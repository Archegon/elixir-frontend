import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useScaling } from '../hooks/useModalScaling';
import SideNavbar from '../components/dashboard/SideNavbar';
import ThemeSelectorModal from '../components/ui/ThemeSelectorModal';
import ElixirLogo from '../components/ui/ElixirLogo';
import apiService from '../services/api.service';
import type { PLCStatus } from '../config/api-endpoints';

const Development: React.FC = () => {
  const { currentTheme } = useTheme();
  const scaleFactor = useScaling();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [plcData, setPLCData] = useState<PLCStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);



  useEffect(() => {
    // Subscribe to PLC status updates
    const handleStatusUpdate = (data: PLCStatus) => {
      setPLCData(data);
      setLastUpdated(new Date());
    };

    const handleConnectionChange = (status: { connected: boolean }) => {
      setConnectionStatus(status.connected);
    };

    apiService.on('status-update', handleStatusUpdate);
    apiService.on('connected', handleConnectionChange);
    apiService.on('disconnected', handleConnectionChange);

    // Get initial status
    const initialStatus = apiService.getSystemStatus();
    if (initialStatus) {
      setPLCData(initialStatus);
      setLastUpdated(new Date());
    }
    setConnectionStatus(apiService.getConnectionStatus());

    return () => {
      apiService.off('status-update', handleStatusUpdate);
      apiService.off('connected', handleConnectionChange);
      apiService.off('disconnected', handleConnectionChange);
    };
  }, []);

  const renderSection = (title: string, data: Record<string, any> | undefined) => {
    if (!data) return null;

    return (
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          backgroundColor: currentTheme.colors.primary,
          border: `1px solid ${currentTheme.colors.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <h3
          className="text-lg font-semibold mb-4 border-b pb-2"
          style={{
            color: currentTheme.colors.textPrimary,
            borderColor: currentTheme.colors.border
          }}
        >
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: currentTheme.colors.secondary,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div
                className="text-sm font-medium mb-1 flex items-center gap-2"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                {/* Show PLC addresses for treatment mode bits */}
                {key === 'mode_rest' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${currentTheme.colors.info}20`, color: currentTheme.colors.info }}>M4.0</span>}
                {key === 'mode_health' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${currentTheme.colors.info}20`, color: currentTheme.colors.info }}>M4.1</span>}
                {key === 'mode_professional' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${currentTheme.colors.info}20`, color: currentTheme.colors.info }}>M4.2</span>}
                {key === 'mode_custom' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${currentTheme.colors.info}20`, color: currentTheme.colors.info }}>M4.3</span>}
                {key === 'mode_o2_100' && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${currentTheme.colors.brand}30`, color: currentTheme.colors.brand }}>M4.4 - O2genes 100</span>}
                {key === 'mode_o2_120' && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${currentTheme.colors.brand}30`, color: currentTheme.colors.brand }}>M4.5 - O2genes 120</span>}
              </div>
              <div
                className="font-mono text-sm"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {typeof value === 'boolean' ? (
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: value ? `${currentTheme.colors.success}20` : `${currentTheme.colors.danger}20`,
                      color: value ? currentTheme.colors.success : currentTheme.colors.danger
                    }}
                  >
                    {value.toString().toUpperCase()}
                  </span>
                ) : typeof value === 'number' ? (
                  <span
                    style={{ color: currentTheme.colors.info }}
                  >
                    {value.toFixed(2)}
                  </span>
                ) : (
                  <span>{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex scaled-container"
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
        onThemeModalOpen={() => setIsThemeModalOpen(true)} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-6 pb-0">
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
                Development Dashboard - Real-time PLC Monitoring
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div
            className="rounded-xl p-4 mb-6 flex items-center justify-between"
            style={{
              backgroundColor: connectionStatus ? `${currentTheme.colors.success}15` : `${currentTheme.colors.danger}15`,
              border: `1px solid ${connectionStatus ? currentTheme.colors.success : currentTheme.colors.danger}30`
            }}
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3 animate-pulse"
                style={{
                  backgroundColor: connectionStatus ? currentTheme.colors.success : currentTheme.colors.danger
                }}
              />
              <span
                className="font-medium"
                style={{
                  color: connectionStatus ? currentTheme.colors.success : currentTheme.colors.danger
                }}
              >
                {connectionStatus ? 'Connected to PLC' : 'Disconnected from PLC'}
              </span>
            </div>
            {lastUpdated && (
              <span
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 scroll-enabled development-content"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            scrollBehavior: 'smooth',
            height: '100%',
            minHeight: '0'
          }}
        >
          {plcData ? (
            <>
              {renderSection('Authentication', plcData.auth)}
              {renderSection('Language Settings', plcData.language)}
              {renderSection('Control Panel', plcData.control_panel)}
              {renderSection('Pressure Control', plcData.pressure)}
              {renderSection('Session Control', plcData.session)}
              {renderSection('Operating Modes', plcData.modes)}
              {renderSection('Temperature Control', plcData.climate)}
              {renderSection('Sensors', plcData.sensors)}
              {renderSection('Calibration', plcData.calibration)}
              {renderSection('Manual Controls', plcData.manual)}
              {renderSection('Timers', plcData.timers)}
              {renderSection('System', plcData.system)}
              
              {/* Test Content to Force Scrolling */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  border: `1px solid ${currentTheme.colors.border}`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Scroll Test Area
                </h3>
                <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: currentTheme.colors.textSecondary }}>
                    This is a tall test area. If you can scroll to see this text clearly, scrolling is working!
                  </p>
                </div>
              </div>
              
              {/* Raw JSON Data */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  border: `1px solid ${currentTheme.colors.border}`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Raw JSON Data
                </h3>
                <pre
                  className="text-xs overflow-auto max-h-96 p-4 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.textSecondary,
                    fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'auto',
                    overscrollBehavior: 'contain'
                  }}
                >
                  {JSON.stringify(plcData, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                backgroundColor: currentTheme.colors.primary,
                border: `1px solid ${currentTheme.colors.border}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div
                className="text-lg font-medium mb-2"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                No PLC Data Available
              </div>
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Waiting for connection to PLC system...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />
    </div>
  );
};

export default Development; 