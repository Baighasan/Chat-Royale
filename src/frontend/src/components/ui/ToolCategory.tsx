import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolCategoryProps {
  name: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const ToolCategory: React.FC<ToolCategoryProps> = ({ name, icon: Icon, children }) => {
  return (
    <div className="mb-6 last:mb-0">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="rounded-lg p-2"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <h3
          className="text-text-primary text-lg font-bold tracking-wide"
          style={{
            textShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
          }}
        >
          {name}
        </h3>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
};

export default ToolCategory;
