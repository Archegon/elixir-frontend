import React, { useState, useEffect } from 'react';
import type { EnvironmentalControls } from '../../types/chamber';
import { FanMode } from '../../types/chamber';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import { BookOpen, DoorOpen, Lightbulb, Flashlight } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localControls, setLocalControls] = useState<EnvironmentalControls>(controls);

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
    onUpdateControls(localControls);
    handleClose();
  };

  const handleCancel = () => {
    setLocalControls(controls); // Reset to original values
    handleClose();
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

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-200 ${
        isAnimating ? 'bg-black/0' : 'bg-black/20 backdrop-blur-sm'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg p-6 w-[800px] max-h-[600px] border shadow-2xl backdrop-blur-md transition-all duration-200 ${
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
            Environmental Controls
          </h2>
          <button 
            onClick={handleClose}
            className="text-2xl hover:opacity-70 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            ×
          </button>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Left Column - Climate Controls */}
          <div className="space-y-6">
            
            {/* Air Conditioner */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Air Conditioning
              </h3>
              
              <div className="space-y-4">
                {/* AC Enable/Disable */}
                <div className="flex items-center justify-between">
                  <label style={{ color: currentTheme.colors.textSecondary }}>AC System</label>
                  <button
                    onClick={() => updateAirConditioner({ enabled: !localControls.airConditioner.enabled })}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: localControls.airConditioner.enabled 
                        ? currentTheme.colors.success 
                        : currentTheme.colors.border,
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
                      className="px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{ 
                        backgroundColor: currentTheme.colors.info,
                        color: currentTheme.colors.textPrimary
                      }}
                    >
                      -
                    </button>
                    <span 
                      className="text-2xl font-bold min-w-[60px] text-center"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {localControls.airConditioner.temperatureSetPoint}°C
                    </span>
                    <button
                      onClick={() => updateAirConditioner({ 
                        temperatureSetPoint: Math.min(30, localControls.airConditioner.temperatureSetPoint + 1)
                      })}
                      className="px-3 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{ 
                        backgroundColor: currentTheme.colors.info,
                        color: currentTheme.colors.textPrimary
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Current: {localControls.airConditioner.currentTemperature}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Fan Controls */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Fan Control
              </h3>
              
              <div className="space-y-4">
                {/* Fan Mode */}
                <div className="space-y-2">
                  <label style={{ color: currentTheme.colors.textSecondary }}>Fan Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(FanMode).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateFan({ mode })}
                        className="px-3 py-2 rounded-lg font-medium transition-all duration-200 capitalize hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: localControls.fan.mode === mode 
                            ? currentTheme.colors.brand 
                            : currentTheme.colors.border,
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
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.tertiary }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Lighting Controls
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'readingLights', label: 'Reading Lights', icon: BookOpen },
                  { key: 'doorLights', label: 'Door Lights', icon: DoorOpen },
                  { key: 'ceilingLights', label: 'Ceiling Lights', icon: Lightbulb },
                  { key: 'exteriorLights', label: 'Exterior Lights', icon: Flashlight }
                ].map(({ key, label, icon: Icon }) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: currentTheme.colors.border }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} style={{ color: currentTheme.colors.textSecondary }} />
                      <label 
                        className="font-medium"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        {label}
                      </label>
                    </div>
                    <button
                      onClick={() => updateLighting(
                        key as keyof typeof localControls.lighting, 
                        !localControls.lighting[key as keyof typeof localControls.lighting]
                      )}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: localControls.lighting[key as keyof typeof localControls.lighting]
                          ? currentTheme.colors.warning
                          : currentTheme.colors.borderLight,
                        color: currentTheme.colors.textPrimary
                      }}
                    >
                      {localControls.lighting[key as keyof typeof localControls.lighting] ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
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
            Apply Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EnvironmentalControlsModal; 