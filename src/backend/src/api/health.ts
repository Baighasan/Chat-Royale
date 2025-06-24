import { Request, Response } from 'express';
import { HealthResponse } from '../types';
import { ClaudeService } from '../services/claudeService';
import { logger } from '../utils/logger';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    const claudeService = new ClaudeService();
    const claudeHealthy = await claudeService.healthCheck();

    const response: HealthResponse = {
      status: claudeHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
    };

    const statusCode = claudeHealthy ? 200 : 503;
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