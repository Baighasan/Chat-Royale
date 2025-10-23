import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { healthCheck, setAIService } from './api/health';
import { processChat, clearChat, setAIService as setChatAIService } from './api/chat';
import { GeminiService } from './services/geminiService';
import { logger } from './utils/logger';

const app = express();

// Initialize GeminiService with MCP
const geminiService = new GeminiService();
setChatAIService(geminiService);
setAIService(geminiService);

// CORS configuration (must come before helmet)
const corsOrigins = process.env['NODE_ENV'] === 'production' 
  ? [process.env['FRONTEND_URL'] || 'http://localhost', 'https://localhost']
  : ["http://localhost:3000", "http://localhost"];

app.use(cors({
  origin: corsOrigins,
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

// Request logging (only in development or when explicitly enabled)
if (process.env['NODE_ENV'] === 'development' || process.env['ENABLE_REQUEST_LOGGING'] === 'true') {
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});
}

// Health check endpoint
app.get('/api/health', healthCheck);

// Chat processing endpoint
app.post('/api/chat', processChat);

// Clear chat session endpoint
app.post('/api/chat/clear', clearChat);

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
  geminiService.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  geminiService.shutdown();
  process.exit(0);
});

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`Gemini model: ${config.gemini.modelName}`);
  logger.info('MCP connection will be established on first chat request');
});

export default app;