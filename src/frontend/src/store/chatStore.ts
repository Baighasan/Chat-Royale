import { create } from 'zustand';
import { Message, ChatState, ChatRequest } from '../types';
import { processChat } from '../services/chatService';

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  processChat: async (request: ChatRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await processChat(request);

      // Create assistant message with the complete response
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      // Use only the main response content, hide tool details from user
      assistantMessage.content = response.content;

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error processing chat:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process chat',
        isLoading: false 
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearMessages: () => {
    set({ messages: [], error: null });
  },
})); 