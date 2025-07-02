import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api.service';
import { useBackendConnection } from '../hooks/useBackendConnection';

interface CustomAddress {
  id: string;
  address: string;
  value: any;
  lastRead: string;
  error?: string;
}

const Development: React.FC = () => {
  const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [writeAddress, setWriteAddress] = useState('');
  const [writeValue, setWriteValue] = useState('');
  const [writeError, setWriteError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  
  // Use backend connection status
  const { isConnected, apiUrl, wsUrl } = useBackendConnection();
  
  // WebSocket connection for real-time data
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection management
  useEffect(() => {
    if (!wsUrl) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${wsUrl}/ws/system-status`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected for Development page');
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
          console.log('WebSocket disconnected for Development page');
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

  // Auto-add commonly used addresses on mount
  useEffect(() => {
    const commonAddresses = ['M4.0', 'M3.2']; // M4.0 should be true, M3.2 is equalise
    commonAddresses.forEach((addr) => addCustomAddress(addr));
  }, []);

  const addCustomAddress = async (address?: string) => {
    const addressToAdd = address || newAddress.trim();
    if (!addressToAdd) return;

    // Check if address already exists
    if (customAddresses.some(addr => addr.address === addressToAdd)) {
      alert('Address already being monitored');
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
      alert(`Failed to add monitoring for ${addressToAdd}: ${error}`);
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
      alert(`Failed to remove monitoring for ${address.address}: ${error}`);
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
      alert(`Successfully wrote ${parsedValue} to ${writeAddress.trim()}`);
      
      // Clear the form
      setWriteAddress('');
      setWriteValue('');
      
    } catch (error: any) {
      console.error('Write operation failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      setWriteError(`Write failed: ${errorMessage}`);
      alert(`Write operation failed: ${errorMessage}`);
    } finally {
      setIsWriting(false);
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return (
        <span className={`font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    if (typeof value === 'number') {
      return <span className="text-blue-600 font-mono">{value}</span>;
    }
    return <span className="text-gray-600">{String(value)}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Development & Debugging</h1>
        
        {/* Backend Connection Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3">Backend Server Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">API: {isConnected ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
          {lastUpdate && (
            <div className="mt-2 text-xs text-gray-600">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
          {!isConnected && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ Backend server may not be running. Check if server is started on port 8000.
            </div>
          )}
        </div>

        {/* Real-time Custom Bit Monitoring */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔄 Real-time Custom Address Monitoring</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add PLC addresses to monitor in real-time via WebSocket connection. Updates automatically at 300ms intervals.
          </p>
          
          {/* Add New Address */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter PLC address (e.g., M4.0, DB1.DBX0.0)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addCustomAddress()}
            />
            <button
              onClick={() => addCustomAddress()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Monitor
            </button>
          </div>

          {/* Monitored Addresses */}
          {customAddresses.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Monitored Addresses ({customAddresses.length})</h3>
              <div className="grid gap-2">
                {customAddresses.map((addr) => (
                  <div key={addr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-sm font-medium text-gray-800">{addr.address}</span>
                        <div className="text-sm">
                          Value: {formatValue(addr.value)}
                        </div>
                        <span className="text-xs text-gray-500">
                          Last: {addr.lastRead}
                        </span>
                      </div>
                      {addr.error && (
                        <div className="text-xs text-red-600 mt-1">⚠️ {addr.error}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeCustomAddress(addr.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No addresses being monitored. Add one above to start real-time monitoring.
            </div>
          )}
        </div>

        {/* Write Operation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">⚠️ Write to Custom Address</h2>
          <p className="text-sm text-red-600 mb-4">
            <strong>WARNING:</strong> Writing to PLC addresses can affect system operation. Use with caution in development only.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={writeAddress}
              onChange={(e) => setWriteAddress(e.target.value)}
              placeholder="Address (e.g., M4.0)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              value={writeValue}
              onChange={(e) => setWriteValue(e.target.value)}
              placeholder="Value (number, true, false)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={writeCustomAddress}
              disabled={isWriting || !isConnected}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWriting ? 'Writing...' : 'Write Value'}
            </button>
          </div>
          
          {writeError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {writeError}
            </div>
          )}
          
          <div className="text-xs text-gray-600">
            <strong>Supported values:</strong> Numbers (1, 2.5, -10), Booleans (true, false)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Development; 