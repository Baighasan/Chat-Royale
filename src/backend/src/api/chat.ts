import { Request, Response, NextFunction } from 'express';
import { ChatRequest, ChatResponse } from '../types';
import { ClaudeService } from '../services/claudeService';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Shared ClaudeService instance
let claudeService: ClaudeService | null = null;

export const setClaudeService = (service: ClaudeService) => {
  claudeService = service;
};

export const processChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, history } = req.body as ChatRequest;

    // Validate request
    if (!message || typeof message !== 'string') {
      throw createError('Message is required and must be a string', 400);
    }

    if (!Array.isArray(history)) {
      throw createError('History must be an array', 400);
    }

    // Validate history format
    for (const msg of history) {
      if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
        throw createError('Invalid message role in history', 400);
      }
      if (!msg.content || typeof msg.content !== 'string') {
        throw createError('Invalid message content in history', 400);
      }
    }

    if (!claudeService) {
      throw createError('ClaudeService not initialized', 500);
    }
    
    logger.info('Starting chat processing', {
      messageLength: message.length,
      historyLength: history.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    const response: ChatResponse = await claudeService.processChat({ message, history });

    logger.info('Chat processing completed', {
      conversationId: response.conversationId,
      contentLength: response.content.length,
    });

    res.json(response);
  } catch (error) {
    logger.error('Error in chat endpoint:', error);
    next(error);
  }
}; 