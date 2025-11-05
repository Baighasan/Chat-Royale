# Chat Royale - Project Reference

## Overview

**Chat Royale** is an AI-powered Clash Royale assistant that combines Google's Gemini 2.0 Flash Lite with real-time game data access through the Clash Royale API. The application uses the Model Context Protocol (MCP) to provide structured access to comprehensive game data.

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

**Purpose**: Node.js/Express server that integrates Google Gemini with MCP client for chat processing

**Architecture**:
- **Framework**: Node.js 18+, Express, TypeScript
- **Port**: 3001
- **Dependencies**: `@google/genai`, `@modelcontextprotocol/sdk`, `express`, `cors`, `helmet`, `express-rate-limit`, `uuid`

**Key Files**:
- `src/server.ts:1-116` - Main server setup, middleware, and Gemini service initialization
- `src/services/geminiService.ts:1-365` - Gemini integration, MCP client management, and session handling
- `src/api/chat.ts:1-77` - Chat endpoint with request validation and session clearing
- `src/api/health.ts` - Health check endpoint with Gemini status
- `src/config/index.ts:1-39` - Environment configuration and validation for both Gemini and OpenAI
- `src/utils/logger.ts:1-16` - Custom console-based logger with timestamps

**Core Features**:

**Gemini Integration** (`geminiService.ts`):
- Model: `gemini-2.0-flash-lite` (configurable via `GEMINI_MODEL_NAME`)
- MCP client with StreamableHTTP transport
- Tool execution with iterative Gemini calls (max 5 iterations)
- Tool chaining: Results from one tool call feed back into Gemini for continued processing
- Lazy initialization on first chat request
- Automatic MCP reconnection on failure

**Session Management**:
- User-based persistent chat sessions using IP/User-Agent hash (SHA-256)
- Session format: `session_{user_identifier}` for consistent conversation history
- 24-hour session timeout with automatic cleanup (hourly interval)
- Manual session clearing via `/api/chat/clear` endpoint
- Session metadata: creation time, last activity tracking

**Security & Middleware**:
- CORS with configurable origins
- Helmet security headers
- Rate limiting (100 requests/15 minutes default)
- Request size limits (10MB)
- Input validation and sanitization

**API Endpoints**:
- `POST /api/chat` - Main chat processing endpoint with session persistence
- `POST /api/chat/clear` - Clear user's chat session manually
- `GET /api/health` - Health check with Gemini and MCP status

**Configuration**:
- **Environment**: `GEMINI_API_KEY` (required), `OPENAI_API_KEY` (validated but unused), `PORT`, `NODE_ENV`
- **Model Configuration**: `GEMINI_MODEL_NAME` (default: `gemini-2.0-flash-lite`)
- **Rate Limiting**: Configurable window and max requests (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)
- **CORS Origins**: Production vs development domains

**Error Handling**:
- Centralized error middleware (`errorHandler.ts`)
- Custom console-based structured logging with timestamps
- Graceful shutdown handling with session cleanup

### 3. Frontend (`src/frontend/`)

**Purpose**: React-based chat interface with markdown support and Clash Royale theming

**Architecture**:
- **Framework**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom Clash Royale theme and typography plugin
- **Build Tool**: Vite with TypeScript
- **Production Server**: nginx (Alpine-based) with custom configuration

**Dependencies**:
- **Core**: `react`, `react-dom`, `zustand`
- **Markdown & Syntax**: `react-markdown`, `react-syntax-highlighter`
- **Icons**: `lucide-react`
- **Styling**: `tailwindcss`, `@tailwindcss/typography`, `autoprefixer`, `postcss`

**Key Files**:
- `src/App.tsx:1-7` - Root application component
- `src/components/layout/AppLayout.tsx:1-17` - Main layout structure
- `src/store/chatStore.ts:1-58` - Chat state management with Zustand
- `src/services/chatService.ts:1-26` - API communication layer
- `src/types/index.ts` - TypeScript interfaces
- `nginx.conf:1-81` - Production nginx configuration with gzip, caching, and SPA routing
- `Dockerfile:1-65` - Multi-stage build (development with Vite, production with nginx)

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
- TailwindCSS with typography plugin for markdown rendering

**Production Configuration** (`nginx.conf`):
- **Server**: nginx on Alpine Linux (port 80)
- **Gzip Compression**: Enabled for text/JS/CSS/JSON with level 6
- **Caching**: 1-year cache for static assets (JS, CSS, images, fonts)
- **SPA Routing**: All routes fallback to index.html for React Router
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy
- **Health Check**: `/health` endpoint returns 200 "healthy"
- **Non-root User**: Runs as nginx user for security

