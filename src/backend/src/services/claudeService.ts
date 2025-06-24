import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { config } from '../config';
import { ChatRequest } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  public async streamChat(payload: ChatRequest, res: Response): Promise<void> {
    try {
      const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send message start event
      this.sendSSEEvent(res, 'message_start', { conversationId });

      const messages = payload.history.concat([
        { role: 'user', content: payload.message }
      ]);

      const stream = await this.anthropic.messages.stream({
        model: config.anthropic.modelName,
        max_tokens: 4096,
        messages,
        system: "You are Claude, an AI assistant. Provide helpful, accurate, and engaging responses. Use markdown formatting when appropriate, especially for code blocks.",
      });

      for await (const event of stream) {
        switch (event.type) {
          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              this.sendSSEEvent(res, 'content_delta', { delta: event.delta.text });
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