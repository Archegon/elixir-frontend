/**
 * API Service for Elixir Frontend
 * 
 * Enhanced service with automatic backend discovery and WebSocket communication.
 * Implements WebSocket + HTTP communication pattern with optimistic updates.
 */

import { CONNECTION_CONFIG, buildApiUrl, buildWsUrl, buildApiUrlSync, buildWsUrlSync, discoverBackend, resetDiscovery } from '../config/connection.config';
import { API_ENDPOINTS, WS_ENDPOINTS, type ApiResponse, type PLCStatus } from '../config/api-endpoints';

class ApiService {
  private ws: WebSocket | null = null;
  private wsStatus: PLCStatus | null = null;
  private optimisticStates: Record<string, any> = {};
  private pendingCommands = new Set<string>();
  private reconnectAttempts = 0;
  private eventListeners: Record<string, Function[]> = {};
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize with discovery
    this.initializeWithDiscovery();
  }

  // ===============================================
  // Initialization with Backend Discovery
  // ===============================================

  private async initializeWithDiscovery() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization() {
    try {
      // Discover backend before initializing WebSocket
      const { apiUrl, wsUrl } = await discoverBackend();
      
      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log(`🎯 Backend discovered - API: ${apiUrl}, WS: ${wsUrl}`);
      }
      
      this.emit('discovery-complete', { apiUrl, wsUrl });
      
      // Initialize WebSocket with discovered URL
      await this.initializeWebSocket();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize with backend discovery:', error);
      this.emit('initialization-failed', { error });
      
      // Fallback to basic initialization
      await this.initializeWebSocket();
      this.isInitialized = true;
    }
  }

  // ===============================================
  // WebSocket Management
  // ===============================================

  private async initializeWebSocket() {
    try {
      const wsUrl = await buildWsUrl(WS_ENDPOINTS.SYSTEM_STATUS);
      
      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
          console.log('✅ WebSocket connected');
        }
        this.reconnectAttempts = 0;
        this.emit('connected', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: PLCStatus = JSON.parse(event.data);
          this.wsStatus = data;
          this.emit('status-update', data);
          this.updateControls();
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
          console.warn('🔌 WebSocket disconnected');
        }
        this.emit('disconnected', { connected: false });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', { error: 'WebSocket connection failed' });
      };

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      this.emit('error', { error: 'Failed to connect to backend' });
    }
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts < CONNECTION_CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      
      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${CONNECTION_CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS}`);
      }
      
      setTimeout(async () => {
        // On every few reconnection attempts, retry discovery
        if (this.reconnectAttempts % 3 === 0) {
          if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
            console.log('🔄 Retrying backend discovery...');
          }
          resetDiscovery();
        }
        
        await this.initializeWebSocket();
      }, CONNECTION_CONFIG.WEBSOCKET.RECONNECT_INTERVAL);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max-reconnects-reached', { attempts: this.reconnectAttempts });
    }
  }

  // ===============================================
  // HTTP API Methods
  // ===============================================

  private async makeRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Ensure initialization is complete
    if (!this.isInitialized) {
      await this.initializeWithDiscovery();
    }

    try {
      const url = await buildApiUrl(endpoint);
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_CONFIG.HTTP.TIMEOUT);

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      // Fallback to synchronous URL building
      const url = buildApiUrlSync(endpoint);
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_CONFIG.HTTP.TIMEOUT);

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (fallbackError) {
        clearTimeout(timeoutId);
        throw fallbackError;
      }
    }
  }

  // ===============================================
  // Public API Methods
  // ===============================================

  async waitForInitialization(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeWithDiscovery();
    }
  }

  async reconnectWithDiscovery(): Promise<void> {
    if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
      console.log('🔄 Manual reconnection with discovery...');
    }
    
    resetDiscovery();
    this.isInitialized = false;
    this.initializationPromise = null;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    await this.initializeWithDiscovery();
  }

  // ===============================================
  // Command Execution with Optimistic Updates
  // ===============================================

  async executeCommand(endpoint: string, controlName: string, expectedData?: any): Promise<ApiResponse> {
    const commandId = `${controlName}_${Date.now()}`;
    this.pendingCommands.add(commandId);

    try {
      // 1. Optimistic update
      if (expectedData !== undefined) {
        this.optimisticStates[controlName] = expectedData;
        this.updateControls();
        this.emit('optimistic-update', { control: controlName, state: expectedData });
      }

      // 2. Send HTTP command
      const response = await this.makeRequest(endpoint, { method: 'POST' });

      if (!response.success) {
        throw new Error(response.message || 'Command failed');
      }

      // 3. Update optimistic state with server response
      if (response.data && response.data[controlName] !== undefined) {
        this.optimisticStates[controlName] = response.data[controlName];
        this.updateControls();
      }

      // 4. Wait for PLC confirmation
      await this.waitForPLCConfirmation(controlName, this.optimisticStates[controlName]);

      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log(`✅ Command successful: ${controlName}`);
      }
      this.emit('command-success', { control: controlName, response });

      return response;

    } catch (error) {
      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.error(`❌ Command failed: ${controlName}`, error);
      }

      // Revert optimistic state
      delete this.optimisticStates[controlName];
      this.updateControls();

      this.emit('command-error', { 
        control: controlName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      throw error;

    } finally {
      this.pendingCommands.delete(commandId);
      this.updateControls();
    }
  }

  private async waitForPLCConfirmation(
    controlName: string, 
    expectedState: any,
    timeout = CONNECTION_CONFIG.COMMANDS.PLC_CONFIRMATION_TIMEOUT
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkConfirmation = () => {
        const actualState = this.getCurrentState(controlName);

        if (actualState === expectedState) {
          delete this.optimisticStates[controlName];
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`PLC confirmation timeout for ${controlName}`));
        } else {
          setTimeout(checkConfirmation, 100);
        }
      };

      checkConfirmation();
    });
  }

  // ===============================================
  // State Management
  // ===============================================

  getCurrentState(controlName: string): any {
    // Use optimistic state if available
    if (this.optimisticStates[controlName] !== undefined) {
      return this.optimisticStates[controlName];
    }

    // Map control names to WebSocket data paths
    const stateMap: Record<string, string> = {
      ceiling_lights: 'control_panel.ceiling_lights_state',
      reading_lights: 'control_panel.reading_lights_state',
      ac: 'control_panel.ac_state',
      intercom: 'control_panel.intercom_state',
      pressure_setpoint: 'pressure.setpoint',
      session_running: 'session.running_state',
    };

    const path = stateMap[controlName];
    if (path && this.wsStatus) {
      return this.getNestedValue(this.wsStatus, path);
    }

    return null;
  }

  isPending(controlName: string): boolean {
    return Array.from(this.pendingCommands).some(cmd => cmd.includes(controlName));
  }

  getSystemStatus(): PLCStatus | null {
    return this.wsStatus;
  }

  getConnectionStatus(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private updateControls() {
    this.emit('controls-update', {
      wsStatus: this.wsStatus,
      optimisticStates: this.optimisticStates,
      pendingCommands: Array.from(this.pendingCommands),
    });
  }

  // ===============================================
  // Specific API Methods
  // ===============================================

  // Control Panel Commands
  async toggleCeilingLights(): Promise<ApiResponse> {
    const currentState = this.getCurrentState('ceiling_lights');
    return this.executeCommand(API_ENDPOINTS.CONTROL.CEILING_LIGHTS, 'ceiling_lights', !currentState);
  }

  async toggleReadingLights(): Promise<ApiResponse> {
    const currentState = this.getCurrentState('reading_lights');
    return this.executeCommand(API_ENDPOINTS.CONTROL.READING_LIGHTS, 'reading_lights', !currentState);
  }

  async toggleDoorLights(): Promise<ApiResponse> {
    const currentState = this.getCurrentState('door_lights');
    return this.executeCommand(API_ENDPOINTS.CONTROL.DOOR_LIGHTS, 'door_lights', !currentState);
  }

  async toggleAC(): Promise<ApiResponse> {
    const currentState = this.getCurrentState('ac');
    return this.executeCommand(API_ENDPOINTS.CONTROL.AC_TOGGLE, 'ac', !currentState);
  }

  async toggleIntercom(): Promise<ApiResponse> {
    const currentState = this.getCurrentState('intercom');
    return this.executeCommand(API_ENDPOINTS.CONTROL.INTERCOM, 'intercom', !currentState);
  }

  // Session Management
  async startSession(): Promise<ApiResponse> {
    return this.executeCommand(API_ENDPOINTS.SESSION.START, 'session_running', true);
  }

  async endSession(): Promise<ApiResponse> {
    return this.executeCommand(API_ENDPOINTS.SESSION.END, 'session_running', false);
  }

  // Pressure Control with Optimistic Updates
  async increasePressure(): Promise<ApiResponse> {
    const currentPressure = this.getCurrentState('pressure_setpoint') || 1.0;
    const newPressure = this.calculateIncrementedPressure(currentPressure);
    return this.executeCommand(API_ENDPOINTS.PRESSURE.ADD, 'pressure_setpoint', newPressure);
  }

  async decreasePressure(): Promise<ApiResponse> {
    const currentPressure = this.getCurrentState('pressure_setpoint') || 1.0;
    const newPressure = this.calculateDecrementedPressure(currentPressure);
    return this.executeCommand(API_ENDPOINTS.PRESSURE.SUBTRACT, 'pressure_setpoint', newPressure);
  }

  private calculateIncrementedPressure(currentPressure: number): number {
    // Special case: increment by 0.09 from 1.9 to reach 1.99
    if (currentPressure >= 1.9 && currentPressure < 1.99) {
      return Math.min(1.99, currentPressure + 0.09);
    }
    // Normal case: increment by 0.1
    return Math.min(6.0, currentPressure + 0.1);
  }

  private calculateDecrementedPressure(currentPressure: number): number {
    // Special case: decrement by 0.09 from 1.99 to reach 1.9
    if (currentPressure === 1.99) {
      return 1.9;
    }
    // Normal case: decrement by 0.1
    return Math.max(1.0, currentPressure - 0.1);
  }

  async setPressureSetpoint(setpoint: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.PRESSURE.SETPOINT, {
      method: 'POST',
      body: JSON.stringify({ setpoint })
    });
  }

  // Mode Control APIs
  async setOperatingMode(mode: 'rest' | 'health' | 'professional' | 'custom' | 'o2_100' | 'o2_120', duration?: number): Promise<ApiResponse> {
    await this.waitForInitialization();
    const payload: { mode: string; duration?: number } = { mode };
    if (duration) {
      payload.duration = duration;
    }
    return this.makeRequest(API_ENDPOINTS.MODES.SET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async setCompressionMode(mode: 'beginner' | 'normal' | 'fast'): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(`${API_ENDPOINTS.MODES.COMPRESSION}?mode=${mode}`, {
      method: 'POST'
    });
  }

  async setOxygenMode(mode: 'continuous' | 'intermittent'): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(`${API_ENDPOINTS.MODES.OXYGEN}?mode=${mode}`, {
      method: 'POST'
    });
  }

  async setDuration(duration: number): Promise<ApiResponse> {
    // Use the modes endpoint to set duration while preserving the current mode
    // This writes to the set_duration PLC address without changing the operating mode
    await this.waitForInitialization();
    
    // Get current mode from system status to preserve it
    const currentStatus = this.getSystemStatus();
    let currentMode = 'professional'; // default fallback
    
    if (currentStatus?.modes) {
      const modes = currentStatus.modes;
      if (modes.mode_rest) currentMode = 'rest';
      else if (modes.mode_health) currentMode = 'health';
      else if (modes.mode_professional) currentMode = 'professional';
      else if (modes.mode_custom) currentMode = 'custom';
      else if (modes.mode_o2_100) currentMode = 'o2_100';
      else if (modes.mode_o2_120) currentMode = 'o2_120';
    }
    
    const payload = { mode: currentMode, duration };
    return this.makeRequest(API_ENDPOINTS.MODES.SET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async setCustomDuration(duration: number): Promise<ApiResponse> {
    // Legacy method - now uses the direct setDuration method
    return this.setDuration(duration);
  }

  // Climate Control Methods
  async setACFanMode(mode: 'auto' | 'low' | 'mid' | 'high'): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(`${API_ENDPOINTS.CLIMATE.AC_MODE}?mode=${mode}`, {
      method: 'POST'
    });
  }

  async setTemperatureSetpoint(temperature: number): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.CLIMATE.TEMPERATURE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setpoint: temperature })
    });
  }

  async toggleHeatingCooling(): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.CLIMATE.HEATING_COOLING, {
      method: 'POST'
    });
  }

  // Password Authentication Methods
  async validatePassword(password: string): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.AUTH.STATUS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  }

  async invalidatePassword(): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.AUTH.STATUS, {
      method: 'DELETE'
    });
  }

  async proceedWithPassword(password: string): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.AUTH.PROCEED, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  }

  async cancelPasswordRequest(): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.AUTH.BACK, {
      method: 'POST'
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    await this.waitForInitialization();
    return this.makeRequest(API_ENDPOINTS.AUTH.INPUT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
  }

  // Status Methods
  async getHealth(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.HEALTH);
  }

  // ===============================================
  // Event System
  // ===============================================

  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ===============================================
  // Cleanup
  // ===============================================

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventListeners = {};
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService; 