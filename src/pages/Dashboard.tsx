import React, { useState } from 'react';
import type { ChamberStatus, AlertLevel, EnvironmentalControls, ModeConfiguration } from '../types/chamber';
import { FanMode } from '../types/chamber';
import { useTheme } from '../contexts/ThemeContext';
import EnvironmentalControlsModal from '../components/chamber/EnvironmentalControlsModal';
import ModeSelectionModal from '../components/chamber/ModeSelectionModal';
import ThemeSelectorModal from '../components/ui/ThemeSelectorModal';
import ElixirLogo from '../components/ui/ElixirLogo';
import PressureChart from '../components/charts/PressureChart';
import { containerStyles, containerClasses, getProgressBarStyle, getStatusIndicatorStyle } from '../utils/containerStyles';
import { Settings, BarChart3, Gauge, Play, MessageCircle, Palette } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentTheme } = useTheme();
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
    set_duration: 90
  });

  return (
    <div 
      className="h-screen w-screen overflow-hidden"
      style={{ 
        backgroundColor: currentTheme.colors.primary,
        color: currentTheme.colors.textPrimary 
      }}
    >
      {/* Header */}
      <header 
        className={containerClasses.header}
        style={containerStyles.header(currentTheme)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/O2genes logo no text.png" 
              alt="O2genes Logo" 
              className="h-8 w-auto"
            />
            <div>
              <ElixirLogo size="md" />
              <p 
                className="text-xs font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Control System
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.textPrimary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <Palette size={16} />
            <span>Themes</span>
          </button>
          
          {/* Minimal Status Indicator */}
          <div 
            className="flex items-center space-x-3 px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: `${currentTheme.colors.warning}15`,
              border: `1px solid ${currentTheme.colors.warning}30`
            }}
          >
            <div 
              className="animate-pulse"
              style={getStatusIndicatorStyle(currentTheme, 'warning')}
            ></div>
            <span 
              className="font-medium"
              style={{ color: currentTheme.colors.warning }}
            >
              Pressurizing
            </span>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm" 
               style={{ 
                 backgroundColor: `${currentTheme.colors.success}15`,
                 color: currentTheme.colors.success
               }}>
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: currentTheme.colors.success,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
            <span className="font-medium">Online</span>
          </div>
          
          <div 
            className={containerClasses.timeDisplay}
            style={containerStyles.timeDisplay(currentTheme)}
          >
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)] p-6 overflow-auto">
        
        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Section - Metrics */}
          <div className="col-span-12 space-y-6">
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              
              {/* Environmental Readings Card */}
              <div 
                className="col-span-2 p-5 rounded-2xl"
                style={containerStyles.card(currentTheme)}
              >
                <div className="mb-4">
                  <h3 
                    className="text-lg font-semibold mb-1"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    Environmental Readings
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Chamber conditions
                  </p>
                </div>

                {/* Readings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Pressure */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="text-sm font-semibold"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Pressure
                      </h4>
                      <div 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={containerStyles.statusBadge(currentTheme, 'success')}
                      >
                        Normal
                      </div>
                    </div>
                    <div>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        2.4 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>ATA</span>
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Target: 2.5 ATA
                      </p>
                    </div>
                    <div style={getProgressBarStyle(currentTheme, 96, currentTheme.colors.success).container}>
                      <div style={getProgressBarStyle(currentTheme, 96, currentTheme.colors.success).fill}></div>
                    </div>
                  </div>

                  {/* Oxygen */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="text-sm font-semibold"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Oxygen
                      </h4>
                      <div 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={containerStyles.statusBadge(currentTheme, 'info')}
                      >
                        Optimal
                      </div>
                    </div>
                    <div>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        100 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Flow: 15 L/min
                      </p>
                    </div>
                    <div style={getProgressBarStyle(currentTheme, 100, currentTheme.colors.info).container}>
                      <div style={getProgressBarStyle(currentTheme, 100, currentTheme.colors.info).fill}></div>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="text-sm font-semibold"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Temperature
                      </h4>
                      <div 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={containerStyles.statusBadge(currentTheme, 'warning')}
                      >
                        Stable
                      </div>
                    </div>
                    <div>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        22 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>°C</span>
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Range: 20-24°C
                      </p>
                    </div>
                    <div style={getProgressBarStyle(currentTheme, 80, currentTheme.colors.warning).container}>
                      <div style={getProgressBarStyle(currentTheme, 80, currentTheme.colors.warning).fill}></div>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="text-sm font-semibold"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Humidity
                      </h4>
                      <div 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={containerStyles.statusBadge(currentTheme, 'success')}
                      >
                        Good
                      </div>
                    </div>
                    <div>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        45 <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>%</span>
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Optimal: 40-60%
                      </p>
                    </div>
                    <div style={getProgressBarStyle(currentTheme, 45, currentTheme.colors.success).container}>
                      <div style={getProgressBarStyle(currentTheme, 45, currentTheme.colors.success).fill}></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Session Information Card */}
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
                    style={containerStyles.statusBadge(currentTheme, 'success')}
                  >
                    Active
                  </div>
                </div>
                
                {/* Session Timer */}
                <div className="mb-4">
                  <p 
                    className="text-3xl font-bold font-mono mb-1"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    45:32
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Remaining: 14:28
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div style={getProgressBarStyle(currentTheme, 76, currentTheme.colors.brand).container}>
                    <div style={getProgressBarStyle(currentTheme, 76, currentTheme.colors.brand).fill}></div>
                  </div>
                </div>

                {/* Operating Mode */}
                <div className="space-y-3">
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
                      Professional Mode
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
                      Normal Rate
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
                      Continuous
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Pressure Chart and Alerts Grid */}
            <div className="grid grid-cols-3 gap-6">
              
              {/* Pressure Chart */}
              <div className="col-span-2">
                <PressureChart />
              </div>

              {/* System Alerts */}
              <div className="col-span-1">
                <div 
                  className={containerClasses.cardLarge}
                  style={containerStyles.card(currentTheme)}
                >
                  <h3 
                    className="text-lg font-semibold mb-4"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    Alerts
                  </h3>
                  <div className="space-y-3">
                    <div 
                      className="flex items-center p-3 rounded-xl"
                      style={containerStyles.alert(currentTheme, 'success')}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-3 flex-shrink-0 animate-pulse"
                        style={{ 
                          backgroundColor: currentTheme.colors.success,
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          All systems nominal
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          12:45 PM
                        </p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center p-3 rounded-xl"
                      style={containerStyles.alert(currentTheme, 'warning')}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-3 flex-shrink-0 animate-pulse"
                        style={{ 
                          backgroundColor: currentTheme.colors.warning,
                          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          Pressure adjustment in progress
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          12:42 PM
                        </p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center p-3 rounded-xl"
                      style={containerStyles.alert(currentTheme, 'info')}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: currentTheme.colors.info }}
                      ></div>
                      <div className="min-w-0">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          Session data logged
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          12:40 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Control Actions Card - Bottom of Grid */}
          <div className="col-span-12">
            <div 
              className={containerClasses.cardLarge}
              style={containerStyles.card(currentTheme)}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Controls
              </h3>
              <div className="grid grid-cols-5 gap-4">
                <button 
                  onClick={() => setIsModeModalOpen(true)}
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={containerStyles.button(currentTheme, 'primary')}
                >
                  <BarChart3 size={18} />
                  <span>Select Mode</span>
                </button>
                <button 
                  onClick={() => setIsEnvModalOpen(true)}
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={containerStyles.button(currentTheme, 'secondary')}
                >
                  <Settings size={18} />
                  <span>Controls</span>
                </button>
                <button 
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={containerStyles.button(currentTheme, 'warning')}
                >
                  <Gauge size={18} />
                  <span>Equalise</span>
                </button>
                <button 
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={containerStyles.button(currentTheme, 'primary')}
                >
                  <Play size={18} />
                  <span>Stop/Start</span>
                </button>
                <button 
                  className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  style={containerStyles.button(currentTheme, 'secondary')}
                >
                  <MessageCircle size={18} />
                  <span>Intercomms</span>
                </button>
              </div>
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