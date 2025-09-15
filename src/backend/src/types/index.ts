
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ToolResult {
  toolId: string;
  toolName: string;
  result: any;
}

export interface ToolError {
  toolId: string;
  toolName: string;
  error: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
} 