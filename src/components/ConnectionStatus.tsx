/**
 * Connection Status Component
 * 
 * Displays backend connection status with comprehensive discovery information
 */

import React, { useState } from 'react';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { getDiscoveryStats, DISCOVERY_CONFIG } from '../config/connection.config';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  showControls?: boolean;
  showDiscoveryInfo?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showDetails = false,
  showControls = true,
  showDiscoveryInfo = false,
}) => {
  const {
    isConnected,
    isDiscovering,
    apiUrl,
    wsUrl,
    error,
    lastDiscovery,
    reconnect,
    resetAndDiscover,
  } = useBackendConnection();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const getStatusColor = () => {
    if (isDiscovering) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (isConnected) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (isDiscovering) return '🔍';
    if (isConnected) return '✅';
    return '❌';
  };

  const getStatusText = () => {
    if (isDiscovering) return 'Discovering backend...';
    if (isConnected) return 'Connected to verified backend';
    return error ? `Connection failed: ${error}` : 'Disconnected from backend';
  };

  const discoveryStats = getDiscoveryStats();

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        {showControls && !isDiscovering && (
          <div className="flex gap-2">
            <button
              onClick={reconnect}
              className="px-3 py-1 text-sm bg-white border border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              title="Reconnect to backend"
            >
              🔄 Reconnect
            </button>
            <button
              onClick={resetAndDiscover}
              className="px-3 py-1 text-sm bg-white border border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              title="Reset discovery and reconnect"
            >
              🔄 Reset & Discover
            </button>
            {(showDetails || showDiscoveryInfo) && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-1 text-sm bg-white border border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
                title="Toggle advanced information"
              >
                {showAdvanced ? '📋 Less' : '📋 More'}
              </button>
            )}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 space-y-2 text-sm">
          {apiUrl && (
            <div className="flex items-center gap-2">
              <span className="font-medium">API:</span>
              <code className="px-2 py-1 bg-white bg-opacity-50 rounded flex-1">{apiUrl}</code>
              <span className="text-xs opacity-75">✓ Verified</span>
            </div>
          )}
          
          {wsUrl && (
            <div className="flex items-center gap-2">
              <span className="font-medium">WebSocket:</span>
              <code className="px-2 py-1 bg-white bg-opacity-50 rounded flex-1">{wsUrl}</code>
            </div>
          )}
          
          {lastDiscovery && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Last Discovery:</span>
              <span>{lastDiscovery.toLocaleTimeString()}</span>
            </div>
          )}

          {discoveryStats.cacheSize > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Cached Results:</span>
              <span>{discoveryStats.cacheSize} URLs</span>
            </div>
          )}
        </div>
      )}

      {showDiscoveryInfo && showAdvanced && (
        <div className="mt-4 p-3 bg-white bg-opacity-30 rounded border border-current border-opacity-30">
          <div className="text-sm font-medium mb-2">🔍 Discovery Configuration</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Auto-discovery:</span>
              <span className="font-mono">{DISCOVERY_CONFIG.ENABLED ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span>Backend Port:</span>
              <span className="font-mono">{DISCOVERY_CONFIG.BACKEND_PORT}</span>
            </div>
            <div className="flex justify-between">
              <span>Scan Mode:</span>
              <span className="font-mono">
                {DISCOVERY_CONFIG.SCAN_RANGE.QUICK_SCAN_ONLY ? 'Quick' : 'Full Range'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IP Range:</span>
              <span className="font-mono">
                {DISCOVERY_CONFIG.SCAN_RANGE.START}-{DISCOVERY_CONFIG.SCAN_RANGE.END}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max Concurrent:</span>
              <span className="font-mono">{DISCOVERY_CONFIG.SCAN_RANGE.MAX_CONCURRENT}</span>
            </div>
            <div className="flex justify-between">
              <span>Timeout:</span>
              <span className="font-mono">{DISCOVERY_CONFIG.CHECK_TIMEOUT}ms</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium mb-1">🛡️ Verification Settings</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Expected Service:</span>
                <span className="font-mono">{DISCOVERY_CONFIG.VERIFICATION.EXPECTED_SERVICE}</span>
              </div>
              <div className="flex justify-between">
                <span>Version Pattern:</span>
                <span className="font-mono">{DISCOVERY_CONFIG.VERIFICATION.EXPECTED_VERSION_PATTERN}</span>
              </div>
              <div className="flex justify-between">
                <span>Verify Endpoints:</span>
                <span className="font-mono">{DISCOVERY_CONFIG.VERIFICATION.VERIFY_ENDPOINTS.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium mb-1">🌐 Scan Subnets</div>
            <div className="flex flex-wrap gap-1">
              {DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.map((subnet, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-mono"
                >
                  {subnet}.x
                </span>
              ))}
            </div>
          </div>

          {!DISCOVERY_CONFIG.SCAN_RANGE.QUICK_SCAN_ONLY && (
            <div className="mt-2 text-xs opacity-75">
              💡 Full range scan: Testing {DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.length} × {DISCOVERY_CONFIG.SCAN_RANGE.END - DISCOVERY_CONFIG.SCAN_RANGE.START + 1} = {DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.length * (DISCOVERY_CONFIG.SCAN_RANGE.END - DISCOVERY_CONFIG.SCAN_RANGE.START + 1)} IPs
            </div>
          )}
        </div>
      )}

      {isDiscovering && (
        <div className="mt-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin text-lg">🔍</div>
            <span>Scanning network for backend service...</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div className="bg-current bg-opacity-60 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs mt-1 opacity-75">
            Testing {DISCOVERY_CONFIG.SCAN_RANGE.QUICK_SCAN_ONLY ? 'common' : 'all'} IPs with service verification
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 