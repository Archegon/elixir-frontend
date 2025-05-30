import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../types/chamber';
import { ThemeType } from '../../types/chamber';
import { containerStyles, containerClasses } from '../../utils/containerStyles';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemePreview: React.FC<{ theme: Theme; isActive: boolean; onSelect: () => void }> = ({
  theme,
  isActive,
  onSelect
}) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
        isActive 
          ? 'border-blue-500 ring-2 ring-blue-500/20 transform scale-105' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ backgroundColor: theme.colors.primary }}
    >
      {/* Theme Preview */}
      <div className="space-y-3">
        {/* Header Preview */}
        <div 
          className="h-8 rounded px-3 flex items-center justify-between"
          style={{ backgroundColor: theme.colors.tertiary }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.brand }}></div>
            <div 
              className="text-xs font-medium"
              style={{ color: theme.colors.textPrimary }}
            >
              {theme.name}
            </div>
          </div>
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: theme.colors.success,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          ></div>
        </div>

        {/* Cards Preview */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="h-12 rounded p-2"
            style={{ backgroundColor: theme.colors.secondary }}
          >
            <div 
              className="text-xs font-medium mb-1"
              style={{ color: theme.colors.success }}
            >
              Pressure
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.textPrimary }}
            >
              2.4 ATA
            </div>
          </div>
          <div 
            className="h-12 rounded p-2"
            style={{ backgroundColor: theme.colors.secondary }}
          >
            <div 
              className="text-xs font-medium mb-1"
              style={{ color: theme.colors.info }}
            >
              Oxygen
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.textPrimary }}
            >
              100%
            </div>
          </div>
        </div>

        {/* Theme Info */}
        <div className="text-center">
          <h3 
            className="font-semibold text-sm"
            style={{ color: theme.colors.textPrimary }}
          >
            {theme.name}
          </h3>
          <p 
            className="text-xs mt-1"
            style={{ color: theme.colors.textSecondary }}
          >
            {theme.description}
          </p>
        </div>
      </div>
    </button>
  );
};

const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleThemeSelect = (themeType: ThemeType) => {
    setTheme(themeType);
  };

  const darkThemes = [ThemeType.DARK_SLATE, ThemeType.DARK_BLUE, ThemeType.DARK_PURPLE, ThemeType.DARK_APPLE];
  const lightThemes = [ThemeType.LIGHT_CLEAN, ThemeType.LIGHT_WARM, ThemeType.LIGHT_BLUE, ThemeType.LIGHT_APPLE];

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-200 ${
        isAnimating ? 'bg-black/0' : 'bg-black/20 backdrop-blur-sm'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg p-6 w-[900px] max-h-[700px] border shadow-2xl backdrop-blur-md transition-all duration-200 ${
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
            Theme Selection
          </h2>
          <button 
            onClick={handleClose}
            className="text-2xl hover:opacity-70 transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            ×
          </button>
        </div>

        {/* Theme Categories */}
        <div className="space-y-8">
          
          {/* Dark Themes */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              Dark Themes
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {darkThemes.map((themeType) => (
                <ThemePreview
                  key={themeType}
                  theme={themes[themeType]}
                  isActive={currentTheme.id === themeType}
                  onSelect={() => handleThemeSelect(themeType)}
                />
              ))}
            </div>
          </div>

          {/* Light Themes */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              Light Themes
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {lightThemes.map((themeType) => (
                <ThemePreview
                  key={themeType}
                  theme={themes[themeType]}
                  isActive={currentTheme.id === themeType}
                  onSelect={() => handleThemeSelect(themeType)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end mt-8 pt-4" style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}>
          <button
            onClick={handleClose}
            className={`${containerClasses.button} transition-all duration-200 hover:scale-105 active:scale-95`}
            style={containerStyles.button(currentTheme, 'primary')}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default ThemeSelectorModal; 