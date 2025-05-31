import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, getProgressBarStyle } from '../../utils/containerStyles';
import { Lightbulb, Thermometer } from 'lucide-react';

interface EnvironmentalReadingsCardProps {
  onClimateControl?: () => void;
}

const EnvironmentalReadingsCard: React.FC<EnvironmentalReadingsCardProps> = ({ onClimateControl }) => {
  const { currentTheme } = useTheme();

  const lightingStatus = [
    { name: 'Reading', status: 'on', color: currentTheme.colors.warning },
    { name: 'Door', status: 'on', color: currentTheme.colors.success },
    { name: 'Ceiling', status: 'off', color: currentTheme.colors.textSecondary },
    { name: 'Exterior', status: 'on', color: currentTheme.colors.info },
  ];

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
          Chamber Status
        </h3>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Environmental conditions & lighting
        </p>
      </div>

      {/* Readings Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
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

      {/* Lighting Status - Improved Layout */}
      <div className="pt-3 border-t space-y-3" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center justify-between">
          <h4 
            className="text-sm font-semibold"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Lighting Status
          </h4>
          <div 
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={containerStyles.statusBadge(currentTheme, 'success')}
          >
            3 Active
          </div>
        </div>
        
        {/* Lighting Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-3">
          {lightingStatus.map((light, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ 
                backgroundColor: `${currentTheme.colors.primary}80`,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div className="flex items-center space-x-2">
                <Lightbulb 
                  size={14} 
                  style={{ 
                    color: light.status === 'on' ? light.color : currentTheme.colors.textSecondary,
                    opacity: light.status === 'on' ? 1 : 0.5
                  }} 
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {light.name}
                </span>
              </div>
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: light.status === 'on' ? light.color : `${currentTheme.colors.textSecondary}40`,
                  boxShadow: light.status === 'on' ? `0 0 6px ${light.color}50` : 'none'
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Climate Control Button */}
        {onClimateControl && (
          <button
            onClick={onClimateControl}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: `${currentTheme.colors.info}20`,
              color: currentTheme.colors.info,
              border: `1px solid ${currentTheme.colors.info}30`
            }}
          >
            <Thermometer size={16} />
            <span>Climate Control</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalReadingsCard; 