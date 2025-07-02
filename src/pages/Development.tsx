import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useScaling } from '../hooks/useModalScaling';
import SideNavbar from '../components/dashboard/SideNavbar';
import ThemeSelectorModal from '../components/ui/ThemeSelectorModal';
import ElixirLogo from '../components/ui/ElixirLogo';
import { apiService } from '../services/api.service';
import type { PLCStatus } from '../config/api-endpoints';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { getDiscoveryStats, resetDiscovery, DISCOVERY_CONFIG, discoverBackend } from '../config/connection.config';

interface CustomAddress {
  id: string;
  address: string;
  value: any;
  lastRead: string;
  error?: string;
}

interface DiscoveryInfo {
  isDiscovering: boolean;
  currentIP: string;
  testedIPs: string[];
  totalIPs: number;
  progress: number;
  discoveredUrl?: string;
  cacheSize: number;
  startTime?: Date;
  elapsedTime?: number;
  currentSubnet?: string;
  networkInfo?: {
    localIP?: string;
    subnets: string[];
  };
  connectionAttempts: number;
  lastAttemptTime?: Date;
  discoveryMethod?: 'explicit' | 'fallback' | 'scan';
}

const Development: React.FC = () => {
  const { currentTheme } = useTheme();
  const scaleFactor = useScaling();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [plcData, setPLCData] = useState<PLCStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);

  // Discovery tracking state
  const [discoveryInfo, setDiscoveryInfo] = useState<DiscoveryInfo>({
    isDiscovering: false,
    currentIP: '',
    testedIPs: [],
    totalIPs: 0,
    progress: 0,
    cacheSize: 0,
    connectionAttempts: 0
  });

  // Custom address monitoring state
  const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [writeAddress, setWriteAddress] = useState('');
  const [writeValue, setWriteValue] = useState('');
  const [writeError, setWriteError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  // Use backend connection status
  const { isConnected, apiUrl, wsUrl } = useBackendConnection();
  
  // WebSocket connection for real-time custom monitoring
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Real-time timer for discovery progress
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Subscribe to PLC status updates from the main apiService
    const handleStatusUpdate = (data: PLCStatus) => {
      setPLCData(data);
      setLastUpdated(new Date());
    };

    const handleConnectionChange = (status: { connected: boolean }) => {
      setConnectionStatus(status.connected);
    };

    // Discovery event listeners
    const handleDiscoveryStart = (data?: any) => {
      console.log('🎯 Development: Discovery start received:', data);
      console.log('🎯 Current discoveryInfo state:', discoveryInfo);
      setDiscoveryInfo(prev => {
        const newState = { 
          ...prev, 
          isDiscovering: true, 
          progress: 0,
          startTime: new Date(),
          connectionAttempts: prev.connectionAttempts + 1,
          lastAttemptTime: new Date(),
          discoveryMethod: data?.method || 'scan'
        };
        console.log('🎯 New discoveryInfo state:', newState);
        return newState;
      });
    };

    const handleDiscoveryComplete = (data: { apiUrl: string; wsUrl: string }) => {
      console.log('🎯 Development: Discovery complete received:', data);
      setDiscoveryInfo(prev => ({ 
        ...prev, 
        isDiscovering: false, 
        discoveredUrl: data.apiUrl,
        progress: 100,
        elapsedTime: prev.startTime ? Date.now() - prev.startTime.getTime() : undefined
      }));
    };

    const handleDiscoveryProgress = (data: { currentIP: string; testedIPs: string[]; totalIPs: number; subnet?: string }) => {
      console.log('🎯 Development: Discovery progress received:', data);
      console.log('🎯 Current discoveryInfo state:', discoveryInfo);
      const progress = (data.testedIPs.length / data.totalIPs) * 100;
      setDiscoveryInfo(prev => {
        const newState = { 
          ...prev, 
          currentIP: data.currentIP,
          testedIPs: data.testedIPs,
          totalIPs: data.totalIPs,
          progress,
          currentSubnet: data.subnet,
          elapsedTime: prev.startTime ? Date.now() - prev.startTime.getTime() : undefined
        };
        console.log('🎯 New discoveryInfo state:', newState);
        return newState;
      });
    };

    const handleDiscoveryFailed = () => {
      setDiscoveryInfo(prev => ({ 
        ...prev, 
        isDiscovering: false,
        elapsedTime: prev.startTime ? Date.now() - prev.startTime.getTime() : undefined
      }));
    };

    apiService.on('status-update', handleStatusUpdate);
    apiService.on('connected', handleConnectionChange);
    apiService.on('disconnected', handleConnectionChange);
    apiService.on('discovery-start', handleDiscoveryStart);
    apiService.on('discovery-complete', handleDiscoveryComplete);
    apiService.on('discovery-progress', handleDiscoveryProgress);
    apiService.on('discovery-failed', handleDiscoveryFailed);

    // Get initial status
    const initialStatus = apiService.getSystemStatus();
    if (initialStatus) {
      setPLCData(initialStatus);
      setLastUpdated(new Date());
    }
    setConnectionStatus(apiService.getConnectionStatus());

    // Get initial discovery stats
    const stats = getDiscoveryStats();
    setDiscoveryInfo(prev => ({ ...prev, cacheSize: stats.cacheSize }));

    return () => {
      apiService.off('status-update', handleStatusUpdate);
      apiService.off('connected', handleConnectionChange);
      apiService.off('disconnected', handleConnectionChange);
      apiService.off('discovery-start', handleDiscoveryStart);
      apiService.off('discovery-complete', handleDiscoveryComplete);
      apiService.off('discovery-progress', handleDiscoveryProgress);
      apiService.off('discovery-failed', handleDiscoveryFailed);
    };
  }, []);

  // Real-time timer for discovery progress
  useEffect(() => {
    if (!discoveryInfo.isDiscovering || !discoveryInfo.startTime) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(timer);
  }, [discoveryInfo.isDiscovering, discoveryInfo.startTime]);

  // Get network information on mount
  useEffect(() => {
    const loadNetworkInfo = async () => {
      const networkInfo = await getNetworkInfo();
      setDiscoveryInfo(prev => ({ ...prev, networkInfo }));
    };
    
    loadNetworkInfo();
  }, []);

  // Debug: Monitor discoveryInfo state changes
  useEffect(() => {
    console.log('🎯 DiscoveryInfo state changed:', discoveryInfo);
  }, [discoveryInfo]);

  // WebSocket connection management for custom address monitoring
  useEffect(() => {
    if (!wsUrl) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${wsUrl}/ws/system-status`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected for Development custom monitoring');
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastUpdate(data.timestamp || new Date().toISOString());
            
            // Update custom addresses from WebSocket data
            if (data.custom_addresses) {
              setCustomAddresses(prevAddresses => 
                prevAddresses.map(addr => ({
                  ...addr,
                  value: data.custom_addresses[addr.address] ?? 'No data',
                  lastRead: new Date().toLocaleTimeString(),
                  error: data.custom_addresses[addr.address] === null ? 'Failed to read' : undefined
                }))
              );
            }
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected for Development custom monitoring');
          setWsConnected(false);
          
          // Attempt to reconnect after 3 seconds if the connection was intentional
          if (wsRef.current === ws) {
            setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wsUrl]);

  // No auto-adding of addresses - user can add what they need

  // Custom address monitoring functions
  // Get network information for discovery
  const getNetworkInfo = async () => {
    try {
      // Get local IP using WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      return new Promise<{ localIP?: string; subnets: string[] }>((resolve) => {
        let resolved = false;
        
        pc.onicecandidate = (event) => {
          if (!resolved && event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match && !match[1].startsWith('127.') && !match[1].startsWith('169.254.')) {
              resolved = true;
              pc.close();
              const localIP = match[1];
              const subnet = localIP.split('.').slice(0, 3).join('.');
              resolve({ 
                localIP, 
                subnets: [subnet, ...DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS]
              });
            }
          }
        };

        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            pc.close();
            resolve({ 
              localIP: undefined, 
              subnets: DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS 
            });
          }
        }, 3000);
      });
    } catch (error) {
      console.warn('Failed to get network info:', error);
      return { 
        localIP: undefined, 
        subnets: DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS 
      };
    }
  };

  const addCustomAddress = async (address?: string) => {
    const addressToAdd = address || newAddress.trim();
    if (!addressToAdd) return;

    // Check if address already exists
    if (customAddresses.some(addr => addr.address === addressToAdd)) {
      if (!address) {
        setWriteError('Address already being monitored');
        setTimeout(() => setWriteError(null), 3000);
      }
      return;
    }

    try {
      // Add to WebSocket monitoring
      await apiService.addAddressMonitoring(addressToAdd);
      
      // Add to local state
      const newAddr: CustomAddress = {
        id: Date.now().toString(),
        address: addressToAdd,
        value: 'Monitoring...',
        lastRead: 'Never',
      };

      setCustomAddresses(prev => [...prev, newAddr]);
      if (!address) setNewAddress(''); // Only clear input if manually added
      
      console.log(`Added ${addressToAdd} to real-time monitoring`);
    } catch (error) {
      console.error('Failed to add address monitoring:', error);
      if (!address) {
        setWriteError(`Failed to add monitoring for ${addressToAdd}: ${error}`);
        setTimeout(() => setWriteError(null), 5000);
      }
    }
  };

  const removeCustomAddress = async (id: string) => {
    const address = customAddresses.find(addr => addr.id === id);
    if (!address) return;

    try {
      // Remove from WebSocket monitoring
      await apiService.removeAddressMonitoring(address.address);
      
      // Remove from local state
      setCustomAddresses(prev => prev.filter(addr => addr.id !== id));
      
      console.log(`Removed ${address.address} from monitoring`);
    } catch (error) {
      console.error('Failed to remove address monitoring:', error);
      setWriteError(`Failed to remove monitoring for ${address.address}: ${error}`);
      setTimeout(() => setWriteError(null), 5000);
    }
  };

  const writeCustomAddress = async () => {
    if (!writeAddress.trim() || writeValue.trim() === '') {
      setWriteError('Both address and value are required');
      return;
    }

    setIsWriting(true);
    setWriteError(null);

    try {
      // Parse value - support numbers, true/false strings
      let parsedValue: number | boolean;
      const lowerValue = writeValue.toLowerCase().trim();
      
      if (lowerValue === 'true') {
        parsedValue = true;
      } else if (lowerValue === 'false') {
        parsedValue = false;
      } else {
        const numValue = parseFloat(writeValue);
        if (isNaN(numValue)) {
          throw new Error('Value must be a number, "true", or "false"');
        }
        parsedValue = numValue;
      }

      console.log(`Writing ${parsedValue} to ${writeAddress}`);
      const result = await apiService.writeCustomAddress(writeAddress.trim(), parsedValue);
      
      console.log('Write result:', result);
      
      // Clear only the value, keep the address
      setWriteValue('');
      
      // Show success message briefly
      setWriteError(`✅ Successfully wrote ${parsedValue} to ${writeAddress.trim()}`);
      setTimeout(() => setWriteError(null), 3000);
      
    } catch (error: any) {
      console.error('Write operation failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      setWriteError(`❌ Write failed: ${errorMessage}`);
    } finally {
      setIsWriting(false);
    }
  };

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
              <div>
                <span
                  className="font-medium"
                  style={{
                    color: connectionStatus ? currentTheme.colors.success : currentTheme.colors.danger
                  }}
                >
                  {connectionStatus ? 'Connected to Backend' : 'Disconnected from Backend'}
                </span>
                <div className="text-sm opacity-75">
                  WebSocket: {connectionStatus ? 'Active' : 'Inactive'} | 
                  Custom Monitoring: {wsConnected ? 'Active' : 'Inactive'} |
                  Backend API: {connectionStatus ? 'Available' : 'Check if backend server is running on :8000'}
                </div>
              </div>
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
          {/* Real-time Custom Bit Monitoring Section */}
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
              🔄 Real-time Custom Address Monitoring
            </h3>
            <p className="text-sm mb-4" style={{ color: currentTheme.colors.textSecondary }}>
              Add PLC addresses to monitor in real-time via WebSocket connection. Updates automatically at 300ms intervals.
            </p>
            
            {/* Add New Address */}
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter PLC address (e.g., M1.0, VD100)"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.textPrimary
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomAddress()}
                />
                <button
                  onClick={() => addCustomAddress()}
                  disabled={!newAddress.trim() || !connectionStatus}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: `${currentTheme.colors.brand}20`,
                    border: `1px solid ${currentTheme.colors.brand}40`,
                    color: currentTheme.colors.brand
                  }}
                >
                  Add Monitor
                </button>
              </div>
            </div>

            {/* Write to Address */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.warning}10`, border: `1px solid ${currentTheme.colors.warning}30` }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: currentTheme.colors.warning }}>
                ⚠️ Write to PLC Address (Use with caution!)
              </h4>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={writeAddress}
                  onChange={(e) => setWriteAddress(e.target.value)}
                  placeholder="PLC address"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.textPrimary
                  }}
                />
                <input
                  type="text"
                  value={writeValue}
                  onChange={(e) => setWriteValue(e.target.value)}
                  placeholder="Value (number, true, false)"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.textPrimary
                  }}
                />
                <button
                  onClick={writeCustomAddress}
                  disabled={!writeAddress.trim() || writeValue.trim() === '' || !connectionStatus || isWriting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: `${currentTheme.colors.danger}20`,
                    border: `1px solid ${currentTheme.colors.danger}40`,
                    color: currentTheme.colors.danger
                  }}
                >
                  {isWriting ? 'Writing...' : 'Write'}
                </button>
              </div>
              
              {writeError && (
                <div className="text-sm p-3 rounded-md" style={{ color: currentTheme.colors.danger, backgroundColor: `${currentTheme.colors.danger}15` }}>
                  {writeError}
                </div>
              )}
              
              <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                <strong>Supported values:</strong> Numbers (1, 2.5, -10), Booleans (true, false)
              </div>
            </div>

            {/* Custom Addresses List */}
            {customAddresses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: currentTheme.colors.secondary,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm font-mono font-semibold"
                        style={{ color: currentTheme.colors.brand }}
                      >
                        {address.address}
                      </span>
                      <button
                        onClick={() => removeCustomAddress(address.id)}
                        className="text-xs px-2 py-1 rounded transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: `${currentTheme.colors.danger}20`,
                          color: currentTheme.colors.danger
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    {address.error ? (
                      <div
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${currentTheme.colors.danger}20`,
                          color: currentTheme.colors.danger
                        }}
                      >
                        Error: {address.error}
                      </div>
                    ) : (
                      <div
                        className="font-mono text-sm"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        {address.value !== null && address.value !== 'No data' ? (
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: typeof address.value === 'boolean' 
                                ? (address.value ? `${currentTheme.colors.success}20` : `${currentTheme.colors.danger}20`)
                                : `${currentTheme.colors.info}20`,
                              color: typeof address.value === 'boolean' 
                                ? (address.value ? currentTheme.colors.success : currentTheme.colors.danger)
                                : currentTheme.colors.info
                            }}
                          >
                            {String(address.value)}
                          </span>
                        ) : (
                          <span style={{ color: currentTheme.colors.textSecondary }}>
                            {address.value}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div
                      className="text-xs mt-2"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      Last: {address.lastRead}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {customAddresses.length === 0 && (
              <div
                className="text-center py-8"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                No custom addresses added yet. Enter a PLC address above to start real-time monitoring.
              </div>
            )}
          </div>
          
          {/* Backend Discovery Status Section */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              backgroundColor: `${currentTheme.colors.info}10`,
              border: `1px solid ${currentTheme.colors.info}30`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold border-b pb-2"
                style={{ 
                  color: currentTheme.colors.info,
                  borderColor: currentTheme.colors.info
                }}
              >
                🔍 Backend Discovery Status
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resetDiscovery();
                    apiService.reconnectWithDiscovery();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: `${currentTheme.colors.info}20`,
                    border: `1px solid ${currentTheme.colors.info}40`,
                    color: currentTheme.colors.info
                  }}
                >
                  Retry Discovery
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 Manual discovery trigger');
                    resetDiscovery();
                    discoverBackend();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: `${currentTheme.colors.warning}20`,
                    border: `1px solid ${currentTheme.colors.warning}40`,
                    color: currentTheme.colors.warning
                  }}
                >
                  Test Discovery
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 Manual state test');
                    setDiscoveryInfo(prev => ({
                      ...prev,
                      currentIP: '192.168.1.100',
                      testedIPs: ['192.168.1.1', '192.168.1.2', '192.168.1.100'],
                      totalIPs: 10,
                      progress: 30,
                      isDiscovering: true,
                      startTime: new Date()
                    }));
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: `${currentTheme.colors.success}20`,
                    border: `1px solid ${currentTheme.colors.success}40`,
                    color: currentTheme.colors.success
                  }}
                >
                  Test UI
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Status and Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Status:</span>
                  <span style={{ color: currentTheme.colors.textPrimary }}>
                    {discoveryInfo.isDiscovering ? '🔍 Discovering...' : '✅ Discovery Complete'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Method:</span>
                  <span style={{ color: currentTheme.colors.textPrimary }}>
                    {discoveryInfo.discoveryMethod || 'Unknown'}
                  </span>
                </div>
              </div>
              
              {/* Timing Information */}
              {discoveryInfo.startTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Started:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {discoveryInfo.startTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Elapsed:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {discoveryInfo.startTime ? 
                        ((currentTime.getTime() - discoveryInfo.startTime.getTime()) / 1000).toFixed(1) + 's' : 
                        discoveryInfo.elapsedTime ? 
                        (discoveryInfo.elapsedTime / 1000).toFixed(1) + 's' : 
                        '0.0s'
                      }
                    </span>
                  </div>
                </div>
              )}
              
              {/* Connection Attempts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Attempts:</span>
                  <span style={{ color: currentTheme.colors.textPrimary }}>
                    {discoveryInfo.connectionAttempts}
                  </span>
                </div>
                {discoveryInfo.lastAttemptTime && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Last Attempt:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {discoveryInfo.lastAttemptTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Discovered URL */}
              {discoveryInfo.discoveredUrl && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Discovered URL:</span>
                  <span className="font-mono text-xs" style={{ color: currentTheme.colors.textPrimary }}>
                    {discoveryInfo.discoveredUrl}
                  </span>
                </div>
              )}
              
              {/* Network Information */}
              {discoveryInfo.networkInfo && (
                <div className="space-y-2">
                  <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                    Network Information:
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: currentTheme.colors.textSecondary }}>Local IP:</span>
                      <span className="font-mono text-xs" style={{ color: currentTheme.colors.textPrimary }}>
                        {discoveryInfo.networkInfo.localIP || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: currentTheme.colors.textSecondary }}>Subnets:</span>
                      <span className="font-mono text-xs" style={{ color: currentTheme.colors.textPrimary }}>
                        {discoveryInfo.networkInfo.subnets.length}
                      </span>
                    </div>
                  </div>
                  {discoveryInfo.networkInfo.subnets.length > 0 && (
                    <div className="text-xs font-mono" style={{ color: currentTheme.colors.textSecondary }}>
                      Scanning: {discoveryInfo.networkInfo.subnets.slice(0, 3).join(', ')}
                      {discoveryInfo.networkInfo.subnets.length > 3 && '...'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Discovery Configuration */}
              <div className="space-y-2">
                <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Discovery Configuration:
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Port:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {DISCOVERY_CONFIG.BACKEND_PORT}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Timeout:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {DISCOVERY_CONFIG.CHECK_TIMEOUT}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Concurrent:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {DISCOVERY_CONFIG.SCAN_RANGE.MAX_CONCURRENT}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>Quick Scan:</span>
                    <span style={{ color: currentTheme.colors.textPrimary }}>
                      {DISCOVERY_CONFIG.SCAN_RANGE.QUICK_SCAN_ONLY ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Cache Information */}
              <div className="flex justify-between text-sm">
                <span style={{ color: currentTheme.colors.textSecondary }}>Cache Size:</span>
                <span style={{ color: currentTheme.colors.textPrimary }}>
                  {discoveryInfo.cacheSize} entries
                </span>
              </div>
              
              {/* Real-time Discovery Progress */}
              {discoveryInfo.isDiscovering && (
                <>
                  {/* Current IP and Subnet */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                      Currently Testing:
                    </div>
                    <div 
                      className="p-3 rounded-lg font-mono text-sm text-center animate-pulse"
                      style={{
                        backgroundColor: `${currentTheme.colors.info}20`,
                        border: `1px solid ${currentTheme.colors.info}40`,
                        color: currentTheme.colors.info
                      }}
                    >
                      {discoveryInfo.currentIP || 'Testing...'}
                    </div>
                    {discoveryInfo.currentSubnet && (
                      <div className="text-xs text-center" style={{ color: currentTheme.colors.textSecondary }}>
                        Subnet: {discoveryInfo.currentSubnet}
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: currentTheme.colors.textSecondary }}>Progress:</span>
                      <span style={{ color: currentTheme.colors.textPrimary }}>
                        {discoveryInfo.testedIPs.length} / {discoveryInfo.totalIPs} ({discoveryInfo.progress.toFixed(1)}%)
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${discoveryInfo.progress}%`,
                          backgroundColor: currentTheme.colors.info
                        }}
                      />
                    </div>
                    
                    {/* Connection Speed */}
                    {discoveryInfo.startTime && discoveryInfo.testedIPs.length > 0 && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: currentTheme.colors.textSecondary }}>Speed:</span>
                        <span style={{ color: currentTheme.colors.textPrimary }}>
                          {((discoveryInfo.testedIPs.length / ((currentTime.getTime() - discoveryInfo.startTime.getTime()) / 1000)) || 0).toFixed(1)} IPs/sec
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Recently Tested IPs */}
                  {discoveryInfo.testedIPs.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                        Recently Tested IPs:
                      </div>
                      <div className="text-xs font-mono" style={{ color: currentTheme.colors.textPrimary }}>
                        {discoveryInfo.testedIPs.slice(-5).join(' → ')}
                      </div>
                    </div>
                  )}
                  
                  {/* Estimated Time Remaining */}
                  {discoveryInfo.startTime && discoveryInfo.progress > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: currentTheme.colors.textSecondary }}>ETA:</span>
                      <span style={{ color: currentTheme.colors.textPrimary }}>
                        {discoveryInfo.progress < 100 ? 
                          `${(((currentTime.getTime() - discoveryInfo.startTime.getTime()) / discoveryInfo.progress) * (100 - discoveryInfo.progress) / 1000).toFixed(1)}s remaining` : 
                          'Complete'
                        }
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
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