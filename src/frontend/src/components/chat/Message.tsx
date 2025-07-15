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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-12 py-2`}>
      <div className={`relative max-w-[40%] ${isUser ? '' : ''}`} style={{ marginLeft: isUser ? '5px' : '0', marginRight: isUser ? '0' : '5px' }}>
        {/* Speech bubble shape */}
        <div
          className={`rounded-[22px] shadow-md px-4 py-3 bg-[#eef7ff]`}
          style={{
            borderTopLeftRadius: isUser ? 22 : 0,
            borderTopRightRadius: isUser ? 0 : 22,
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
            boxShadow: '0 4px 0 #2a3c5a',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold" style={{ color: '#009cff', fontSize: 16, letterSpacing: 1 }}>{message.name}</span>
            <span className="ml-2 text-xs font-semibold" style={{ color: '#bfc9d8', fontSize: 12 }}>{message.role === 'assistant' ? 'Elder' : 'Elder'}</span>
          </div>
          <div className="mb-2" style={{ color: '#586270', fontSize: 14, fontWeight: 600, wordBreak: 'break-word' }}>
            <ReactMarkdown
              components={{
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !match ? (
                    <CodeBlock className={className} {...props}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code className="bg-background-primary px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-semibold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mb-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-4 italic text-text-secondary">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="text-xs font-semibold" style={{ color: '#bfc9d8', fontSize: 11 }}>
            {/* Example: 1h 20min ago */}
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {/* Speech bubble pointer */}
        <div
          className="absolute top-6"
          style={{
            left: isUser ? 'auto' : '-18px',
            right: isUser ? '-18px' : 'auto',
            width: 0,
            height: 0,
            borderTop: '12px solid transparent',
            borderBottom: '12px solid transparent',
            borderLeft: isUser ? '18px solid #eef7ff' : 'none',
            borderRight: isUser ? 'none' : '18px solid #eef7ff',
          }}
        />
      </div>
    </div>
  );
}; 