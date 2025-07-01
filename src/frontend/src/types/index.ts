export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  conversationId: string;
  delta?: string;
  reason?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ToolUse {
  id: string;
  name: string;
  input: any;
}

export interface ToolResult {
  toolId: string;
  result: any;
}

export interface ToolError {
  toolId: string;
  error: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  streamAssistantMessage: (stream: ReadableStream) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
} 