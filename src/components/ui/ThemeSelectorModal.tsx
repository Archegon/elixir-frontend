import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../types/chamber';
import { ThemeType } from '../../types/chamber';
import { containerStyles, containerClasses } from '../../utils/containerStyles';
import ModalTemplate from './ModalTemplate';

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
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
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

  const handleThemeSelect = (themeType: ThemeType) => {
    setTheme(themeType);
  };

  const darkThemes = [ThemeType.DARK_SLATE, ThemeType.DARK_BLUE, ThemeType.DARK_PURPLE, ThemeType.DARK_APPLE];
  const lightThemes = [ThemeType.LIGHT_CLEAN, ThemeType.LIGHT_WARM, ThemeType.LIGHT_BLUE, ThemeType.LIGHT_APPLE];

  const footer = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: currentTheme.colors.brand,
          border: `1px solid ${currentTheme.colors.brand}`,
          color: '#ffffff'
        }}
      >
        Done
      </button>
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Theme Selection"
      subtitle="Choose your preferred visual theme"
      width="w-[90vw] max-w-[1200px]"
      height="max-h-[85vh]"
      footer={footer}
    >
      <div className="p-6">
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
      </div>
    </ModalTemplate>
  );
};

export default ThemeSelectorModal; 