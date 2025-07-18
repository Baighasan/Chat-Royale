#!/bin/bash

# Minimal deployment script for $5 Lightsail plan (1GB RAM)
echo "🚀 Deploying Chat Royale on minimal resources..."

# Stop any existing containers
echo "Stopping existing containers..."
docker compose down

# Clean up Docker to free memory
echo "Cleaning up Docker..."
docker system prune -f

# Deploy MCP server first (smallest)
echo "Deploying MCP server..."
docker compose -f docker-compose.yml up -d clash-royale-mcp-server
sleep 30

# Deploy backend
echo "Deploying backend..."
docker compose -f docker-compose.yml up -d chat-royale-backend
sleep 30

# Deploy frontend last
echo "Deploying frontend..."
docker compose -f docker-compose.yml up -d chat-royale-frontend
sleep 30

# Check status
echo "Checking container status..."
docker compose ps

echo "✅ Deployment complete!"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:3001"
echo "MCP: http://localhost:8000" 