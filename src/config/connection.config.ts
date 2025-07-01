/**
 * Connection Configuration for Elixir Frontend
 * 
 * Centralized configuration for backend connection settings with comprehensive auto-discovery.
 * API endpoints are defined separately in api-endpoints.ts
 */

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) || fallback : fallback;
};

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key];
  return value ? value === 'true' : fallback;
};

// Enhanced backend discovery configuration
export const DISCOVERY_CONFIG = {
  // Default backend port (configurable via env)
  BACKEND_PORT: getEnvNumber('VITE_BACKEND_PORT', 8000),
  
  // Connection check timeout per attempt
  CHECK_TIMEOUT: getEnvNumber('VITE_DISCOVERY_TIMEOUT', 2000),
  
  // Enable automatic discovery (can be disabled via env)
  ENABLED: getEnvBoolean('VITE_AUTO_DISCOVERY', true),
  
  // IP range scanning configuration
  SCAN_RANGE: {
    // Start and end of IP range to scan (e.g., 192.168.1.1 to 192.168.1.254)
    START: getEnvNumber('VITE_SCAN_START', 1),
    END: getEnvNumber('VITE_SCAN_END', 254),
    
    // Maximum concurrent scans to avoid overwhelming the network
    MAX_CONCURRENT: getEnvNumber('VITE_MAX_CONCURRENT_SCANS', 20),
    
    // Common subnets to scan (only 192.168.x.x private networks)
    COMMON_SUBNETS: [
      '192.168.1',
      '192.168.0', 
      '192.168.2',
      '192.168.3',
      '192.168.4',
      '192.168.5',
      '192.168.10',
      '192.168.11',
      '192.168.20',
      '192.168.100',
    ],
    
    // Skip scanning entire range if true (use only common IPs)
    QUICK_SCAN_ONLY: getEnvBoolean('VITE_QUICK_SCAN_ONLY', false),
  },
  
  // Backend verification configuration
  VERIFICATION: {
    // Expected service identifier in health response
    EXPECTED_SERVICE: getEnvVar('VITE_EXPECTED_SERVICE', 'elixir-backend'),
    
    // Expected API version pattern
    EXPECTED_VERSION_PATTERN: getEnvVar('VITE_EXPECTED_VERSION', '^1\\.'),
    
    // Additional endpoints to verify
    VERIFY_ENDPOINTS: ['/health'],
    
    // Expected response structure indicators
    EXPECTED_FIELDS: ['status', 'service', 'version'],
  },
  
  // Fallback URLs to try if discovery fails
  FALLBACK_URLS: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ],
};

// Enhanced backend discovery service
class BackendDiscovery {
  private static instance: BackendDiscovery;
  private discoveredBaseUrl: string | null = null;
  private discoveredWsUrl: string | null = null;
  private isDiscovering = false;
  private discoveryCache: Map<string, { valid: boolean; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  static getInstance(): BackendDiscovery {
    if (!this.instance) {
      this.instance = new BackendDiscovery();
    }
    return this.instance;
  }

  async discoverBackend(): Promise<{ apiUrl: string; wsUrl: string }> {
    if (this.discoveredBaseUrl && this.discoveredWsUrl) {
      return { 
        apiUrl: this.discoveredBaseUrl, 
        wsUrl: this.discoveredWsUrl 
      };
    }

    if (this.isDiscovering) {
      // Wait for ongoing discovery
      while (this.isDiscovering) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.discoveredBaseUrl && this.discoveredWsUrl) {
        return { 
          apiUrl: this.discoveredBaseUrl, 
          wsUrl: this.discoveredWsUrl 
        };
      }
    }

    this.isDiscovering = true;

    try {
      // First try explicit environment variables if set
      const explicitApiUrl = import.meta.env.VITE_API_BASE_URL;
      const explicitWsUrl = import.meta.env.VITE_WS_BASE_URL;
      
      if (explicitApiUrl && explicitWsUrl) {
        console.log('🎯 Using explicit backend URLs from environment');
        const isValid = await this.verifyBackendService(explicitApiUrl);
        if (isValid) {
          const result = { apiUrl: explicitApiUrl, wsUrl: explicitWsUrl };
          this.discoveredBaseUrl = explicitApiUrl;
          this.discoveredWsUrl = explicitWsUrl;
          return result;
        } else {
          console.warn('⚠️ Explicit backend URL failed verification, falling back to discovery');
        }
      }

      if (!DISCOVERY_CONFIG.ENABLED) {
        console.log('🔒 Auto-discovery disabled, using fallback');
        const fallbackUrl = DISCOVERY_CONFIG.FALLBACK_URLS[0];
        const result = { 
          apiUrl: fallbackUrl, 
          wsUrl: fallbackUrl.replace('http', 'ws') 
        };
        this.discoveredBaseUrl = result.apiUrl;
        this.discoveredWsUrl = result.wsUrl;
        return result;
      }

      console.log('🔍 Starting comprehensive backend discovery...');
      
      // Get all candidate URLs to test
      const candidateUrls = await this.getCandidateUrls();
      console.log(`📡 Testing ${candidateUrls.length} potential backend URLs...`);
      
      // Test URLs with concurrency control
      const validUrl = await this.testUrlsConcurrently(candidateUrls);
      
      if (validUrl) {
        const apiUrl = validUrl;
        const wsUrl = validUrl.replace('http', 'ws');
        
        console.log(`✅ Backend discovered and verified at: ${apiUrl}`);
        this.discoveredBaseUrl = apiUrl;
        this.discoveredWsUrl = wsUrl;
        
        return { apiUrl, wsUrl };
      }

      // If discovery fails, use fallback
      console.warn('⚠️ Backend discovery failed, using fallback URLs');
      const fallbackUrl = DISCOVERY_CONFIG.FALLBACK_URLS[0];
      const result = { 
        apiUrl: fallbackUrl, 
        wsUrl: fallbackUrl.replace('http', 'ws') 
      };
      this.discoveredBaseUrl = result.apiUrl;
      this.discoveredWsUrl = result.wsUrl;
      return result;

    } finally {
      this.isDiscovering = false;
    }
  }

