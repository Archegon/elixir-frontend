import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';

const AlertsCard: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="col-span-1">
      <div 
        className={containerClasses.cardLarge}
        style={containerStyles.card(currentTheme)}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          Alerts
        </h3>
        <div className="space-y-3">
          <div 
            className="flex items-center p-3 rounded-xl"
            style={containerStyles.alert(currentTheme, 'success')}
          >
            <div 
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0 animate-pulse"
              style={{ 
                backgroundColor: currentTheme.colors.success,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
            <div className="min-w-0">
              <p 
                className="font-medium text-sm"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                All systems nominal
              </p>
              <p 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                12:45 PM
              </p>
            </div>
          </div>
          <div 
            className="flex items-center p-3 rounded-xl"
            style={containerStyles.alert(currentTheme, 'warning')}
          >
            <div 
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0 animate-pulse"
              style={{ 
                backgroundColor: currentTheme.colors.warning,
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
            <div className="min-w-0">
              <p 
                className="font-medium text-sm"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Pressure adjustment in progress
              </p>
              <p 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                12:42 PM
              </p>
            </div>
          </div>
          <div 
            className="flex items-center p-3 rounded-xl"
            style={containerStyles.alert(currentTheme, 'info')}
          >
            <div 
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: currentTheme.colors.info }}
            ></div>
            <div className="min-w-0">
              <p 
                className="font-medium text-sm"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Session data logged
              </p>
              <p 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                12:40 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsCard; 