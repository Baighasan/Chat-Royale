# Backend-only Dockerfile for production
FROM node:18-alpine AS base

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source
COPY . ./

# Build backend
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built backend
COPY --from=base --chown=nextjs:nodejs /app/dist ./dist
COPY --from=base --chown=nextjs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

USER nextjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/server.js"] 