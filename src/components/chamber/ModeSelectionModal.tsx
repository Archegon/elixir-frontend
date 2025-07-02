import React, { useState, useEffect, useCallback } from 'react';
import type { ModeConfiguration, TreatmentMode, CompressionMode } from '../../types/chamber';
import type { PLCStatus } from '../../config/api-endpoints';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { useModalScaling } from '../../hooks/useModalScaling';
import { Clock, Activity, Gauge, Droplet, Timer, BarChart3 } from 'lucide-react';
import { apiService } from '../../services/api.service';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: ModeConfiguration;
  onUpdateConfig?: (config: ModeConfiguration) => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onUpdateConfig
}) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [plcStatus, setPlcStatus] = useState<PLCStatus | null>(null);
  const { scale, modalRef } = useModalScaling({ 
    isOpen, 
    isVisible,
    viewportThreshold: 0.98,
    scaleThreshold: 0.95,
    minScale: 0.8
  });
  
  // Helper function to convert PLC status to ModeConfiguration
  const convertPlcStatusToConfig = useCallback((status: PLCStatus | null): ModeConfiguration => {
    // Debug logging to see what we're actually getting
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 ModeSelectionModal - Converting PLC status to config:', {
        status,
        modes: status?.modes,
        hasStatus: !!status,
        hasModes: !!status?.modes
      });
    }

    if (!status?.modes) {
      console.warn('⚠️ No PLC status or modes available, using defaults');
      // Default config if no status available - but don't default to professional
      return {
        mode_rest: false,
        mode_health: false,
        mode_professional: false,
        mode_custom: false,
        mode_o2_100: false,
        mode_o2_120: false,
        compression_beginner: false,
        compression_normal: true,
        compression_fast: false,
        continuous_o2_flag: true,
        intermittent_o2_flag: false,
        set_duration: 90,
        pressure_set_point: 2.4
      };
    }

    const modes = status.modes;
    
    // Debug log the actual mode values
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 ModeSelectionModal - Mode flags from PLC:', {
        mode_rest: modes.mode_rest,
        mode_health: modes.mode_health,
        mode_professional: modes.mode_professional,
        mode_custom: modes.mode_custom,
        mode_o2_100: modes.mode_o2_100,
        mode_o2_120: modes.mode_o2_120
      });
    }

    const convertedConfig = {
      // Treatment modes - use actual boolean values, not fallback to false
      mode_rest: !!modes.mode_rest,
      mode_health: !!modes.mode_health,
      mode_professional: !!modes.mode_professional,
      mode_custom: !!modes.mode_custom,
      mode_o2_100: !!modes.mode_o2_100,
      mode_o2_120: !!modes.mode_o2_120,
      
      // Compression modes
      compression_beginner: !!modes.compression_beginner,
      compression_normal: !!modes.compression_normal,
      compression_fast: !!modes.compression_fast,
      
      // O2 delivery modes
      continuous_o2_flag: !!modes.continuous_o2_flag,
      intermittent_o2_flag: !!modes.intermittent_o2_flag,
      
      // Session duration - read from PLC status
      set_duration: status.modes?.custom_duration || 90,
      
      // Pressure setpoint - convert from raw PLC value (add 100 and divide by 100)
      pressure_set_point: status.pressure?.setpoint ? 
        ((status.pressure.setpoint + 100) / 100) : 2.4
    };

    // Debug log the converted config
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 ModeSelectionModal - Converted config:', convertedConfig);
      console.log('🔧 ModeSelectionModal - Duration from PLC:', {
        plc_custom_duration: status.modes?.custom_duration,
        converted_set_duration: convertedConfig.set_duration,
        using_plc_value: !!status.modes?.custom_duration
      });
    }

    return convertedConfig;
  }, []);

  const [config, setConfig] = useState<ModeConfiguration>(() => {
    // Initialize with initialConfig if provided, otherwise use PLC status or defaults
    if (initialConfig) return initialConfig;
    
    const initialStatus = apiService.getSystemStatus();
    return convertPlcStatusToConfig(initialStatus);
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 10);
    } else if (isVisible) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 200);
    }
  }, [isOpen, isVisible]);

  // Listen for PLC status updates to sync with real-time mode and settings
  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      const newStatus = data.wsStatus;
      setPlcStatus(newStatus);
      
      // Only sync config if we're not using an initialConfig override
      // This allows the modal to reflect real-time changes
      if (!initialConfig && isOpen) {
        if (import.meta.env.MODE === 'development') {
          console.log('🔧 ModeSelectionModal - Syncing config from status update');
        }
        const newConfig = convertPlcStatusToConfig(newStatus);
        setConfig(newConfig);
      }
    };

    // Subscribe to PLC status updates
    apiService.on('controls-update', handleStatusUpdate);

    // Get initial status when modal opens
    if (isOpen) {
      const initialStatus = apiService.getSystemStatus();
      if (import.meta.env.MODE === 'development') {
        console.log('🔧 ModeSelectionModal - Modal opened, getting initial status:', initialStatus);
        console.log('🔧 ModeSelectionModal - Current treatment mode from PLC:', {
          mode_rest: initialStatus?.modes?.mode_rest,
          mode_health: initialStatus?.modes?.mode_health,
          mode_professional: initialStatus?.modes?.mode_professional,
          mode_custom: initialStatus?.modes?.mode_custom,
          mode_o2_100: initialStatus?.modes?.mode_o2_100,
          mode_o2_120: initialStatus?.modes?.mode_o2_120,
          active_mode: initialStatus?.modes ? Object.entries(initialStatus.modes).find(([key, value]) => 
            key.startsWith('mode_') && value === true)?.[0] : 'none'
        });
      }
      
      if (initialStatus) {
        setPlcStatus(initialStatus);
        
        // Always sync config with initial status when modal opens (unless overridden)
        if (!initialConfig) {
          if (import.meta.env.MODE === 'development') {
            console.log('🔧 ModeSelectionModal - Syncing config from initial status');
          }
          const newConfig = convertPlcStatusToConfig(initialStatus);
          setConfig(newConfig);
        }
      } else {
        console.warn('⚠️ No initial PLC status available when modal opened');
      }
    }

    return () => {
      apiService.off('controls-update', handleStatusUpdate);
    };
  }, [isOpen, initialConfig, convertPlcStatusToConfig]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isVisible) return null;

  const handleSave = () => {
    onUpdateConfig?.(config);
    handleClose();
  };

  const handleCancel = () => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
    handleClose();
  };

  const updateTreatmentMode = async (mode: TreatmentMode) => {
    try {
      const newConfig = {
        ...config,
        mode_rest: false,
        mode_health: false,
        mode_professional: false,
        mode_custom: false,
        mode_o2_100: false,
        mode_o2_120: false,
        [mode]: true
      };

      // Set fixed duration for O2genes modes
      if (mode === 'mode_o2_100') {
        newConfig.set_duration = 100;
      } else if (mode === 'mode_o2_120') {
        newConfig.set_duration = 120;
      }

      // Adjust pressure if it's outside the new mode's limits
      const limits = mode === 'mode_rest' ? { min: 1.1, max: 1.5 } :
                     mode === 'mode_health' ? { min: 1.4, max: 1.99 } :
                     mode === 'mode_professional' ? { min: 1.5, max: 1.99 } :
                     mode === 'mode_custom' ? { min: 1.1, max: 1.99 } :
                     { min: 1.4, max: 1.99 };

      const isNewModeO2Genes = mode === 'mode_o2_100' || mode === 'mode_o2_120';
      
      if (!isNewModeO2Genes && (mode === 'mode_rest' || mode === 'mode_health' || mode === 'mode_professional' || mode === 'mode_custom')) {
        if (newConfig.pressure_set_point < limits.min) {
          newConfig.pressure_set_point = limits.min;
        } else if (newConfig.pressure_set_point > limits.max) {
          newConfig.pressure_set_point = limits.max;
        }
      }

      // Adjust compression mode if it's not available in the new mode
      const availableCompression = mode === 'mode_rest' || mode === 'mode_health' ? ['compression_beginner', 'compression_normal'] :
                                   mode === 'mode_professional' ? ['compression_normal', 'compression_fast'] :
                                   ['compression_beginner', 'compression_normal', 'compression_fast'];

      const currentCompression = newConfig.compression_beginner ? 'compression_beginner' :
                                newConfig.compression_normal ? 'compression_normal' :
                                'compression_fast';

      if (!isNewModeO2Genes && !availableCompression.includes(currentCompression)) {
        // Reset compression modes
        newConfig.compression_beginner = false;
        newConfig.compression_normal = false;
        newConfig.compression_fast = false;
        // Set to the first available option
        if (availableCompression[0] === 'compression_beginner') {
          newConfig.compression_beginner = true;
        } else if (availableCompression[0] === 'compression_normal') {
          newConfig.compression_normal = true;
        } else if (availableCompression[0] === 'compression_fast') {
          newConfig.compression_fast = true;
        }
      }

      // Update local config for immediate UI feedback
      setConfig(newConfig);

      // Map frontend mode to API mode
      const modeMap: Record<TreatmentMode, 'rest' | 'health' | 'professional' | 'custom' | 'o2_100' | 'o2_120'> = {
        mode_rest: 'rest',
        mode_health: 'health', 
        mode_professional: 'professional',
        mode_custom: 'custom',
        mode_o2_100: 'o2_100',
        mode_o2_120: 'o2_120'
      };

      // Send command to PLC with duration for O2 modes
      if (mode === 'mode_o2_100') {
        await apiService.setOperatingMode(modeMap[mode], 100);
      } else if (mode === 'mode_o2_120') {
        await apiService.setOperatingMode(modeMap[mode], 120);
      } else if (mode === 'mode_custom' && newConfig.set_duration !== config.set_duration) {
        // If custom mode and duration changed, include duration
        await apiService.setOperatingMode(modeMap[mode], newConfig.set_duration);
      } else {
        await apiService.setOperatingMode(modeMap[mode]);
      }
      
    } catch (error) {
      console.error('Failed to update treatment mode:', error);
    }
  };

  const updateCompressionMode = async (mode: CompressionMode) => {
    try {
      // Update local config for immediate UI feedback
      setConfig(prev => ({
        ...prev,
        compression_beginner: false,
        compression_normal: false,
        compression_fast: false,
        [mode]: true
      }));

      // Map frontend mode to API mode
      const modeMap: Record<CompressionMode, 'beginner' | 'normal' | 'fast'> = {
        compression_beginner: 'beginner',
        compression_normal: 'normal',
        compression_fast: 'fast'
      };

      // Send command to PLC
      await apiService.setCompressionMode(modeMap[mode]);
      
    } catch (error) {
      console.error('Failed to update compression mode:', error);
    }
  };

  const updateO2Delivery = async (continuous: boolean) => {
    try {
      // Update local config for immediate UI feedback
      setConfig(prev => ({
        ...prev,
        continuous_o2_flag: continuous,
        intermittent_o2_flag: !continuous
      }));

      // Send command to PLC
      await apiService.setOxygenMode(continuous ? 'continuous' : 'intermittent');
      
    } catch (error) {
      console.error('Failed to update oxygen delivery mode:', error);
    }
  };

  const updateDuration = async (duration: number) => {
    try {
      const clampedDuration = Math.min(120, Math.max(60, duration));
      
      // Debug logging for duration updates
      if (import.meta.env.MODE === 'development') {
        console.log('🔧 ModeSelectionModal - Updating duration:', {
          requested_duration: duration,
          clamped_duration: clampedDuration,
          current_plc_duration: plcStatus?.modes?.custom_duration,
          current_config_duration: config.set_duration
        });
      }
      
      // Update local config for immediate UI feedback
      setConfig(prev => ({
        ...prev,
        set_duration: clampedDuration
      }));

      // Send command to PLC using the direct Set Duration endpoint
      await apiService.setDuration(clampedDuration);
      
    } catch (error) {
      console.error('Failed to update session duration:', error);
    }
  };

  // Get current treatment mode key - read directly from PLC status (like SessionInfoCard)
  const getCurrentTreatmentMode = (): string => {
    if (!plcStatus?.modes) return 'mode_professional'; // default fallback
    
    const modes = plcStatus.modes;
    if (modes.mode_rest) return 'mode_rest';
    if (modes.mode_health) return 'mode_health';
    if (modes.mode_professional) return 'mode_professional';
    if (modes.mode_custom) return 'mode_custom';
    if (modes.mode_o2_100) return 'mode_o2_100';
    if (modes.mode_o2_120) return 'mode_o2_120';
    return 'mode_professional'; // default
  };

  // Get pressure limits based on treatment mode
  const getPressureLimits = () => {
    const mode = getCurrentTreatmentMode();
    switch (mode) {
      case 'mode_rest':
        return { min: 1.1, max: 1.5 };
      case 'mode_health':
        return { min: 1.4, max: 1.99 };
      case 'mode_professional':
        return { min: 1.5, max: 1.99 };
      case 'mode_custom':
        return { min: 1.1, max: 1.99 };
      default:
        return { min: 1.4, max: 1.99 };
    }
  };

  // Get available compression modes based on treatment mode
  const getAvailableCompressionModes = () => {
    const mode = getCurrentTreatmentMode();
    switch (mode) {
      case 'mode_rest':
      case 'mode_health':
        return ['compression_beginner', 'compression_normal'];
      case 'mode_professional':
        return ['compression_normal', 'compression_fast'];
      case 'mode_custom':
        return ['compression_beginner', 'compression_normal', 'compression_fast'];
      default:
        return ['compression_beginner', 'compression_normal', 'compression_fast'];
    }
  };

  // Check if configuration sections should be shown - read directly from PLC status
  const isO2GenesMode = () => {
    return plcStatus?.modes?.mode_o2_100 || plcStatus?.modes?.mode_o2_120;
  };

  const shouldShowPressureConfig = () => !isO2GenesMode();
  const shouldShowCompressionConfig = () => !isO2GenesMode();
  const shouldShowDurationConfig = () => !isO2GenesMode();
  const shouldShowO2DeliveryConfig = () => isO2GenesMode();

  const updatePressure = (pressure: number) => {
    const limits = getPressureLimits();
    const clampedPressure = Math.min(limits.max, Math.max(limits.min, Math.round(pressure * 100) / 100));
    setConfig(prev => ({
      ...prev,
      pressure_set_point: clampedPressure
    }));
  };

  const incrementPressure = async () => {
    try {
      await apiService.increasePressure();
      // The actual pressure value will be updated via WebSocket from the PLC
    } catch (error) {
      console.error('Failed to increase pressure:', error);
    }
  };

  const decrementPressure = async () => {
    try {
      await apiService.decreasePressure();
      // The actual pressure value will be updated via WebSocket from the PLC
    } catch (error) {
      console.error('Failed to decrease pressure:', error);
    }
  };

  const treatmentModes = [
    { key: 'mode_rest', label: 'Rest & Relax', description: 'Gentle treatment for relaxation (1.1-1.5 ATA)', color: currentTheme.colors.brand },
    { key: 'mode_health', label: 'Health & Wellness', description: 'Standard wellness treatment (1.4-1.99 ATA)', color: currentTheme.colors.brand },
    { key: 'mode_professional', label: 'Professional Recovery', description: 'Advanced recovery treatment (1.5-1.99 ATA)', color: currentTheme.colors.brand },
    { key: 'mode_custom', label: 'Customise', description: 'User-defined parameters (1.1-1.99 ATA)', color: currentTheme.colors.brand },
    { key: 'mode_o2_100', label: 'O2genes 100 Mins', description: 'Oxygen therapy - 100 minutes', color: currentTheme.colors.brand },
    { key: 'mode_o2_120', label: 'O2genes 120 Mins', description: 'Oxygen therapy - 120 minutes', color: currentTheme.colors.brand }
  ];

  const compressionModes = [
    { key: 'compression_beginner', label: 'Beginner', description: 'Slow, gentle compression', color: currentTheme.colors.brand },
    { key: 'compression_normal', label: 'Normal', description: 'Standard compression rate', color: currentTheme.colors.brand },
    { key: 'compression_fast', label: 'Fast', description: 'Rapid compression for experienced users', color: currentTheme.colors.brand }
  ];

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isAnimating ? 'bg-black/0' : 'bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleClose}
    >
      <div 
        ref={modalRef}
        className={`w-[98vw] max-w-[1600px] h-[98vh] border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          ...containerStyles.modal(currentTheme),
          transform: `scale(${scale}) ${isAnimating ? 'scale(0.95) translateY(1rem)' : ''}`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '98vh',
          maxHeight: '98vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 
                className="text-2xl font-semibold"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Mode Selection & Configuration
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Configure treatment parameters and session settings
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-2xl hover:opacity-70 transition-all duration-200 hover:scale-110 active:scale-95 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ 
                color: currentTheme.colors.textSecondary,
                backgroundColor: `${currentTheme.colors.border}30`
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div style={{
          ...containerStyles.modalContent(currentTheme),
          flex: 1,
          maxHeight: 'none',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div className="p-6 h-full">
            
            {/* Configuration Grid */}
            <div className="grid grid-cols-2 gap-8 h-full">
              
              {/* Left Column */}
              <div className="space-y-8 flex flex-col h-full">
                
                {/* Treatment Mode Selection */}
                <div style={{...containerStyles.section(currentTheme), flex: 2, display: 'flex', flexDirection: 'column'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                    >
                      <Activity size={18} style={{ color: currentTheme.colors.brand }} />
                    </div>
                    <h3 
                      className="text-lg font-semibold"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      Treatment Mode
                    </h3>
                  </div>
                  
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {treatmentModes.map(({ key, label, description, color }) => {
                      // Check PLC status directly for accurate mode selection display (like SessionInfoCard does)
                      const isSelected = plcStatus?.modes ? plcStatus.modes[key as keyof typeof plcStatus.modes] : false;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => updateTreatmentMode(key as TreatmentMode)}
                          className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            backgroundColor: isSelected 
                              ? `${color}20` 
                              : `${currentTheme.colors.border}20`,
                            border: `1px solid ${isSelected ? color : currentTheme.colors.border}40`,
                            color: currentTheme.colors.textPrimary
                          }}
                        >
                          <div className="font-semibold text-base">{label}</div>
                          <div 
                            className="text-sm mt-2"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            {description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compression Mode */}
                {shouldShowCompressionConfig() && (
                  <div style={{...containerStyles.section(currentTheme), flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                      >
                        <Gauge size={18} style={{ color: currentTheme.colors.brand }} />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Compression Rate
                      </h3>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      {compressionModes
                        .filter(({ key }) => getAvailableCompressionModes().includes(key))
                        .map(({ key, label, description, color }) => {
                          // Check PLC status directly for accurate compression mode selection
                          const isSelected = plcStatus?.modes ? plcStatus.modes[key as keyof typeof plcStatus.modes] : false;
                          
                          return (
                            <button
                              key={key}
                              onClick={() => updateCompressionMode(key as CompressionMode)}
                              className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                              style={{
                                backgroundColor: isSelected 
                                  ? `${color}20` 
                                  : `${currentTheme.colors.border}20`,
                                border: `1px solid ${isSelected ? color : currentTheme.colors.border}40`,
                                color: currentTheme.colors.textPrimary
                              }}
                            >
                              <div className="font-semibold text-base">{label}</div>
                              <div 
                                className="text-sm mt-2"
                                style={{ color: currentTheme.colors.textSecondary }}
                              >
                                {description}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column */}
              <div className="space-y-8 flex flex-col h-full">
                
                {/* Pressure Set Point */}
                {shouldShowPressureConfig() && (
                  <div style={{...containerStyles.section(currentTheme), flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                      >
                        <BarChart3 size={18} style={{ color: currentTheme.colors.brand }} />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Pressure Set Point
                      </h3>
                    </div>
                    
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={decrementPressure}
                            className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
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
                              className="text-3xl font-bold font-mono"
                              style={{ color: currentTheme.colors.textPrimary }}
                            >
                              {plcStatus?.pressure?.setpoint ? ((plcStatus.pressure.setpoint + 100) / 100).toFixed(2) : config.pressure_set_point.toFixed(2)}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: currentTheme.colors.textSecondary }}
                            >
                              ATA
                            </div>
                          </div>
                          
                          <button
                            onClick={incrementPressure}
                            className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${currentTheme.colors.brand}20`,
                              border: `1px solid ${currentTheme.colors.brand}40`,
                              color: currentTheme.colors.brand
                            }}
                          >
                            +
                          </button>
                        </div>
                      
                                              <div>
                          <input
                            type="range"
                            min={getPressureLimits().min}
                            max={getPressureLimits().max}
                            step="0.01"
                            value={plcStatus?.pressure?.setpoint ? (plcStatus.pressure.setpoint + 100) / 100 : config.pressure_set_point}
                            disabled={true}
                            className="w-full h-2 rounded-lg appearance-none cursor-not-allowed opacity-60"
                            style={{ 
                              backgroundColor: currentTheme.colors.border,
                              outline: 'none'
                            }}
                          />
                          <div 
                            className="flex justify-between text-xs mt-2"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            <span>{getPressureLimits().min} ATA</span>
                            <span>{getPressureLimits().max} ATA</span>
                          </div>
                          <div 
                            className="text-xs text-center mt-1"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            Use + / - buttons to control pressure
                          </div>
                        </div>
                    </div>
                  </div>
                )}
                
                {/* O2 Delivery Method */}
                {shouldShowO2DeliveryConfig() && (
                  <div style={{...containerStyles.section(currentTheme), flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                      >
                        <Droplet size={18} style={{ color: currentTheme.colors.brand }} />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Oxygen Delivery
                      </h3>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      <button
                        onClick={() => updateO2Delivery(true)}
                        className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: plcStatus?.modes?.continuous_o2_flag 
                            ? `${currentTheme.colors.brand}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${plcStatus?.modes?.continuous_o2_flag ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        <div className="font-semibold text-base">Continuous O2</div>
                        <div 
                          className="text-sm mt-2"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Constant oxygen flow throughout session
                        </div>
                      </button>

                      <button
                        onClick={() => updateO2Delivery(false)}
                        className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: plcStatus?.modes?.intermittent_o2_flag 
                            ? `${currentTheme.colors.brand}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${plcStatus?.modes?.intermittent_o2_flag ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        <div className="font-semibold text-base">Intermittent O2</div>
                        <div 
                          className="text-sm mt-2"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Timed oxygen intervals during session
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Duration */}
                {shouldShowDurationConfig() ? (
                  <div style={{...containerStyles.section(currentTheme), flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                      >
                        <Timer size={18} style={{ color: currentTheme.colors.brand }} />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Session Duration
                      </h3>
                    </div>
                    
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateDuration((plcStatus?.modes?.custom_duration ? plcStatus.modes.custom_duration : config.set_duration) - 5)}
                            className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${currentTheme.colors.brand}20`,
                              border: `1px solid ${currentTheme.colors.brand}40`,
                              color: currentTheme.colors.brand
                            }}
                          >
                            -5
                          </button>
                          
                          <div className="flex-1 text-center">
                            <div 
                              className="text-3xl font-bold font-mono"
                              style={{ color: currentTheme.colors.textPrimary }}
                            >
                              {plcStatus?.modes?.custom_duration ? plcStatus.modes.custom_duration : config.set_duration}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: currentTheme.colors.textSecondary }}
                            >
                              minutes
                            </div>
                          </div>
                          
                          <button
                            onClick={() => updateDuration((plcStatus?.modes?.custom_duration ? plcStatus.modes.custom_duration : config.set_duration) + 5)}
                            className="w-10 h-10 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${currentTheme.colors.brand}20`,
                              border: `1px solid ${currentTheme.colors.brand}40`,
                              color: currentTheme.colors.brand
                            }}
                          >
                            +5
                          </button>
                        </div>
                        
                        <div>
                          <input
                            type="range"
                            min="60"
                            max="120"
                            step="5"
                            value={plcStatus?.modes?.custom_duration ? plcStatus.modes.custom_duration : config.set_duration}
                            onChange={(e) => updateDuration(parseInt(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ 
                              backgroundColor: currentTheme.colors.border,
                              outline: 'none'
                            }}
                          />
                          <div 
                            className="flex justify-between text-xs mt-2"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            <span>60 min</span>
                            <span>120 min</span>
                          </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  // Show fixed duration for O2genes modes
                  <div style={{...containerStyles.section(currentTheme), flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.brand}20` }}
                      >
                        <Timer size={18} style={{ color: currentTheme.colors.brand }} />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Session Duration
                      </h3>
                    </div>
                    
                    <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${currentTheme.colors.border}10` }}>
                      <div 
                        className="text-3xl font-bold font-mono"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        {plcStatus?.modes?.custom_duration ? plcStatus.modes.custom_duration : config.set_duration}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        minutes (fixed)
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className="p-6 border-t"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: `${currentTheme.colors.border}20`,
                border: `1px solid ${currentTheme.colors.border}40`,
                color: currentTheme.colors.textPrimary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: currentTheme.colors.brand,
                border: `1px solid ${currentTheme.colors.brand}`,
                color: '#ffffff'
              }}
            >
              Apply Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModeSelectionModal; 