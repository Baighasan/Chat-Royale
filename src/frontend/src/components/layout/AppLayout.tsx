import React from 'react';
import { Header } from './Header';
import { MessageList } from '../chat/MessageList';
import { ChatInput } from '../chat/ChatInput';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background-primary">
      <Header />
      <div className="pt-6" />
      <main className="flex-1 flex flex-col min-h-0 relative">
        <MessageList />
        <ChatInput />
      </main>
    </div>
  );
}; 