import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { Message } from './Message';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export const MessageList: React.FC = () => {
  const { messages, isLoading, setInputValue } = useChatStore();
  const scrollRef = useAutoScroll([messages, isLoading]);

  const suggestions = [
    { label: 'Player stats', prompt: 'What are the stats for the player with the id [player id]?' },
    { label: 'Clan info', prompt: 'Tell me about the clan with the name [clan name].' },
    { label: 'Rankings', prompt: 'Who is the top player on path of legends in Canada and what are their stats?' },
  ];

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto pb-32 px-2 sm:px-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent',
      }}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full px-4 py-8">
          <div className="text-center w-full max-w-4xl animate-fade-in-up">
            {/* Floating Logo */}
            <div className="mb-5 flex justify-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center animate-bounce-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(78, 106, 163, 0.4) 0%, rgba(56, 129, 200, 0.3) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.15), 0 0 24px rgba(56, 189, 248, 0.2)',
                }}
              >
                <img src="/images/clash-royale-icon.png" alt="Chat Royale" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              </div>
            </div>

            {/* Welcome Text */}
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 5px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.4)',
                letterSpacing: '0.8px',
              }}
            >
              Welcome to Chat Royale
            </h2>
            <p className="text-sm sm:text-base mb-5" style={{ color: '#bfc9d8', textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>
              Start a conversation by typing a message below.
            </p>

            {/* Suggestion Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(66, 83, 122, 0.7) 0%, rgba(58, 73, 107, 0.7) 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: '#e5e7eb',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start px-4 sm:px-8 py-2 mb-3 animate-fade-in">
            <div className="relative max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
              <div
                className="rounded-2xl shadow-message px-5 py-4 bg-gradient-to-br from-assistant-from to-assistant-to"
                style={{
                  borderRadius: '20px',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-white/95" style={{ letterSpacing: '0.3px' }}>Blue King</span>
                  <span className="ml-3 text-xs font-semibold text-white/60 uppercase tracking-wider">Elder</span>
                </div>
                <div className="mb-2 flex items-center text-white/90 min-h-[24px]">
                  <LoadingIndicator />
                </div>
                <div className="text-xs font-medium text-white/50">
                  typing...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 