import React, { useState, useEffect } from 'react';
import type { EnvironmentalControls } from '../../types/chamber';
import { FanMode } from '../../types/chamber';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles } from '../../utils/containerStyles';
import ModalTemplate from '../ui/ModalTemplate';
import { BookOpen, DoorOpen, Lightbulb, Flashlight, Snowflake, Fan } from 'lucide-react';
import { apiService } from '../../services/api.service';
import type { PLCStatus } from '../../config/api-endpoints';

interface EnvironmentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  controls: EnvironmentalControls;
  onUpdateControls: (controls: EnvironmentalControls) => void;
}

const EnvironmentalControlsModal: React.FC<EnvironmentalControlsModalProps> = ({
  isOpen,
  onClose,
  controls,
  onUpdateControls
}) => {
  const { currentTheme } = useTheme();
  const [currentStatus, setCurrentStatus] = useState<PLCStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  // Subscribe to real-time PLC updates
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

        // Get initial connection status and data
        setIsConnected(apiService.getConnectionStatus());
        const initialStatus = apiService.getSystemStatus();
        if (initialStatus) {
          setCurrentStatus(initialStatus);
        }

      } catch (error) {
        console.error('Failed to setup environmental controls subscriptions:', error);
      }
    };

    if (isOpen) {
      setupSubscriptions();
    }

    // Cleanup subscriptions
    return () => {
      if (statusCallback) apiService.off('status-update', statusCallback);
      if (connectedCallback) apiService.off('connected', connectedCallback);
      if (disconnectedCallback) apiService.off('disconnected', disconnectedCallback);
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // API call handlers with loading states
  const handleACToggle = async () => {
    if (!isConnected || pendingOperations.has('ac_toggle')) return;
    
    setPendingOperations(prev => new Set(prev).add('ac_toggle'));
    try {
      const response = await apiService.toggleAC();
      if (!response.success) {
        console.error('Failed to toggle AC:', response.message);
      }
    } catch (error) {
      console.error('Error toggling AC:', error);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete('ac_toggle');
        return newSet;
      });
    }
  };

  const handleTemperatureChange = async (newTemp: number) => {
    if (!isConnected || pendingOperations.has('temp_change')) return;
    
    setPendingOperations(prev => new Set(prev).add('temp_change'));
    try {
      const response = await apiService.setTemperatureSetpoint(newTemp);
      if (!response.success) {
        console.error('Failed to set temperature:', response.message);
      }
    } catch (error) {
      console.error('Error setting temperature:', error);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete('temp_change');
        return newSet;
      });
    }
  };

  const handleFanModeChange = async (mode: 'auto' | 'low' | 'mid' | 'high') => {
    if (!isConnected || pendingOperations.has('fan_mode')) return;
    
    setPendingOperations(prev => new Set(prev).add('fan_mode'));
    try {
      const response = await apiService.setACFanMode(mode);
      if (!response.success) {
        console.error('Failed to set fan mode:', response.message);
      }
    } catch (error) {
      console.error('Error setting fan mode:', error);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete('fan_mode');
        return newSet;
      });
    }
  };

  const handleLightToggle = async (lightType: 'ceiling' | 'reading') => {
    if (!isConnected || pendingOperations.has(`${lightType}_lights`)) return;
    
    setPendingOperations(prev => new Set(prev).add(`${lightType}_lights`));
    try {
      let response;
      if (lightType === 'ceiling') {
        response = await apiService.toggleCeilingLights();
      } else {
        response = await apiService.toggleReadingLights();
      }
      
      if (!response.success) {
        console.error(`Failed to toggle ${lightType} lights:`, response.message);
      }
    } catch (error) {
      console.error(`Error toggling ${lightType} lights:`, error);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${lightType}_lights`);
        return newSet;
      });
    }
  };

  // Helper functions to get current values from PLC status
  const getCurrentACState = (): boolean => {
    return currentStatus?.control_panel?.ac_state || false;
  };

  const getCurrentTemperature = (): number => {
    return currentStatus?.sensors?.current_temperature || 20;
  };

  const getTemperatureSetpoint = (): number => {
    return currentStatus?.climate?.temperature_setpoint || 22;
  };

  const getCurrentFanMode = (): 'auto' | 'low' | 'mid' | 'high' => {
    const mode = currentStatus?.climate?.ac_mode || 0;
    switch (mode) {
      case 0: return 'auto';
      case 1: return 'low';
      case 2: return 'mid';
      case 3: return 'high';
      default: return 'auto';
    }
  };

  const getCeilingLightsState = (): boolean => {
    return currentStatus?.control_panel?.ceiling_lights_state || false;
  };

  const getReadingLightsState = (): boolean => {
    return currentStatus?.control_panel?.reading_lights_state || false;
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        onClick={handleClose}
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: `${currentTheme.colors.border}20`,
          border: `1px solid ${currentTheme.colors.border}40`,
          color: currentTheme.colors.textPrimary
        }}
      >
        Close
      </button>
      <div 
        className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        style={{
          backgroundColor: isConnected ? `${currentTheme.colors.success}15` : `${currentTheme.colors.danger}15`,
          border: `1px solid ${isConnected ? currentTheme.colors.success : currentTheme.colors.danger}30`,
          color: isConnected ? currentTheme.colors.success : currentTheme.colors.danger
        }}
      >
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-current' : 'bg-current opacity-50'}`} />
        {isConnected ? 'Live Control' : 'Disconnected'}
      </div>
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Environmental Controls"
      subtitle="Manage chamber climate and lighting settings"
      width="w-[900px]"
      height="max-h-[600px]"
      footer={footer}
    >
      <div className="p-6">
        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Left Column - Climate Controls */}
          <div className="space-y-6">
            
            {/* Air Conditioner */}
            <div style={containerStyles.section(currentTheme)}>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                >
                  <Snowflake size={18} style={{ color: currentTheme.colors.brand }} />
                </div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Air Conditioning
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* AC Enable/Disable */}
                <div className="flex items-center justify-between">
                  <label style={{ color: currentTheme.colors.textSecondary }}>AC System</label>
                  <button
                    onClick={handleACToggle}
                    disabled={!isConnected || pendingOperations.has('ac_toggle')}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: getCurrentACState() 
                        ? `${currentTheme.colors.brand}20` 
                        : `${currentTheme.colors.border}20`,
                      border: `1px solid ${getCurrentACState() ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    {pendingOperations.has('ac_toggle') ? 'Loading...' : (getCurrentACState() ? 'ON' : 'OFF')}
                  </button>
                </div>

                {/* Temperature Set Point */}
                <div className="space-y-2">
                  <label style={{ color: currentTheme.colors.textSecondary }}>Temperature Set Point</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleTemperatureChange(Math.max(16, getTemperatureSetpoint() - 1))}
                      disabled={!isConnected || pendingOperations.has('temp_change')}
                      className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: `${currentTheme.colors.brand}20`,
                        border: `1px solid ${currentTheme.colors.brand}40`,
                        color: currentTheme.colors.brand
                      }}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <div 
                        className="text-2xl font-bold font-mono"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        {getTemperatureSetpoint()}°C
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Current: {getCurrentTemperature().toFixed(2)}°C
                      </div>
                    </div>
                    <button
                      onClick={() => handleTemperatureChange(Math.min(30, getTemperatureSetpoint() + 1))}
                      disabled={!isConnected || pendingOperations.has('temp_change')}
                      className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: `${currentTheme.colors.brand}20`,
                        border: `1px solid ${currentTheme.colors.brand}40`,
                        color: currentTheme.colors.brand
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fan Controls */}
            <div style={containerStyles.section(currentTheme)}>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                >
                  <Fan size={18} style={{ color: currentTheme.colors.brand }} />
                </div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Fan Control
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Fan Mode */}
                <div className="space-y-2">
                  <label style={{ color: currentTheme.colors.textSecondary }}>Fan Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['auto', 'low', 'mid', 'high'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleFanModeChange(mode)}
                        disabled={!isConnected || pendingOperations.has('fan_mode')}
                        className="px-3 py-2 rounded-lg font-medium transition-all duration-200 capitalize hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: getCurrentFanMode() === mode 
                            ? `${currentTheme.colors.brand}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${getCurrentFanMode() === mode ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        {pendingOperations.has('fan_mode') && getCurrentFanMode() === mode ? 'Setting...' : mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Lighting Controls */}
          <div>
            <div style={containerStyles.section(currentTheme)}>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                >
                  <Lightbulb size={18} style={{ color: currentTheme.colors.brand }} />
                </div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Lighting Controls
                </h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'reading', label: 'Reading Lights', icon: BookOpen, getState: getReadingLightsState },
                  { key: 'ceiling', label: 'Ceiling Lights', icon: Lightbulb, getState: getCeilingLightsState }
                ].map(({ key, label, icon: Icon, getState }) => (
                  <button
                    key={key}
                    onClick={() => handleLightToggle(key as 'ceiling' | 'reading')}
                    disabled={!isConnected || pendingOperations.has(`${key}_lights`)}
                    className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: getState() 
                        ? `${currentTheme.colors.brand}20` 
                        : `${currentTheme.colors.border}20`,
                      border: `1px solid ${getState() ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon size={20} style={{ color: currentTheme.colors.textSecondary }} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ 
                          color: getState() 
                            ? currentTheme.colors.brand 
                            : currentTheme.colors.textSecondary 
                        }}
                      >
                        {pendingOperations.has(`${key}_lights`) ? 'Loading...' : (getState() ? 'ON' : 'OFF')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ModalTemplate>
  );
};

export default EnvironmentalControlsModal; 