import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, getProgressBarStyle } from '../../utils/containerStyles';
import { Lightbulb, Thermometer, Wifi, WifiOff } from 'lucide-react';
import apiService from '../../services/api.service';
import type { PLCStatus } from '../../config/api-endpoints';
import { CONNECTION_CONFIG } from '../../config/connection.config';

interface EnvironmentalReadingsCardProps {
  onClimateControl?: () => void;
}

const EnvironmentalReadingsCard: React.FC<EnvironmentalReadingsCardProps> = ({ onClimateControl }) => {
  const { currentTheme } = useTheme();
  const [plcData, setPlcData] = useState<PLCStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to WebSocket status updates
    const handleStatusUpdate = (data: PLCStatus) => {
      /*
      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log('📊 Received PLC data:', data);
      }
        */
      setPlcData(data);
      setLastUpdate(new Date());
    };

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Register event listeners
    apiService.on('status-update', handleStatusUpdate);
    apiService.on('connected', handleConnected);
    apiService.on('disconnected', handleDisconnected);

    // Check initial connection status
    setIsConnected(apiService.getConnectionStatus());
    
    // Get initial data if available
    const initialData = apiService.getSystemStatus();
    if (initialData) {
      setPlcData(initialData);
      setLastUpdate(new Date());
    }

    // Cleanup
    return () => {
      apiService.off('status-update', handleStatusUpdate);
      apiService.off('connected', handleConnected);
      apiService.off('disconnected', handleDisconnected);
    };
  }, []);

  // Helper functions to get real-time data
  const getPressureData = () => {
    if (!plcData || !plcData.pressure) return { current: 0, target: 0, percentage: 0, status: 'No Data' };
    
    const current = plcData.pressure.internal_pressure_1 || 0;
    const target = plcData.pressure.setpoint || 0;
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    
    let status = 'Normal';
    if (percentage < 80) status = 'Low';
    else if (percentage > 105) status = 'High';
    
    return { current, target, percentage, status };
  };

  const getOxygenData = () => {
    if (!plcData || !plcData.sensors) return { level: 0, status: 'No Data' };
    
    const level = plcData.sensors.ambient_o2 || 0;
    let status = 'Safe';
    
    // Health hazard thresholds: below 20% or above 25% is dangerous
    if (level < 20) status = 'Low Hazard';
    else if (level > 25) status = 'High Hazard';
    else status = 'Safe'; // 20-25% is safe range
    
    return { level, status };
  };

  const getTemperatureData = () => {
    if (!plcData || !plcData.sensors) return { current: 0, range: '20-30°C', percentage: 0, status: 'No Data' };
    
    const current = plcData.sensors.current_temperature || 0;
    const minTemp = 20;
    const maxTemp = 30;
    const percentage = ((current - minTemp) / (maxTemp - minTemp)) * 100;
    
    let status = 'Stable';
    if (current < minTemp) status = 'Cold';
    else if (current > maxTemp) status = 'Warm';
    
    return { current, range: '20-30°C', percentage: Math.max(0, Math.min(100, percentage)), status };
  };

  const getHumidityData = () => {
    if (!plcData || !plcData.sensors) return { level: 0, status: 'No Data' };
    
    const level = plcData.sensors.current_humidity || 0;
    let status = 'Good';
    if (level < 40) status = 'Low';
    else if (level > 60) status = 'High';
    
    return { level, status };
  };

  const getLightingStatus = () => {
    if (!plcData || !plcData.control_panel) {
      return [
        { name: 'Reading', status: false, color: currentTheme.colors.textSecondary },
        { name: 'Ceiling', status: false, color: currentTheme.colors.textSecondary },
        { name: 'AC', status: false, color: currentTheme.colors.textSecondary },
        { name: 'Intercom', status: false, color: currentTheme.colors.textSecondary },
      ];
    }

    return [
      { 
        name: 'Reading', 
        status: plcData.control_panel.reading_lights_state || false, 
        color: plcData.control_panel.reading_lights_state ? currentTheme.colors.warning : currentTheme.colors.textSecondary 
      },
      { 
        name: 'Ceiling', 
        status: plcData.control_panel.ceiling_lights_state || false, 
        color: plcData.control_panel.ceiling_lights_state ? currentTheme.colors.success : currentTheme.colors.textSecondary 
      },
      { 
        name: 'AC', 
        status: plcData.control_panel.ac_state || false, 
        color: plcData.control_panel.ac_state ? currentTheme.colors.info : currentTheme.colors.textSecondary 
      },
      { 
        name: 'Intercom', 
        status: plcData.control_panel.intercom_state || false, 
        color: plcData.control_panel.intercom_state ? currentTheme.colors.primary : currentTheme.colors.textSecondary 
      },
    ];
  };

  // Get processed data
  const pressureData = getPressureData();
  const oxygenData = getOxygenData();
  const temperatureData = getTemperatureData();
  const humidityData = getHumidityData();
  const lightingStatus = getLightingStatus();
  const activeLights = lightingStatus.filter(light => light.status).length;

  return (
    <div 
      className="col-span-2 p-5 rounded-2xl"
      style={containerStyles.card(currentTheme)}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 
            className="text-lg font-semibold"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            Chamber Status
          </h3>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi size={16} style={{ color: currentTheme.colors.success }} />
            ) : (
              <WifiOff size={16} style={{ color: currentTheme.colors.danger }} />
            )}
            {lastUpdate && (
              <span 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {isConnected ? 'Real-time environmental conditions & lighting' : 'Disconnected - showing cached data'}
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
              style={containerStyles.statusBadge(currentTheme, 
                pressureData.status === 'Normal' ? 'success' : 
                pressureData.status === 'Low' ? 'warning' : 'danger'
              )}
            >
              {pressureData.status}
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {pressureData.current.toFixed(3)} <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>ATA</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Target: {pressureData.target.toFixed(3)} ATA
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, pressureData.percentage, 
            pressureData.status === 'Normal' ? currentTheme.colors.success : 
            pressureData.status === 'Low' ? currentTheme.colors.warning : currentTheme.colors.danger
          ).container}>
            <div style={getProgressBarStyle(currentTheme, pressureData.percentage, 
              pressureData.status === 'Normal' ? currentTheme.colors.success : 
              pressureData.status === 'Low' ? currentTheme.colors.warning : currentTheme.colors.danger
            ).fill}></div>
          </div>
        </div>

        {/* Oxygen */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-semibold"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Ambient O₂
            </h4>
            <div 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={containerStyles.statusBadge(currentTheme, 
                oxygenData.status === 'Safe' ? 'success' : 'danger'
              )}
            >
              {oxygenData.status}
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {oxygenData.level.toFixed(2)} <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Safe: 20-25% ambient
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, oxygenData.level, 
            oxygenData.status === 'Safe' ? currentTheme.colors.success : currentTheme.colors.danger
          ).container}>
            <div style={getProgressBarStyle(currentTheme, oxygenData.level, 
              oxygenData.status === 'Safe' ? currentTheme.colors.success : currentTheme.colors.danger
            ).fill}></div>
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
              style={containerStyles.statusBadge(currentTheme, 
                temperatureData.status === 'Stable' ? 'success' : 'warning'
              )}
            >
              {temperatureData.status}
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {temperatureData.current.toFixed(2)} <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>°C</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Range: {temperatureData.range}
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, temperatureData.percentage, 
            temperatureData.status === 'Stable' ? currentTheme.colors.success : currentTheme.colors.warning
          ).container}>
            <div style={getProgressBarStyle(currentTheme, temperatureData.percentage, 
              temperatureData.status === 'Stable' ? currentTheme.colors.success : currentTheme.colors.warning
            ).fill}></div>
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
              style={containerStyles.statusBadge(currentTheme, 
                humidityData.status === 'Good' ? 'success' : 'warning'
              )}
            >
              {humidityData.status}
            </div>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {humidityData.level.toFixed(2)} <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
            </p>
            <p 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Optimal: 40-60%
            </p>
          </div>
          <div style={getProgressBarStyle(currentTheme, humidityData.level, 
            humidityData.status === 'Good' ? currentTheme.colors.success : currentTheme.colors.warning
          ).container}>
            <div style={getProgressBarStyle(currentTheme, humidityData.level, 
              humidityData.status === 'Good' ? currentTheme.colors.success : currentTheme.colors.warning
            ).fill}></div>
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
            style={containerStyles.statusBadge(currentTheme, activeLights > 0 ? 'success' : 'warning')}
          >
            {activeLights} Active
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
                    color: light.status ? light.color : currentTheme.colors.textSecondary,
                    opacity: light.status ? 1 : 0.5
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
                  backgroundColor: light.status ? light.color : `${currentTheme.colors.textSecondary}40`,
                  boxShadow: light.status ? `0 0 6px ${light.color}50` : 'none'
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