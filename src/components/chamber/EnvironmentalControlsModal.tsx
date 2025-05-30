import React, { useState } from 'react';
import type { EnvironmentalControls } from '../../types/chamber';
import { FanMode } from '../../types/chamber';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles } from '../../utils/containerStyles';
import ModalTemplate from '../ui/ModalTemplate';
import { BookOpen, DoorOpen, Lightbulb, Flashlight, Snowflake, Fan } from 'lucide-react';

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
  const [localControls, setLocalControls] = useState<EnvironmentalControls>(controls);

  const handleSave = () => {
    onUpdateControls(localControls);
    onClose();
  };

  const handleCancel = () => {
    setLocalControls(controls); // Reset to original values
    onClose();
  };

  const updateAirConditioner = (updates: Partial<typeof localControls.airConditioner>) => {
    setLocalControls(prev => ({
      ...prev,
      airConditioner: { ...prev.airConditioner, ...updates }
    }));
  };

  const updateFan = (updates: Partial<typeof localControls.fan>) => {
    setLocalControls(prev => ({
      ...prev,
      fan: { ...prev.fan, ...updates }
    }));
  };

  const updateLighting = (lightType: keyof typeof localControls.lighting, value: boolean) => {
    setLocalControls(prev => ({
      ...prev,
      lighting: { ...prev.lighting, [lightType]: value }
    }));
  };

  const footer = (
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
        Apply Changes
      </button>
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
                    onClick={() => updateAirConditioner({ enabled: !localControls.airConditioner.enabled })}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: localControls.airConditioner.enabled 
                        ? `${currentTheme.colors.brand}20` 
                        : `${currentTheme.colors.border}20`,
                      border: `1px solid ${localControls.airConditioner.enabled ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                      color: currentTheme.colors.textPrimary
                    }}
                  >
                    {localControls.airConditioner.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Temperature Set Point */}
                <div className="space-y-2">
                  <label style={{ color: currentTheme.colors.textSecondary }}>Temperature Set Point</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateAirConditioner({ 
                        temperatureSetPoint: Math.max(16, localControls.airConditioner.temperatureSetPoint - 1)
                      })}
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
                        className="text-2xl font-bold font-mono"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        {localControls.airConditioner.temperatureSetPoint}°C
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Current: {localControls.airConditioner.currentTemperature}°C
                      </div>
                    </div>
                    <button
                      onClick={() => updateAirConditioner({ 
                        temperatureSetPoint: Math.min(30, localControls.airConditioner.temperatureSetPoint + 1)
                      })}
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
                    {Object.values(FanMode).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateFan({ mode })}
                        className="px-3 py-2 rounded-lg font-medium transition-all duration-200 capitalize hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: localControls.fan.mode === mode 
                            ? `${currentTheme.colors.brand}20` 
                            : `${currentTheme.colors.border}20`,
                          border: `1px solid ${localControls.fan.mode === mode ? currentTheme.colors.brand : currentTheme.colors.border}40`,
                          color: currentTheme.colors.textPrimary
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fan Speed (when not auto) */}
                {localControls.fan.mode !== FanMode.AUTO && (
                  <div className="space-y-2">
                    <label style={{ color: currentTheme.colors.textSecondary }}>
                      Fan Speed: {localControls.fan.speed}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localControls.fan.speed}
                      onChange={(e) => updateFan({ speed: parseInt(e.target.value) })}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{ backgroundColor: currentTheme.colors.border }}
                    />
                  </div>
                )}
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
                  { key: 'readingLights', label: 'Reading Lights', icon: BookOpen },
                  { key: 'doorLights', label: 'Door Lights', icon: DoorOpen },
                  { key: 'ceilingLights', label: 'Ceiling Lights', icon: Lightbulb },
                  { key: 'exteriorLights', label: 'Exterior Lights', icon: Flashlight }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => updateLighting(
                      key as keyof typeof localControls.lighting, 
                      !localControls.lighting[key as keyof typeof localControls.lighting]
                    )}
                    className="w-full p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: localControls.lighting[key as keyof typeof localControls.lighting]
                        ? `${currentTheme.colors.brand}20` 
                        : `${currentTheme.colors.border}20`,
                      border: `1px solid ${localControls.lighting[key as keyof typeof localControls.lighting] ? currentTheme.colors.brand : currentTheme.colors.border}40`,
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
                          color: localControls.lighting[key as keyof typeof localControls.lighting] 
                            ? currentTheme.colors.brand 
                            : currentTheme.colors.textSecondary 
                        }}
                      >
                        {localControls.lighting[key as keyof typeof localControls.lighting] ? 'ON' : 'OFF'}
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