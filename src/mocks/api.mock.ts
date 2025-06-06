/**
 * Mock API Service
 * 
 * Simulates backend API responses for frontend testing
 */

import type { ApiResponse } from '../config/api-endpoints';
import { plcDataMock } from './plc-data.mock';

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
  networkJitter: true,
};

class MockApiService {
  private config: MockApiConfig = { ...DEFAULT_CONFIG };
  private requestCount = 0;

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

    return this.createResponse(plcDataMock.getCurrentData(), 'System status retrieved');
  }

  // Control commands
  async toggleCeilingLights(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle ceiling lights');
    }

    plcDataMock.toggleControl('ceiling_lights_state');
    
    return this.createResponse(
      { ceiling_lights_state: plcDataMock.getCurrentData().control_panel.ceiling_lights_state },
      'Ceiling lights toggled'
    );
  }

  async toggleReadingLights(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle reading lights');
    }

    plcDataMock.toggleControl('reading_lights_state');
    
    return this.createResponse(
      { reading_lights_state: plcDataMock.getCurrentData().control_panel.reading_lights_state },
      'Reading lights toggled'
    );
  }

  async toggleAC(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle AC');
    }

    plcDataMock.toggleControl('ac_state');
    
    return this.createResponse(
      { ac_state: plcDataMock.getCurrentData().control_panel.ac_state },
      'AC toggled'
    );
  }

  async toggleIntercom(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to toggle intercom');
    }

    plcDataMock.toggleControl('intercom_state');
    
    return this.createResponse(
      { intercom_state: plcDataMock.getCurrentData().control_panel.intercom_state },
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
    
    return this.createResponse(
      { 
        session_ended: true,
        end_time: new Date().toISOString(),
      },
      'Session ended successfully'
    );
  }

  // Pressure control
  async increasePressure(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to increase pressure');
    }

    const currentData = plcDataMock.getCurrentData();
    const newSetpoint = Math.min(6.0, currentData.pressure.setpoint + 0.1);
    plcDataMock.setTargetPressure(newSetpoint);
    
    return this.createResponse(
      { 
        pressure_setpoint: newSetpoint,
        previous_setpoint: currentData.pressure.setpoint,
      },
      'Pressure increased'
    );
  }

  async decreasePressure(): Promise<ApiResponse> {
    await this.delay();
    
    if (this.shouldError()) {
      return this.createErrorResponse('Failed to decrease pressure');
    }

    const currentData = plcDataMock.getCurrentData();
    const newSetpoint = Math.max(1.0, currentData.pressure.setpoint - 0.1);
    plcDataMock.setTargetPressure(newSetpoint);
    
    return this.createResponse(
      { 
        pressure_setpoint: newSetpoint,
        previous_setpoint: currentData.pressure.setpoint,
      },
      'Pressure decreased'
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

    return this.createResponse(
      { 
        authenticated: true,
        role: isAdmin ? 'admin' : 'user',
        session_token: `mock_token_${Date.now()}`,
      },
      'Authentication successful'
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
export const mockApiService = new MockApiService(); 