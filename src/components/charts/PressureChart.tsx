import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';

// Generate sample pressure data for the last 2 hours
const generatePressureData = () => {
  const data = [];
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  // Generate data points every 5 minutes (24 points total)
  for (let i = 0; i < 24; i++) {
    const time = new Date(twoHoursAgo.getTime() + i * 5 * 60 * 1000);
    
    // Simulate realistic pressure changes
    let pressure = 1.0 + Math.random() * 0.99; // Range 1.0 - 1.99
    
    // Add some realistic patterns (gradual increases/decreases)
    if (i < 8) {
      // First hour: gradual increase
      pressure = 1.0 + (i / 8) * 0.8 + Math.random() * 0.1;
    } else if (i < 16) {
      // Second hour: stable high pressure
      pressure = 1.7 + Math.random() * 0.2;
    } else {
      // Last 40 minutes: slight decrease
      pressure = 1.8 - ((i - 16) / 8) * 0.3 + Math.random() * 0.1;
    }
    
    data.push({
      time: time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      timestamp: time.getTime(),
      pressure: Math.round(pressure * 100) / 100, // Round to 2 decimal places
      pressureFormatted: `${Math.round(pressure * 100) / 100} ATA`
    });
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  const { currentTheme } = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <div 
        className="p-3 rounded-lg shadow-lg border"
        style={{
          backgroundColor: currentTheme.colors.secondary,
          border: `1px solid ${currentTheme.colors.border}`,
          color: currentTheme.colors.textPrimary
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
          Time: {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: currentTheme.colors.brand }}>
          Pressure: {payload[0].payload.pressureFormatted}
        </p>
      </div>
    );
  }
  return null;
};

const PressureChart: React.FC = () => {
  const { currentTheme } = useTheme();
  const data = generatePressureData();

  return (
    <div 
      className={containerClasses.cardLarge}
      style={containerStyles.card(currentTheme)}
    >
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          Pressure Trend
        </h3>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Last 2 hours
        </p>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={currentTheme.colors.border}
              opacity={0.3}
            />
            <XAxis 
              dataKey="time"
              stroke={currentTheme.colors.textSecondary}
              fontSize={12}
              fontFamily="SF Mono, Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace"
              tick={{ fill: currentTheme.colors.textSecondary }}
              axisLine={{ stroke: currentTheme.colors.border }}
              tickLine={{ stroke: currentTheme.colors.border }}
              interval="preserveStartEnd"
              tickFormatter={(value, index) => {
                // Show every 4th tick (every 20 minutes)
                return index % 4 === 0 ? value : '';
              }}
            />
            <YAxis 
              domain={[1.0, 1.99]}
              stroke={currentTheme.colors.textSecondary}
              fontSize={12}
              fontFamily="SF Mono, Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace"
              tick={{ fill: currentTheme.colors.textSecondary }}
              axisLine={{ stroke: currentTheme.colors.border }}
              tickLine={{ stroke: currentTheme.colors.border }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
              label={{ 
                value: 'Pressure (ATA)', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle',
                  fill: currentTheme.colors.textSecondary,
                  fontSize: '12px'
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="pressure" 
              stroke={currentTheme.colors.brand}
              strokeWidth={2}
              dot={{ 
                fill: currentTheme.colors.brand, 
                strokeWidth: 0,
                r: 3
              }}
              activeDot={{ 
                r: 5, 
                fill: currentTheme.colors.brand,
                stroke: currentTheme.colors.secondary,
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PressureChart; 