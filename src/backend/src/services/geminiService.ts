import { Chat, FunctionCallingConfigMode, FunctionDeclaration, GoogleGenAI } from "@google/genai";
import { config } from "../config";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { logger } from "../utils/logger";
import { ChatRequest, ChatResponse } from "../types";
import { createError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from 'uuid';


export class GeminiService {
    private gemini: GoogleGenAI;
    private chatSessions = new Map<string, Chat>();
    private mcpClient: Client;
    private mcpTransport: StreamableHTTPClientTransport | null = null;
    private mcpServerUrl: URL;
    private tools: FunctionDeclaration[] = [];
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

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


    public async processChat(payload: ChatRequest): Promise<ChatResponse> {
        await this.ensureInitialized()

        const conversationId = uuidv4();

        try {
            let chat = this.chatSessions.get(conversationId);

            if (!chat) {
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
                this.chatSessions.set(conversationId, chat);
            }

            const response = await chat.sendMessage({
                message: payload.message
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                logger.debug('Function call detected in Gemini response', response.functionCalls);
                const functionCall = response.functionCalls[0];

                if (!functionCall || !functionCall.name || !functionCall.args) {
                    throw new Error('Invalid function call structure from Gemini');
                }

                logger.debug('Function to call:', functionCall.name);
                logger.debug('Arguments:', JSON.stringify(functionCall.args));

                const toolResult = await this.executeTool(functionCall.name, functionCall.args);

                const followUpResponse = await chat.sendMessage({
                    message: `The result of the tool call (${functionCall.name}) is: ${JSON.stringify(toolResult)}`,
                    config: {
                        toolConfig: {
                            functionCallingConfig: {
                                mode: FunctionCallingConfigMode.NONE,   // Prevent further tool calls in this follow-up
                            }
                        }
                    }
                });

                if (followUpResponse.text) {
                    return {
                        conversationId,
                        content: followUpResponse.text
                    };
                } else {
                    throw new Error('No valid follow-up response from Gemini after tool execution');
                }
            } else if (response.text) {
                return {
                    conversationId,
                    content: response.text
                };
            } else {
                throw new Error('No valid response from Gemini');
            }

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
}