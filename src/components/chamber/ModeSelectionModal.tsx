import React, { useState, useEffect } from 'react';
import type { ModeConfiguration, TreatmentMode, CompressionMode } from '../../types/chamber';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { Clock, Activity, Gauge, Droplet, Timer } from 'lucide-react';

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
  
  const [config, setConfig] = useState<ModeConfiguration>(initialConfig || {
    // Default to professional mode
    mode_rest: false,
    mode_health: false,
    mode_professional: true,
    mode_custom: false,
    mode_o2_100: false,
    mode_o2_120: false,
    
    // Default to normal compression
    compression_beginner: false,
    compression_normal: true,
    compression_fast: false,
    
    // Default to continuous O2
    continuous_o2_flag: true,
    intermittent_o2_flag: false,
    
    // Default 90 minute session
    set_duration: 90
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Small delay to trigger the animation
      setTimeout(() => setIsAnimating(false), 10);
    } else if (isVisible) {
      setIsAnimating(true);
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 200);
    }
  }, [isOpen, isVisible]);

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

  const updateTreatmentMode = (mode: TreatmentMode) => {
    setConfig(prev => ({
      ...prev,
      // Reset all treatment modes
      mode_rest: false,
      mode_health: false,
      mode_professional: false,
      mode_custom: false,
      mode_o2_100: false,
      mode_o2_120: false,
      // Set selected mode
      [mode]: true
    }));
  };

  const updateCompressionMode = (mode: CompressionMode) => {
    setConfig(prev => ({
      ...prev,
      // Reset all compression modes
      compression_beginner: false,
      compression_normal: false,
      compression_fast: false,
      // Set selected mode
      [mode]: true
    }));
  };

  const updateO2Delivery = (continuous: boolean) => {
    setConfig(prev => ({
      ...prev,
      continuous_o2_flag: continuous,
      intermittent_o2_flag: !continuous
    }));
  };

  const updateDuration = (duration: number) => {
    const clampedDuration = Math.min(120, Math.max(60, duration));
    setConfig(prev => ({
      ...prev,
      set_duration: clampedDuration
    }));
  };

  const treatmentModes = [
    { key: 'mode_rest', label: 'Rest Mode', description: 'Gentle treatment for recovery' },
    { key: 'mode_health', label: 'Health Mode', description: 'Standard wellness treatment' },
    { key: 'mode_professional', label: 'Professional Mode', description: 'Advanced therapeutic treatment' },
    { key: 'mode_custom', label: 'Custom Mode', description: 'User-defined parameters' },
    { key: 'mode_o2_100', label: '100% O2 Mode', description: 'Pure oxygen treatment' },
    { key: 'mode_o2_120', label: '120 Min O2 Mode', description: 'Extended oxygen therapy' }
  ];

  const compressionModes = [
    { key: 'compression_beginner', label: 'Beginner', description: 'Slow, gentle compression' },
    { key: 'compression_normal', label: 'Normal', description: 'Standard compression rate' },
    { key: 'compression_fast', label: 'Fast', description: 'Rapid compression for experienced users' }
  ];

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-200 ${
        isAnimating ? 'bg-black/0' : 'bg-black/20 backdrop-blur-sm'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg p-6 w-[1000px] max-h-[700px] border shadow-2xl backdrop-blur-md overflow-y-auto transition-all duration-200 ${
          isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={containerStyles.modal(currentTheme)}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            Mode Selection & Configuration
          </h2>
          <button 
            onClick={handleClose}
            className="text-2xl hover:opacity-70 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            ×
          </button>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Treatment Mode Selection */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Activity size={20} style={{ color: currentTheme.colors.brand }} />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Treatment Mode
                </h3>
              </div>
              
              <div className="space-y-3">
                {treatmentModes.map(({ key, label, description }) => (
                  <button
                    key={key}
                    onClick={() => updateTreatmentMode(key as TreatmentMode)}
                    className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: config[key as keyof ModeConfiguration] 
                        ? currentTheme.colors.brand 
                        : currentTheme.colors.border,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    <div className="font-medium">{label}</div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      {description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compression Mode */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Gauge size={20} style={{ color: currentTheme.colors.info }} />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Compression Rate
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {compressionModes.map(({ key, label, description }) => (
                  <button
                    key={key}
                    onClick={() => updateCompressionMode(key as CompressionMode)}
                    className="p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: config[key as keyof ModeConfiguration] 
                        ? currentTheme.colors.info 
                        : currentTheme.colors.border,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    <div className="font-medium">{label}</div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      {description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* O2 Delivery Method */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Droplet size={20} style={{ color: currentTheme.colors.success }} />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Oxygen Delivery
                </h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => updateO2Delivery(true)}
                  className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: config.continuous_o2_flag 
                      ? currentTheme.colors.success 
                      : currentTheme.colors.border,
                    color: currentTheme.colors.textPrimary
                  }}
                >
                  <div className="font-medium">Continuous O2</div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Constant oxygen flow throughout session
                  </div>
                </button>

                <button
                  onClick={() => updateO2Delivery(false)}
                  className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: config.intermittent_o2_flag 
                      ? currentTheme.colors.success 
                      : currentTheme.colors.border,
                    color: currentTheme.colors.textPrimary
                  }}
                >
                  <div className="font-medium">Intermittent O2</div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Timed oxygen intervals during session
                  </div>
                </button>
              </div>
            </div>

            {/* Session Duration */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Timer size={20} style={{ color: currentTheme.colors.warning }} />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Session Duration
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateDuration(config.set_duration - 5)}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ 
                      backgroundColor: currentTheme.colors.warning,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    -5
                  </button>
                  
                  <div className="flex-1 text-center">
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {config.set_duration}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      minutes
                    </div>
                  </div>
                  
                  <button
                    onClick={() => updateDuration(config.set_duration + 5)}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ 
                      backgroundColor: currentTheme.colors.warning,
                      color: currentTheme.colors.textPrimary
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
                    value={config.set_duration}
                    onChange={(e) => updateDuration(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: currentTheme.colors.border }}
                  />
                  <div 
                    className="flex justify-between text-xs mt-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div 
          className="flex justify-end space-x-4 mt-6 pt-4"
          style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}
        >
          <button
            onClick={handleCancel}
            className={`${containerClasses.button} transition-all duration-200 hover:scale-105 active:scale-95`}
            style={containerStyles.button(currentTheme, 'secondary')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${containerClasses.button} transition-all duration-200 hover:scale-105 active:scale-95`}
            style={containerStyles.button(currentTheme, 'primary')}
          >
            Apply Configuration
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModeSelectionModal; 