import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { ChatRequest, ChatResponse, ToolResult, ToolError } from '../types';
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

  public async processChat(payload: ChatRequest): Promise<ChatResponse> {
    const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      
      logger.info('Starting chat processing', {
        conversationId,
        messageLength: payload.message.length,
        historyLength: payload.history.length,
      });
      
      const messages = payload.history.concat([
        {
          role: 'user', 
          content: payload.message 
        }
      ]);
      
      logger.debug('Prepared messages for Claude API', {
        conversationId,
        totalMessages: messages.length,
        lastMessageLength: payload.message.length,
      });

      // Ensure we have tools available
      if (this.tools.length === 0) {
        logger.info('No tools available, attempting to connect to MCP server', { conversationId });
        try {
          await this.connectToServer();
          logger.info('Successfully connected to MCP server', { 
            conversationId, 
            availableTools: this.tools.map(t => t.name) 
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
          availableTools: this.tools.map(t => t.name) 
        });
      }

      // Initial Claude API call
      logger.info('Making initial Claude API call', { 
        conversationId, 
        model: config.anthropic.modelName,
        maxTokens: 8192,
        hasTools: this.tools.length > 0,
        toolCount: this.tools.length,
      });
      
      const response = await this.anthropic.messages.create({
        model: config.anthropic.modelName,
        max_tokens: 4096,
        messages,
        tools: this.tools.length > 0 ? this.tools : undefined,
        system: `You are Claude, an AI assistant specialized in Clash Royale with access to comprehensive game data through the official Clash Royale API. You are knowledgeable, helpful, and engaging when discussing all aspects of Clash Royale.

          ## Your Capabilities

          You have access to real-time Clash Royale data through the following tools:

          ### Player Information
          - **Player Profiles**: Get detailed player stats, trophies, battle history, clan membership, and achievements
          - **Battle Logs**: Access recent battle history with deck compositions and outcomes
          - **Upcoming Chests**: View a player's chest cycle and upcoming rewards

          ### Card Information
          - **Card Database**: Access complete card information including elixir costs, rarities, max levels, and evolution details
          - **Card Stats**: Get comprehensive card statistics and metadata

          ### Clan Information
          - **Clan Profiles**: Detailed clan information including member counts, scores, and descriptions
          - **Clan Members**: View clan member lists and individual member details
          - **Clan River Race**: Access clan river race logs and current race information
          - **Clan Search**: Find clans by name, location, member count, or score requirements

          ### Leaderboards & Rankings
          - **Global Leaderboards**: Access various game mode leaderboards (2v2, special events, etc.)
          - **Location Rankings**: Regional and country-specific player and clan rankings
          - **Path of Legends**: Top players in the Path of Legends competitive mode
          - **Season Rankings**: Historical season data and rankings

          ### Tournament Information
          - **Tournament Search**: Find player-created tournaments by name
          - **Tournament Details**: Get comprehensive tournament information and participant data

          ### Location & Regional Data
          - **Global Locations**: Access worldwide location data for regional rankings
          - **Season Information**: Historical season data and identifiers

          ## Your Behavior Guidelines

          1. **Be Comprehensive**: When users ask about players, clans, or cards, provide detailed information using the available tools
          2. **Be Helpful**: Offer strategic advice, deck suggestions, and game insights based on the data you access
          3. **Be Accurate**: Always use the latest data from the API rather than making assumptions
          4. **Be Engaging**: Show enthusiasm for the game and help users improve their Clash Royale experience
          5. **Use Tools Proactively**: When users mention players, clans, or cards, automatically look up relevant information
          6. **Provide Context**: Explain what the data means and how it relates to gameplay strategy

          ## Response Format

          - Use markdown formatting for better readability
          - Present data in organized, easy-to-read formats
          - Include relevant statistics and insights
          - When appropriate, suggest strategies or improvements based on the data
          - Always cite the source of your information (Clash Royale API)

          ## Example Interactions

          - "Show me player #ABC123" → Look up player profile and provide comprehensive stats
          - "What's the best deck right now?" → Check current meta through leaderboards and suggest popular/effective decks
          - "Tell me about Clan XYZ" → Search for and provide detailed clan information
          - "How do I improve my gameplay?" → Analyze battle logs and provide strategic advice

          Remember: You're not just providing data - you're helping players understand and improve their Clash Royale knowledge and gameplay through insights, analysis, and strategic guidance.`,
      });

      let finalContent = '';
      const toolResults: ToolResult[] = [];
      const toolErrors: ToolError[] = [];
      const conversationMessages = [...messages];

      logger.info('Processing Claude response', { 
        conversationId, 
        contentBlocks: response.content.length,
        usage: response.usage,
      });

      // Process the response and handle any tool calls
      for (const content of response.content) {
        if (content.type === 'text') {
          finalContent += content.text + "\n\n";
          logger.debug('Added text content to response', { 
            conversationId, 
            textLength: content.text.length,
            totalContentLength: finalContent.length,
          });
        } else if (content.type === 'tool_use') {
          logger.info('Executing tool call', { 
            conversationId, 
            toolName: content.name,
            toolId: content.id,
            inputKeys: Object.keys(content.input || {}),
          });
          
          // Execute the tool call
          try {
            const toolResult = await this.executeTool(content.name, content.input);
            toolResults.push({
              toolId: content.id,
              toolName: content.name,
              result: toolResult
            });
            
            logger.info('Tool execution successful', { 
              conversationId, 
              toolName: content.name,
              toolId: content.id,
              resultType: typeof toolResult,
              resultSize: JSON.stringify(toolResult).length,
            });

            // Add tool result to conversation for Claude to process
            conversationMessages.push({
              role: 'assistant',
              content: JSON.stringify([content])
            });
            conversationMessages.push({
              role: 'user',
              content: JSON.stringify([{
                type: 'tool_result',
                tool_use_id: content.id,
                content: toolResult
              }])
            });

            logger.info('Making follow-up Claude API call for tool result', { 
              conversationId, 
              toolName: content.name,
              toolId: content.id,
            });

            // Get Claude's response to the tool result
            const followUpResponse = await this.anthropic.messages.create({
              model: config.anthropic.modelName,
              max_tokens: 4096,
              messages: conversationMessages,
              tools: this.tools.length > 0 ? this.tools : undefined,
            });

            logger.info('Received follow-up Claude response', { 
              conversationId, 
              toolName: content.name,
              followUpContentBlocks: followUpResponse.content.length,
              followUpUsage: followUpResponse.usage,
            });

            // Add the follow-up response to final content
            for (const followUpContent of followUpResponse.content) {
              if (followUpContent.type === 'text') {
                finalContent += followUpContent.text;
                logger.debug('Added follow-up text content', { 
                  conversationId, 
                  toolName: content.name,
                  textLength: followUpContent.text.length,
                  totalContentLength: finalContent.length,
                });
              }
            }

          } catch (toolError) {
            logger.error('Tool execution failed', { 
              conversationId, 
              toolName: content.name,
              toolId: content.id,
              error: toolError instanceof Error ? toolError.message : 'Unknown tool error',
              stack: toolError instanceof Error ? toolError.stack : undefined,
            });
            toolErrors.push({
              toolId: content.id,
              toolName: content.name,
              error: toolError instanceof Error ? toolError.message : 'Unknown tool error'
            });
          }
        }
      }

      logger.info('Chat processing completed successfully', { 
        conversationId, 
        finalContentLength: finalContent.length,
        totalToolResults: toolResults.length,
        totalToolErrors: toolErrors.length,
        totalUsage: response.usage,
      });

      return {
        conversationId,
        content: finalContent,
        usage: response.usage,
      };

    } catch (error) {
      logger.error('Chat processing failed', { 
        conversationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API error details', { 
          conversationId,
          status: error.status,
          message: error.message,
        });
        throw createError(`Anthropic API error: ${error.message}`, 500);
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
    /**
     * Connect to an MCP server
     */

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
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
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
    logger.debug('Starting Claude health check');
    
    try {
      // Simple health check by making a minimal request
      await this.anthropic.messages.create({
        model: config.anthropic.modelName,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });
      
      logger.debug('Claude health check passed');
      return true;
    } catch (error) {
      logger.error('Claude health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }
} 