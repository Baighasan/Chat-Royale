# Production Deployment Guide

This guide covers deploying Chat Royale to production with proper security, performance, and monitoring configurations.

## Prerequisites

- Docker and Docker Compose installed
- A VPS or cloud server with at least 2GB RAM and 1 vCPU
- Domain name (optional but recommended for HTTPS)
- OpenAI API key

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd Chat-Royale
```

### 2. Configure Environment Variables

#### Backend Configuration
```bash
# Copy the production template
cp src/backend/env.production.example src/backend/.env

# Edit with your actual values
nano src/backend/.env
```

Required variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `FRONTEND_URL`: Your frontend domain (e.g., `https://yourdomain.com`)
- `NODE_ENV`: Set to `production`

#### MCP Configuration
```bash
# Copy the production template
cp src/mcp/env.production.example src/mcp/.env

# Edit with your actual values
nano src/mcp/.env
```

### 3. Deploy to Production

#### Using the Deployment Script (Recommended)

**Windows:**
```powershell
.\deploy-prod.ps1
```

**Linux/macOS:**
```bash
./deploy-prod.sh
```

#### Manual Deployment
```bash
# Set production environment
export NODE_ENV=production

# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Production Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o-mini

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Logging
ENABLE_REQUEST_LOGGING=false

# MCP Server Configuration
MCP_SERVER_URL=http://clash-royale-mcp-server:8000
```

#### MCP (.env)
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# Logging
LOG_LEVEL=INFO
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Use strong, unique API keys and rotate them regularly
3. **CORS**: Configure CORS to only allow your frontend domain
4. **Rate Limiting**: Adjust rate limits based on your expected traffic
5. **HTTPS**: Use a reverse proxy (Nginx/Caddy) for SSL termination

### Performance Optimizations

1. **Resource Limits**: The production compose file includes memory and CPU limits
2. **Caching**: Frontend assets are cached for 1 year
3. **Compression**: Gzip compression is enabled for all text-based assets
4. **Health Checks**: All services have health check endpoints

## Monitoring and Maintenance

### Health Checks

- **Frontend**: `http://localhost/health`
- **Backend**: `http://localhost:3001/api/health`
- **MCP**: `http://localhost:8000/mcp`

### Logs

View service logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f chat-royale-backend
docker-compose logs -f chat-royale-frontend
docker-compose logs -f clash-royale-mcp-server
```

### Updates

To update the application:

1. Pull the latest code
2. Rebuild and restart services:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Backup

Backup your environment files and any persistent data:
```bash
# Backup environment files
tar -czf backup-$(date +%Y%m%d).tar.gz src/*/.env

# Backup Docker volumes (if any)
docker run --rm -v chat-royale_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Services not starting**: Check logs with `docker-compose logs [service-name]`
2. **Health checks failing**: Verify environment variables are set correctly
3. **CORS errors**: Ensure `FRONTEND_URL` is set correctly in backend `.env`
4. **Memory issues**: Adjust resource limits in `docker-compose.prod.yml`

### Debug Mode

To enable debug logging:
```bash
# Set in backend .env
ENABLE_REQUEST_LOGGING=true
```

### Scaling

For higher traffic, consider:
1. Using Docker Swarm or Kubernetes
2. Adding a load balancer
3. Implementing Redis for session storage
4. Using a managed database service

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] API keys are secure and not exposed
- [ ] CORS is configured for production domains
- [ ] Rate limiting is enabled
- [ ] HTTPS is configured (via reverse proxy)
- [ ] Non-root users are used in containers
- [ ] Health checks are working
- [ ] Logs are being monitored
- [ ] Regular backups are scheduled

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test health endpoints manually
4. Check Docker resource usage: `docker stats` 