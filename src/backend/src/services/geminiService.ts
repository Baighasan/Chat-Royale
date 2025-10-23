import { Chat, FunctionCallingConfigMode, FunctionDeclaration, GoogleGenAI } from "@google/genai";
import { config } from "../config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { logger } from "../utils/logger";
import { ChatRequest, ChatResponse, SessionData } from "../types";
import { createError } from "../middleware/errorHandler";
import crypto from 'crypto';
import { Request } from 'express';


export class GeminiService {
    private gemini: GoogleGenAI;
    private chatSessions = new Map<string, SessionData>();
    private mcpClient: Client;
    private mcpTransport: StreamableHTTPClientTransport | null = null;
    private mcpServerUrl: URL;
    private tools: FunctionDeclaration[] = [];
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(mcpServerUrl: string = "http://clash-royale-mcp-server:8000/mcp") {
        this.gemini = new GoogleGenAI({
            apiKey: config.gemini.apiKey
        });
        
        this.mcpClient = new Client({
                name: "chat-royale-mcp-client",
                version: "1.0.0",
            }, {
                capabilities: {}
        });

        this.mcpServerUrl = new URL(mcpServerUrl);

        // Start periodic session cleanup
        this.startSessionCleanup();
    }

    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) return;

        if (this.initializationPromise) return this.initializationPromise;

        this.initializationPromise = this.initialize();
        try {
            await this.initializationPromise;
            this.isInitialized = true;
        } catch (error) {
            logger.error('Gemini initialization failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });
            this.initializationPromise = null;
            throw createError('Failed to initialize Gemini service', 500);
        }
    }

    private async initialize(): Promise<void> {
        if (this.tools.length === 0) {
            await this.connectToMcpServer();
        }
    }


    private generateUserIdentifier(req: Request): string {
        // Create a consistent identifier based on IP and User-Agent
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // Create a hash for privacy and consistency
        const identifier = crypto
            .createHash('sha-256')
            .update(`${ip}_${userAgent}`)
            .digest('hex');

        return identifier;
    }

    public async processChat(payload: ChatRequest, req: Request): Promise<ChatResponse> {
        await this.ensureInitialized()

        // Generate consistent user-based session ID
        const userIdentifier = this.generateUserIdentifier(req);
        const conversationId = `session_${userIdentifier}`;

        try {
            let sessionData = this.chatSessions.get(conversationId);
            let chat: Chat;

            if (!sessionData) {
                // Create new session
                chat = this.gemini.chats.create({
                    model: config.gemini.modelName,
                    config: {
                        systemInstruction: "You are an AI assistant specialized in Clash Royale with access to comprehensive game data through the official Clash Royale API. You are knowledgeable, helpful, and engaging when discussing all aspects of Clash Royale.",
                        tools: [{ functionDeclarations: this.tools }],
                        toolConfig: {
                            functionCallingConfig: {
                                mode: FunctionCallingConfigMode.AUTO,
                            }
                        }
                    }
                });

                sessionData = {
                    chat,
                    lastActivity: new Date(),
                    createdAt: new Date()
                };

                this.chatSessions.set(conversationId, sessionData);

                logger.info('Created new user session', {
                    conversationId,
                    userIdentifier
                });
            } else {
                // Update existing session activity
                chat = sessionData.chat;
                sessionData.lastActivity = new Date();

                logger.debug('Using existing user session', {
                    conversationId,
                    sessionAge: Date.now() - sessionData.createdAt.getTime()
                });
            }

            // Iterative loop to handle multiple tool calls (tool chaining)
            let iterationCount = 0;
            const maxIterations = 5;
            let currentMessage = payload.message;

            while (iterationCount < maxIterations) {
                iterationCount++;

                logger.info(`Processing Gemini message (iteration ${iterationCount})`, {
                    conversationId,
                    iteration: iterationCount
                });

                // Send message and get response
                const response = await chat.sendMessage({ message: currentMessage });

                // If no tool calls, return the text response
                if (!response.functionCalls || response.functionCalls.length === 0) {
                    if (response.text) {
                        logger.info('Chat processing completed', {
                            conversationId,
                            totalIterations: iterationCount,
                            responseLength: response.text.length
                        });

                        return {
                            conversationId,
                            content: response.text
                        };
                    }
                    throw new Error('No valid response from Gemini');
                }

                // Process the single tool call
                const functionCall = response.functionCalls[0];

                if (!functionCall || !functionCall.name || !functionCall.args) {
                    throw new Error('Invalid function call structure from Gemini');
                }

                logger.info('Executing tool call', {
                    conversationId,
                    iteration: iterationCount,
                    functionName: functionCall.name,
                    args: JSON.stringify(functionCall.args)
                });

                // Execute the tool
                const toolResult = await this.executeTool(functionCall.name, functionCall.args);

                logger.debug('Tool execution completed', {
                    conversationId,
                    iteration: iterationCount,
                    toolName: functionCall.name
                });

                // Prepare tool result as the next message
                currentMessage = `Tool execution result for ${functionCall.name}:\n${JSON.stringify(toolResult, null, 2)}`;

                // Loop continues - next iteration will send this result
            }

            throw new Error(`Maximum iterations (${maxIterations}) reached without final response`);

        } catch (error) {
                logger.error('Chat processing failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                errorType: error instanceof Error ? error.constructor.name : 'Unknown',
            });

            throw createError('Failed to process chat response', 500);
        }
    }

    private async executeTool(toolName: string, input: any): Promise<any> {
        logger.debug('Executing MCP tool', { toolName, input });

        if (!this.mcpClient) {
            logger.error('MCP client not connected for tool execution', { toolName });
            throw new Error('MCP client not connected');
        }

        try {
            const result = await this.mcpClient.callTool({
                name: toolName,
                arguments: input
            });

            logger.debug('MCP tool execution completed', {
                toolName,
                resultType: typeof result.content,
                resultSize: JSON.stringify(result.content).length,
            });

            return result.content;
        } catch (error) {
            logger.error('MCP tool execution failed', {
                toolName,
                input,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async connectToMcpServer() {
        logger.info('Attempting to connect to MCP server', {
            serverUrl: this.mcpServerUrl.toString()
        });

        try {
            this.mcpTransport = new StreamableHTTPClientTransport(
                this.mcpServerUrl
            );

            logger.debug('Created MCP transport', { serverUrl: this.mcpServerUrl.toString() });

            await this.mcpClient.connect(this.mcpTransport);
            logger.info('Successfully connected to MCP server');

            const toolsResult = await this.mcpClient.listTools();

            this.tools = this.mapMCPToolsToGeminiFunctions(toolsResult.tools);

            logger.info('MCP server connection completed', {
                availableTools: this.tools.map(tool => tool.name)
            });
        } catch (error) {
            logger.error('Failed to create MCP transport', {
                serverUrl: this.mcpServerUrl.toString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    private startSessionCleanup(): void {
        // Run cleanup every hour
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // 1 hour

        logger.info('Session cleanup scheduler started', {
            intervalHours: 1,
            sessionTimeoutHours: this.sessionTimeout / (60 * 60 * 1000)
        });
    }

    private cleanupExpiredSessions(): void {
        const now = new Date();
        let cleanedCount = 0;
        const initialCount = this.chatSessions.size;

        for (const [sessionId, sessionData] of this.chatSessions) {
            const timeSinceActivity = now.getTime() - sessionData.lastActivity.getTime();

            if (timeSinceActivity > this.sessionTimeout) {
                this.chatSessions.delete(sessionId);
                cleanedCount++;

                logger.debug('Cleaned up expired session', {
                    sessionId,
                    hoursInactive: Math.round(timeSinceActivity / (60 * 60 * 1000))
                });
            }
        }

        if (cleanedCount > 0) {
            logger.info('Session cleanup completed', {
                cleaned: cleanedCount,
                remaining: this.chatSessions.size,
                initialCount
            });
        }
    }

    public clearSession(conversationId: string): boolean {
        const existed = this.chatSessions.has(conversationId);
        this.chatSessions.delete(conversationId);

        if (existed) {
            logger.info('Session cleared manually', { conversationId });
        }

        return existed;
    }

    public clearUserSession(req: Request): boolean {
        const userIdentifier = this.generateUserIdentifier(req);
        const conversationId = `session_${userIdentifier}`;
        return this.clearSession(conversationId);
    }

    mapMCPToolsToGeminiFunctions(mcpTools: FunctionDeclaration[]): FunctionDeclaration[] {
        /**
         * Maps the JSON format of the MCP tools to Gemini function declaration structure.
         */
        return mcpTools.map(tool => ({
            name: tool.name,
            description: tool.description || `Execute ${tool.name}`,
            parametersJsonSchema: tool.parametersJsonSchema
        }));
    }

    public async healthCheck(): Promise<boolean> {
        logger.debug("Starting Gemini health check...");
        try {
            await this.gemini.models.list();
            
            logger.debug("Gemini health check passed.");
            return true;
        } catch (error) {
            logger.error('Gemini health check failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });
            return false;
        }
    }

    public shutdown(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger.info('Session cleanup scheduler stopped');
        }

        // Clear all sessions
        this.chatSessions.clear();
        logger.info('All sessions cleared during shutdown');
    }
}