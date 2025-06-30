/**
 * Mock Controls Component
 * 
 * Developer tool for controlling mock system behavior during frontend testing
 */

import React, { useState, useEffect } from 'react';
import { plcDataMock, MOCK_SCENARIOS, type MockScenario } from '../mocks/plc-data.mock';
import { mockApiService, type MockApiConfig } from '../mocks/api.mock';
import { mockWebSocketService, type MockWebSocketConfig } from '../mocks/websocket.mock';
import { isSessionActive } from '../utils/session.utils';

interface MockControlsProps {
  visible?: boolean;
  onToggle?: () => void;
}

export const MockControls: React.FC<MockControlsProps> = ({ 
  visible = false, 
  onToggle 
}) => {
  const [currentScenario, setCurrentScenario] = useState<MockScenario>(
    plcDataMock.getCurrentScenario()
  );
  const [updateFrequency, setUpdateFrequency] = useState<number>(1000);
  const [apiConfig, setApiConfig] = useState<MockApiConfig>(mockApiService.getConfig());
  const [wsConfig, setWsConfig] = useState<MockWebSocketConfig>(mockWebSocketService.getConfig());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Check if mock mode is enabled
  const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true' ||
                     import.meta.env.VITE_MOCK_PLC_DATA === 'true' ||
                     import.meta.env.VITE_MOCK_API === 'true' ||
                     import.meta.env.VITE_MOCK_WEBSOCKET === 'true';

  useEffect(() => {
    // Update scenario when it changes
    const interval = setInterval(() => {
      setCurrentScenario(plcDataMock.getCurrentScenario());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isMockMode || !visible) return null;

  const scenarios = plcDataMock.getScenarios();

  const handleScenarioChange = (scenarioId: string) => {
    plcDataMock.setScenario(scenarioId);
    setCurrentScenario(MOCK_SCENARIOS[scenarioId]);
  };

  const handleFrequencyChange = (frequency: number) => {
    setUpdateFrequency(frequency);
    plcDataMock.setUpdateFrequency(frequency);
  };

  const handleApiConfigChange = (updates: Partial<MockApiConfig>) => {
    const newConfig = { ...apiConfig, ...updates };
    setApiConfig(newConfig);
    mockApiService.configure(newConfig);
  };

  const handleWsConfigChange = (updates: Partial<MockWebSocketConfig>) => {
    const newConfig = { ...wsConfig, ...updates };
    setWsConfig(newConfig);
    mockWebSocketService.configure(newConfig);
  };

  const triggerAlarm = (alarmType: string) => {
    plcDataMock.triggerAlarm(alarmType, 'warning');
  };

  const clearAllAlarms = () => {
    plcDataMock.clearAlarms();
  };

  const injectNetworkError = () => {
    mockApiService.injectError(5000);
  };

  const simulateNetworkIssue = () => {
    mockWebSocketService.simulateNetworkIssue(3000);
  };

  const startSession = () => {
    plcDataMock.startMockSession();
  };

  const stopSession = () => {
    plcDataMock.stopMockSession();
  };

  const triggerPasswordRequest = () => {
    plcDataMock.triggerPasswordRequest();
  };

  const currentData = plcDataMock.getCurrentData();

  return (
    <div className={`
      fixed top-4 right-4 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700
      ${isMinimized ? 'w-64' : 'w-96'} max-h-[80vh] overflow-y-auto z-50
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-sm">Mock Controls</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white p-1 text-xs"
          >
            {isMinimized ? '📋' : '➖'}
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Current Status */}
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-medium mb-2">Current Status</h4>
            <div className="text-xs space-y-1">
              <div>Scenario: <span className="text-blue-400">{currentScenario.name}</span></div>
              <div>Connected: <span className={currentData.system.plc_connected ? 'text-green-400' : 'text-red-400'}>
                {currentData.system.plc_connected ? 'Yes' : 'No'}
              </span></div>
              <div>Session Active: <span className={isSessionActive(currentData.session) ? 'text-green-400' : 'text-gray-400'}>
                {isSessionActive(currentData.session) ? 'Yes' : 'No'}
              </span></div>
              <div>Pressure: <span className="text-yellow-400">{currentData.pressure.internal_pressure_1.toFixed(2)} ATA</span></div>
            </div>
          </div>

          {/* Scenario Control */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Scenarios</h4>
            <select
              value={currentScenario.id}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">{currentScenario.description}</p>
          </div>

          {/* Session Control */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Session Control</h4>
            <div className="flex gap-2">
              <button
                onClick={startSession}
                disabled={isSessionActive(currentData.session)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                         disabled:cursor-not-allowed rounded text-xs"
              >
                Start Session
              </button>
              <button
                onClick={stopSession}
                disabled={!isSessionActive(currentData.session)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                         disabled:cursor-not-allowed rounded text-xs"
              >
                Stop Session
              </button>
            </div>
          </div>

          {/* Password Testing */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Password Testing</h4>
            <div className="flex gap-2">
              <button
                onClick={triggerPasswordRequest}
                disabled={currentData.auth.show_password}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 
                         disabled:cursor-not-allowed rounded text-xs flex-1"
              >
                Trigger Password Request
              </button>
            </div>
                         <div className="text-xs text-gray-400 space-y-1">
               <div>Show Password: <span className={currentData.auth.show_password ? 'text-yellow-400' : 'text-gray-500'}>
                 {currentData.auth.show_password ? 'Active' : 'Inactive'}
               </span></div>
               <div>Proceed Status: <span className={currentData.auth.proceed_status ? 'text-green-400' : 'text-red-400'}>
                 {currentData.auth.proceed_status ? 'Valid' : 'Invalid'}
               </span></div>
               <div>User PIN: <span className="text-blue-400">{currentData.auth.user_password}</span></div>
               <div>Admin PIN: <span className="text-red-400">{currentData.auth.admin_password}</span></div>
             </div>
          </div>

          {/* Alarm Testing */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Alarm Testing</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerAlarm('pressure_high')}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
              >
                High Pressure
              </button>
              <button
                onClick={() => triggerAlarm('oxygen_low')}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
              >
                Low Oxygen
              </button>
              <button
                onClick={() => triggerAlarm('temperature_high')}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
              >
                High Temp
              </button>
              <button
                onClick={clearAllAlarms}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Network Simulation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Network Simulation</h4>
            <div className="flex gap-2">
              <button
                onClick={injectNetworkError}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs flex-1"
              >
                API Errors (5s)
              </button>
              <button
                onClick={simulateNetworkIssue}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs flex-1"
              >
                WS Issues (3s)
              </button>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Performance</h4>
            <div className="space-y-2">
              <label className="text-xs">
                Update Frequency: {updateFrequency}ms
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={updateFrequency}
                  onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </label>
              
              <label className="text-xs">
                API Error Rate: {Math.round(apiConfig.errorRate * 100)}%
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={apiConfig.errorRate * 100}
                  onChange={(e) => handleApiConfigChange({ errorRate: Number(e.target.value) / 100 })}
                  className="w-full mt-1"
                />
              </label>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Control Panel</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => plcDataMock.toggleControl('ceiling_lights_state')}
                className={`px-2 py-1 rounded text-xs ${
                  currentData.control_panel.ceiling_lights_state 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Ceiling Lights
              </button>
              <button
                onClick={() => plcDataMock.toggleControl('reading_lights_state')}
                className={`px-2 py-1 rounded text-xs ${
                  currentData.control_panel.reading_lights_state 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Reading Lights
              </button>
              <button
                onClick={() => plcDataMock.toggleControl('ac_state')}
                className={`px-2 py-1 rounded text-xs ${
                  currentData.control_panel.ac_state 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                AC
              </button>
              <button
                onClick={() => plcDataMock.toggleControl('intercom_state')}
                className={`px-2 py-1 rounded text-xs ${
                  currentData.control_panel.intercom_state 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Intercom
              </button>
            </div>
          </div>

          {/* Pressure Control */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pressure Control</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => plcDataMock.setTargetPressure(Math.max(1.0, currentData.pressure.setpoint - 0.1))}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                -0.1
              </button>
              <span className="text-xs flex-1 text-center">
                {currentData.pressure.setpoint.toFixed(1)} ATA
              </span>
              <button
                onClick={() => plcDataMock.setTargetPressure(Math.min(6.0, currentData.pressure.setpoint + 0.1))}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                +0.1
              </button>
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-gray-800 p-2 rounded">
            <h4 className="text-xs font-medium mb-1">Environment</h4>
            <div className="text-xs space-y-1 text-gray-400">
              <div>Mock Mode: {import.meta.env.VITE_MOCK_MODE === 'true' ? '✅' : '❌'}</div>
              <div>Mock Data: {import.meta.env.VITE_MOCK_PLC_DATA === 'true' ? '✅' : '❌'}</div>
              <div>Mock API: {import.meta.env.VITE_MOCK_API === 'true' ? '✅' : '❌'}</div>
              <div>Mock WS: {import.meta.env.VITE_MOCK_WEBSOCKET === 'true' ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 