import React from 'react';
import { Trophy } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-background-header w-full py-3 sm:py-5 shadow-md">
      <div
        className="max-w-full sm:max-w-5xl mx-auto flex flex-row items-center rounded-2xl bg-background-header border-2 border-[#6b8ac7] px-3 sm:px-12 py-3 sm:py-5"
        style={{ boxShadow: '0 2px 8px #0003', minHeight: 64 }}
      >
        {/* Logo and text */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-accent flex items-center justify-center overflow-hidden border-2 border-white mr-3 sm:mr-6 flex-shrink-0">
            <img src="/images/clash-royale-icon.png" alt="Clash Royale Icon" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span
              className="text-base sm:text-3xl font-bold text-white font-sans tracking-wide leading-tight truncate"
              style={{ fontFamily: 'Supercell Magic, Inter, sans-serif', textShadow: '0 2px 2px #0008' }}
            >
              Chat Royale
            </span>
            <span className="flex items-center mt-1">
              <span className="inline-block w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-green-400 border-2 border-white mr-2 sm:mr-3"></span>
              <span className="font-bold text-xs sm:text-lg truncate" style={{ color: '#b3d6ff', textShadow: '0 2px 6px #000a, 0 1px 0 #fff8' }}>
                Members online: 2
              </span>
            </span>
          </div>
        </div>
        {/* Trophy count */}
        <div className="flex items-center ml-3 sm:ml-10">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-[#d1a3f7] mr-2 sm:mr-3" fill="#d1a3f7" style={{ filter: 'drop-shadow(0 2px 2px #0006)' }} />
          <span className="text-base sm:text-3xl font-extrabold text-[#f5c6f7]" style={{ fontFamily: 'Supercell Magic, Inter, sans-serif', textShadow: '0 2px 2px #0008' }}>
            1495
          </span>
        </div>
      </div>
    </header>
  );
}; 