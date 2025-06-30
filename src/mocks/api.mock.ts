/**
 * Mock API Service for Development and Testing
 * 
 * This service simulates backend API responses and integrates with mock data systems.
 * Used when VITE_MOCK_MODE or VITE_MOCK_API environment variables are enabled.
 */

import type { ApiResponse } from '../config/api-endpoints';
import { plcDataMock } from './plc-data.mock';

// Simple browser-compatible event emitter
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export interface MockApiConfig {
  enabled: boolean;
  responseDelay: {
    min: number;
    max: number;
  };
  errorRate: number; // 0.0 to 1.0
  networkJitter: boolean;
}

const DEFAULT_CONFIG: MockApiConfig = {
  enabled: true,
  responseDelay: { min: 100, max: 500 },
  errorRate: 0.05, // 5% error rate
  networkJitter: false,
};

const MOCK_USER_PASSWORD = '1234';
const MOCK_ADMIN_PASSWORD = '9999';

class MockAPIService extends SimpleEventEmitter {
  private config: MockApiConfig = { ...DEFAULT_CONFIG };
  private requestCount = 0;
  private currentStatus = plcDataMock.getCurrentData();

  configure(config: Partial<MockApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): MockApiConfig {
    return { ...this.config };
  }

  // Simulate network delay
  private async delay(): Promise<void> {
    if (!this.config.networkJitter) return;
    
    const { min, max } = this.config.responseDelay;
    const delay = min + Math.random() * (max - min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Simulate random errors
  private shouldError(): boolean {
    return Math.random() < this.config.errorRate;
  }

  // Create success response
  private createResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  // Create error response
  private createErrorResponse(message: string, code = 500): ApiResponse {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  // Health endpoint
  async getHealth(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Health check failed', 503);
    }

    return this.createResponse({
      status: 'healthy',
      service: 'elixir-backend',
      version: '1.2.3',
      mode: 'mock',
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      requests_served: this.requestCount++,
    }, 'Service is healthy');
  }

  // System status
  async getSystemStatus(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to get system status');
    }

    return this.createResponse(this.currentStatus, 'System status retrieved');
  }

  // Control commands
  async toggleCeilingLights(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle ceiling lights');
    }

    plcDataMock.toggleControl('ceiling_lights_state');
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { ceiling_lights_state: this.currentStatus.control_panel.ceiling_lights_state },
      'Ceiling lights toggled'
    );
  }

  async toggleReadingLights(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle reading lights');
    }

    plcDataMock.toggleControl('reading_lights_state');
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { reading_lights_state: this.currentStatus.control_panel.reading_lights_state },
      'Reading lights toggled'
    );
  }

  async toggleAC(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle AC');
    }

    plcDataMock.toggleControl('ac_state');
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { ac_state: this.currentStatus.control_panel.ac_state },
      'AC toggled'
    );
  }

  async toggleIntercom(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle intercom');
    }

    plcDataMock.toggleControl('intercom_state');
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { intercom_state: this.currentStatus.control_panel.intercom_state },
      'Intercom toggled'
    );
  }

  // Session management
  async startSession(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to start session');
    }

    plcDataMock.startMockSession();
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { 
        session_started: true,
        session_id: `mock_${Date.now()}`,
        start_time: new Date().toISOString(),
      },
      'Session started successfully'
    );
  }

  async endSession(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to end session');
    }

    plcDataMock.stopMockSession();
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { 
        session_ended: true,
        end_time: new Date().toISOString(),
      },
      'Session ended successfully'
    );
  }

  // Pressure control - PLC button simulation
  async increasePressure(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to increase pressure');
    }

    const currentData = plcDataMock.getCurrentData();
    const previousSetpoint = currentData.pressure.setpoint;
    
    // Simulate PLC pressure_add_button command
    plcDataMock.pressurePlusButton();
    
    const newData = plcDataMock.getCurrentData();
    const newSetpoint = newData.pressure.setpoint;
    
    this.currentStatus = newData;
    
    return this.createResponse(
      { 
        pressure_setpoint: newSetpoint,
        previous_setpoint: previousSetpoint,
        increment: newSetpoint - previousSetpoint,
      },
      'Pressure add button pressed'
    );
  }

  async decreasePressure(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to decrease pressure');
    }

    const currentData = plcDataMock.getCurrentData();
    const previousSetpoint = currentData.pressure.setpoint;
    
    // Simulate PLC pressure_minus_button command
    plcDataMock.pressureMinusButton();
    
    const newData = plcDataMock.getCurrentData();
    const newSetpoint = newData.pressure.setpoint;
    
    this.currentStatus = newData;
    
    return this.createResponse(
      { 
        pressure_setpoint: newSetpoint,
        previous_setpoint: previousSetpoint,
        decrement: previousSetpoint - newSetpoint,
      },
      'Pressure minus button pressed'
    );
  }

  async setPressureSetpoint(setpoint: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set pressure setpoint');
    }

    if (setpoint < 1.0 || setpoint > 6.0) {
      return this.createErrorResponse('Invalid pressure setpoint. Must be between 1.0 and 6.0 ATA', 400);
    }

    const currentData = plcDataMock.getCurrentData();
    plcDataMock.setTargetPressure(setpoint);
    
    this.currentStatus = plcDataMock.getCurrentData();
    
    return this.createResponse(
      { 
        pressure_setpoint: setpoint,
        previous_setpoint: currentData.pressure.setpoint,
      },
      `Pressure setpoint set to ${setpoint} ATA`
    );
  }

  // Authentication (mock)
  async authenticate(password: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Authentication failed');
    }

    const currentData = plcDataMock.getCurrentData();
    const isAdmin = password === currentData.auth.admin_password;
    const isUser = password === currentData.auth.user_password;
    
    if (!isAdmin && !isUser) {
      return this.createErrorResponse('Invalid password', 401);
    }

    this.currentStatus = currentData;
    
    return this.createResponse(
      { 
        authenticated: true,
        role: isAdmin ? 'admin' : 'user',
        session_token: `mock_token_${Date.now()}`,
      },
      'Authentication successful'
    );
  }

  // Validate password against both user and admin passwords
  async validatePassword(password: string): Promise<boolean> {
    console.log('MockAPIService: Validating password:', password);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const isUserPassword = password === MOCK_USER_PASSWORD;
    const isAdminPassword = password === MOCK_ADMIN_PASSWORD;
    
    if (isUserPassword || isAdminPassword) {
      // Set PLC status bits based on access level
      this.currentStatus.auth.proceed_status = true;
      this.currentStatus.auth.change_password_status = isAdminPassword; // Only admin can change password
      
      console.log('MockAPIService: PIN validation successful', {
        isAdmin: isAdminPassword,
        proceed_status: this.currentStatus.auth.proceed_status,
        change_password_status: this.currentStatus.auth.change_password_status
      });
    } else {
      // Invalid password - clear both status bits
      this.currentStatus.auth.proceed_status = false;
      this.currentStatus.auth.change_password_status = false;
      
      console.log('MockAPIService: PIN validation failed');
    }
    
    // Emit status update to notify frontend
    this.emit('status-update', { ...this.currentStatus });
    
    return isUserPassword || isAdminPassword;
  }

  // Process proceed action (called after validation)
  async proceedWithPassword(password: string): Promise<boolean> {
    console.log('MockAPIService: Processing proceed with password');
    
    // Only proceed if password was previously validated (proceed_status is true)
    if (!this.currentStatus.auth.proceed_status) {
      throw new Error('Password not validated');
    }
    
    // Simulate the PLC proceed action
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Reset auth status after successful proceed
    this.currentStatus.auth.proceed_status = false;
    this.currentStatus.auth.change_password_status = false;
    this.currentStatus.auth.show_password = false;
    
    console.log('MockAPIService: Proceed successful, clearing auth status');
    this.emit('status-update', { ...this.currentStatus });
    
    return true;
  }

  // Clear password validation status
  async invalidatePassword(): Promise<void> {
    console.log('MockAPIService: Invalidating password status');
    
    this.currentStatus.auth.proceed_status = false;
    this.currentStatus.auth.change_password_status = false;
    
    // Emit status update
    this.emit('status-update', { ...this.currentStatus });
  }

  // Cancel password request (activates back_password bit)
  async cancelPasswordRequest(): Promise<ApiResponse> {
    console.log('MockAPIService: Cancelling password request (back_password activated)');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Reset all auth-related status
    this.currentStatus.auth.show_password = false;
    this.currentStatus.auth.proceed_status = false;
    this.currentStatus.auth.change_password_status = false;
    
    console.log('MockAPIService: Password request cancelled, all auth status cleared');
    this.emit('status-update', { ...this.currentStatus });
    
    return this.createResponse(
      { back_password: true },
      'Password request cancelled'
    );
  }

  // Method for when proceed button is actually pressed
  async confirmPasswordProceed(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to confirm password proceed');
    }

    plcDataMock.confirmPasswordProceed();
    
    return this.createResponse(
      { 
        proceed_confirmed: true,
        show_password: false,
      },
      'Password proceed confirmed'
    );
  }



  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to change password');
    }

    plcDataMock.changePassword(oldPassword, newPassword);
    
    const currentData = plcDataMock.getCurrentData();
    if (currentData.auth.change_password_status) {
      return this.createResponse(
        { 
          change_password_status: true,
          message: 'Password changed successfully',
        },
        'Password changed successfully'
      );
    } else {
      return this.createErrorResponse('Invalid current password', 401);
    }
  }

  // Method to invalidate password status
  async invalidatePasswordStatus(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to invalidate password status');
    }

    plcDataMock.invalidatePasswordStatus();
    
    return this.createResponse(
      { 
        proceed_status: false,
        message: 'Password status invalidated',
      },
      'Password status cleared'
    );
  }

  // Mock method to trigger password request (for testing)
  async triggerPasswordRequest(): Promise<ApiResponse> {
    await this.delay();
    
    plcDataMock.triggerPasswordRequest();
    
    return this.createResponse(
      { 
        show_password: true,
        message: 'Password request triggered',
      },
      'Password request initiated'
    );
  }

  // Language switching
  async switchLanguage(language: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to switch language');
    }

    // Mock language switching
    const languages = ['English', 'Spanish', 'French', 'German'];
    const languageName = languages[language - 1] || 'Unknown';
    
    return this.createResponse(
      { 
        current_language: language,
        language_name: languageName,
      },
      `Language switched to ${languageName}`
    );
  }

  // Climate control
  async setTemperature(temperature: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set temperature');
    }

    if (temperature < 16 || temperature > 30) {
      return this.createErrorResponse('Invalid temperature. Must be between 16°C and 30°C', 400);
    }

    return this.createResponse(
      { 
        temperature_setpoint: temperature,
        unit: 'celsius',
      },
      `Temperature setpoint set to ${temperature}°C`
    );
  }

  // Calibration
  async calibratePressureSensor(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Pressure sensor calibration failed');
    }

    // Simulate calibration process
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second calibration
    
    return this.createResponse(
      { 
        calibration_completed: true,
        calibration_time: new Date().toISOString(),
        accuracy: 99.8 + Math.random() * 0.2, // 99.8-100%
      },
      'Pressure sensor calibration completed'
    );
  }

  async calibrateOxygenSensor(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Oxygen sensor calibration failed');
    }

    // Simulate calibration process
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second calibration
    
    return this.createResponse(
      { 
        calibration_completed: true,
        calibration_time: new Date().toISOString(),
        accuracy: 99.5 + Math.random() * 0.5, // 99.5-100%
      },
      'Oxygen sensor calibration completed'
    );
  }

  // Manual mode
  async toggleManualMode(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle manual mode');
    }

    const currentData = plcDataMock.getCurrentData();
    const newManualMode = !currentData.manual.manual_mode;
    
    return this.createResponse(
      { 
        manual_mode: newManualMode,
        previous_mode: currentData.manual.manual_mode,
      },
      `Manual mode ${newManualMode ? 'enabled' : 'disabled'}`
    );
  }

  // Mode Control APIs
  async setOperatingMode(mode: 'rest' | 'health' | 'professional' | 'custom' | 'o2_100' | 'o2_120', duration?: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set operating mode');
    }

    plcDataMock.setOperatingModePublic(mode);
    
    // Set duration if provided
    if (duration) {
      plcDataMock.setCustomDuration(duration);
    }
    
    return this.createResponse(
      { operating_mode: mode, duration: duration || null },
      `Operating mode set to ${mode}${duration ? ` with ${duration} minutes duration` : ''}`
    );
  }

  async setCompressionMode(mode: 'beginner' | 'normal' | 'fast'): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set compression mode');
    }

    plcDataMock.setCompressionModePublic(mode);
    
    return this.createResponse(
      { compression_mode: mode },
      `Compression mode set to ${mode}`
    );
  }

  async setOxygenMode(mode: 'continuous' | 'intermittent'): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set oxygen mode');
    }

    plcDataMock.setOxygenModePublic(mode);
    
    return this.createResponse(
      { oxygen_mode: mode },
      `Oxygen mode set to ${mode}`
    );
  }

  async setCustomDuration(duration: number): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to set custom duration');
    }

    if (duration < 60 || duration > 120) {
      return this.createErrorResponse('Invalid duration. Must be between 60 and 120 minutes', 400);
    }

    plcDataMock.setCustomDuration(duration);
    
    return this.createResponse(
      { custom_duration: duration },
      `Custom duration set to ${duration} minutes`
    );
  }

  // Emergency scenarios (for testing)
  async triggerEmergencyScenario(): Promise<ApiResponse> {
    await this.delay();
    
    plcDataMock.setScenario('emergency');
    
    return this.createResponse(
      { emergency_triggered: true },
      'Emergency scenario triggered'
    );
  }

  async simulateConnectionLoss(): Promise<ApiResponse> {
    await this.delay();
    
    plcDataMock.setScenario('offline');
    
    return this.createResponse(
      { connection_lost: true },
      'Connection loss simulated'
    );
  }

  async restoreConnection(): Promise<ApiResponse> {
    await this.delay();
    
    plcDataMock.setScenario('normal');
    
    return this.createResponse(
      { connection_restored: true },
      'Connection restored'
    );
  }

  // Alarm management
  async triggerAlarm(alarmType: string): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to trigger alarm');
    }

    plcDataMock.triggerAlarm(alarmType, 'warning');
    
    return this.createResponse(
      { 
        alarm_triggered: true,
        alarm_type: alarmType,
        timestamp: new Date().toISOString(),
      },
      `${alarmType} alarm triggered`
    );
  }

  async clearAlarms(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to clear alarms');
    }

    plcDataMock.clearAlarms();
    
    return this.createResponse(
      { alarms_cleared: true },
      'All alarms cleared'
    );
  }

  // Get configuration endpoints
  async getConfiguration(): Promise<ApiResponse> {
    await this.delay();
    
    return this.createResponse({
      mock_mode: true,
      current_scenario: plcDataMock.getCurrentScenario(),
      available_scenarios: plcDataMock.getScenarios(),
      api_config: this.config,
    }, 'Configuration retrieved');
  }

  // Update frequencies and behavior
  async setUpdateFrequency(frequency: number): Promise<ApiResponse> {
    await this.delay();
    
    if (frequency < 100 || frequency > 10000) {
      return this.createErrorResponse('Invalid frequency. Must be between 100ms and 10000ms', 400);
    }

    plcDataMock.setUpdateFrequency(frequency);
    
    return this.createResponse(
      { update_frequency: frequency },
      `Update frequency set to ${frequency}ms`
    );
  }

  // Error injection for testing
  async injectError(duration: number = 5000): Promise<ApiResponse> {
    await this.delay();
    
    const originalErrorRate = this.config.errorRate;
    this.config.errorRate = 1.0; // 100% error rate
    
    setTimeout(() => {
      this.config.errorRate = originalErrorRate;
    }, duration);
    
    return this.createResponse(
      { 
        error_injection_active: true,
        duration,
        original_error_rate: originalErrorRate,
      },
      `Error injection active for ${duration}ms`
    );
  }
}

// Export singleton instance
export const mockApiService = new MockAPIService(); 