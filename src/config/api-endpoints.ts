/**
 * API Endpoints Configuration
 * 
 * Centralized definition of all API endpoints and WebSocket paths.
 * Connection settings are defined separately in connection.config.ts
 */

// HTTP API Endpoints
export const API_ENDPOINTS = {
  // Health and Configuration
  HEALTH: '/health',
  CONFIG: {
    RELOAD: '/api/config/reload',
    ADDRESSES: '/api/config/addresses',
    SEARCH: '/api/config/search',
  },

  // Authentication
  AUTH: {
    SHOW: '/api/auth/show',
    PROCEED: '/api/auth/proceed',
    BACK: '/api/auth/back',
    INPUT: '/api/auth/input',
    STATUS: '/api/auth/status',
  },

  // Language Settings
  LANGUAGE: {
    SWITCH: '/api/language/switch',
    CURRENT: '/api/language/current',
  },

  // Control Panel
  CONTROL: {
    SHUTDOWN: '/api/control/shutdown',
    AC_TOGGLE: '/api/control/ac/toggle',
    CEILING_LIGHTS: '/api/control/lights/ceiling/toggle',
    READING_LIGHTS: '/api/control/lights/reading/toggle',
    DOOR_LIGHTS: '/api/control/lights/door/toggle',
    INTERCOM: '/api/control/intercom/toggle',
    STATUS: '/api/control/status',
  },

  // Pressure Control
  PRESSURE: {
    ADD: '/api/pressure/add',
    SUBTRACT: '/api/pressure/subtract',
    SETPOINT: '/api/pressure/setpoint',
    CURRENT: '/api/pressure/current',
  },

  // Session Management
  SESSION: {
    START: '/api/session/start',
    END: '/api/session/end',
    DEPRESSURIZE_CONFIRM: '/api/session/depressurize/confirm',
  },

  // Treatment Modes
  MODES: {
    SET: '/api/modes/set',
    COMPRESSION: '/api/modes/compression',
    OXYGEN: '/api/modes/oxygen',
  },

  // Climate Control
  CLIMATE: {
    AC_MODE: '/api/ac/mode',
    TEMPERATURE: '/api/ac/temperature',
    HEATING_COOLING: '/api/ac/heating-cooling/toggle',
  },

  // Sensors and Monitoring
  SENSORS: {
    READINGS: '/api/sensors/readings',
  },

  // Calibration
  CALIBRATION: {
    PRESSURE: '/api/calibration/pressure',
    OXYGEN: '/api/calibration/oxygen',
  },

  // Manual Control
  MANUAL: {
    TOGGLE: '/api/manual/toggle',
    CONTROLS: '/api/manual/controls',
  },

  // System Status
  SYSTEM: {
    STATUS: '/api/status/system',
  },
};

// WebSocket Endpoints
export const WS_ENDPOINTS = {
  SYSTEM_STATUS: '/ws/system-status',
  CRITICAL_STATUS: '/ws/critical-status',
  PRESSURE: '/ws/pressure',
  SENSORS: '/ws/sensors',
  LIVE_DATA: '/ws/live-data', // Legacy endpoint
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface WebSocketMessage<T = any> {
  timestamp: string;
  type?: string;
  data: T;
  error?: string;
}

// PLC Status Types
export interface PLCStatus {
  timestamp: string;
  
  auth: {
    show_password_screen: boolean;
    proceed_status: boolean;
    change_password_status: boolean;
    admin_password: number;
    user_password: number;
  };
  
  language: {
    current_language: number;
  };
  
  control_panel: {
    ac_state: boolean;
    system_shutdown: boolean;
    ceiling_lights_state: boolean;
    reading_lights_state: boolean;
    door_lights_state: boolean;
    intercom_state: boolean;
  };
  
  pressure: {
    setpoint: number;
    internal_pressure_1: number;
    internal_pressure_2: number;
  };
  
  session: {
    // Mutually exclusive session states
    equalise_state: boolean;
    pressuring_state: boolean;
    stabilising_state: boolean;
    depressurise_state: boolean;
    
    // Session control flags
    running_state: boolean;  // True when session is active (pressuring/stabilising/depressurising)
    stop_state: boolean;     // True only when depressurisation is completed
    
    // Session flags
    session_ended: boolean;
    depressurise_confirm: boolean;
  };
  
  modes: {
    // Operating modes (mutually exclusive)
    mode_rest: boolean;
    mode_health: boolean;
    mode_professional: boolean;
    mode_custom: boolean;
    mode_o2_100: boolean;
    mode_o2_120: boolean;
    custom_duration: number;
    
    // Compression modes (mutually exclusive)
    compression_beginner: boolean;
    compression_normal: boolean;
    compression_fast: boolean;
    
    // Oxygen delivery modes (mutually exclusive)
    continuous_o2_flag: boolean;
    intermittent_o2_flag: boolean;
  };
  
  climate: {
    ac_mode: number;
    temperature_setpoint: number;
    heating_cooling_mode: boolean;
  };
  
  sensors: {
    current_temperature: number;
    current_humidity: number;
    ambient_o2: number;
    ambient_o2_2: number;
    ambient_o2_check_flag: boolean;
  };
  
  calibration: {
    pressure_sensor_calibration: boolean;
    oxygen_sensor_calibration: boolean;
  };
  
  manual: {
    manual_mode: boolean;
  };
  
  timers: {
    run_time_remaining_sec: number;
    run_time_remaining_min: number;
    session_elapsed_time: number;
  };
  
  system: {
    plc_connected: boolean;
    communication_errors: number;
    last_update: string;
  };
}

// Command Request Types
export interface PressureRequest {
  setpoint: number;
}

export interface TemperatureRequest {
  setpoint: number;
}

export interface ModeRequest {
  mode: string;
  duration?: number;
}

export interface PasswordRequest {
  password?: number;
}

export interface ManualControlRequest {
  control: string;
  value: any;
}

// Export all endpoints as default
export default {
  API_ENDPOINTS,
  WS_ENDPOINTS,
}; 