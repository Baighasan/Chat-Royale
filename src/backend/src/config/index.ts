import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Print what we're loading
console.log('=== ENVIRONMENT DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('OPENAI_API_KEY loaded:', process.env['OPENAI_API_KEY'] ? 'YES (length: ' + process.env['OPENAI_API_KEY']!.length + ')' : 'NO');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('GPT') || key.includes('PORT')));
console.log('========================');

export const config = {
  server: {
    port: process.env['PORT'] || 3001,
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'],
    modelName: process.env['OPENAI_MODEL_NAME'] || 'gpt-4o-mini',
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