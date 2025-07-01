import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { config } from '../config';
import { ChatRequest } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  Tool,
  } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
  import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class ClaudeService {
  private anthropic: Anthropic;
  private mcpClient: Client;
  private mcpTransport: StreamableHTTPClientTransport | null = null;
  private mcpServerUrl: URL;
  private tools: Tool[] = [];

  constructor(mcpServerUrl: string = "http://clash-royale-mcp-server:8000/mcp") {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });

    this.mcpClient = new Client({
      name: "chat-royale-mcp-client",
      version: "1.0.0",
    }, {
      capabilities: {}
    });

    this.mcpServerUrl = new URL(mcpServerUrl);
  }

  public async streamChat(payload: ChatRequest, res: Response): Promise<void> {
    try {
      const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send message start event
      this.sendSSEEvent(res, 'message_start', { conversationId });

      const messages = payload.history.concat([
        {
          role: 'user', 
          content: payload.message 
        }
      ]);
      console.log(messages);

      // Ensure we have tools available
      if (this.tools.length === 0) {
        try {
          await this.connectToServer();
        } catch (error) {
          logger.warn('Failed to connect to MCP server, proceeding without tools:', error);
        }
      }

      const stream = await this.anthropic.messages.stream({
        model: config.anthropic.modelName,
        max_tokens: 4096,
        messages,
        tools: this.tools.length > 0 ? this.tools : undefined,
        system: "You are Claude, an AI assistant. Provide helpful, accurate, and engaging responses. Use markdown formatting when appropriate, especially for code blocks. You have access to various tools that you can use when needed.",
      });

      let currentToolUse: any = null;
      let toolInputBuffer = '';

      for await (const event of stream) {
        switch (event.type) {
          case 'content_block_start':
            if (event.content_block.type === 'tool_use') {
              currentToolUse = {
                id: event.content_block.id,
                name: event.content_block.name,
                input: {}
              };
              toolInputBuffer = '';
              this.sendSSEEvent(res, 'tool_use_start', { 
                toolId: event.content_block.id,
                toolName: event.content_block.name 
              });
            }
            break;

          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              this.sendSSEEvent(res, 'content_delta', { delta: event.delta.text });
            } else if (event.delta.type === 'input_json_delta') {
              // Accumulate partial JSON for tool input
              toolInputBuffer += event.delta.partial_json;
              this.sendSSEEvent(res, 'tool_input_delta', { 
                delta: event.delta.partial_json,
                toolId: currentToolUse?.id 
              });
            }
            break;

          case 'content_block_stop':
            if (currentToolUse && event.index !== undefined) {
              // Parse the complete tool input
              try {
                currentToolUse.input = JSON.parse(toolInputBuffer);
                
                // Execute the tool
                this.sendSSEEvent(res, 'tool_execution_start', { 
                  toolId: currentToolUse.id,
                  toolName: currentToolUse.name 
                });

                try {
                  const toolResult = await this.executeTool(currentToolUse.name, currentToolUse.input);
                  
                  this.sendSSEEvent(res, 'tool_result', {
                    toolId: currentToolUse.id,
                    result: toolResult
                  });
                } catch (toolError) {
                  logger.error('Tool execution error:', toolError);
                  this.sendSSEEvent(res, 'tool_error', {
                    toolId: currentToolUse.id,
                    error: toolError instanceof Error ? toolError.message : 'Unknown tool error'
                  });
                }

                currentToolUse = null;
                toolInputBuffer = '';
              } catch (parseError) {
                logger.error('Failed to parse tool input JSON:', parseError);
                this.sendSSEEvent(res, 'tool_error', {
                  toolId: currentToolUse.id,
                  error: 'Failed to parse tool input'
                });
                currentToolUse = null;
                toolInputBuffer = '';
              }
            }
            break;
            
          case 'message_delta':
            // Note: usage is not available in message_delta events in current SDK
            // We'll get usage from the final message_stop event
            break;
          
          case 'message_stop':
            this.sendSSEEvent(res, 'message_stop', {
              reason: 'stop_sequence', // Default reason since it's not available in the event
            });
            break;
        }
      }

      res.end();
    } catch (error) {
      logger.error('Error in Claude stream:', error);
      
      if (error instanceof Anthropic.APIError) {
        const message = error.message || 'Anthropic API error';
        
        this.sendSSEEvent(res, 'error', {
          code: 'API_ERROR',
          message,
        });
        
        res.end();
      } else {
        throw createError('Failed to stream chat response', 500);
      }
    }
  }

  private async executeTool(toolName: string, input: any): Promise<any> {
    if (!this.mcpClient) {
      throw new Error('MCP client not connected');
    }

    try {
      const result = await this.mcpClient.callTool({
        name: toolName,
        arguments: input
      });

      return result.content;
    } catch (error) {
      logger.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  async connectToServer() {
    /**
     * Connect to an MCP server
     *
     * @param serverScriptPath - Path to the server script (.py or .js)
     */

    try {
        this.mcpTransport = new StreamableHTTPClientTransport(
            this.mcpServerUrl,
        );

        await this.mcpClient.connect(this.mcpTransport);

        const toolsResult = await this.mcpClient.listTools();
        this.tools = toolsResult.tools.map((tool) => {
            return {
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            };
        });
        console.log(
            "Connected to server with tools:",
            this.tools.map(({ name }) => name)
        );
    } catch (e) {
        console.log("Failed to connect to MCP server: ", e);
        throw e;
    }
}

  private sendSSEEvent(res: Response, event: string, data: any): void {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by making a minimal request
      await this.anthropic.messages.create({
        model: config.anthropic.modelName,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      logger.error('Claude health check failed:', error);
      return false;
    }
  }
} 