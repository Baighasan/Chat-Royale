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
      className="flex-1 overflow-y-auto scrollbar-hide pb-32 text-sm"
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <div className="text-center">
            <h2 className="text-base font-semibold mb-2">Welcome to Chat Royale</h2>
            <p className="text-xs">Start a conversation by typing a message below.</p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start px-12 py-2">
          <div className="relative max-w-[40%]" style={{ marginLeft: '0', marginRight: '5px' }}>
            {/* Speech bubble shape */}
            <div
              className="rounded-[22px] shadow-md px-6 py-4 bg-[#eef7ff]"
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                boxShadow: '0 4px 0 #2a3c5a',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold" style={{ color: '#009cff', fontSize: 16, letterSpacing: 1 }}>Elder</span>
                <span className="ml-2 text-xs font-semibold" style={{ color: '#bfc9d8', fontSize: 12 }}>Elder</span>
              </div>
              <div className="mb-2 flex items-center" style={{ color: '#586270', fontSize: 14, fontWeight: 600, minHeight: 24 }}>
                <LoadingIndicator />
              </div>
              <div className="text-xs font-semibold" style={{ color: '#bfc9d8', fontSize: 11 }}>
                typing...
              </div>
            </div>
            {/* Speech bubble pointer */}
            <div
              className="absolute top-6"
              style={{
                left: '-18px',
                right: 'auto',
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderRight: '18px solid #eef7ff',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 