## Production Deployment

### Infrastructure
- **Platform**: AWS Lightsail
- **DNS/CDN**: Cloudflare
- **Containerization**: Docker with multi-stage builds
- **Web Server**: nginx (Alpine) for frontend static file serving
- **Orchestration**: Docker Compose with development and production overlays

### Docker Configuration

**Development** (`docker-compose.yml`):
- All services with development builds
- Port exposure: Frontend Vite dev server (5173→3000), Backend (3001), MCP (8000)
- Volume mounts for live development and hot reload
- Frontend runs Vite dev server with HMR

**Production** (`docker-compose.prod.yml`):
- Optimized production builds with multi-stage Dockerfiles
- Frontend: nginx Alpine serving static built assets (port 80→8080)
- Health checks for all services
- Environment-specific configurations
- Reduced image sizes and non-root users

**Service Dependencies**:
```
Frontend (nginx) → Backend (Express) → MCP Server (FastMCP) → Clash Royale API
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
- `GEMINI_API_KEY` - Google Gemini API authentication (required)
- `OPENAI_API_KEY` - Legacy validation (validated but unused, still required by config)
- `GEMINI_MODEL_NAME` - Gemini model to use (default: `gemini-2.0-flash-lite`)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (`development` or `production`)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 900000 = 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `FRONTEND_URL` - Frontend URL for CORS in production

**MCP Server** (`src/mcp/.env`):
- `CR_API_KEY` - Clash Royale API token
- `PYTHONUNBUFFERED` - Python output buffering (set to 1 in Docker)
- `PYTHONDONTWRITEBYTECODE` - Prevent .pyc files (set to 1 in Docker)

**Frontend** (Build Args):
- `VITE_API_BASE_URL` - Backend API endpoint (set during Docker build)

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
   # Backend (both keys currently required by config)
   echo "GEMINI_API_KEY=your_gemini_key" > src/backend/.env
   echo "OPENAI_API_KEY=your_openai_key" >> src/backend/.env

   # MCP Server
   echo "CR_API_KEY=your_clash_royale_key" > src/mcp/.env
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
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand, react-markdown, react-syntax-highlighter, lucide-react
- **Backend**: Node.js 18+, Express, TypeScript, Google Gemini SDK (`@google/genai`), MCP SDK
- **MCP Server**: Python 3.12, FastMCP, Requests
- **Infrastructure**: Docker (multi-stage builds), nginx (Alpine), AWS Lightsail, Cloudflare DNS

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
3. Backend validates request and retrieves/creates user session (based on IP/User-Agent hash)
4. Backend lazily initializes Gemini service and connects to MCP server (discovers tools on first request)
5. Gemini processes message with available MCP tools using function calling
6. If tools needed: Backend executes via MCP and feeds results back to Gemini
7. Iterative tool execution and chaining (max 5 cycles) until completion
8. Final response returned as JSON to frontend with conversation ID
9. Frontend displays response with markdown rendering and syntax highlighting
10. Session persists for 24 hours or until manually cleared via `/api/chat/clear`

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
│   │   │   ├── services/       # Gemini & MCP integration
│   │   │   │   └── geminiService.ts  # Gemini client and session management
│   │   │   ├── api/           # Route handlers (chat, health)
│   │   │   ├── config/        # Environment configuration
│   │   │   ├── middleware/    # Error handling middleware
│   │   │   └── utils/         # Custom logger
│   │   ├── package.json       # Node.js dependencies
│   │   └── Dockerfile         # Multi-stage backend container
│   └── frontend/              # React Application
│       ├── src/
│       │   ├── App.tsx        # Root component
│       │   ├── components/    # React components
│       │   ├── store/         # Zustand state management
│       │   └── services/      # API client
│       ├── nginx.conf         # Production nginx configuration
│       ├── package.json       # React dependencies
│       └── Dockerfile         # Multi-stage frontend container (Vite dev / nginx prod)
├── docker-compose.yml         # Development configuration
├── docker-compose.prod.yml    # Production overrides
└── .github/workflows/         # CI/CD pipeline
```

This reference provides comprehensive coverage of the Chat Royale project architecture, focusing on the MCP server's tool ecosystem, backend's Google Gemini integration with persistent session management, frontend's React architecture with nginx production serving, and production deployment on AWS Lightsail with Cloudflare DNS.