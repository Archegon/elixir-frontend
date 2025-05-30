// Chamber status and operational states
export enum ChamberStatus {
  IDLE = 'idle',
  PRESSURIZING = 'pressurizing',
  TREATMENT = 'treatment',
  DEPRESSURIZING = 'depressurizing',
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance'
}

export enum AlertLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Theme system
export enum ThemeType {
  DARK_SLATE = 'dark-slate',
  DARK_BLUE = 'dark-blue',
  DARK_PURPLE = 'dark-purple',
  DARK_APPLE = 'dark-apple',
  LIGHT_CLEAN = 'light-clean',
  LIGHT_WARM = 'light-warm',
  LIGHT_BLUE = 'light-blue',
  LIGHT_APPLE = 'light-apple'
}

export enum ThemeMode {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  mode: ThemeMode;
  colors: {
    // Background colors
    primary: string;    // Main background
    secondary: string;  // Card backgrounds
    tertiary: string;   // Header backgrounds
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textAccent: string;
    
    // Border colors
    border: string;
    borderLight: string;
    
    // Status colors (consistent across themes)
    success: string;
    warning: string;
    danger: string;
    info: string;
    
    // Brand color
    brand: string;
  };
}

// Environmental controls
export enum FanMode {
  AUTO = 'auto',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface EnvironmentalControls {
  airConditioner: {
    enabled: boolean;
    temperatureSetPoint: number; // Celsius
    currentTemperature: number;
  };
  fan: {
    mode: FanMode;
    speed: number; // 0-100 percentage
  };
  lighting: {
    readingLights: boolean;
    doorLights: boolean;
    ceilingLights: boolean;
    exteriorLights: boolean;
  };
}

// Core chamber metrics
export interface ChamberMetrics {
  pressure: {
    current: number; // ATA (Atmospheres Absolute)
    target: number;
    unit: string;
  };
  oxygen: {
    level: number; // Percentage
    unit: string;
  };
  temperature: {
    current: number; // Celsius
    unit: string;
  };
  session: {
    elapsed: number; // Minutes
    remaining: number; // Minutes
    total: number; // Minutes
  };
}

// System alerts and notifications
export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Complete chamber state
export interface ChamberState {
  status: ChamberStatus;
  metrics: ChamberMetrics;
  alerts: Alert[];
  environmental: EnvironmentalControls;
  isConnected: boolean;
  lastUpdate: Date;
}

// Control actions
export interface ControlAction {
  id: string;
  label: string;
  action: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  confirmRequired?: boolean;
}

export interface ModeConfiguration {
  // Treatment modes
  mode_rest: boolean;
  mode_health: boolean;
  mode_professional: boolean;
  mode_custom: boolean;
  mode_o2_100: boolean;
  mode_o2_120: boolean;
  
  // Compression modes
  compression_beginner: boolean;
  compression_normal: boolean;
  compression_fast: boolean;
  
  // O2 delivery flags
  continuous_o2_flag: boolean;
  intermittent_o2_flag: boolean;
  
  // Session duration (60-120 minutes)
  set_duration: number;
}

export type TreatmentMode = 'mode_rest' | 'mode_health' | 'mode_professional' | 'mode_custom' | 'mode_o2_100' | 'mode_o2_120';
export type CompressionMode = 'compression_beginner' | 'compression_normal' | 'compression_fast'; 