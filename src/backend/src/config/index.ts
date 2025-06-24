import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Print what we're loading
console.log('=== ENVIRONMENT DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('ANTHROPIC_API_KEY loaded:', process.env['ANTHROPIC_API_KEY'] ? 'YES (length: ' + process.env['ANTHROPIC_API_KEY']!.length + ')' : 'NO');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('ANTHROPIC') || key.includes('CLAUDE') || key.includes('PORT')));
console.log('========================');

export const config = {
  server: {
    port: process.env['PORT'] || 3001,
  },
  anthropic: {
    apiKey: process.env['ANTHROPIC_API_KEY'],
    modelName: process.env['CLAUDE_MODEL_NAME'] || 'claude-3-opus-20240229',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  },
} as const;

// Validate required environment variables
if (!config.anthropic.apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
} 