import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses, getProgressBarStyle } from '../../utils/containerStyles';
import { BarChart3, Gauge, Play, MessageCircle } from 'lucide-react';
import { apiService } from '../../services/api.service';
import type { PLCStatus } from '../../config/api-endpoints';
import { isSessionActive } from '../../utils/session.utils';

interface SessionInfoCardProps {
  onModeSelect?: () => void;
}

const SessionInfoCard: React.FC<SessionInfoCardProps> = ({ onModeSelect }) => {
  const { currentTheme } = useTheme();
  const [currentStatus, setCurrentStatus] = useState<PLCStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Subscribe to real-time session updates
  useEffect(() => {
    let statusCallback: Function | null = null;
    let connectedCallback: Function | null = null;
    let disconnectedCallback: Function | null = null;

    const setupSubscriptions = async () => {
      try {
        await apiService.waitForInitialization();

        // Define event callbacks
        statusCallback = (status: PLCStatus) => {
          setCurrentStatus(status);
        };

        connectedCallback = (connectionData: { connected: boolean }) => {
          setIsConnected(connectionData.connected);
        };

        disconnectedCallback = (connectionData: { connected: boolean }) => {
          setIsConnected(connectionData.connected);
        };

        // Subscribe to events
        apiService.on('status-update', statusCallback);
        apiService.on('connected', connectedCallback);
        apiService.on('disconnected', disconnectedCallback);

        // Get initial connection status
        setIsConnected(apiService.getConnectionStatus());

      } catch (error) {
        console.error('Failed to setup session info subscriptions:', error);
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions
    return () => {
      if (statusCallback) apiService.off('status-update', statusCallback);
      if (connectedCallback) apiService.off('connected', connectedCallback);
      if (disconnectedCallback) apiService.off('disconnected', disconnectedCallback);
    };
  }, []);

  // Helper functions to format data
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionStatus = (): { status: string; variant: 'success' | 'warning' | 'info' | 'danger' } => {
    if (!isConnected) return { status: 'Disconnected', variant: 'danger' };
    if (!currentStatus) return { status: 'No Data', variant: 'warning' };
    
    // Check session control flags first
    const session = currentStatus.session;
    if (session.stop_state) return { status: 'Session Complete', variant: 'info' };
    
    // Check mutually exclusive session states
    if (session.equalise_state) return { status: 'Equalising', variant: 'info' };
    if (session.pressuring_state) return { status: 'Pressurizing', variant: 'warning' };
    if (session.stabilising_state) return { status: 'Treatment', variant: 'success' };
    if (session.depressurise_state) return { status: 'Depressurizing', variant: 'info' };
    
    // Fallback for running_state without specific phase
    if (session.running_state) return { status: 'Running', variant: 'success' };
    
    return { status: 'Idle', variant: 'info' };
  };

  const getTreatmentMode = (): string => {
    if (!currentStatus) return 'Unknown';
    // Check which operating mode flag is active (mutually exclusive)
    const modes = currentStatus.modes;
    if (modes.mode_rest) return 'Rest Mode';
    if (modes.mode_health) return 'Health Mode';
    if (modes.mode_professional) return 'Professional Mode';
    if (modes.mode_custom) return 'Custom Mode';
    if (modes.mode_o2_100) return 'O2 100%';
    if (modes.mode_o2_120) return 'O2 120%';
    return 'Unknown Mode';
  };

  const getCompressionRate = (): string => {
    if (!currentStatus) return 'Unknown';
    // Check which compression mode flag is active (mutually exclusive)
    const modes = currentStatus.modes;
    if (modes.compression_beginner) return 'Beginner';
    if (modes.compression_normal) return 'Normal';
    if (modes.compression_fast) return 'Fast';
    return 'Unknown Rate';
  };

  const getO2Delivery = (): string => {
    if (!currentStatus) return 'Unknown';
    // Check which oxygen mode flag is active (mutually exclusive)
    const modes = currentStatus.modes;
    if (modes.continuous_o2_flag) return 'Continuous';
    if (modes.intermittent_o2_flag) return 'Intermittent';
    return 'Unknown O2 Mode';
  };

  const calculateProgress = (): number => {
    if (!currentStatus) return 0;
    
    // Check if any active session state indicates a running session
    if (!isSessionActive(currentStatus.session)) return 0;
    
    const elapsed = currentStatus.timers.session_elapsed_time;
    const remaining = currentStatus.timers.run_time_remaining_min * 60;
    const total = elapsed + remaining;
    
    if (total === 0) return 0;
    return Math.min(100, (elapsed / total) * 100);
  };

  const sessionStatus = getSessionStatus();

  return (
    <div 
      className="col-span-2 p-5 rounded-2xl"
      style={containerStyles.card(currentTheme)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-sm font-semibold"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Current Session
        </h3>
        <div 
          className={containerClasses.statusBadge}
          style={containerStyles.statusBadge(currentTheme, sessionStatus.variant)}
        >
          {sessionStatus.status}
        </div>
      </div>
      
      {/* Session Timer */}
      <div className="mb-4">
        <p 
          className="text-3xl font-bold font-mono mb-1"
          style={{ color: currentTheme.colors.textPrimary }}
        >
          {currentStatus ? formatTime(currentStatus.timers.session_elapsed_time) : '--:--'}
        </p>
        <p 
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Remaining: {currentStatus ? formatTime(currentStatus.timers.run_time_remaining_min * 60) : '--:--'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div style={getProgressBarStyle(currentTheme, calculateProgress(), currentTheme.colors.brand).container}>
          <div style={getProgressBarStyle(currentTheme, calculateProgress(), currentTheme.colors.brand).fill}></div>
        </div>
      </div>

      {/* Operating Mode */}
      <div className="space-y-3 mb-4">
        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Treatment Mode
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.info}15`,
              color: currentTheme.colors.info
            }}
          >
            {getTreatmentMode()}
          </div>
        </div>

        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Compression
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.warning}15`,
              color: currentTheme.colors.warning
            }}
          >
            {getCompressionRate()}
          </div>
        </div>

        <div>
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            O2 Delivery
          </p>
          <div 
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: `${currentTheme.colors.success}15`,
              color: currentTheme.colors.success
            }}
          >
            {getO2Delivery()}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {/* Change Mode Button */}
        {onModeSelect && (
          <button 
            onClick={onModeSelect}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.brand,
              color: '#ffffff',
              border: `1px solid ${currentTheme.colors.brand}`
            }}
          >
            <BarChart3 size={16} />
            <span>Change Mode</span>
          </button>
        )}

        {/* Session Control Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.brand,
              border: `1px solid ${currentTheme.colors.brand}`
            }}
          >
            <Play size={14} />
            <span>Stop/Start</span>
          </button>
          
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: `${currentTheme.colors.warning}15`,
              color: currentTheme.colors.warning,
              border: `1px solid ${currentTheme.colors.warning}30`
            }}
          >
            <Gauge size={14} />
            <span>Equalise</span>
          </button>
          
          <button 
            className="py-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.textSecondary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <MessageCircle size={14} />
            <span>Intercomms</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionInfoCard; 