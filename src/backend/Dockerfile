# Multi-stage Dockerfile for backend
FROM node:20-alpine AS base

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . ./

# Development stage
FROM base AS development

# Set development environment
ENV NODE_ENV=development
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start with nodemon for hot reloading
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build

# Set production environment for build
ENV NODE_ENV=production

# Build the application
RUN npm run build:prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and dependencies
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "dist/server.js"] 