import { Request, Response, NextFunction } from 'express';
import { ChatRequest } from '../types';
import { ClaudeService } from '../services/claudeService';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export const streamChat = async (
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

    // Set SSE headers with CORS support
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const claudeService = new ClaudeService();
    
    logger.info('Starting chat stream', {
      messageLength: message.length,
      historyLength: history.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    await claudeService.streamChat({ message, history }, res);

    logger.info('Chat stream completed');
  } catch (error) {
    logger.error('Error in chat endpoint:', error);
    next(error);
  }
}; 