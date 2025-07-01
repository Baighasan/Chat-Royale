# Chat Royale

A real-time chat application with Claude AI integration and MCP (Model Context Protocol) tools support.

## Features

- Real-time streaming chat with Claude AI
- MCP (Model Context Protocol) tools integration
- Modern React frontend with TypeScript
- Express.js backend with streaming support
- Tool execution with real-time feedback

## MCP Tools Integration

This application supports MCP tools that can be used by Claude during conversations. The tools are automatically available when an MCP server is running.

### How it works

1. **Tool Discovery**: The backend connects to an MCP server and discovers available tools
2. **Streaming Tool Use**: When Claude decides to use a tool, it streams the tool call in real-time
3. **Tool Execution**: The backend executes the tool via the MCP client
4. **Result Streaming**: Tool results are streamed back to the frontend
5. **Visual Feedback**: The frontend shows tool usage, execution, and results in real-time

### Supported Events

The streaming implementation supports the following events:

- `content_delta`: Text content from Claude
- `tool_use_start`: When Claude starts using a tool
- `tool_input_delta`: Tool input parameters being built
- `tool_execution_start`: When tool execution begins
- `tool_result`: Tool execution results
- `tool_error`: Tool execution errors
- `message_stop`: End of Claude's response

### Setting up MCP Tools

1. Start your MCP server (e.g., on `http://127.0.0.1:8000/mcp`)
2. The backend will automatically connect and discover available tools
3. Tools will be available to Claude in conversations

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MCP server (optional, for tool functionality)

### Backend Setup

```bash
cd src/backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd src/frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
NODE_ENV=development
PORT=3001
```

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **AI**: Anthropic Claude API with streaming
- **Tools**: MCP (Model Context Protocol) integration
- **Real-time**: Server-Sent Events (SSE) for streaming

## API Endpoints

- `POST /api/chat` - Streaming chat endpoint
- `GET /api/health` - Health check endpoint

## Tool Integration Flow

1. User sends message
2. Backend connects to MCP server (if not already connected)
3. Claude receives message with available tools
4. If Claude uses a tool:
   - Tool use is streamed to frontend
   - Tool input parameters are built incrementally
   - Tool is executed via MCP client
   - Results are streamed back
5. Claude continues with final response
6. Complete conversation is displayed to user

## 🌟 Features

- **Player Analytics**: Get detailed player statistics, battle logs, and upcoming chests
- **Clan Management**: Access clan information, member lists, and river race data
- **Tournament Tracking**: Monitor global tournaments and leaderboards
- **Card Database**: Explore card information and meta analysis
- **Location Rankings**: View regional player and clan rankings
- **Challenge Information**: Stay updated on current and upcoming challenges
- **Natural Language Interface**: Ask questions in plain English and get structured responses

## 🏗️ Architecture

Chat Royale consists of two main components:

### MCP Server (`/server`)
A comprehensive Model Context Protocol server that provides tools for accessing the Clash Royale API:

- **Player Tools**: Battle logs, player info, upcoming chests
- **Clan Tools**: Clan info, members, river race data, war logs
- **Card Tools**: Card database and statistics
- **Tournament Tools**: Global tournaments and rankings
- **Location Tools**: Regional rankings and location data
- **Challenge Tools**: Current and upcoming challenge information
- **Leaderboard Tools**: Global and seasonal rankings

### Client (`/client`)
*Coming Soon* - A user-friendly chat interface for interacting with Clash Royale data

## 💬 Example Interactions

Once connected to an MCP-compatible client, you can ask questions like:

- "Show me the stats for player #ABC123"
- "What's the current river race status for clan Warriors?"
- "Who are the top players in the United States?"
- "What challenges are currently available?"
- "Tell me about the Knight card"

## 🔗 Links

- [Clash Royale API Documentation](https://developer.clashroyale.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---