  private async getCandidateUrls(): Promise<string[]> {
    const port = DISCOVERY_CONFIG.BACKEND_PORT;
    const urls: string[] = [];

    // Always try localhost first (highest priority)
    urls.push(`http://localhost:${port}`);
    urls.push(`http://127.0.0.1:${port}`);

    // Get local network IP and add it
    try {
      const localIp = await this.getLocalNetworkIP();
      if (localIp) {
        urls.push(`http://${localIp}:${port}`);
        
        // Add the detected subnet to common subnets (only if it's a 192.168.x.x range)
        const detectedSubnet = localIp.split('.').slice(0, 3).join('.');
        if (detectedSubnet.startsWith('192.168.') && !DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.includes(detectedSubnet)) {
          DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.unshift(detectedSubnet);
          console.log(`🔍 Added detected 192.168.x.x subnet: ${detectedSubnet}`);
        }
      }
    } catch (error) {
      console.warn('Could not determine local network IP:', error);
    }

    // Add comprehensive IP range scanning
    if (!DISCOVERY_CONFIG.SCAN_RANGE.QUICK_SCAN_ONLY) {
      const rangeIps = await this.generateIPRange();
      urls.push(...rangeIps);
    } else {
      // Quick scan - just common IPs
      const commonIps = this.generateCommonIPs();
      urls.push(...commonIps);
    }

    // Add fallback URLs
    urls.push(...DISCOVERY_CONFIG.FALLBACK_URLS);

    // Remove duplicates and return
    return [...new Set(urls)];
  }

  private async generateIPRange(): Promise<string[]> {
    const port = DISCOVERY_CONFIG.BACKEND_PORT;
    const urls: string[] = [];

    // Generate IPs for each common subnet (filter to only 192.168.x.x ranges)
    const filtered192Subnets = DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.filter(subnet => 
      subnet.startsWith('192.168.')
    );
    
    for (const subnet of filtered192Subnets) {
      for (let i = DISCOVERY_CONFIG.SCAN_RANGE.START; i <= DISCOVERY_CONFIG.SCAN_RANGE.END; i++) {
        urls.push(`http://${subnet}.${i}:${port}`);
      }
    }

    if (filtered192Subnets.length > 0) {
      console.log(`🔍 Scanning ${filtered192Subnets.length} 192.168.x.x subnets for backend discovery`);
    }

    return urls;
  }

  private generateCommonIPs(): string[] {
    const port = DISCOVERY_CONFIG.BACKEND_PORT;
    const urls: string[] = [];
    const commonLastOctets = [1, 2, 10, 20, 50, 100, 101, 110, 150, 200, 254];

    // Filter to only 192.168.x.x subnets for quick scan
    const filtered192Subnets = DISCOVERY_CONFIG.SCAN_RANGE.COMMON_SUBNETS.filter(subnet => 
      subnet.startsWith('192.168.')
    );

    for (const subnet of filtered192Subnets) {
      for (const lastOctet of commonLastOctets) {
        urls.push(`http://${subnet}.${lastOctet}:${port}`);
      }
    }

    return urls;
  }

