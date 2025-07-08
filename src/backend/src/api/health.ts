import { Request, Response } from 'express';
import { HealthResponse } from '../types';
import { logger } from '../utils/logger';

// Import the shared service instance
let aiService: any = null;

export const setAIService = (service: any) => {
  aiService = service;
};

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    let aiHealthy = false;
    
    if (aiService) {
      aiHealthy = await aiService.healthCheck();
    } else {
      logger.warn('AIService not initialized for health check');
    }

    const response: HealthResponse = {
      status: aiHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
    };

    const statusCode = aiHealthy ? 200 : 503;
    res.status(statusCode).json(response);

    logger.info(`Health check: ${response.status}`);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
}; 