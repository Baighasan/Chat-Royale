import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { Message } from './Message';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export const MessageList: React.FC = () => {
  const { messages, isLoading } = useChatStore();
  const scrollRef = useAutoScroll([messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-hide"
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to Claude Chat</h2>
            <p className="text-sm">Start a conversation by typing a message below.</p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex gap-3 p-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <div className="w-5 h-5 text-background-primary">🤖</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <LoadingIndicator />
          </div>
        </div>
      )}
    </div>
  );
}; 