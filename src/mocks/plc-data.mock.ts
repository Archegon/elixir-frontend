/**
 * Mock PLC Data Generator
 * 
 * Generates realistic hyperbaric chamber data for frontend testing
 */

import type { PLCStatus } from '../config/api-endpoints';

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  duration?: number; // Auto-advance after duration (ms)
  nextScenario?: string;
}

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
  normal: {
    id: 'normal',
    name: 'Normal Operation',
    description: 'Chamber operating normally with gradual pressure changes',
  },
  pressurizing: {
    id: 'pressurizing',
    name: 'Pressurizing',
    description: 'Chamber pressurizing to treatment level',
    duration: 30000, // 30 seconds
    nextScenario: 'treatment',
  },
  treatment: {
    id: 'treatment',
    name: 'Treatment Session',
    description: 'Patient treatment in progress at target pressure',
  },
  depressurizing: {
    id: 'depressurizing',
    name: 'Depressurizing',
    description: 'Safely reducing chamber pressure',
    duration: 45000, // 45 seconds
    nextScenario: 'normal',
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Decompression',
    description: 'Emergency rapid decompression scenario',
    duration: 10000, // 10 seconds
    nextScenario: 'normal',
  },
  maintenance: {
    id: 'maintenance',
    name: 'Maintenance Mode',
    description: 'System in maintenance mode - limited functionality',
  },
  offline: {
    id: 'offline',
    name: 'PLC Offline',
    description: 'PLC communication lost',
  },
  startup: {
    id: 'startup',
    name: 'System Startup',
    description: 'System initializing and running self-tests',
    duration: 15000, // 15 seconds
    nextScenario: 'normal',
  },
};

export class PLCDataMock {
  private currentScenario: string = 'normal';
  private startTime: number = Date.now();
  private scenarioStartTime: number = Date.now();
  private baseData: PLCStatus;
  private listeners: Array<(data: PLCStatus) => void> = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private updateFrequency: number = 1000; // 1 second default

  constructor() {
    this.baseData = this.createBaseData();
    this.startUpdates();
  }

  private createBaseData(): PLCStatus {
    return {
      timestamp: new Date().toISOString(),
      
      auth: {
        proceed_status: false,
        change_password_status: false,
        admin_password: 1234,
        user_password: 5678,
      },
      
      language: {
        current_language: 1, // English
      },
      
      control_panel: {
        ac_state: false,
        system_shutdown: false,
        ceiling_lights_state: false,
        reading_lights_state: false,
        intercom_state: false,
      },
      
      pressure: {
        setpoint: 1.0, // ATA
        internal_pressure_1: 1.0,
        internal_pressure_2: 1.0,
      },
      
      session: {
        // Mutually exclusive session states - equalise state active by default
        equalise_state: true,
        pressuring_state: false,
        stabilising_state: false,
        depressurise_state: false,
        
        // Session control flags
        running_state: false, // True when session is active (pressuring/stabilising/depressurising)
        stop_state: false,    // True only when depressurisation is completed
        
        // Session flags
        session_ended: false,
        depressurise_confirm: false,
      },
      
      modes: {
        // Operating modes (mutually exclusive) - Health mode active by default
        mode_rest: false,
        mode_health: true,
        mode_professional: false,
        mode_custom: false,
        mode_o2_100: false,
        mode_o2_120: false,
        custom_duration: 60, // minutes
        
        // Compression modes (mutually exclusive) - Normal active by default
        compression_beginner: false,
        compression_normal: true,
        compression_fast: false,
        
        // Oxygen delivery modes (mutually exclusive) - Continuous active by default
        continuous_o2_flag: true,
        intermittent_o2_flag: false,
      },
      
      climate: {
        ac_mode: 1,
        temperature_setpoint: 22.0, // °C
        heating_cooling_mode: false,
      },
      
      sensors: {
        current_temperature: 22.5,
        current_humidity: 45.0,
        ambient_o2: 21.0, // %
        ambient_o2_2: 21.0, // %
        ambient_o2_check_flag: true,
      },
      
      calibration: {
        pressure_sensor_calibration: false,
        oxygen_sensor_calibration: false,
      },
      
      manual: {
        manual_mode: false,
      },
      
      timers: {
        run_time_remaining_sec: 0,
        run_time_remaining_min: 0,
        session_elapsed_time: 0,
      },
      
      system: {
        plc_connected: true,
        communication_errors: 0,
        last_update: new Date().toISOString(),
      },
    };
  }

