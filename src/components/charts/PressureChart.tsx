import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { apiService } from '../../services/api.service';
import type { PLCStatus } from '../../config/api-endpoints';

interface PressureDataPoint {
  time: string;
  timestamp: number;
  pressure: number;
  pressureFormatted: string;
  setpoint?: number;
  internal_pressure_1?: number;
  internal_pressure_2?: number;
}

type TimeWindow = '1min' | '10min' | '1.5hr';

interface TimeWindowOption {
  key: TimeWindow;
  label: string;
  displayLabel: string;
  minutes: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  const { currentTheme } = useTheme();
  
  if (active && payload && payload.length) {
    // Format timestamp to readable time
    const formattedTime = new Date(label).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
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
          Time: {formattedTime}
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
  const [allPressureData, setAllPressureData] = useState<PressureDataPoint[]>([]);
  const [currentStatus, setCurrentStatus] = useState<PLCStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<TimeWindow>('1.5hr');

  // Time window options
  const timeWindowOptions: TimeWindowOption[] = [
    { key: '1min', label: '1m', displayLabel: '1 Minute', minutes: 1 },
    { key: '10min', label: '10m', displayLabel: '10 Minutes', minutes: 10 },
    { key: '1.5hr', label: '1.5h', displayLabel: '1.5 Hours', minutes: 90 }
  ];

  // Get current time window based on selection (current time to future)
  const getTimeWindow = () => {
    const now = new Date();
    const selectedOption = timeWindowOptions.find(option => option.key === selectedTimeWindow);
    const minutesAhead = selectedOption ? selectedOption.minutes : 90;
    const futureTime = new Date(now.getTime() + minutesAhead * 60 * 1000);
    
    // Ensure we have a minimum time difference to avoid duplicate keys
    const minDifference = 60000; // 1 minute minimum
    const actualMax = Math.max(futureTime.getTime(), now.getTime() + minDifference);
    
    return {
      min: now.getTime(),
      max: actualMax
    };
  };

  // Generate manual ticks to avoid duplicate keys and overcrowding
  const generateXAxisTicks = (dataToAnalyze: PressureDataPoint[]) => {
    const timeWindow = getTimeWindow();
    const selectedOption = timeWindowOptions.find(option => option.key === selectedTimeWindow);
    const windowMinutes = selectedOption ? selectedOption.minutes : 90;
    const windowDuration = windowMinutes * 60 * 1000;
    
    // If we have data, use consistent sliding window logic
    if (dataToAnalyze.length > 0) {
      const timestamps = dataToAnalyze.map((point: PressureDataPoint) => point.timestamp);
      const dataMin = Math.min(...timestamps);
      const dataMax = Math.max(...timestamps);
      const dataSpan = dataMax - dataMin;
      
      // Always use sliding window approach for consistency
      if (dataSpan <= windowDuration) {
        // Data fits within window duration - show from first data point forward
        // Make sure domain starts exactly at first data point for perfect alignment
        return [dataMin, dataMin + windowDuration];
      } else {
        // Data exceeds window - find the earliest data point that should be visible
        const windowStart = dataMax - windowDuration;
        const firstVisibleData = Math.min(...timestamps.filter(ts => ts >= windowStart));
        // Domain starts at first visible data point, not calculated window start
        return [firstVisibleData, dataMax];
      }
    }
    
    // No data: show window from current time
    return [timeWindow.min, timeWindow.min + windowDuration];
  };

  // Memoize calculations to prevent unnecessary re-renders
  const { currentDomain, pressureData, fullRangeTicks, yAxisConfig } = useMemo(() => {
    // Calculate domain and filtered data
    const domain = generateXAxisTicks(allPressureData);
    
    // Generate ticks that span the full domain range
    const generateFullRangeTicks = () => {
      const [domainMin, domainMax] = domain;
      const span = domainMax - domainMin;
      
      // Determine tick count based on time window
      let tickCount;
      switch (selectedTimeWindow) {
        case '1min':
          tickCount = 4; // Every 15 seconds for 1 minute
          break;
        case '10min':
          tickCount = 6; // Every ~1.7 minutes for 10 minutes
          break;
        case '1.5hr':
          tickCount = 7; // Every ~13 minutes for 1.5 hours
          break;
        default:
          tickCount = 5;
      }
      
      const ticks = [];
      
      // Always start with domain minimum (which is now aligned with first data point)
      ticks.push(domainMin);
      
      // Add remaining ticks evenly spaced to domain maximum
      if (tickCount > 1) {
        for (let i = 1; i < tickCount; i++) {
          const tick = domainMin + (span * i) / (tickCount - 1);
          ticks.push(tick);
        }
      }
      
      return ticks;
    };

    const ticks = generateFullRangeTicks();

    // Show data within the rolling window, using first tick as minimum boundary
    const getFilteredData = () => {
      if (allPressureData.length === 0) return allPressureData;
      
      const [windowStart, windowEnd] = domain;
      const firstTickTime = ticks[0]; // Use actual first tick time
      
      // Filter data: don't filter out points that are <= first tick time
      return allPressureData.filter((point: PressureDataPoint) => 
        point.timestamp >= firstTickTime && point.timestamp <= windowEnd
      );
    };

    const data = getFilteredData();

    // Calculate dynamic Y-axis configuration
    const calculateYAxisConfig = () => {
      const baseMin = 1.0;
      const baseMax = 2.0;
      
      // Find the maximum pressure value in the filtered data
      const maxPressure = data.length > 0 ? Math.max(...data.map(point => point.pressure)) : baseMax;
      
      // If max pressure exceeds base max, extend the domain
      const yMax = Math.max(baseMax, Math.ceil(maxPressure * 10) / 10); // Round up to nearest 0.1
      
      // Generate ticks from 1.0 to yMax with 0.2 intervals
      const yTicks = [];
      for (let tick = baseMin; tick <= yMax; tick += 0.2) {
        yTicks.push(Math.round(tick * 10) / 10); // Round to 1 decimal place
      }
      
      return {
        domain: [baseMin, yMax],
        ticks: yTicks
      };
    };

    const yConfig = calculateYAxisConfig();

    return {
      currentDomain: domain,
      pressureData: data,
      fullRangeTicks: ticks,
      yAxisConfig: yConfig
    };
  }, [allPressureData, selectedTimeWindow]);

  // Start with empty data - chart will build up as data comes in
  useEffect(() => {
    setAllPressureData([]);
  }, []);

  // Subscribe to real-time pressure updates
  useEffect(() => {
    let statusCallback: Function | null = null;
    let connectedCallback: Function | null = null;
    let disconnectedCallback: Function | null = null;

    const setupSubscriptions = async () => {
      try {
        await apiService.waitForInitialization();

        // Define event callbacks
        statusCallback = (status: PLCStatus) => {
          setCurrentStatus(status);
          
          // Add new data point to chart
          const now = new Date();
          const newDataPoint: PressureDataPoint = {
            time: now.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            timestamp: now.getTime(),
            pressure: status.pressure.internal_pressure_1,
            pressureFormatted: `${status.pressure.internal_pressure_1.toFixed(2)} ATA`,
            setpoint: status.pressure.setpoint,
            internal_pressure_1: status.pressure.internal_pressure_1,
            internal_pressure_2: status.pressure.internal_pressure_2,
          };

          setAllPressureData((prevData: PressureDataPoint[]) => {
            const updatedData = [...prevData, newDataPoint];
            
            // Keep a reasonable amount of historical data (more than any window duration)
            // This ensures domain calculations work properly while preventing memory issues
            const maxHistoryTime = 6 * 60 * 60 * 1000; // 6 hours of history
            const cutoffTime = new Date().getTime() - maxHistoryTime;
            
            return updatedData.filter(point => point.timestamp >= cutoffTime);
          });
        };

        connectedCallback = (connectionData: { connected: boolean }) => {
          setIsConnected(connectionData.connected);
        };

        disconnectedCallback = (connectionData: { connected: boolean }) => {
          setIsConnected(connectionData.connected);
        };

        // Subscribe to events
        apiService.on('status-update', statusCallback);
        apiService.on('connected', connectedCallback);
        apiService.on('disconnected', disconnectedCallback);

        // Get initial connection status
        setIsConnected(apiService.getConnectionStatus());

      } catch (error) {
        console.error('Failed to setup pressure chart subscriptions:', error);
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions
    return () => {
      if (statusCallback) apiService.off('status-update', statusCallback);
      if (connectedCallback) apiService.off('connected', connectedCallback);
      if (disconnectedCallback) apiService.off('disconnected', disconnectedCallback);
    };
  }, []);



  return (
    <div 
      className={containerClasses.cardLarge}
      style={containerStyles.card(currentTheme)}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-lg font-semibold"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            Pressure Trend
          </h3>
          <div className="flex items-center space-x-2">
            {currentStatus && (
              <span 
                className="text-sm font-mono"
                style={{ color: currentTheme.colors.brand }}
              >
                {currentStatus.pressure.internal_pressure_1.toFixed(2)} ATA
              </span>
            )}
            <div className="flex items-center space-x-1">
              <div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p 
              className="text-sm font-medium"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              Time Window: {timeWindowOptions.find(opt => opt.key === selectedTimeWindow)?.displayLabel}
            </p>
          </div>
          
          <div className="flex items-center bg-opacity-50 rounded-lg p-1"
               style={{ backgroundColor: currentTheme.colors.border }}>
            {timeWindowOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedTimeWindow(option.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedTimeWindow === option.key
                    ? 'shadow-sm'
                    : 'hover:bg-opacity-60'
                }`}
                style={{
                  backgroundColor: selectedTimeWindow === option.key 
                    ? currentTheme.colors.brand 
                    : 'transparent',
                  color: selectedTimeWindow === option.key 
                    ? 'white' 
                    : currentTheme.colors.textSecondary,
                  ...(selectedTimeWindow !== option.key && {
                    ':hover': {
                      backgroundColor: currentTheme.colors.border + '60'
                    }
                  })
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={pressureData}
            margin={{
              top: 20,
              right: 30,
              left: 50,
              bottom: 80,
            }}
            syncId="pressureChart"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={currentTheme.colors.border}
              opacity={0.3}
            />
            <XAxis 
              type="number"
              dataKey="timestamp"
              domain={currentDomain}
              ticks={fullRangeTicks}
              scale="time"
              allowDataOverflow={false}
              allowDecimals={false}
              stroke={currentTheme.colors.textSecondary}
              fontSize={12}
              fontFamily="SF Mono, Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace"
              tick={{ fill: currentTheme.colors.textSecondary }}
              axisLine={{ stroke: currentTheme.colors.border }}
              tickLine={{ stroke: currentTheme.colors.border }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(timestamp) => {
                return new Date(timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: selectedTimeWindow === '1min' ? '2-digit' : undefined,
                  hour12: false
                });
              }}
            />
            <YAxis 
              domain={yAxisConfig.domain}
              stroke={currentTheme.colors.textSecondary}
              fontSize={12}
              fontFamily="SF Mono, Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace"
              tick={{ fill: currentTheme.colors.textSecondary }}
              axisLine={{ stroke: currentTheme.colors.border }}
              tickLine={{ stroke: currentTheme.colors.border }}
              tickFormatter={(value) => `${value.toFixed(2)}`}
              ticks={yAxisConfig.ticks}
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
            <Tooltip 
              content={<CustomTooltip />} 
              allowEscapeViewBox={{ x: true, y: true }}
              position={{ x: undefined, y: undefined }}
            />
            <Line 
              type="monotone" 
              dataKey="pressure" 
              stroke={currentTheme.colors.brand}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
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