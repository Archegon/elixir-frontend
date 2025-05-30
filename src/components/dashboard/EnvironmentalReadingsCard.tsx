import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, getProgressBarStyle } from '../../utils/containerStyles';

const EnvironmentalReadingsCard: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="col-span-2 p-5 rounded-2xl"
      style={containerStyles.card(currentTheme)}
    >
      <div className="mb-4">
        <h3 
          className="text-lg font-semibold mb-1"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          Environmental Readings
        </h3>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Chamber conditions
        </p>
      </div>

      {/* Readings Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Pressure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Pressure
            </h4>
            <div 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={containerStyles.statusBadge(currentTheme, 'success')}
            >
              Normal
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              2.4 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>ATA</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Target: 2.5 ATA
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, 96, currentTheme.colors.success).container}>
            <div style={getProgressBarStyle(currentTheme, 96, currentTheme.colors.success).fill}></div>
          </div>
        </div>

        {/* Oxygen */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Oxygen
            </h4>
            <div 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={containerStyles.statusBadge(currentTheme, 'info')}
            >
              Optimal
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              100 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Flow: 15 L/min
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, 100, currentTheme.colors.info).container}>
            <div style={getProgressBarStyle(currentTheme, 100, currentTheme.colors.info).fill}></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Temperature
            </h4>
            <div 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={containerStyles.statusBadge(currentTheme, 'warning')}
            >
              Stable
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              22 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>°C</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Range: 20-24°C
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, 80, currentTheme.colors.warning).container}>
            <div style={getProgressBarStyle(currentTheme, 80, currentTheme.colors.warning).fill}></div>
          </div>
        </div>

        {/* Humidity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Humidity
            </h4>
            <div 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={containerStyles.statusBadge(currentTheme, 'success')}
            >
              Good
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              45 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Optimal: 40-60%
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, 45, currentTheme.colors.success).container}>
            <div style={getProgressBarStyle(currentTheme, 45, currentTheme.colors.success).fill}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnvironmentalReadingsCard; 