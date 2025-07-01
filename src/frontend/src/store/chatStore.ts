import { create } from 'zustand';
import { Message, ChatState } from '../types';

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  streamAssistantMessage: async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let currentToolUse: any = null;
    let toolInputBuffer = '';

    // Create initial assistant message
    const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const initialMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, initialMessage],
    }));

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        let currentEvent = '';
        let currentData = '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6).trim();
          } else if (line === '' && currentEvent && currentData) {
            // Empty line indicates end of event block
            try {
              const data = JSON.parse(currentData);
              const eventType = currentEvent;
                
              switch (eventType) {
                case 'content_delta':
                  if (data.delta) {
                    assistantMessage += data.delta;
                    
                    set((state) => ({
                      messages: state.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantMessage }
                          : msg
                      ),
                    }));
                  }
                  break;

                case 'tool_use_start':
                  currentToolUse = {
                    id: data.toolId,
                    name: data.toolName,
                    input: ''
                  };
                  toolInputBuffer = '';
                  
                  // Add tool use indicator to the message
                  const toolIndicator = `\n\n🔧 **Using tool: ${data.toolName}**\n`;
                  assistantMessage += toolIndicator;
                  
                  set((state) => ({
                    messages: state.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantMessage }
                        : msg
                    ),
                  }));
                  break;

                case 'tool_input_delta':
                  if (data.delta && currentToolUse) {
                    toolInputBuffer += data.delta;
                    // Optionally show tool input being built
                    const toolInputPreview = `\n\n🔧 **Using tool: ${currentToolUse.name}**\n\`\`\`json\n${toolInputBuffer}\n\`\`\`\n`;
                    
                    const messageWithToolInput = assistantMessage.replace(
                      new RegExp(`🔧 \\*\\*Using tool: ${currentToolUse.name}\\*\\*.*$`, 's'),
                      toolInputPreview
                    );
                    
                    set((state) => ({
                      messages: state.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: messageWithToolInput }
                          : msg
                      ),
                    }));
                  }
                  break;

                case 'tool_execution_start':
                  // Update the tool indicator to show execution
                  const executionIndicator = `\n\n🔧 **Executing tool: ${data.toolName}**\n`;
                  const messageWithExecution = assistantMessage.replace(
                    new RegExp(`🔧 \\*\\*Using tool: ${data.toolName}\\*\\*.*$`, 's'),
                    executionIndicator
                  );
                  
                  set((state) => ({
                    messages: state.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: messageWithExecution }
                        : msg
                    ),
                  }));
                  break;

                case 'tool_result':
                  // Add tool result to the message
                  const toolResult = `\n\n✅ **Tool Result:**\n\`\`\`json\n${JSON.stringify(data.result, null, 2)}\n\`\`\`\n`;
                  assistantMessage += toolResult;
                  
                  set((state) => ({
                    messages: state.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantMessage }
                        : msg
                    ),
                  }));
                  
                  currentToolUse = null;
                  toolInputBuffer = '';
                  break;

                case 'tool_error':
                  // Add tool error to the message
                  const toolError = `\n\n❌ **Tool Error:** ${data.error}\n`;
                  assistantMessage += toolError;
                  
                  set((state) => ({
                    messages: state.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantMessage }
                        : msg
                    ),
                  }));
                  
                  currentToolUse = null;
                  toolInputBuffer = '';
                  break;

                case 'message_stop':
                  // Final message complete
                  break;

                case 'error':
                  set({ error: data.message || 'An error occurred' });
                  break;
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
            
            // Reset for next event
            currentEvent = '';
            currentData = '';
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
      set({ error: 'Failed to stream response' });
    } finally {
      reader.releaseLock();
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