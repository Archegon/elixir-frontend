import React, { useState, useEffect } from 'react';
import type { EnvironmentalControls, ModeConfiguration } from '../types/chamber';
import { FanMode } from '../types/chamber';
import { useTheme } from '../contexts/ThemeContext';
import EnvironmentalControlsModal from '../components/chamber/EnvironmentalControlsModal';
import ModeSelectionModal from '../components/chamber/ModeSelectionModal';
import ThemeSelectorModal from '../components/ui/ThemeSelectorModal';
import PressureChart from '../components/charts/PressureChart';
import SideNavbar from '../components/dashboard/SideNavbar';
import EnvironmentalReadingsCard from '../components/dashboard/EnvironmentalReadingsCard';
import SessionInfoCard from '../components/dashboard/SessionInfoCard';
import AlertsCard from '../components/dashboard/AlertsCard';
import ElixirLogo from '../components/ui/ElixirLogo';

const Dashboard: React.FC = () => {
  const { currentTheme } = useTheme();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
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
      <SideNavbar onThemeModalOpen={() => setIsThemeModalOpen(true)} onEnvControls={() => setIsEnvModalOpen(true)} />

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
              <EnvironmentalReadingsCard onClimateControl={() => setIsEnvModalOpen(true)} />
              <SessionInfoCard onModeSelect={() => setIsModeModalOpen(true)} />
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
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        controls={environmentalControls}
        onUpdateControls={setEnvironmentalControls}
      />

      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        initialConfig={modeConfiguration}
        onUpdateConfig={setModeConfiguration}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard; 