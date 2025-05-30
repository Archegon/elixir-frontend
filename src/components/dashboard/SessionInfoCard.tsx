import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses, getProgressBarStyle } from '../../utils/containerStyles';

const SessionInfoCard: React.FC = () => {
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
      <div className="space-y-3">
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
    </div>
  );
};

export default SessionInfoCard; 