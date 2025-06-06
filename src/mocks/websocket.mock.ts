/**
 * Mock WebSocket Service
 * 
 * Simulates real-time WebSocket connections for PLC data streaming
 */

import { plcDataMock } from './plc-data.mock';
import type { PLCStatus, WebSocketMessage } from '../config/api-endpoints';

export interface MockWebSocketConfig {
  enabled: boolean;
  connectionDelay: number; // ms
  simulateDisconnections: boolean;
  disconnectionRate: number; // 0.0 to 1.0
  messageDelay: {
    min: number;
    max: number;
  };
}

const DEFAULT_WS_CONFIG: MockWebSocketConfig = {
  enabled: true,
  connectionDelay: 1000, // 1 second to connect
  simulateDisconnections: false,
  disconnectionRate: 0.01, // 1% chance of disconnection
  messageDelay: { min: 50, max: 200 },
};

// Mock WebSocket implementation
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public url: string;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private config: MockWebSocketConfig;
  private connectionTimer: NodeJS.Timeout | null = null;
  private messageTimer: NodeJS.Timeout | null = null;
  private dataSubscription: (() => void) | null = null;
  private lastDataSent: string = '';

  constructor(url: string, config: MockWebSocketConfig = DEFAULT_WS_CONFIG) {
    this.url = url;
    this.config = { ...config };
    
    console.log(`🔌 Mock WebSocket connecting to: ${url}`);
    
    if (this.config.enabled) {
      this.simulateConnection();
    } else {
      this.simulateError('WebSocket mock disabled');
    }
  }

  private simulateConnection(): void {
    this.connectionTimer = setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      console.log(`✅ Mock WebSocket connected to: ${this.url}`);
      
      // Trigger onopen event
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      
      // Start sending data
      this.startDataStreaming();
      
    }, this.config.connectionDelay);
  }

  private startDataStreaming(): void {
    // Subscribe to mock data updates
    this.dataSubscription = plcDataMock.subscribe((data: PLCStatus) => {
      this.sendDataToClient(data);
    });

    // Simulate periodic disconnections if enabled
    if (this.config.simulateDisconnections) {
      this.simulateRandomDisconnections();
    }
  }

  private sendDataToClient(data: PLCStatus): void {
    if (this.readyState !== MockWebSocket.OPEN) return;

    // Create WebSocket message
    const message: WebSocketMessage<PLCStatus> = {
      timestamp: new Date().toISOString(),
      type: 'status_update',
      data,
    };

    const messageStr = JSON.stringify(message);

    // Only send if data has changed (optimize bandwidth)
    if (messageStr === this.lastDataSent) return;
    this.lastDataSent = messageStr;

    // Simulate network delay
    const delay = this.config.messageDelay.min + 
                  Math.random() * (this.config.messageDelay.max - this.config.messageDelay.min);

    setTimeout(() => {
      if (this.readyState === MockWebSocket.OPEN && this.onmessage) {
        const event = new MessageEvent('message', { data: messageStr });
        this.onmessage(event);
      }
    }, delay);
  }

  private simulateRandomDisconnections(): void {
    const checkInterval = 10000; // Check every 10 seconds
    
    const disconnectionCheck = () => {
      if (this.readyState === MockWebSocket.OPEN && Math.random() < this.config.disconnectionRate) {
        console.warn('🔌 Mock WebSocket simulating disconnection');
        this.simulateDisconnection();
        
        // Reconnect after a delay
        setTimeout(() => {
          console.log('🔄 Mock WebSocket attempting reconnection');
          this.simulateReconnection();
        }, 2000 + Math.random() * 3000); // 2-5 second delay
      } else if (this.readyState === MockWebSocket.OPEN) {
        setTimeout(disconnectionCheck, checkInterval);
      }
    };

    setTimeout(disconnectionCheck, checkInterval);
  }

  private simulateDisconnection(): void {
    this.readyState = MockWebSocket.CLOSING;
    
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      
      if (this.onclose) {
        const event = new CloseEvent('close', {
          code: 1006, // Abnormal closure
          reason: 'Simulated network interruption',
          wasClean: false,
        });
        this.onclose(event);
      }
      
      this.cleanup();
    }, 100);
  }

  private simulateReconnection(): void {
    this.readyState = MockWebSocket.CONNECTING;
    this.simulateConnection();
  }

  private simulateError(message: string): void {
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      
      if (this.onerror) {
        const event = new Event('error');
        (event as any).message = message;
        this.onerror(event);
      }
      
      this.cleanup();
    }, 100);
  }

  private cleanup(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
    
    if (this.dataSubscription) {
      this.dataSubscription();
      this.dataSubscription = null;
    }
  }

  // Public methods
  close(code?: number, reason?: string): void {
    console.log(`🔌 Mock WebSocket closing connection to: ${this.url}`);
    
    this.readyState = MockWebSocket.CLOSING;
    
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      
      if (this.onclose) {
        const event = new CloseEvent('close', {
          code: code || 1000,
          reason: reason || 'Normal closure',
          wasClean: true,
        });
        this.onclose(event);
      }
      
      this.cleanup();
    }, 100);
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    console.log(`📤 Mock WebSocket sending data:`, data);
    // In a real WebSocket, this would send data to the server
    // For mock, we can simulate server responses if needed
  }
}

