import React, { useState, useEffect } from 'react';
import type { EnvironmentalControls, ModeConfiguration } from '../types/chamber';
import type { PLCStatus } from '../config/api-endpoints';
import { FanMode } from '../types/chamber';
import { useTheme } from '../contexts/ThemeContext';
import EnvironmentalControlsModal from '../components/chamber/EnvironmentalControlsModal';
import ModeSelectionModal from '../components/chamber/ModeSelectionModal';
import ThemeSelectorModal from '../components/ui/ThemeSelectorModal';
import PasswordInputModal from '../components/ui/PasswordInputModal';
import PressureChart from '../components/charts/PressureChart';
import SideNavbar from '../components/dashboard/SideNavbar';
import EnvironmentalReadingsCard from '../components/dashboard/EnvironmentalReadingsCard';
import SessionInfoCard from '../components/dashboard/SessionInfoCard';
import AlertsCard from '../components/dashboard/AlertsCard';
import ElixirLogo from '../components/ui/ElixirLogo';
import { MockControls } from '../components/MockControls';
import apiService from '../services/api.service';

const Dashboard: React.FC = () => {
  const { currentTheme } = useTheme();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMockControlsVisible, setIsMockControlsVisible] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [plcStatus, setPLCStatus] = useState<PLCStatus | null>(null);
  const [environmentalControls, setEnvironmentalControls] = useState<EnvironmentalControls>({
    airConditioner: {
      enabled: true,
      temperatureSetPoint: 22,
      currentTemperature: 22
    },
    fan: {
      mode: FanMode.AUTO,
      speed: 75
    },
    lighting: {
      readingLights: true,
      doorLights: true,
      ceilingLights: false,
      exteriorLights: true
    }
  });

  const [modeConfiguration, setModeConfiguration] = useState<ModeConfiguration>({
    mode_rest: false,
    mode_health: false,
    mode_professional: true,
    mode_custom: false,
    mode_o2_100: false,
    mode_o2_120: false,
    compression_beginner: false,
    compression_normal: true,
    compression_fast: false,
    continuous_o2_flag: true,
    intermittent_o2_flag: false,
    set_duration: 90,
    pressure_set_point: 2.4
  });

  // Calculate scale factor based on viewport size
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Base dimensions (reference size for scaling)
      const baseWidth = 1920;
      const baseHeight = 1080;
      
      // Calculate scale based on what fits (ensure it always fits)
      const scaleX = viewportWidth / baseWidth;
      const scaleY = viewportHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY); // Use minimum to ensure it fits
      
      // Limit scale factor to reasonable bounds
      const boundedScale = Math.max(0.4, Math.min(2.5, scale));
      
      setScaleFactor(boundedScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Monitor PLC status for show_password bit
  useEffect(() => {
    const handleStatusUpdate = (status: PLCStatus) => {
      setPLCStatus(status);
      setIsPasswordModalOpen(status.auth.show_password_screen);
    };

    // Subscribe to PLC status updates
    apiService.on('status-update', handleStatusUpdate);
    
    // Get initial status
    const initialStatus = apiService.getSystemStatus();
    if (initialStatus) {
      handleStatusUpdate(initialStatus);
    }

    return () => {
      apiService.off('status-update', handleStatusUpdate);
    };
  }, []);

  // Password modal handlers
  const handlePasswordCancel = async () => {
    try {
      await apiService.cancelPasswordRequest();
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel password request:', error);
    }
  };

  const handlePasswordProceed = async (password: string) => {
    try {
      await apiService.proceedWithPassword(password);
      // Modal will close automatically when show_password becomes false
    } catch (error) {
      console.error('Failed to proceed with password:', error);
    }
  };

  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    try {
      await apiService.changePassword(oldPassword, newPassword);
      // Modal will close automatically when show_password becomes false
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex"
      style={{ 
        backgroundColor: currentTheme.colors.primary,
        color: currentTheme.colors.textPrimary,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        width: `${100 / scaleFactor}vw`,
        height: `${100 / scaleFactor}vh`
      }}
    >
      {/* Side Navbar */}
      <SideNavbar 
        onThemeModalOpen={() => !isPasswordModalOpen && setIsThemeModalOpen(true)} 
        onEnvControls={() => !isPasswordModalOpen && setIsEnvModalOpen(true)}
        onMockControls={() => !isPasswordModalOpen && setIsMockControlsVisible(!isMockControlsVisible)}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <ElixirLogo size="lg" />
          </div>
          <div>
              <p 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Hyperbaric Chamber Management
              </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-2">
          
          {/* Metrics Grid */}
          <div className="col-span-12">
            <div className="grid grid-cols-4 gap-4 mb-2">
              <EnvironmentalReadingsCard 
                onClimateControl={() => !isPasswordModalOpen && setIsEnvModalOpen(true)} 
              />
              <SessionInfoCard 
                onModeSelect={() => !isPasswordModalOpen && setIsModeModalOpen(true)} 
              />
            </div>
          </div>

          {/* Pressure Chart and Alerts Grid */}
          <div className="col-span-12">
            <div className="grid grid-cols-3 gap-4 mb-2">
              {/* Pressure Chart */}
              <div className="col-span-2">
                <PressureChart />
              </div>
              <AlertsCard />
            </div>
          </div>

        </div>

      </main>

      {/* Modals */}
      <EnvironmentalControlsModal
        isOpen={isEnvModalOpen && !isPasswordModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        controls={environmentalControls}
        onUpdateControls={setEnvironmentalControls}
      />

      <ModeSelectionModal
        isOpen={isModeModalOpen && !isPasswordModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        initialConfig={modeConfiguration}
        onUpdateConfig={setModeConfiguration}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen && !isPasswordModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Password Input Modal - Highest priority */}
      <PasswordInputModal
        isOpen={isPasswordModalOpen}
        onCancel={handlePasswordCancel}
        onProceed={handlePasswordProceed}
        onChangePassword={handlePasswordChange}
      />

      {/* Mock Controls - Only visible in mock mode */}
      <MockControls 
        visible={isMockControlsVisible && !isPasswordModalOpen}
        onToggle={() => setIsMockControlsVisible(!isMockControlsVisible)}
      />

      {/* Overlay when password modal is active */}
      {isPasswordModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 pointer-events-none"
          style={{
            transform: `scale(${1/scaleFactor})`,
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  );
};

export default Dashboard; 