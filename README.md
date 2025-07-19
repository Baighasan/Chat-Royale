# Chat Royale

A real-time chat application that provides AI-powered Clash Royale insights through OpenAI GPT-4o-mini integration and a comprehensive MCP (Model Context Protocol) server.

🌐 **Live Demo**: [https://chat-royale.com](https://chat-royale.com)

## Project Overview

Chat Royale enables natural language interactions with Clash Royale game data. Ask questions like "Show me stats for player #ABC123" or "What's my clan's current river race status?" and get detailed, real-time responses powered by the official Clash Royale API.

## Architecture

The project consists of three containerized services working together:

### 🔧 MCP Server (`src/mcp/`)
**Technology**: Python 3.12, FastMCP, Clash Royale API

A comprehensive Model Context Protocol server that exposes 8 categories of Clash Royale tools:

- **Players**: Player stats, battle logs, upcoming chests
- **Clans**: Clan info, member data, river race status, war logs
- **Cards**: Card database and meta information
- **Tournaments**: Global tournaments and leaderboards
- **Locations**: Regional rankings by country/region
- **Challenges**: Current and upcoming challenges
- **Leaderboards**: Global and seasonal rankings
- **Global Tournaments**: Tournament-specific data and standings

The MCP server runs on port 8000 and provides structured tool definitions that the AI can invoke during conversations.

### 🌐 Backend API (`src/backend/`)
**Technology**: Node.js, Express, TypeScript, OpenAI SDK, MCP Client

- Integrates OpenAI GPT-4o-mini with MCP tools via `@modelcontextprotocol/sdk`
- Streams real-time responses including tool usage and execution
- Handles tool discovery and automatic connection to the MCP server
- Provides health checks and rate limiting

**Key Features**:
- Real-time streaming with Server-Sent Events (SSE)
- Automatic tool discovery from MCP server
- Visual feedback for tool execution states
- Error handling and graceful degradation

### 🎨 Frontend UI (`src/frontend/`)
**Technology**: React, TypeScript, Vite, TailwindCSS

- Modern chat interface with real-time streaming
- Visual indicators for tool usage and execution
- Markdown support for formatted responses
- Responsive design optimized for mobile and desktop

## MCP Integration Flow

1. **Tool Discovery**: Backend connects to MCP server and discovers available Clash Royale tools
2. **Chat Processing**: User message is sent to OpenAI with tool definitions
3. **Tool Execution**: When AI decides to use a tool, the backend executes it via MCP client
4. **Streaming Response**: Tool usage, execution, and results are streamed to frontend in real-time
5. **Contextual Continuation**: AI uses tool results to provide comprehensive answers

## Deployment

### Production Environment
- **Platform**: AWS Lightsail
- **CDN**: Cloudflare
- **URL**: [https://chat-royale.com](https://chat-royale.com)
- **Containerization**: Docker Compose with production optimizations

### CI/CD Pipeline
Automated deployment via GitHub Actions:
- **Trigger**: Push to `main` branch
- **Process**: SSH to Lightsail → Git pull → Docker rebuild
- **Zero-downtime**: Health checks ensure service availability

### Quick Deploy
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Clash Royale API key

### Environment Configuration
**Backend** (`src/backend/.env`):
```env
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
PORT=3001
```

**MCP Server** (`src/mcp/.env`):
```env
CLASH_ROYALE_API_KEY=your_clash_royale_api_key
```

### Local Development
```bash
# Start all services
docker-compose up -d

# Or run individually:
# MCP Server
cd src/mcp && uv run src/main.py

# Backend
cd src/backend && npm run dev

# Frontend  
cd src/frontend && npm run dev
```

## API Endpoints

- `POST /api/chat` - Streaming chat with MCP tool integration
- `GET /api/health` - Service health check

## Streaming Events

The real-time interface supports these event types:
- `content_delta` - AI text responses
- `tool_use_start` - Tool invocation begins
- `tool_input_delta` - Tool parameters being built
- `tool_execution_start` - Tool execution starts
- `tool_result` - Tool execution results
- `tool_error` - Tool execution errors
- `message_stop` - Response completion

## Technology Stack

| Component | Technologies |
|-----------|-------------|
| **MCP Server** | Python 3.12, FastMCP, Requests |
| **Backend** | Node.js, Express, TypeScript, OpenAI SDK |
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Deployment** | Docker, AWS Lightsail, Cloudflare, GitHub Actions |
| **APIs** | OpenAI GPT-4o-mini, Clash Royale API |

---

*Built with Model Context Protocol for extensible AI tool integration*