import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Message } from '../../types';

export const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, addMessage, processChat, setError } = useChatStore();

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setError(null);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      await processChat({
        message: userMessage.content,
        history,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background-primary p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="w-full resize-none rounded-lg border border-border bg-background-secondary text-text-primary placeholder-text-secondary p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
        >
          <Send className="w-5 h-5 text-background-primary" />
        </button>
      </div>
      
      <div className="text-xs text-text-secondary mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}; 