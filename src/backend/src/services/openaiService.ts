import OpenAI from 'openai';
import { config } from '../config';
import { ChatRequest, ChatResponse, ToolResult, ToolError } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { encoding_for_model } from "tiktoken";

export class OpenAIService {
  private openai: OpenAI;
  private mcpClient: Client;
  private mcpTransport: StreamableHTTPClientTransport | null = null;
  private mcpServerUrl: URL;
  private tools: any[] = [];

  constructor(mcpServerUrl: string = "http://clash-royale-mcp-server:8000/mcp") {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.mcpClient = new Client({
      name: "chat-royale-mcp-client",
      version: "1.0.0",
    }, {
      capabilities: {}
    });

    this.mcpServerUrl = new URL(mcpServerUrl);
  }

  public async processChat(payload: ChatRequest): Promise<ChatResponse> {
    const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const MODEL_CONTEXT_WINDOW = 128000; // gpt-4o-mini context window
    const RESPONSE_BUFFER = 4096; // Reserve for completion
    const modelName = config.openai.modelName || 'gpt-4o-mini';
    const enc = encoding_for_model(modelName);
    try {
      logger.info('Starting chat processing', {
        conversationId,
        messageLength: payload.message.length,
        historyLength: payload.history.length,
      });

      // Prepare system prompt
      const systemPrompt = {
        role: 'system' as const,
        content: `You are an AI assistant specialized in Clash Royale with access to comprehensive game data through the official Clash Royale API. You are knowledgeable, helpful, and engaging when discussing all aspects of Clash Royale.`
      };

      // Prepare all messages (history + current user message)
      const allMessages = payload.history.concat([
        {
          role: 'user',
          content: payload.message
        }
      ]);

      // Token counting utility for OpenAI chat messages
      function countMessageTokens(msg: { role: string, content: string }) {
        // OpenAI chat format: <|start|>{role}\n{content}<|end|>
        // tiktoken chat encoding is slightly more complex, but this is a good approximation
        return enc.encode(msg.role + "\n" + msg.content).length + 4; // +4 for role/format overhead
      }
      // Count system prompt tokens
      let totalTokens = countMessageTokens(systemPrompt);
      // Always include the latest user message
      totalTokens += countMessageTokens({ role: 'user', content: payload.message });
      // Add history messages in reverse (most recent first) until context window is reached
      const limitedHistory: typeof payload.history = [];
      for (let i = payload.history.length - 1; i >= 0; i--) {
        const msg = payload.history[i];
        const msgTokens = countMessageTokens(msg);
        if (totalTokens + msgTokens + RESPONSE_BUFFER > MODEL_CONTEXT_WINDOW) {
          break;
        }
        limitedHistory.unshift(msg); // Add to start
        totalTokens += msgTokens;
      }
      // Compose messages for OpenAI
      const messages = [
        systemPrompt,
        ...limitedHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: payload.message
        }
      ];

      // Ensure we have tools available
      if (this.tools.length === 0) {
        logger.info('No tools available, attempting to connect to MCP server', { conversationId });
        try {
          await this.connectToServer();
          logger.info('Successfully connected to MCP server', {
            conversationId,
            availableTools: this.tools.map(t => t.function.name)
          });
        } catch (error) {
          logger.warn('Failed to connect to MCP server, proceeding without tools', {
            conversationId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        logger.debug('Using existing MCP tools', {
          conversationId,
          availableTools: this.tools.map(t => t.function.name)
        });
      }

      let finalContent = '';
      const toolResults: ToolResult[] = [];
      const toolErrors: ToolError[] = [];
      let conversationMessages = [...messages];
      let iterationCount = 0;
      const maxIterations = 10; // Prevent infinite loops
      let lastResponse: any = null;

      // Loop until OpenAI stops making tool calls or we reach max iterations
      while (iterationCount < maxIterations) {
        iterationCount++;
        
        logger.info(`Making OpenAI API call (iteration ${iterationCount})`, {
          conversationId,
          model: config.openai.modelName,
          hasTools: this.tools.length > 0,
          toolCount: this.tools.length,
          conversationMessageCount: conversationMessages.length,
        });

        const response = await this.openai.chat.completions.create({
          model: config.openai.modelName,
          messages: conversationMessages,
          tools: this.tools.length > 0 ? this.tools : undefined,
          max_tokens: 4096,
        });

        lastResponse = response; // Store the last response for final logging

        const choices = response.choices || [];
        logger.info(`Processing response (iteration ${iterationCount})`, {
          conversationId,
          choiceCount: choices.length,
          hasContent: choices.some(c => c.message.content),
          hasToolCalls: choices.some(c => c.message.tool_calls && c.message.tool_calls.length > 0),
        });

        let hasToolCalls = false;

        for (const choice of choices) {
          // Capture any content from this response
          if (choice.message.content) {
            finalContent += choice.message.content + "\n\n";
            logger.debug('Added content from response', {
              conversationId,
              iteration: iterationCount,
              textLength: choice.message.content.length,
              totalContentLength: finalContent.length,
            });
          }

          // Handle tool calls
          if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            hasToolCalls = true;
            
            logger.info('Processing tool calls', {
              conversationId,
              iteration: iterationCount,
              toolCallCount: choice.message.tool_calls.length,
              toolNames: choice.message.tool_calls.map(tc => tc.function.name),
            });

            // Add the assistant message with tool calls to conversation
            conversationMessages.push({
              role: 'assistant',
              content: choice.message.content,
              tool_calls: choice.message.tool_calls
            } as any);

            // Execute all tool calls
            for (const toolCall of choice.message.tool_calls) {
              logger.info('Executing tool call', {
                conversationId,
                iteration: iterationCount,
                toolName: toolCall.function.name,
                toolId: toolCall.id,
                inputKeys: Object.keys(JSON.parse(toolCall.function.arguments || '{}')),
              });

              try {
                const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
                const toolResult = await this.executeTool(toolCall.function.name, toolArgs);
                
                toolResults.push({
                  toolId: toolCall.id,
                  toolName: toolCall.function.name,
                  result: toolResult
                });

                logger.info('Tool execution successful', {
                  conversationId,
                  iteration: iterationCount,
                  toolName: toolCall.function.name,
                  toolId: toolCall.id,
                  resultType: typeof toolResult,
                  resultSize: JSON.stringify(toolResult).length,
                });

                // Add tool result to conversation
                conversationMessages.push({
                  role: 'tool',
                  content: JSON.stringify(toolResult),
                  tool_call_id: toolCall.id
                } as any);

              } catch (toolError) {
                logger.error('Tool execution failed', {
                  conversationId,
                  iteration: iterationCount,
                  toolName: toolCall.function.name,
                  toolId: toolCall.id,
                  error: toolError instanceof Error ? toolError.message : 'Unknown tool error',
                  stack: toolError instanceof Error ? toolError.stack : undefined,
                });
                toolErrors.push({
                  toolId: toolCall.id,
                  toolName: toolCall.function.name,
                  error: toolError instanceof Error ? toolError.message : 'Unknown tool error'
                });
              }
            }
          }
        }

        // If no tool calls were made, we're done
        if (!hasToolCalls) {
          logger.info('No more tool calls, conversation complete', {
            conversationId,
            iteration: iterationCount,
            finalContentLength: finalContent.length,
          });
          break;
        }

        logger.info('Tool calls completed, continuing to next iteration', {
          conversationId,
          iteration: iterationCount,
          toolResultsCount: toolResults.length,
        });
      }

      if (iterationCount >= maxIterations) {
        logger.warn('Reached maximum iterations, stopping tool execution', {
          conversationId,
          iterationCount,
          finalContentLength: finalContent.length,
        });
      }

      logger.info('Chat processing completed successfully', {
        conversationId,
        iterations: iterationCount,
        finalContentLength: finalContent.length,
        totalToolResults: toolResults.length,
        totalToolErrors: toolErrors.length,
        totalUsage: lastResponse?.usage,
      });

      // Safety check: if no content was captured but tools were executed, provide a fallback
      if (finalContent.trim().length === 0 && toolResults.length > 0) {
        logger.warn('No content captured but tools were executed, providing fallback message', {
          conversationId,
          toolCount: toolResults.length,
        });
        finalContent = `I've gathered some information for you using the available tools. Here's what I found:\n\n`;
        
        for (const toolResult of toolResults) {
          finalContent += `**${toolResult.toolName}**: Data retrieved successfully.\n`;
        }
        
        finalContent += `\nPlease let me know if you'd like me to analyze this data further or if you have any specific questions about the information I've gathered.`;
      }

      return {
        conversationId,
        content: finalContent,
        usage: lastResponse?.usage ? {
          prompt_tokens: lastResponse.usage.prompt_tokens,
          completion_tokens: lastResponse.usage.completion_tokens,
          total_tokens: lastResponse.usage.total_tokens,
        } : undefined,
      };

    } catch (error) {
      logger.error('Chat processing failed', {
        conversationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      
      if (error instanceof OpenAI.APIError) {
        logger.error('OpenAI API error details', {
          conversationId,
          status: error.status,
          message: error.message,
        });
        throw createError(`OpenAI API error: ${error.message}`, 500);
      } else {
        throw createError('Failed to process chat response', 500);
      }
    }
  }

  private async executeTool(toolName: string, input: any): Promise<any> {
    logger.debug('Executing MCP tool', { toolName, inputKeys: Object.keys(input || {}) });
    
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

  async connectToServer() {
    logger.info('Attempting to connect to MCP server', {
      serverUrl: this.mcpServerUrl.toString()
    });

    try {
      this.mcpTransport = new StreamableHTTPClientTransport(
        this.mcpServerUrl,
      );

      logger.debug('Created MCP transport', { serverUrl: this.mcpServerUrl.toString() });

      await this.mcpClient.connect(this.mcpTransport);
      logger.info('MCP client connected successfully');

      const toolsResult = await this.mcpClient.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          }
        };
      });
      
      logger.info('MCP server connection completed', {
        availableTools: this.tools.map(({ name }) => name),
        toolCount: this.tools.length,
      });
    } catch (error) {
      logger.error('Failed to connect to MCP server', {
        serverUrl: this.mcpServerUrl.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    logger.debug('Starting OpenAI health check');
    
    try {
      // Simple health check by making a minimal request
      await this.openai.chat.completions.create({
        model: config.openai.modelName,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
      
      logger.debug('OpenAI health check passed');
      return true;
    } catch (error) {
      logger.error('OpenAI health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }
} 