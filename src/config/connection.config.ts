/**
 * Connection Configuration for Elixir Frontend
 * 
 * Centralized configuration for backend connection settings only.
 * API endpoints are defined separately in api-endpoints.ts
 */

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) || fallback : fallback;
};

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key];
  return value ? value === 'true' : fallback;
};

// Connection Configuration - Fully environment-driven
export const CONNECTION_CONFIG = {
  // Base URLs - completely from environment variables
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 
    isDevelopment ? 'http://localhost:8000' : 'https://your-production-domain.com'
  ),
  
  WS_BASE_URL: getEnvVar('VITE_WS_BASE_URL', 
    isDevelopment ? 'ws://localhost:8000' : 'wss://your-production-domain.com'
  ),

  // HTTP Configuration
  HTTP: {
    TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 5000),
    RETRY_ATTEMPTS: getEnvNumber('VITE_HTTP_RETRY_ATTEMPTS', 3),
    RETRY_DELAY: getEnvNumber('VITE_HTTP_RETRY_DELAY', 1000),
  },

  // WebSocket Configuration
  WEBSOCKET: {
    RECONNECT_INTERVAL: getEnvNumber('VITE_WS_RECONNECT_INTERVAL', 1000),
    MAX_RECONNECT_ATTEMPTS: getEnvNumber('VITE_WS_MAX_RECONNECT_ATTEMPTS', 5),
    HEARTBEAT_INTERVAL: getEnvNumber('VITE_WS_HEARTBEAT_INTERVAL', 30000),
    CONNECTION_TIMEOUT: getEnvNumber('VITE_WS_CONNECTION_TIMEOUT', 10000),
  },

  // Command Configuration
  COMMANDS: {
    TIMEOUT: getEnvNumber('VITE_COMMAND_TIMEOUT', 3000),
    PLC_CONFIRMATION_TIMEOUT: getEnvNumber('VITE_PLC_CONFIRMATION_TIMEOUT', 3000),
    RATE_LIMIT: {
      MAX_COMMANDS: getEnvNumber('VITE_RATE_LIMIT_MAX_COMMANDS', 5),
      TIME_WINDOW: getEnvNumber('VITE_RATE_LIMIT_TIME_WINDOW', 1000),
    },
  },

  // Development Settings
  DEV: {
    DEBUG: getEnvBoolean('VITE_DEBUG_MODE', isDevelopment),
    MOCK_PLC_DATA: getEnvBoolean('VITE_MOCK_PLC_DATA', false),
    MOCK_WEBSOCKET: getEnvBoolean('VITE_MOCK_WEBSOCKET', false),
    CONSOLE_LOGGING: getEnvBoolean('VITE_CONSOLE_LOGGING', isDevelopment),
  },
};

// Helper functions to build URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = CONNECTION_CONFIG.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const buildWsUrl = (endpoint: string): string => {
  const baseUrl = CONNECTION_CONFIG.WS_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Environment utilities
export const ENV = {
  isDevelopment,
  isProduction,
  mode: import.meta.env.MODE,
} as const;

// Connection status type
export interface ConnectionStatus {
  api: boolean;
  websocket: boolean;
  plc: boolean;
  lastCheck: Date;
}

// Export default
export default CONNECTION_CONFIG; 