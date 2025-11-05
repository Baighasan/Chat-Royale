import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolItemProps {
  icon: LucideIcon;
  name: string;
  description: string;
}

const ToolItem: React.FC<ToolItemProps> = ({ icon: Icon, name, description }) => {
  return (
    <div
      className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-glow-purple"
      style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.15) 50%, rgba(109, 40, 217, 0.15) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        boxShadow: 'inset 0 1px 0 0 rgba(168, 85, 247, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Icon Container */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 rounded-lg p-2 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)',
          }}
        >
          <Icon className="w-5 h-5 text-purple-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-text-primary font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">
            {name}
          </h4>
          <p className="text-text-secondary text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolItem;
