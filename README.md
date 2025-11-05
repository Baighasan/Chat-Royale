# Chat Royale

AI-powered Clash Royale agent using Gemini 2.0 with MCP tools for real-time game data access.

## Full Technical Deep Dive

I recently wrote a technical breakdown on the architecture, my building process and other cool things about this project. You can read it on my websites here:

[Full Technical Deep Dive](https://hasanbaig.net/projects/chat-royale/)

## Architecture

Three containerized services:

**MCP Server** (`src/mcp/`) - Python FastMCP server exposing Clash Royale API tools:
- Players, Clans, Cards, Rankings

**Backend API** (`src/backend/`) - Node.js/Express server:
- Integrates Gemini with MCP client via `@modelcontextprotocol/sdk`
- Standard JSON request/response (no streaming)
- Tool execution handled internally with iterative Gemini calls

**Frontend** (`src/frontend/`) - React/TypeScript UI:
- Simple chat interface with markdown support
- Standard HTTP requests to backend API

## How It Works

1. User sends message to frontend
2. Frontend posts to backend `/api/chat`
3. Backend connects to MCP server and discovers tools
4. Gemini processes message with available tools
5. If tools needed: backend executes via MCP, feeds results back to OpenAI
6. Final response returned as JSON to frontend

## Deployment

**Production**: AWS Lightsail with Cloudflare CDN

**CI/CD**: GitHub Actions auto-deploy on `main` branch push/merge

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## Development

```bash
# Environment setup
# Backend: src/backend/.env - GEMINI_API_KEY
# MCP: src/mcp/.env - CR_API_KEY

# Run all services
docker-compose up -d
```

## Tech Stack

- **MCP Server**: Python 3.12, FastMCP, Clash Royale API
- **Backend**: Node.js, Express, TypeScript, Gemini SDK
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Deployment**: Docker, AWS Lightsail, Cloudflare, GitHub Actions
