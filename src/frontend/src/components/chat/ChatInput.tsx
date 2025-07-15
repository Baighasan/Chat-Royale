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
      name: 'You',
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
    <div className="fixed bottom-0 left-0 w-full z-20 flex justify-center pointer-events-none">
      <div className="border border-border p-4 rounded-xl shadow-xl max-w-5xl w-full m-4 pointer-events-auto" style={{ backgroundColor: '#42537a' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="w-full resize-none rounded-lg border border-border bg-background-secondary text-text-primary placeholder-text-secondary px-3 py-0 pr-12 focus:outline-none focus:ring-2 focus:ring-accent focus-border-transparent disabled:opacity-50 h-12 text-sm leading-[48px]"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 text-sm"
          >
            <Send className="w-5 h-5 text-background-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}; 