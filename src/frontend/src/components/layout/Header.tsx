import React from 'react';
import { useChatStore } from '../../store/chatStore';

export const Header: React.FC = () => {
  const { clearMessages } = useChatStore();

  const handleResetChat = () => {
    clearMessages();
  };

  return (
    <header className="w-full py-4 sm:py-6">
      <div className="flex justify-center items-center w-full px-4 gap-3">
        {/* Modern Glassmorphic Header */}
        <div
          className="flex flex-row items-center rounded-2xl px-5 sm:px-8 py-4 w-full backdrop-blur-md shadow-glass transition-all duration-300 hover:shadow-soft-lg border"
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(148, 163, 184, 0.15)',
            maxWidth: '1000px',
          }}
        >
          {/* Left Section - Logo */}
          <div className="flex items-center flex-shrink-0 mr-4 sm:mr-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center overflow-hidden shadow-soft p-1">
              <img src="/images/clash-royale-icon.png" alt="Clash Royale Icon" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Middle Section - Title */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <h1
              className="text-xl sm:text-3xl font-bold text-white leading-tight truncate"
              style={{
                fontFamily: 'Supercell Magic, Inter, sans-serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(59, 130, 246, 0.2)',
                letterSpacing: '0.5px'
              }}
            >
              Chat Royale
            </h1>
            <div className="flex items-center mt-1.5">
              <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400 mr-2 animate-pulse shadow-sm shadow-green-400/50"></span>
              <span className="text-xs sm:text-sm font-medium text-text-secondary">
                Members Online: 2
              </span>
            </div>
          </div>

          {/* Right Section - Reset Button */}
          <button
            onClick={handleResetChat}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-soft hover:shadow-soft-lg"
            title="Reset Chat History"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-6 sm:h-6"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}; 