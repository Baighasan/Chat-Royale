import React from 'react';
import { Trophy } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export const Header: React.FC = () => {
  const { clearMessages } = useChatStore();

  const handleResetChat = () => {
    clearMessages();
  };

  return (
    <header className="bg-background-header w-full py-3 sm:py-5 shadow-md">
      <div className="flex justify-center items-center w-full px-4">
        {/* Header Bubble */}
        <div
          className="flex flex-row items-center rounded-2xl px-4 sm:px-8 py-3 sm:py-5 w-full"
          style={{ 
            background: 'linear-gradient(to bottom, #e5e7eb 0%, #9ca3af 100%)',
            border: '1px solid #6b7280',
            boxShadow: '0 2px 8px #0003', 
            minHeight: 64,
            minWidth: '600px',
            maxWidth: '1100px', // Increased max width
            width: '100%'
          }}
        >
          {/* Left Section - Logo/Crest */}
          <div className="flex items-center flex-shrink-0 mr-4 sm:mr-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-accent flex items-center justify-center overflow-hidden border-2 border-white">
              <img src="/images/clash-royale-icon.png" alt="Clash Royale Icon" className="w-14 h-14 sm:w-18 sm:h-18 object-contain" />
            </div>
          </div>

          {/* Middle Section - Text Information */}
          <div className="flex flex-col justify-center flex-1 min-w-0 mr-4 sm:mr-8">
            <span
              className="text-base sm:text-3xl font-bold text-white font-sans tracking-wide leading-tight truncate"
              style={{ 
                fontFamily: 'Supercell Magic, Inter, sans-serif', 
                textShadow: '0 2px 2px #0008, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                color: '#ffffff'
              }}
            >
              Chat Royale
            </span>
            <span className="flex items-center mt-1">
              <span className="inline-block w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-green-400 border-2 border-white mr-2 sm:mr-3"></span>
              <span 
                className="font-bold text-xs sm:text-lg truncate" 
                style={{ 
                  color: '#6b7280', 
                  textShadow: 'none'
                }}
              >
                Members online: 2
              </span>
            </span>
          </div>

          {/* Right Section - Trophy and Score */}
          <div className="flex items-center flex-shrink-0">
            <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-[#d1a3f7] mr-2 sm:mr-3" fill="#d1a3f7" style={{ filter: 'drop-shadow(0 2px 2px #0006)' }} />
            <span 
              className="text-base sm:text-3xl font-extrabold px-2 py-1 rounded-lg" 
              style={{ 
                fontFamily: 'Supercell Magic, Inter, sans-serif', 
                textShadow: '0 2px 2px #0008',
                color: '#f5c6f7',
                backgroundColor: '#6b7280'
              }}
            >
              1495
            </span>
          </div>
        </div>

        {/* X Button */}
        <button
          onClick={handleResetChat}
          className="ml-4 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(to bottom, #ff6b6b 0%, #e74c3c 50%, #c0392b 100%)',
            border: '2px solid #2c3e50',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            position: 'relative'
          }}
          title="Reset Chat History"
        >
          <div
            className="w-full h-full rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-8 sm:h-8"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))'
                }}
              />
            </svg>
          </div>
        </button>
      </div>
    </header>
  );
}; 