// Mock WebSocket service manager
export class MockWebSocketService {
  private static instance: MockWebSocketService;
  private config: MockWebSocketConfig = { ...DEFAULT_WS_CONFIG };
  private activeConnections: Set<MockWebSocket> = new Set();

  static getInstance(): MockWebSocketService {
    if (!this.instance) {
      this.instance = new MockWebSocketService();
    }
    return this.instance;
  }

  configure(config: Partial<MockWebSocketConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 Mock WebSocket service configured:', this.config);
  }

  getConfig(): MockWebSocketConfig {
    return { ...this.config };
  }

  createWebSocket(url: string): MockWebSocket {
    const ws = new MockWebSocket(url, this.config);
    this.activeConnections.add(ws);
    
    // Remove from active connections when closed
    const originalOnClose = ws.onclose;
    ws.onclose = (event) => {
      this.activeConnections.delete(ws);
      if (originalOnClose) {
        originalOnClose(event);
      }
    };
    
    return ws;
  }

  // Simulate network issues for all connections
  simulateNetworkIssue(duration: number = 5000): void {
    console.warn(`🌐 Simulating network issues for ${duration}ms`);
    
    this.activeConnections.forEach(ws => {
      if (ws.readyState === MockWebSocket.OPEN) {
        (ws as any).simulateDisconnection();
      }
    });
    
    // Restore connections after the issue
    setTimeout(() => {
      console.log('🌐 Network issues resolved, restoring connections');
      this.activeConnections.forEach(ws => {
        if (ws.readyState === MockWebSocket.CLOSED) {
          (ws as any).simulateReconnection();
        }
      });
    }, duration);
  }

  // Inject message to all connections
  injectMessage(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.activeConnections.forEach(ws => {
      if (ws.readyState === MockWebSocket.OPEN && ws.onmessage) {
        const event = new MessageEvent('message', { data: messageStr });
        ws.onmessage(event);
      }
    });
  }

  // Simulate high-frequency updates
  enableHighFrequencyMode(frequency: number = 100): void {
    console.log(`⚡ Enabling high-frequency mode: ${frequency}ms intervals`);
    plcDataMock.setUpdateFrequency(frequency);
  }

  disableHighFrequencyMode(): void {
    console.log('🔄 Disabling high-frequency mode');
    plcDataMock.setUpdateFrequency(1000); // Back to 1 second
  }

  // Get connection statistics
  getConnectionStats(): {
    activeConnections: number;
    totalConnections: number;
    config: MockWebSocketConfig;
  } {
    return {
      activeConnections: this.activeConnections.size,
      totalConnections: this.activeConnections.size, // In real implementation, this would be cumulative
      config: this.config,
    };
  }

  // Cleanup all connections
  closeAllConnections(): void {
    console.log('🔌 Closing all mock WebSocket connections');
    
    this.activeConnections.forEach(ws => {
      ws.close(1001, 'Service shutdown');
    });
    
    this.activeConnections.clear();
  }
}

// Export service instance and WebSocket class
export const mockWebSocketService = MockWebSocketService.getInstance();

// Replace global WebSocket with mock in development
export function enableMockWebSocket(): void {
  if (typeof window !== 'undefined') {
    (window as any).MockWebSocket = MockWebSocket;
    console.log('🔧 Mock WebSocket enabled globally');
  }
}

export function disableMockWebSocket(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).MockWebSocket;
    console.log('🔧 Mock WebSocket disabled');
  }
} 