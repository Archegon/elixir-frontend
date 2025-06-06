/**
 * Backend Connection Hook
 * 
 * React hook for managing backend connection status and auto-discovery
 */

import { useState, useEffect, useCallback } from 'react';
import { getBackendUrls, resetDiscovery, CONNECTION_CONFIG } from '../config/connection.config';

export interface BackendConnectionState {
  isConnected: boolean;
  isDiscovering: boolean;
  apiUrl: string | null;
  wsUrl: string | null;
  error: string | null;
  lastDiscovery: Date | null;
}

export interface BackendConnectionActions {
  reconnect: () => Promise<void>;
  resetAndDiscover: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

export function useBackendConnection(): BackendConnectionState & BackendConnectionActions {
  const [state, setState] = useState<BackendConnectionState>({
    isConnected: false,
    isDiscovering: true,
    apiUrl: null,
    wsUrl: null,
    error: null,
    lastDiscovery: null,
  });

  // Test if backend is reachable
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { apiUrl } = await getBackendUrls();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Discover backend URLs
  const discoverBackend = useCallback(async () => {
    setState(prev => ({ ...prev, isDiscovering: true, error: null }));

    try {
      const { apiUrl, wsUrl } = await getBackendUrls();
      const isConnected = await testConnection();

      setState(prev => ({
        ...prev,
        isConnected,
        isDiscovering: false,
        apiUrl,
        wsUrl,
        error: null,
        lastDiscovery: new Date(),
      }));

      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.log(`🎯 Backend discovery complete - Connected: ${isConnected}`);
        console.log(`API: ${apiUrl}, WS: ${wsUrl}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Discovery failed';
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isDiscovering: false,
        error: errorMessage,
        lastDiscovery: new Date(),
      }));

      if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
        console.error('❌ Backend discovery failed:', errorMessage);
      }
    }
  }, [testConnection]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
      console.log('🔄 Manual reconnection requested...');
    }
    
    await discoverBackend();
  }, [discoverBackend]);

  // Reset and rediscover
  const resetAndDiscover = useCallback(async () => {
    if (CONNECTION_CONFIG.DEV.CONSOLE_LOGGING) {
      console.log('🔄 Resetting discovery and reconnecting...');
    }
    
    resetDiscovery();
    await discoverBackend();
  }, [discoverBackend]);

  // Initial discovery on mount
  useEffect(() => {
    discoverBackend();
  }, [discoverBackend]);

  // Periodic connection check
  useEffect(() => {
    if (!state.isConnected && !state.isDiscovering) {
      const interval = setInterval(async () => {
        const isConnected = await testConnection();
        if (isConnected !== state.isConnected) {
          setState(prev => ({ ...prev, isConnected }));
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.isDiscovering, testConnection]);

  return {
    ...state,
    reconnect,
    resetAndDiscover,
    testConnection,
  };
} 