  // Subscribe to data updates
  subscribe(callback: (data: PLCStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Set current scenario
  setScenario(scenarioId: string): void {
    if (MOCK_SCENARIOS[scenarioId]) {
      this.currentScenario = scenarioId;
      this.scenarioStartTime = Date.now();
      console.log(`🎭 Mock scenario changed to: ${MOCK_SCENARIOS[scenarioId].name}`);
      this.notifyListeners();
    }
  }

  // Set update frequency
  setUpdateFrequency(ms: number): void {
    this.updateFrequency = Math.max(100, ms); // Minimum 100ms
    this.restartUpdates();
  }

  // Get current scenario
  getCurrentScenario(): MockScenario {
    return MOCK_SCENARIOS[this.currentScenario];
  }

  // Get available scenarios
  getScenarios(): MockScenario[] {
    return Object.values(MOCK_SCENARIOS);
  }

  // Start automatic updates
  private startUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateData();
      this.checkScenarioTransition();
      this.notifyListeners();
    }, this.updateFrequency);
  }

  private restartUpdates(): void {
    this.startUpdates();
  }

  // Update data based on current scenario
  private updateData(): void {
    const scenario = MOCK_SCENARIOS[this.currentScenario];
    const elapsed = Date.now() - this.scenarioStartTime;
    const totalElapsed = Date.now() - this.startTime;

    // Update timestamp
    this.baseData.timestamp = new Date().toISOString();
    this.baseData.system.last_update = new Date().toISOString();

    // Apply scenario-specific updates
    switch (scenario.id) {
      case 'normal':
        this.updateNormalOperation(elapsed);
        break;
      case 'pressurizing':
        this.updatePressurizing(elapsed);
        break;
      case 'treatment':
        this.updateTreatment(elapsed);
        break;
      case 'depressurizing':
        this.updateDepressurizing(elapsed);
        break;
      case 'emergency':
        this.updateEmergency(elapsed);
        break;
      case 'maintenance':
        this.updateMaintenance(elapsed);
        break;
      case 'offline':
        this.updateOffline();
        break;
      case 'startup':
        this.updateStartup(elapsed);
        break;
    }

    // Add random variations to make it realistic
    this.addRealisticVariations();
    
    // Update system metrics
    this.updateSystemMetrics(totalElapsed);
  }

  private updateNormalOperation(elapsed: number): void {
    this.baseData.system.plc_connected = true;
    this.setSessionState('equalise'); // Idle state
    
    // Slight pressure fluctuation
    this.baseData.pressure.internal_pressure_1 = 1.0 + (Math.sin(elapsed / 10000) * 0.02);
    this.baseData.pressure.internal_pressure_2 = this.baseData.pressure.internal_pressure_1 + (Math.random() - 0.5) * 0.01;
    this.baseData.pressure.setpoint = 1.0;
    
    // Reset to health mode when idle
    this.setOperatingMode('health');
    this.setCompressionMode('normal');
    this.setOxygenMode('continuous');
    
    this.baseData.timers.run_time_remaining_sec = 0;
    this.baseData.timers.run_time_remaining_min = 0;
    this.baseData.timers.session_elapsed_time = 0;
  }

  private updatePressurizing(elapsed: number): void {
    const progress = Math.min(elapsed / 30000, 1); // 30 second pressurization
    const targetPressure = 1.99; // Changed from 2.5 to 1.99 ATA
    
    this.setSessionState('pressuring');
    
    this.baseData.pressure.internal_pressure_1 = 1.0 + (progress * (targetPressure - 1.0));
    this.baseData.pressure.internal_pressure_2 = this.baseData.pressure.internal_pressure_1 + (Math.random() - 0.5) * 0.02;
    this.baseData.pressure.setpoint = targetPressure;
    
    // Set professional mode during pressurization
    this.setOperatingMode('professional');
    this.setCompressionMode('normal');
    this.setOxygenMode('continuous');
    
    this.baseData.timers.session_elapsed_time = Math.floor(elapsed / 1000);
    this.baseData.timers.run_time_remaining_min = Math.max(0, 60 - Math.floor(elapsed / 60000));
    
    this.baseData.control_panel.ceiling_lights_state = true;
  }

  private updateTreatment(elapsed: number): void {
    this.setSessionState('stabilising');
    
    // Stable pressure with small fluctuations
    this.baseData.pressure.internal_pressure_1 = 1.99 + (Math.sin(elapsed / 5000) * 0.02);
    this.baseData.pressure.internal_pressure_2 = this.baseData.pressure.internal_pressure_1 + (Math.random() - 0.5) * 0.01;
    this.baseData.pressure.setpoint = 1.99;
    
    // Maintain professional mode during treatment with high oxygen
    this.setOperatingMode('professional');
    this.setCompressionMode('normal');
    this.setOxygenMode('continuous');
    
    // High oxygen during treatment
    this.baseData.sensors.ambient_o2 = 95.0 + (Math.random() * 4);
    this.baseData.sensors.ambient_o2_2 = this.baseData.sensors.ambient_o2 + (Math.random() - 0.5) * 2;
    
    this.baseData.timers.session_elapsed_time = Math.floor((Date.now() - this.startTime) / 1000);
    this.baseData.timers.run_time_remaining_min = Math.max(0, 45 - Math.floor(elapsed / 60000));
    
    this.baseData.control_panel.ceiling_lights_state = true;
    this.baseData.control_panel.ac_state = true;
  }

  private updateDepressurizing(elapsed: number): void {
    const progress = Math.min(elapsed / 45000, 1); // 45 second decompression
    
    // During depressurisation
    if (progress < 1) {
      this.setSessionState('depressurise');
    } else {
      // Depressurisation completed - set stop state
      this.setSessionState('stop');
      this.baseData.session.session_ended = true;
    }
    
    this.baseData.pressure.internal_pressure_1 = 1.99 - (progress * 0.99); // Changed from 2.5 to 1.99, pressure drop from 0.99 ATA
    this.baseData.pressure.internal_pressure_2 = this.baseData.pressure.internal_pressure_1 + (Math.random() - 0.5) * 0.02;
    this.baseData.pressure.setpoint = 1.0;
    
    this.baseData.timers.session_elapsed_time = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Gradually return oxygen to normal
    this.baseData.sensors.ambient_o2 = Math.max(21, 95 - (progress * 74));
    this.baseData.sensors.ambient_o2_2 = this.baseData.sensors.ambient_o2 + (Math.random() - 0.5) * 2;
  }

  private updateEmergency(elapsed: number): void {
    const progress = Math.min(elapsed / 10000, 1); // 10 second emergency decompression
    
    this.setSessionState('depressurise');
    this.baseData.session.depressurise_confirm = true;
    
    this.baseData.pressure.internal_pressure_1 = Math.max(1.0, 1.99 - (progress * 0.99)); // Changed from 2.5 to 1.99
    this.baseData.pressure.internal_pressure_2 = this.baseData.pressure.internal_pressure_1 + (Math.random() - 0.5) * 0.05;
    this.baseData.pressure.setpoint = 1.0;
    
    // Flash lights during emergency
    this.baseData.control_panel.ceiling_lights_state = Math.sin(elapsed / 200) > 0;
    this.baseData.control_panel.reading_lights_state = Math.sin(elapsed / 200) > 0;
    
    this.baseData.system.communication_errors += Math.random() < 0.1 ? 1 : 0;
  }

  private updateMaintenance(elapsed: number): void {
    this.baseData.system.plc_connected = true;
    this.setSessionState('stop'); // Maintenance uses stop state
    this.baseData.manual.manual_mode = true;
    this.baseData.pressure.setpoint = 1.0;
    this.baseData.pressure.internal_pressure_1 = 1.0;
    this.baseData.pressure.internal_pressure_2 = 1.0;
    
    // All controls off during maintenance
    this.baseData.control_panel = {
      ac_state: false,
      system_shutdown: false,
      ceiling_lights_state: false,
      reading_lights_state: false,
      intercom_state: false,
    };
  }

  private updateOffline(): void {
    this.baseData.system.plc_connected = false;
    this.baseData.system.communication_errors += 1;
    // Keep last known data but mark as disconnected
  }

  private updateStartup(elapsed: number): void {
    const progress = elapsed / 15000; // 15 second startup
    this.baseData.system.plc_connected = true;
    
    // Simulate system initialization
    if (progress < 0.3) {
      this.baseData.calibration.pressure_sensor_calibration = true;
    } else if (progress < 0.7) {
      this.baseData.calibration.pressure_sensor_calibration = false;
      this.baseData.calibration.oxygen_sensor_calibration = true;
    } else {
      this.baseData.calibration.oxygen_sensor_calibration = false;
    }
    
    // Flash lights during startup
    this.baseData.control_panel.ceiling_lights_state = Math.sin(elapsed / 500) > 0;
  }

  private addRealisticVariations(): void {
    // Add small random variations to sensor readings
    this.baseData.sensors.current_temperature += (Math.random() - 0.5) * 0.2;
    this.baseData.sensors.current_humidity += (Math.random() - 0.5) * 2;
    
    // Keep values in realistic ranges
    this.baseData.sensors.current_temperature = Math.max(18, Math.min(28, this.baseData.sensors.current_temperature));
    this.baseData.sensors.current_humidity = Math.max(20, Math.min(80, this.baseData.sensors.current_humidity));
    
    // Update temperature setpoint if AC is on
    if (this.baseData.control_panel.ac_state) {
      const targetTemp = this.baseData.climate.temperature_setpoint;
      const currentTemp = this.baseData.sensors.current_temperature;
      const diff = targetTemp - currentTemp;
      this.baseData.sensors.current_temperature += diff * 0.1; // Slowly approach target
    }
  }

  private updateSystemMetrics(totalElapsed: number): void {
    // Update communication quality
    if (this.baseData.system.plc_connected && Math.random() < 0.05) {
      this.baseData.system.communication_errors = Math.max(0, this.baseData.system.communication_errors - 1);
    }
  }

  private checkScenarioTransition(): void {
    const scenario = MOCK_SCENARIOS[this.currentScenario];
    if (scenario.duration && scenario.nextScenario) {
      const elapsed = Date.now() - this.scenarioStartTime;
      if (elapsed >= scenario.duration) {
        this.setScenario(scenario.nextScenario);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback({ ...this.baseData }); // Send copy to prevent mutations
      } catch (error) {
        console.error('Error in mock data listener:', error);
      }
    });
  }

  // Manually trigger specific events
  triggerAlarm(alarmId: string, level: 'warning' | 'critical' = 'warning'): void {
    // Simulate alarm by setting relevant flags
    switch (alarmId) {
      case 'pressure_high':
        this.baseData.pressure.internal_pressure_1 = 6.0;
        break;
      case 'pressure_low':
        this.baseData.pressure.internal_pressure_1 = 0.5;
        break;
      case 'oxygen_low':
        this.baseData.sensors.ambient_o2 = 15.0;
        break;
      case 'temperature_high':
        this.baseData.sensors.current_temperature = 35.0;
        break;
      case 'communication_error':
        this.baseData.system.communication_errors += 10;
        break;
    }
    
    this.notifyListeners();
  }

  clearAlarms(): void {
    // Reset alarm conditions
    this.baseData.system.communication_errors = 0;
    this.baseData.sensors.ambient_o2 = 21.0;
    this.baseData.sensors.current_temperature = 22.5;
    this.notifyListeners();
  }

  // Control individual systems
  toggleControl(control: keyof typeof this.baseData.control_panel): void {
    this.baseData.control_panel[control] = !this.baseData.control_panel[control];
    this.notifyListeners();
  }

  // Helper methods for mutually exclusive mode management
  private setOperatingMode(mode: 'rest' | 'health' | 'professional' | 'custom' | 'o2_100' | 'o2_120'): void {
    // Reset all operating mode flags
    this.baseData.modes.mode_rest = false;
    this.baseData.modes.mode_health = false;
    this.baseData.modes.mode_professional = false;
    this.baseData.modes.mode_custom = false;
    this.baseData.modes.mode_o2_100 = false;
    this.baseData.modes.mode_o2_120 = false;
    
    // Set the active mode
    switch (mode) {
      case 'rest': this.baseData.modes.mode_rest = true; break;
      case 'health': this.baseData.modes.mode_health = true; break;
      case 'professional': this.baseData.modes.mode_professional = true; break;
      case 'custom': this.baseData.modes.mode_custom = true; break;
      case 'o2_100': this.baseData.modes.mode_o2_100 = true; break;
      case 'o2_120': this.baseData.modes.mode_o2_120 = true; break;
    }
  }

  private setCompressionMode(mode: 'beginner' | 'normal' | 'fast'): void {
    // Reset all compression mode flags
    this.baseData.modes.compression_beginner = false;
    this.baseData.modes.compression_normal = false;
    this.baseData.modes.compression_fast = false;
    
    // Set the active compression mode
    switch (mode) {
      case 'beginner': this.baseData.modes.compression_beginner = true; break;
      case 'normal': this.baseData.modes.compression_normal = true; break;
      case 'fast': this.baseData.modes.compression_fast = true; break;
    }
  }

  private setOxygenMode(mode: 'continuous' | 'intermittent'): void {
    // Reset all oxygen mode flags
    this.baseData.modes.continuous_o2_flag = false;
    this.baseData.modes.intermittent_o2_flag = false;
    
    // Set the active oxygen mode
    switch (mode) {
      case 'continuous': this.baseData.modes.continuous_o2_flag = true; break;
      case 'intermittent': this.baseData.modes.intermittent_o2_flag = true; break;
    }
  }

  private setSessionState(state: 'equalise' | 'pressuring' | 'stabilising' | 'depressurise' | 'stop'): void {
    // Reset mutually exclusive session state flags
    this.baseData.session.equalise_state = false;
    this.baseData.session.pressuring_state = false;
    this.baseData.session.stabilising_state = false;
    this.baseData.session.depressurise_state = false;
    
    // Set running_state based on active session phases
    this.baseData.session.running_state = (state === 'pressuring' || state === 'stabilising' || state === 'depressurise');
    
    // Stop state only when depressurisation is completed
    this.baseData.session.stop_state = (state === 'stop');
    
    // Set the active session state (mutually exclusive)
    switch (state) {
      case 'equalise': this.baseData.session.equalise_state = true; break;
      case 'pressuring': this.baseData.session.pressuring_state = true; break;
      case 'stabilising': this.baseData.session.stabilising_state = true; break;
      case 'depressurise': this.baseData.session.depressurise_state = true; break;
      case 'stop': break; // stop_state already set above
    }
  }

  setTargetPressure(pressure: number): void {
    this.baseData.pressure.setpoint = Math.max(1.0, Math.min(6.0, pressure));
    this.notifyListeners();
  }

  startMockSession(): void {
    this.baseData.session.running_state = true;
    this.baseData.timers.session_elapsed_time = 0;
    this.setScenario('pressurizing');
  }

  stopMockSession(): void {
    this.baseData.session.running_state = false;
    this.baseData.session.session_ended = true;
    this.setScenario('depressurizing');
  }

  // Get current data snapshot
  getCurrentData(): PLCStatus {
    return { ...this.baseData };
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const plcDataMock = new PLCDataMock(); 