# Multi-stage Dockerfile for frontend
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Development stage
FROM base AS development

# Accept build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:3001

# Set development environment
ENV NODE_ENV=development
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build

# Accept build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:3001

# Set production environment
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Set proper permissions (nginx user already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]