  private async testUrlsConcurrently(urls: string[]): Promise<string | null> {
    const maxConcurrent = DISCOVERY_CONFIG.SCAN_RANGE.MAX_CONCURRENT;
    const chunks = this.chunkArray(urls, maxConcurrent);
    
    for (const chunk of chunks) {
      const promises = chunk.map(url => this.testBackendConnection(url));
      const results = await Promise.allSettled(promises);
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'fulfilled' && (results[i] as PromiseFulfilledResult<boolean>).value) {
          return chunk[i];
        }
      }
    }
    
    return null;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const results = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
    }
    return results;
  }

  private async getLocalNetworkIP(): Promise<string | null> {
    try {
      // Create a dummy WebRTC connection to get local IP
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      return new Promise((resolve) => {
        let resolved = false;
        
        pc.onicecandidate = (event) => {
          if (!resolved && event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match && !match[1].startsWith('127.') && !match[1].startsWith('169.254.')) {
              resolved = true;
              pc.close();
              resolve(match[1]);
            }
          }
        };

        // Create a data channel to trigger ICE gathering
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        // Timeout after 3 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            pc.close();
            resolve(null);
          }
        }, 3000);
      });
    } catch (error) {
      console.warn('WebRTC IP detection failed:', error);
      return null;
    }
  }

  private async testBackendConnection(url: string): Promise<boolean> {
    // Check cache first
    const cached = this.discoveryCache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.valid;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DISCOVERY_CONFIG.CHECK_TIMEOUT);

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.discoveryCache.set(url, { valid: false, timestamp: Date.now() });
        return false;
      }

      // Verify this is our specific backend service
      const isValid = await this.verifyBackendService(url, response);
      this.discoveryCache.set(url, { valid: isValid, timestamp: Date.now() });
      
      return isValid;
    } catch (error) {
      this.discoveryCache.set(url, { valid: false, timestamp: Date.now() });
      return false;
    }
  }

  private async verifyBackendService(url: string, healthResponse?: Response): Promise<boolean> {
    try {
      let response = healthResponse;
      
      if (!response) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DISCOVERY_CONFIG.CHECK_TIMEOUT);

        response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
        });

        clearTimeout(timeoutId);
      }

      if (!response.ok) return false;

      const data = await response.json();
      
      // Check for expected service identifier
      if (DISCOVERY_CONFIG.VERIFICATION.EXPECTED_SERVICE) {
        const serviceName = data.service || data.name || data.app;
        if (!serviceName || !serviceName.toLowerCase().includes(DISCOVERY_CONFIG.VERIFICATION.EXPECTED_SERVICE.toLowerCase())) {
          console.log(`❌ Service verification failed for ${url}: expected "${DISCOVERY_CONFIG.VERIFICATION.EXPECTED_SERVICE}", got "${serviceName}"`);
          return false;
        }
      }

      // Check for expected version pattern
      if (DISCOVERY_CONFIG.VERIFICATION.EXPECTED_VERSION_PATTERN && data.version) {
        const versionRegex = new RegExp(DISCOVERY_CONFIG.VERIFICATION.EXPECTED_VERSION_PATTERN);
        if (!versionRegex.test(data.version)) {
          console.log(`❌ Version verification failed for ${url}: expected pattern "${DISCOVERY_CONFIG.VERIFICATION.EXPECTED_VERSION_PATTERN}", got "${data.version}"`);
          return false;
        }
      }

      // Check for expected response fields
      const hasRequiredFields = DISCOVERY_CONFIG.VERIFICATION.EXPECTED_FIELDS.every(field => 
        data.hasOwnProperty(field)
      );
      
      if (!hasRequiredFields) {
        console.log(`❌ Field verification failed for ${url}: missing required fields`);
        return false;
      }

      // Additional endpoint verification (skip first endpoint as it's already tested)
      const additionalEndpoints = DISCOVERY_CONFIG.VERIFICATION.VERIFY_ENDPOINTS.slice(1);
      for (const endpoint of additionalEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);

          const endpointResponse = await fetch(`${url}${endpoint}`, {
            method: 'GET',
            signal: controller.signal,
            mode: 'cors',
          });

          clearTimeout(timeoutId);

          if (!endpointResponse.ok) {
            console.log(`❌ Endpoint verification failed for ${url}${endpoint}`);
            return false;
          }
        } catch (error) {
          console.log(`❌ Endpoint verification error for ${url}${endpoint}:`, error);
          return false;
        }
      }

      console.log(`✅ Backend service verified at ${url}`);
      return true;

    } catch (error) {
      console.log(`❌ Backend verification error for ${url}:`, error);
      return false;
    }
  }

  reset(): void {
    this.discoveredBaseUrl = null;
    this.discoveredWsUrl = null;
    this.discoveryCache.clear();
  }

  // Get discovery statistics
  getDiscoveryStats(): { cacheSize: number; lastDiscovery: Date | null } {
    return {
      cacheSize: this.discoveryCache.size,
      lastDiscovery: this.discoveredBaseUrl ? new Date() : null,
    };
  }
}

