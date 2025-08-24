# Chat Royale - Project Reference

## Overview

**Chat Royale** is an AI-powered Clash Royale assistant that combines OpenAI's GPT-4o-mini with real-time game data access through the Clash Royale API. The application uses the Model Context Protocol (MCP) to provide structured access to comprehensive game data.

**Live URL**: [https://chat-royale.com](https://chat-royale.com)

## Architecture Overview

The project follows a three-tier microservices architecture with containerized services:

```
Frontend (React) → Backend (Node.js/Express) → MCP Server (Python) → Clash Royale API
```

## Component Breakdown

### 1. MCP Server (`src/mcp/`)

**Purpose**: Python-based FastMCP server that exposes Clash Royale API functionality as MCP tools

**Architecture**:
- **Framework**: Python 3.12, FastMCP
- **Port**: 8000
- **Transport**: Streamable HTTP
- **Dependencies**: `mcp[cli]`, `requests`, `python-dotenv`, `pytest`

**Key Files**:
- `src/main.py:14-32` - FastMCP server initialization and tool registration
- `src/tools/__init__.py:1-24` - Tool exports and initialization
- `src/tools/utils.py:18-81` - API utilities (request handling, tag encoding, query building)
- `src/tools/*.py` - Individual tool implementations for each API category

**Available Tools**:
1. **Players** (`players.py`) - Player info, battle logs, upcoming chests
2. **Clans** (`clans.py`) - Clan info, members, war logs, river race logs
3. **Cards** (`cards.py`) - Card information and statistics
4. **Tournaments** (`tournaments.py`) - Tournament data and management
5. **Locations** (`locations.py`) - Location-based data
6. **Challenges** (`challenges.py`) - Challenge information
7. **Leaderboards** (`leaderboards.py`) - Rankings and leaderboards
8. **Global Tournaments** (`globaltournaments.py`) - Global tournament data

**Configuration**:
- **Environment**: `CR_API_KEY` (Clash Royale API token)
- **Base URL**: `https://api.clashroyale.com/v1`
- **Logging**: INFO level with timestamps

**Health Check**: `GET /mcp` endpoint with curl-based Docker health checks

### 2. Backend API (`src/backend/`)

**Purpose**: Node.js/Express server that integrates OpenAI with MCP client for chat processing

**Architecture**:
- **Framework**: Node.js 18+, Express, TypeScript
- **Port**: 3001
- **Dependencies**: `openai`, `@modelcontextprotocol/sdk`, `express`, `cors`, `helmet`

**Key Files**:
- `src/server.ts:1-117` - Main server setup, middleware, and MCP connection
- `src/services/openaiService.ts:1-100+` - OpenAI integration and MCP client management
- `src/api/chat.ts:1-63` - Chat endpoint with request validation
- `src/api/health.ts` - Health check endpoint
- `src/config/index.ts:1-32` - Environment configuration and validation

**Core Features**:

**OpenAI Integration** (`openaiService.ts`):
- Model: `gpt-4o-mini` (configurable)
- MCP client with StreamableHTTP transport
- Tool execution with iterative OpenAI calls (max 5 iterations)
- Conversation ID tracking for logging
- Automatic MCP reconnection on failure

**Security & Middleware**:
- CORS with configurable origins
- Helmet security headers
- Rate limiting (100 requests/15 minutes default)
- Request size limits (10MB)
- Input validation and sanitization

**API Endpoints**:
- `POST /api/chat` - Main chat processing endpoint
- `GET /api/health` - Health check with MCP status

**Configuration**:
- **Environment**: `OPENAI_API_KEY`, `PORT`, `NODE_ENV`
- **Rate Limiting**: Configurable window and max requests
- **CORS Origins**: Production vs development domains

**Error Handling**:
- Centralized error middleware (`errorHandler.ts`)
- Structured logging with Winston
- Graceful shutdown handling

### 3. Frontend (`src/frontend/`)

**Purpose**: React-based chat interface with markdown support and Clash Royale theming

**Architecture**:
- **Framework**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom Clash Royale theme
- **Build Tool**: Vite with TypeScript

**Key Files**:
- `src/App.tsx:1-7` - Root application component
- `src/components/layout/AppLayout.tsx:1-17` - Main layout structure
- `src/store/chatStore.ts:1-58` - Chat state management with Zustand
- `src/services/chatService.ts:1-26` - API communication layer
- `src/types/index.ts` - TypeScript interfaces

**Component Architecture**:
```
AppLayout
├── Header (Clash Royale branding)
├── MessageList (Chat history with markdown)
└── ChatInput (Message composition)
```

**Key Components**:
- **MessageList** - Displays chat history with auto-scroll
- **Message** - Individual message rendering with markdown support
- **ChatInput** - Text input with send functionality
- **CodeBlock** - Syntax highlighting for code responses
- **LoadingIndicator** - Chat processing feedback

**State Management** (`chatStore.ts`):
- Message history persistence
- Loading states and error handling
- Assistant persona: "Blue King"
- Tool execution details hidden from user

**Services**:
- **chatService.ts**: HTTP client for backend API communication
- **API Base URL**: Configurable via `VITE_API_BASE_URL`

**Styling**:
- Custom Clash Royale color scheme
- Supercell Magic font
- Responsive design
- TailwindCSS with typography plugin

## Production Deployment

### Infrastructure
- **Platform**: AWS Lightsail
- **CDN**: Cloudflare
- **Containerization**: Docker with multi-stage builds

### Docker Configuration

**Development** (`docker-compose.yml`):
- All services with development builds
- Port exposure: Frontend (8080), Backend (3001), MCP (8000)
- Volume mounts for live development

**Production** (`docker-compose.prod.yml`):
- Optimized production builds
- Health checks for all services
- Environment-specific configurations
- Multi-stage Dockerfiles for reduced image size

**Service Dependencies**:
```
Frontend → Backend → MCP Server → Clash Royale API
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
Trigger: Push to main branch
Steps:
  1. Checkout code
  2. Setup SSH to Lightsail
  3. Git pull on server
  4. Docker compose up with production config
```

**Deployment Command**:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Environment Configuration

**Backend** (`src/backend/.env`):
- `OPENAI_API_KEY` - OpenAI API authentication
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode
- `RATE_LIMIT_*` - Rate limiting configuration

**MCP Server** (`src/mcp/.env`):
- `CR_API_KEY` - Clash Royale API token

**Frontend**:
- `VITE_API_BASE_URL` - Backend API endpoint

### Health Monitoring

**Health Checks**:
- **Backend**: HTTP GET to `/api/health`
- **MCP Server**: curl to `/mcp` endpoint
- **Frontend**: nginx status check

**Service Dependencies**:
- Backend waits for MCP server health
- Automatic restart policies for all services

## Development Workflow

### Local Development Setup

1. **Environment Files**:
   ```bash
   # Backend
   echo "OPENAI_API_KEY=your_key" > src/backend/.env
   
   # MCP Server
   echo "CR_API_KEY=your_key" > src/mcp/.env
   ```

2. **Start All Services**:
   ```bash
   docker-compose up -d
   ```

3. **Individual Service Development**:
   ```bash
   # Frontend (React dev server)
   cd src/frontend && npm run dev
   
   # Backend (TypeScript watch mode)
   cd src/backend && npm run dev
   
   # MCP Server (Python with auto-reload)
   cd src/mcp && python src/main.py
   ```

### Build Commands

**Backend**:
```bash
npm run build      # Development build
npm run build:prod # Production build with NODE_ENV
npm run start:prod # Production start
```

**Frontend**:
```bash
npm run build      # Production build
npm run build:prod # Explicit production build
npm run preview    # Preview built application
```

**MCP Server**:
- Uses `uv` for dependency management
- `pyproject.toml` configuration
- Python 3.12+ required

### Testing & Quality

**Linting**:
- Backend: ESLint with TypeScript rules
- Frontend: ESLint with React hooks plugin
- MCP Server: Python with pytest

**Type Safety**:
- Strict TypeScript configuration
- Shared type definitions between frontend/backend
- Runtime validation on API endpoints

## Key Technologies

### Core Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js 18+, Express, TypeScript, OpenAI SDK
- **MCP Server**: Python 3.12, FastMCP, Requests
- **Infrastructure**: Docker, AWS Lightsail, Cloudflare

### Communication Protocols
- **Frontend ↔ Backend**: HTTP/JSON REST API
- **Backend ↔ MCP**: Model Context Protocol over HTTP
- **MCP ↔ Clash Royale API**: HTTP REST with Bearer authentication

### Security Features
- CORS configuration with domain whitelisting
- Helmet security headers
- Rate limiting with configurable windows
- Input validation and sanitization
- Environment-based configuration management
- Non-root Docker users

## API Flow

### Chat Processing Flow
1. User submits message via frontend
2. Frontend sends HTTP POST to `/api/chat`
3. Backend validates request and initializes OpenAI
4. Backend connects to MCP server and discovers tools
5. OpenAI processes message with available MCP tools
6. If tools needed: Backend executes via MCP and feeds results back
7. Iterative tool execution (max 5 cycles) until completion
8. Final response returned as JSON to frontend
9. Frontend displays response with markdown rendering

### Error Handling
- Graceful degradation when MCP server unavailable
- Comprehensive logging at all levels
- User-friendly error messages
- Automatic reconnection attempts
- Health check monitoring

## File Structure Summary

```
Chat-Royale/
├── src/
│   ├── mcp/                    # Python MCP Server
│   │   ├── src/
│   │   │   ├── main.py         # FastMCP server setup
│   │   │   └── tools/          # Clash Royale API tools
│   │   ├── pyproject.toml      # Python dependencies
│   │   └── Dockerfile          # MCP server container
│   ├── backend/                # Node.js API Server
│   │   ├── src/
│   │   │   ├── server.ts       # Express server setup
│   │   │   ├── services/       # OpenAI & MCP integration
│   │   │   ├── api/           # Route handlers
│   │   │   └── config/        # Environment configuration
│   │   ├── package.json       # Node.js dependencies
│   │   └── Dockerfile         # Multi-stage backend container
│   └── frontend/              # React Application
│       ├── src/
│       │   ├── App.tsx        # Root component
│       │   ├── components/    # React components
│       │   ├── store/         # Zustand state management
│       │   └── services/      # API client
│       ├── package.json       # React dependencies
│       └── Dockerfile         # Multi-stage frontend container
├── docker-compose.yml         # Development configuration
├── docker-compose.prod.yml    # Production overrides
└── .github/workflows/         # CI/CD pipeline
```

This reference provides comprehensive coverage of the Chat Royale project architecture, focusing on the MCP server's tool ecosystem, backend's OpenAI integration, frontend's React architecture, and production deployment on AWS Lightsail with Cloudflare CDN.