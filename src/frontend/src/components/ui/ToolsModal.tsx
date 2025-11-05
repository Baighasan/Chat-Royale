import React, { useEffect } from 'react';
import { X, User, Users, FileText, Trophy, MapPin, Calendar, Crown, Shield } from 'lucide-react';
import ToolCategory from './ToolCategory';
import ToolItem from './ToolItem';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tools-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-glass animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{
            borderColor: 'rgba(148, 163, 184, 0.2)',
          }}
        >
          <h2
            id="tools-modal-title"
            className="text-2xl font-bold text-text-primary tracking-wide"
            style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
            }}
          >
            Available Tools
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          className="overflow-y-auto px-6 py-6"
          style={{
            maxHeight: 'calc(90vh - 80px)',
          }}
        >
          {/* Player Information Category */}
          <ToolCategory name="Player Information" icon={User}>
            <ToolItem
              icon={User}
              name="Player Profile"
              description="View comprehensive player stats, deck, trophies, clan membership, donations, and tournament data"
            />
            <ToolItem
              icon={Shield}
              name="Battle History"
              description="Check recent battle logs including game modes, deck compositions, and battle outcomes"
            />
          </ToolCategory>

          {/* Clan Information Category */}
          <ToolCategory name="Clan Information" icon={Users}>
            <ToolItem
              icon={Users}
              name="Clan Search"
              description="Find clans by name, location, member count, or score requirements"
            />
            <ToolItem
              icon={Users}
              name="Clan Profile"
              description="View detailed clan information including members, war stats, description, and requirements"
            />
            <ToolItem
              icon={Users}
              name="Member List"
              description="See all clan members with their roles, trophies, donations, and activity status"
            />
          </ToolCategory>

          {/* Game Data Category */}
          <ToolCategory name="Game Data" icon={FileText}>
            <ToolItem
              icon={FileText}
              name="Card Database"
              description="Browse all available cards with details like elixir cost, rarity, max level, and evolution status"
            />
          </ToolCategory>

          {/* Rankings & Leaderboards Category */}
          <ToolCategory name="Rankings & Leaderboards" icon={Trophy}>
            <ToolItem
              icon={MapPin}
              name="Locations"
              description="Get all available regions and locations for location-based rankings"
            />
            <ToolItem
              icon={Calendar}
              name="Seasons"
              description="View all available seasons and their identifiers for season-based leaderboards"
            />
            <ToolItem
              icon={Crown}
              name="Path of Legends (by Location)"
              description="View top Path of Legends players ranked by specific location or region"
            />
            <ToolItem
              icon={Crown}
              name="Path of Legends (by Season)"
              description="Check global Path of Legends rankings for a specific season"
            />
            <ToolItem
              icon={Trophy}
              name="Clan Rankings"
              description="View top clans ranked by trophy count for a specific location"
            />
            <ToolItem
              icon={Trophy}
              name="Clan War Rankings"
              description="See top clans ranked by war trophy count for a specific location"
            />
          </ToolCategory>

          {/* Info Note */}
          <div
            className="mt-6 p-4 rounded-xl text-sm text-text-secondary"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <p className="leading-relaxed">
              💡 <span className="font-semibold text-text-primary">Tip:</span> I can access all these tools automatically during our conversation. Just ask me about any Clash Royale topic, and I'll use the right tools to help you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal;
