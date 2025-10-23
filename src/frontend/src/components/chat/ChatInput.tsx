import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Message } from '../../types';

export const ChatInput: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, addMessage, processChat, setError, inputValue, setInputValue } = useChatStore();
  const input = inputValue;
  const setInput = setInputValue;

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
      <div className="max-w-4xl w-full m-4 sm:m-6 pointer-events-auto">
        <div
          className="backdrop-blur-lg rounded-2xl shadow-glass border transition-all duration-200 hover:shadow-soft-lg p-3 sm:p-4"
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            borderColor: 'rgba(148, 163, 184, 0.2)',
          }}
        >
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isLoading}
                className="w-full resize-none rounded-xl border bg-background-secondary/50 text-text-primary placeholder-text-muted px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-all text-sm sm:text-base"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '200px',
                  borderColor: 'rgba(148, 163, 184, 0.15)',
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-soft hover:shadow-soft-lg hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 