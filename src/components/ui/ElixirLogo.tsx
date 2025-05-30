import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeMode } from '../../types/chamber';

interface ElixirLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ElixirLogo: React.FC<ElixirLogoProps> = ({ size = 'md', className = '' }) => {
  const { currentTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const appleTextStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600' as const,
    letterSpacing: '-0.015em',
    color: currentTheme.colors.textPrimary,
    textRendering: 'optimizeLegibility' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const
  };

  return (
    <h1 
      className={`${sizeClasses[size]} ${className}`}
      style={appleTextStyle}
    >
      Elixir Cocoon
    </h1>
  );
};

export default ElixirLogo; 