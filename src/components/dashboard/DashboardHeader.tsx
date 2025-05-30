import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses, getStatusIndicatorStyle } from '../../utils/containerStyles';
import { Palette } from 'lucide-react';
import ElixirLogo from '../ui/ElixirLogo';

interface DashboardHeaderProps {
  onThemeModalOpen: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onThemeModalOpen }) => {
  const { currentTheme } = useTheme();

  return (
    <header 
      className={containerClasses.header}
      style={containerStyles.header(currentTheme)}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/O2genes logo no text.png" 
            alt="O2genes Logo" 
            className="h-14 w-auto"
          />
          <div>
            <ElixirLogo size="md" />
            <p 
              className="text-xs font-medium"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Control System
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onThemeModalOpen}
          className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.textPrimary,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <Palette size={16} />
          <span>Themes</span>
        </button>
        
        {/* Minimal Status Indicator */}
        <div 
          className="flex items-center space-x-3 px-4 py-2 rounded-full text-sm"
          style={{ 
            backgroundColor: `${currentTheme.colors.warning}15`,
            border: `1px solid ${currentTheme.colors.warning}30`
          }}
        >
          <div 
            className="animate-pulse"
            style={getStatusIndicatorStyle(currentTheme, 'warning')}
          ></div>
          <span 
            className="font-medium"
            style={{ color: currentTheme.colors.warning }}
          >
            Pressurizing
          </span>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm" 
             style={{ 
               backgroundColor: `${currentTheme.colors.success}15`,
               color: currentTheme.colors.success
             }}>
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: currentTheme.colors.success,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          ></div>
          <span className="font-medium">Online</span>
        </div>
        
        <div 
          className={containerClasses.timeDisplay}
          style={containerStyles.timeDisplay(currentTheme)}
        >
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 