import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { Settings, BarChart3, Gauge, Play, MessageCircle } from 'lucide-react';

interface ControlsCardProps {
  onModeSelect: () => void;
  onEnvControls: () => void;
}

const ControlsCard: React.FC<ControlsCardProps> = ({ onModeSelect, onEnvControls }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="col-span-12">
      <div 
        className={containerClasses.cardLarge}
        style={containerStyles.card(currentTheme)}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          Controls
        </h3>
        <div className="grid grid-cols-5 gap-4">
          <button 
            onClick={onModeSelect}
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={containerStyles.button(currentTheme, 'primary')}
          >
            <BarChart3 size={18} />
            <span>Select Mode</span>
          </button>
          <button 
            onClick={onEnvControls}
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={containerStyles.button(currentTheme, 'secondary')}
          >
            <Settings size={18} />
            <span>Controls</span>
          </button>
          <button 
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={containerStyles.button(currentTheme, 'warning')}
          >
            <Gauge size={18} />
            <span>Equalise</span>
          </button>
          <button 
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={containerStyles.button(currentTheme, 'primary')}
          >
            <Play size={18} />
            <span>Stop/Start</span>
          </button>
          <button 
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={containerStyles.button(currentTheme, 'secondary')}
          >
            <MessageCircle size={18} />
            <span>Intercomms</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlsCard; 