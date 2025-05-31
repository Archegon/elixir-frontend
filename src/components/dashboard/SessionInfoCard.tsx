import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses, getProgressBarStyle } from '../../utils/containerStyles';
import { BarChart3, Gauge, Play, MessageCircle } from 'lucide-react';

interface SessionInfoCardProps {
  onModeSelect?: () => void;
}

const SessionInfoCard: React.FC<SessionInfoCardProps> = ({ onModeSelect }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="col-span-2 p-5 rounded-2xl"
      style={containerStyles.card(currentTheme)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-sm font-semibold"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Current Session
        </h3>
        <div 
          className={containerClasses.statusBadge}
          style={containerStyles.statusBadge(currentTheme, 'success')}
        >
          Active
        </div>
      </div>
      
      {/* Session Timer */}
      <div className="mb-4">
        <p 
          className="text-3xl font-bold font-mono mb-1"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          45:32
        </p>
        <p 
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Remaining: 14:28
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div style={getProgressBarStyle(currentTheme, 76, currentTheme.colors.brand).container}>
          <div style={getProgressBarStyle(currentTheme, 76, currentTheme.colors.brand).fill}></div>
        </div>
      </div>

      {/* Operating Mode */}
      <div className="space-y-3 mb-4">
        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Treatment Mode
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.info}15`,
              color: currentTheme.colors.info
            }}
          >
            Professional Mode
          </div>
        </div>

        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Compression
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.warning}15`,
              color: currentTheme.colors.warning
            }}
          >
            Normal Rate
          </div>
        </div>

        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            O2 Delivery
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.success}15`,
              color: currentTheme.colors.success
            }}
          >
            Continuous
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {/* Change Mode Button */}
        {onModeSelect && (
          <button 
            onClick={onModeSelect}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.brand,
              color: '#ffffff',
              border: `1px solid ${currentTheme.colors.brand}`
            }}
          >
            <BarChart3 size={16} />
            <span>Change Mode</span>
          </button>
        )}

        {/* Session Control Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.brand,
              border: `1px solid ${currentTheme.colors.brand}`
            }}
          >
            <Play size={14} />
            <span>Stop/Start</span>
          </button>
          
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: `${currentTheme.colors.warning}15`,
              color: currentTheme.colors.warning,
              border: `1px solid ${currentTheme.colors.warning}30`
            }}
          >
            <Gauge size={14} />
            <span>Equalise</span>
          </button>
          
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.textSecondary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <MessageCircle size={14} />
            <span>Intercomms</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionInfoCard; 