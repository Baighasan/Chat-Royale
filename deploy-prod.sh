#!/bin/bash

# Production Deployment Script for Chat Royale
set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install it and try again."
    exit 1
fi

# Check for environment files
print_status "Checking environment files..."

if [ ! -f "src/backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from template..."
    if [ -f "src/backend/env.production.example" ]; then
        cp src/backend/env.production.example src/backend/.env
        print_warning "Please edit src/backend/.env with your actual values before continuing."
        read -p "Press Enter after you've configured the environment variables..."
    else
        print_error "Backend environment template not found. Please create src/backend/.env manually."
        exit 1
    fi
fi

if [ ! -f "src/mcp/.env" ]; then
    print_warning "MCP .env file not found. Creating from template..."
    if [ -f "src/mcp/env.production.example" ]; then
        cp src/mcp/env.production.example src/mcp/.env
        print_warning "Please edit src/mcp/.env with your actual values before continuing."
        read -p "Press Enter after you've configured the environment variables..."
    else
        print_error "MCP environment template not found. Please create src/mcp/.env manually."
        exit 1
    fi
fi

# Set production environment
export NODE_ENV=production

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services in production mode..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check backend health
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend is healthy"
else
    print_error "❌ Backend health check failed"
    docker-compose logs chat-royale-backend
    exit 1
fi

# Check MCP server health
if curl -f http://localhost:8000/mcp > /dev/null 2>&1; then
    print_status "✅ MCP server is healthy"
else
    print_warning "⚠️  MCP server health check failed (this might be expected if MCP doesn't have a health endpoint)"
fi

# Check frontend health
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend health check failed"
    docker-compose logs chat-royale-frontend
    exit 1
fi

print_status "🎉 Production deployment completed successfully!"
print_status "Frontend: http://localhost"
print_status "Backend API: http://localhost:3001"
print_status "MCP Server: http://localhost:8000"

# Show running containers
print_status "Running containers:"
docker-compose ps

echo ""
print_status "To view logs: docker-compose logs -f [service-name]"
print_status "To stop services: docker-compose down" 