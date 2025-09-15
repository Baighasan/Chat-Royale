import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Print what we're loading (only in development)
if (process.env['NODE_ENV'] === 'development') {
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('Current working directory:', process.cwd());
  console.log('GEMINI_API_KEY loaded:', process.env['GEMINI_API_KEY'] ? 'YES (length: ' + process.env['GEMINI_API_KEY']!.length + ')' : 'NO');
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('GPT') || key.includes('PORT')));
  console.log('========================');
}

export const config = {
  server: {
    port: process.env['PORT'] || 3001,
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'],
    modelName: process.env['OPENAI_MODEL_NAME'] || 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env['GEMINI_API_KEY'],
    modelName: process.env['GEMINI_MODEL_NAME'] || 'gemini-2.0-flash-lite',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  },
} as const;

// Validate required environment variables
if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
if (!config.gemini.apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}