export interface Message {
  id: string;
  role: 'user' | 'assistant';
  name: string; // Added for sender name
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
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  // Tool details are hidden from user responses
}

export interface ToolUse {
  id: string;
  name: string;
  input: any;
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

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  processChat: (request: ChatRequest) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
} 