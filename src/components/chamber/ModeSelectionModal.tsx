import React, { useState, useEffect } from 'react';
import type { ModeConfiguration, TreatmentMode, CompressionMode } from '../../types/chamber';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { useModalScaling } from '../../hooks/useModalScaling';
import { Clock, Activity, Gauge, Droplet, Timer, BarChart3 } from 'lucide-react';

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
  const { scale, modalRef } = useModalScaling({ 
    isOpen, 
    isVisible,
    viewportThreshold: 0.9,
    scaleThreshold: 0.8,
    minScale: 0.6
  });
  
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
    set_duration: 90,
    
    // Default 2.4 ATA pressure
    pressure_set_point: 2.4
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
      mode_rest: false,
      mode_health: false,
      mode_professional: false,
      mode_custom: false,
      mode_o2_100: false,
      mode_o2_120: false,
      [mode]: true
    }));
  };

  const updateCompressionMode = (mode: CompressionMode) => {
    setConfig(prev => ({
      ...prev,
      compression_beginner: false,
      compression_normal: false,
      compression_fast: false,
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

  const updatePressure = (pressure: number) => {
    const clampedPressure = Math.min(3.0, Math.max(1.4, Math.round(pressure * 10) / 10));
    setConfig(prev => ({
      ...prev,
      pressure_set_point: clampedPressure
    }));
  };

  const treatmentModes = [
    { key: 'mode_rest', label: 'Rest Mode', description: 'Gentle treatment for recovery', color: currentTheme.colors.brand },
    { key: 'mode_health', label: 'Health Mode', description: 'Standard wellness treatment', color: currentTheme.colors.brand },
    { key: 'mode_professional', label: 'Professional Mode', description: 'Advanced therapeutic treatment', color: currentTheme.colors.brand },
    { key: 'mode_custom', label: 'Custom Mode', description: 'User-defined parameters', color: currentTheme.colors.brand },
    { key: 'mode_o2_100', label: '100% O2 Mode', description: 'Pure oxygen treatment', color: currentTheme.colors.brand },
    { key: 'mode_o2_120', label: '120 Min O2 Mode', description: 'Extended oxygen therapy', color: currentTheme.colors.brand }
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
        className={`w-[1100px] border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          ...containerStyles.modal(currentTheme),
          transform: `scale(${scale}) ${isAnimating ? 'scale(0.95) translateY(1rem)' : ''}`,
          transformOrigin: 'center center'
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
        <div style={containerStyles.modalContent(currentTheme)}>
          <div className="p-6">
            
            {/* Configuration Grid */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Treatment Mode Selection */}
                <div style={containerStyles.section(currentTheme)}>
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
                  
                  <div className="space-y-2">
                    {treatmentModes.map(({ key, label, description, color }) => (
                      <button
                        key={key}
                        onClick={() => updateTreatmentMode(key as TreatmentMode)}
                        className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: config[key as keyof ModeConfiguration] 
                            ? `${color}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${config[key as keyof ModeConfiguration] ? color : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        <div className="font-medium text-sm">{label}</div>
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
                <div style={containerStyles.section(currentTheme)}>
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
                  
                  <div className="space-y-2">
                    {compressionModes.map(({ key, label, description, color }) => (
                      <button
                        key={key}
                        onClick={() => updateCompressionMode(key as CompressionMode)}
                        className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: config[key as keyof ModeConfiguration] 
                            ? `${color}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${config[key as keyof ModeConfiguration] ? color : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        <div className="font-medium text-sm">{label}</div>
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
                
                {/* Pressure Set Point */}
                <div style={containerStyles.section(currentTheme)}>
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updatePressure(config.pressure_set_point - 0.1)}
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
                          {config.pressure_set_point.toFixed(1)}
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          ATA
                        </div>
                      </div>
                      
                      <button
                        onClick={() => updatePressure(config.pressure_set_point + 0.1)}
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
                        min="1.4"
                        max="3.0"
                        step="0.1"
                        value={config.pressure_set_point}
                        onChange={(e) => updatePressure(parseFloat(e.target.value))}
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
                        <span>1.4 ATA</span>
                        <span>3.0 ATA</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* O2 Delivery Method */}
                <div style={containerStyles.section(currentTheme)}>
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
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => updateO2Delivery(true)}
                      className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: config.continuous_o2_flag 
                          ? `${currentTheme.colors.brand}20` 
                          : `${currentTheme.colors.border}20`,
                        border: `1px solid ${config.continuous_o2_flag ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                        color: currentTheme.colors.textPrimary
                      }}
                    >
                      <div className="font-medium text-sm">Continuous O2</div>
                      <div 
                        className="text-xs mt-1"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Constant oxygen flow throughout session
                      </div>
                    </button>

                    <button
                      onClick={() => updateO2Delivery(false)}
                      className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: config.intermittent_o2_flag 
                          ? `${currentTheme.colors.brand}20` 
                          : `${currentTheme.colors.border}20`,
                        border: `1px solid ${config.intermittent_o2_flag ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                        color: currentTheme.colors.textPrimary
                      }}
                    >
                      <div className="font-medium text-sm">Intermittent O2</div>
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
                <div style={containerStyles.section(currentTheme)}>
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateDuration(config.set_duration - 5)}
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
                        value={config.set_duration}
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