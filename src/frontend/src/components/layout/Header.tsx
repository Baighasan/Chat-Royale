import React from 'react';
import { Bot } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-background-primary px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-background-primary" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary">AI Chat</h1>
      </div>
    </header>
  );
}; 