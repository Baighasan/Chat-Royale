import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message as MessageType } from '../../types';
import { CodeBlock } from '../ui/CodeBlock';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 sm:px-8 py-2 mb-3 animate-fade-in`}>
      <div className={`relative max-w-[90%] sm:max-w-[80%] md:max-w-[75%] group`}>
        {/* Speech bubble with integrated tail via CSS pseudo-element */}
        <div
          className={`
            message-bubble relative
            rounded-2xl px-5 py-4
            transition-all duration-200
            ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'}
          `}
          style={{
            borderRadius: '20px',
            background: isUser
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)',
            boxShadow: `
              0 4px 6px -1px rgba(0, 0, 0, 0.3),
              0 2px 4px -1px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)
            `,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-base text-white/95" style={{ letterSpacing: '0.3px' }}>
              {message.name}
            </span>
            <span className="ml-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
              {message.role === 'assistant' ? 'Elder' : 'Member'}
            </span>
          </div>
          <div className="mb-2 text-sm sm:text-base leading-relaxed text-white/90" style={{ fontWeight: 500, wordBreak: 'break-word' }}>
            <ReactMarkdown
              components={{
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !match ? (
                    <CodeBlock className={className} {...props}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono text-white/95" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm sm:text-base">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-2 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base sm:text-lg font-bold mb-2 text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm sm:text-base font-bold mb-2 text-white">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70 my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="text-xs font-medium text-white/50">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}; 