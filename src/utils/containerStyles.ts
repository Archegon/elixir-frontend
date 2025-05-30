import type { Theme } from '../types/chamber';

// Apple-style font configuration
export const appleMonoFont = {
  fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
  letterSpacing: '0.025em',
  fontWeight: '500' as const
};

// Container style generators
export const containerStyles = {
  // Primary card container (for metric cards, main sections)
  card: (theme: Theme) => ({
    backgroundColor: theme.colors.secondary,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    borderRadius: '1rem' // rounded-2xl equivalent
  }),

  // Small container (for status badges, time displays)
  small: (theme: Theme) => ({
    backgroundColor: theme.colors.primary,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem', // rounded-lg equivalent
    padding: '0.25rem 0.75rem' // py-1 px-3 equivalent
  }),

  // Button container
  button: (theme: Theme, variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'primary') => {
    const colorMap = {
      primary: theme.colors.brand,
      secondary: theme.colors.primary,
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      info: theme.colors.info
    };

    return {
      backgroundColor: colorMap[variant],
      color: variant === 'secondary' ? theme.colors.textPrimary : '#ffffff',
      border: variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none',
      borderRadius: '0.75rem', // rounded-xl equivalent
      padding: '0.75rem 1rem', // py-3 px-4 equivalent
      fontWeight: '600' as const,
      cursor: 'pointer' as const
    };
  },

  // Status badge container
  statusBadge: (theme: Theme, status: 'success' | 'warning' | 'danger' | 'info') => {
    const colorMap = {
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      info: theme.colors.info
    };

    const color = colorMap[status];

    return {
      backgroundColor: `${color}15`,
      color: color,
      borderRadius: '9999px', // rounded-full equivalent
      padding: '0.25rem 0.5rem', // py-1 px-2 equivalent
      fontSize: '0.75rem', // text-xs equivalent
      fontWeight: '500' as const
    };
  },

  // Time display container
  timeDisplay: (theme: Theme) => ({
    ...containerStyles.small(theme),
    ...appleMonoFont
  }),

  // Header container
  header: (theme: Theme) => ({
    backgroundColor: `${theme.colors.secondary}95`,
    borderBottom: `1px solid ${theme.colors.border}`,
    backdropFilter: 'blur(20px)'
  }),

  // Modal container
  modal: (theme: Theme) => ({
    backgroundColor: theme.colors.secondary,
    border: `1px solid ${theme.colors.border}60`,
    borderRadius: '1rem', // rounded-xl equivalent
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl equivalent
    backdropFilter: 'blur(12px)',
    maxHeight: 'calc(100vh - 8rem)', // Prevent overflow
    overflow: 'hidden' // Container shouldn't scroll
  }),

  // Modal content (scrollable area)
  modalContent: (theme: Theme) => ({
    maxHeight: 'calc(100vh - 16rem)', // Account for header and footer
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const
  }),

  // Section container for modal sections
  section: (theme: Theme) => ({
    backgroundColor: `${theme.colors.tertiary}60`,
    border: `1px solid ${theme.colors.border}30`,
    borderRadius: '0.75rem', // rounded-xl equivalent
    padding: '1.5rem' // p-6 equivalent
  }),

  // Input styling (Apple-style)
  input: (theme: Theme) => ({
    backgroundColor: theme.colors.primary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem', // rounded-lg equivalent
    padding: '0.75rem 1rem', // py-3 px-4 equivalent
    color: theme.colors.textPrimary,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
    '&:focus': {
      borderColor: theme.colors.brand
    }
  }),

  // Range slider styling
  slider: (theme: Theme) => ({
    appearance: 'none' as const,
    height: '0.5rem', // h-2
    borderRadius: '0.25rem', // rounded
    backgroundColor: theme.colors.border,
    cursor: 'pointer' as const,
    outline: 'none',
    '&::-webkit-slider-thumb': {
      appearance: 'none' as const,
      height: '1.25rem', // h-5
      width: '1.25rem', // w-5
      borderRadius: '50%',
      backgroundColor: theme.colors.brand,
      cursor: 'pointer' as const,
      border: '2px solid #ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }
  }),

  // Alert container
  alert: (theme: Theme, type: 'success' | 'warning' | 'danger' | 'info') => {
    const colorMap = {
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      info: theme.colors.info
    };

    const color = colorMap[type];

    return {
      backgroundColor: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: '0.75rem', // rounded-xl equivalent
      padding: '0.75rem' // p-3 equivalent
    };
  }
};

// CSS class utilities for common styling patterns
export const containerClasses = {
  card: 'p-5 rounded-2xl',
  cardLarge: 'p-6 rounded-2xl',
  button: 'font-semibold py-3 px-4 rounded-xl text-sm',
  buttonFull: 'w-full font-semibold py-3 px-4 rounded-xl text-sm',
  statusBadge: 'px-2 py-1 text-xs font-medium rounded-full',
  timeDisplay: 'text-sm font-mono px-3 py-1 rounded-lg',
  header: 'h-16 px-6 flex items-center justify-between',
  grid4: 'grid grid-cols-4 gap-4',
  grid3: 'grid grid-cols-4 gap-3',
  gridCols12: 'grid grid-cols-12 gap-6',
  spaceY6: 'space-y-6',
  spaceY3: 'space-y-3'
};

// Utility functions
export const getProgressBarStyle = (theme: Theme, percentage: number, color?: string) => ({
  container: {
    width: '100%',
    height: '0.375rem', // h-1.5 equivalent
    borderRadius: '9999px',
    backgroundColor: theme.colors.border
  },
  fill: {
    height: '100%',
    borderRadius: '9999px',
    width: `${percentage}%`,
    backgroundColor: color || theme.colors.brand
  }
});

export const getStatusIndicatorStyle = (theme: Theme, status: 'success' | 'warning' | 'danger' | 'info') => {
  const colorMap = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info
  };

  return {
    width: '0.5rem', // w-2
    height: '0.5rem', // h-2
    borderRadius: '9999px',
    backgroundColor: colorMap[status]
  };
}; 