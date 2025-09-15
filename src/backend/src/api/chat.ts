import { Request, Response, NextFunction } from 'express';
import { ChatRequest, ChatResponse } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Shared AIService instance (GeminiService)
type AIService = {
  processChat: (payload: ChatRequest, req: Request) => Promise<ChatResponse>;
  healthCheck: () => Promise<boolean>;
  clearUserSession: (req: Request) => boolean;
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
    const { message } = req.body as { message: string };

    // Validate request
    if (!message || typeof message !== 'string') {
      throw createError('Message is required and must be a string', 400);
    }

    if (!aiService) {
      throw createError('AIService not initialized', 500);
    }
    logger.info('Starting chat processing', {
      messageLength: message.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    const response: ChatResponse = await aiService.processChat({ message }, req);
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

export const clearChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!aiService) {
      throw createError('AIService not initialized', 500);
    }

    logger.info('Clearing user session', {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    const cleared = aiService.clearUserSession(req);

    logger.info('Session clear completed', {
      cleared,
    });

    res.json({ success: true, cleared });
  } catch (error) {
    logger.error('Error in clear chat endpoint:', error);
    next(error);
  }
}; 