import { Request, Response, NextFunction } from 'express';
import { ChatRequest, ChatResponse } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Shared AIService instance (OpenAIService)
type AIService = {
  processChat: (payload: ChatRequest) => Promise<ChatResponse>;
  healthCheck: () => Promise<boolean>;
};
let aiService: AIService | null = null;

export const setAIService = (service: AIService) => {
  aiService = service;
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

    if (!aiService) {
      throw createError('AIService not initialized', 500);
    }
    logger.info('Starting chat processing', {
      messageLength: message.length,
      historyLength: history.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    const response: ChatResponse = await aiService.processChat({ message, history });
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