// Global discovery instance
const discovery = BackendDiscovery.getInstance();

// Initialize discovery on import (for development)
let discoveryPromise: Promise<{ apiUrl: string; wsUrl: string }> | null = null;

const getDiscoveredUrls = async (): Promise<{ apiUrl: string; wsUrl: string }> => {
  if (!discoveryPromise) {
    discoveryPromise = discovery.discoverBackend();
  }
  return discoveryPromise;
};

// Connection Configuration - Enhanced with auto-discovery
export const CONNECTION_CONFIG = {
  // Base URLs - will be determined by discovery or environment variables
  get API_BASE_URL(): string {
    // This will be replaced by discovered URL during runtime
    return getEnvVar('VITE_API_BASE_URL', 
    isDevelopment ? 'http://localhost:8000' : 'https://your-production-domain.com'
    );
  },
  
  get WS_BASE_URL(): string {
    // This will be replaced by discovered URL during runtime
    return getEnvVar('VITE_WS_BASE_URL', 
    isDevelopment ? 'ws://localhost:8000' : 'wss://your-production-domain.com'
    );
  },

  // HTTP Configuration
  HTTP: {
    TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 3000),
    RETRY_ATTEMPTS: getEnvNumber('VITE_HTTP_RETRY_ATTEMPTS', 3),
    RETRY_DELAY: getEnvNumber('VITE_HTTP_RETRY_DELAY', 500),
  },

  // WebSocket Configuration
  WEBSOCKET: {
    RECONNECT_INTERVAL: getEnvNumber('VITE_WS_RECONNECT_INTERVAL', 500),
    MAX_RECONNECT_ATTEMPTS: getEnvNumber('VITE_WS_MAX_RECONNECT_ATTEMPTS', 5),
    HEARTBEAT_INTERVAL: getEnvNumber('VITE_WS_HEARTBEAT_INTERVAL', 30000),
    CONNECTION_TIMEOUT: getEnvNumber('VITE_WS_CONNECTION_TIMEOUT', 3000),
  },

  // Command Configuration
  COMMANDS: {
    TIMEOUT: getEnvNumber('VITE_COMMAND_TIMEOUT', 3000),
    PLC_CONFIRMATION_TIMEOUT: getEnvNumber('VITE_PLC_CONFIRMATION_TIMEOUT', 3000),
    RATE_LIMIT: {
      MAX_COMMANDS: getEnvNumber('VITE_RATE_LIMIT_MAX_COMMANDS', 5),
      TIME_WINDOW: getEnvNumber('VITE_RATE_LIMIT_TIME_WINDOW', 1000),
    },
  },

  // Development Settings
  DEV: {
    DEBUG: getEnvBoolean('VITE_DEBUG_MODE', isDevelopment),
    
    CONSOLE_LOGGING: getEnvBoolean('VITE_CONSOLE_LOGGING', isDevelopment),
  },
};

// Enhanced helper functions that use discovery
export const buildApiUrl = async (endpoint: string): Promise<string> => {
  const { apiUrl } = await getDiscoveredUrls();
  const baseUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const buildWsUrl = async (endpoint: string): Promise<string> => {
  const { wsUrl } = await getDiscoveredUrls();
  const baseUrl = wsUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Synchronous versions for backward compatibility
export const buildApiUrlSync = (endpoint: string): string => {
  const baseUrl = CONNECTION_CONFIG.API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const buildWsUrlSync = (endpoint: string): string => {
  const baseUrl = CONNECTION_CONFIG.WS_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Discovery utilities
export const discoverBackend = () => discovery.discoverBackend();
export const resetDiscovery = () => discovery.reset();
export const getBackendUrls = () => getDiscoveredUrls();
export const getDiscoveryStats = () => discovery.getDiscoveryStats();

// Environment utilities
export const ENV = {
  isDevelopment,
  isProduction,
  mode: import.meta.env.MODE,
} as const;

// Connection status type
export interface ConnectionStatus {
  api: boolean;
  websocket: boolean;
  plc: boolean;
  lastCheck: Date;
  discoveredUrl?: string;
}

// Export default
export default CONNECTION_CONFIG; 