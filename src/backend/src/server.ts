import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { healthCheck } from './api/health';
import { processChat, setClaudeService } from './api/chat';
import { logger } from './utils/logger';
import { ClaudeService } from './services/claudeService';

const app = express();

// Initialize ClaudeService with MCP
const claudeService = new ClaudeService();
setClaudeService(claudeService);

// CORS configuration (must come before helmet)
app.use(cors({ 
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept'
  ]
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', healthCheck);

// Chat processing endpoint
app.post('/api/chat', processChat);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    statusCode: 404,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = config.server.port;

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`Claude model: ${config.anthropic.modelName}`);
  
  // Initialize MCP connection
  try {
    await claudeService.connectToServer();
    logger.info('MCP server connected successfully');
  } catch (error) {
    logger.warn('Failed to connect to MCP server, continuing without tools:', error);
  }
});

export default app; 