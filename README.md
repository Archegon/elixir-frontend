# Elixir Frontend

React-based frontend for the Elixir hyperbaric chamber control system with automatic backend discovery and comprehensive mock system for development.

## 🚀 Features

### Production Features
- **Automatic Backend Discovery**: Finds and connects to backend services automatically across local networks
- **Network Range Scanning**: Comprehensive IP scanning with configurable concurrency and verification
- **Service Verification**: Ensures connections are to authentic Elixir backend services
- **Real-time Data**: WebSocket connections for live PLC status updates
- **Responsive Design**: Works on tablets, phones, and desktop computers
- **Connection Monitoring**: Live connection status with detailed diagnostics

### Development Features
- **Mock System**: Complete frontend-only development without PLC hardware
- **Scenario Testing**: Multiple realistic operation scenarios (normal, emergency, maintenance, etc.)
- **Network Simulation**: Configurable delays, errors, and disconnections
- **Developer Controls**: Real-time mock data manipulation and testing tools

## 🛠️ Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Access to local network (for backend discovery)
- Elixir backend service (for production mode)

### Installation

   ```bash
# Clone the repository
   git clone <repository-url>
   cd elixir-frontend

# Install dependencies
npm install

# Copy environment configuration
cp config.example.env .env.local

# Configure your environment (see Configuration section)
nano .env.local
```

## ⚙️ Configuration

### Basic Configuration

Copy `config.example.env` to `.env.local` and adjust settings:

   ```bash
# For automatic discovery (recommended)
VITE_AUTO_DISCOVERY=true
VITE_BACKEND_PORT=8000

# For manual configuration
VITE_API_BASE_URL=http://192.168.1.100:8000
VITE_WS_BASE_URL=ws://192.168.1.100:8000
VITE_AUTO_DISCOVERY=false
```

### Mock System Configuration

#### Frontend-Only Development
For development without PLC hardware:

   ```bash
# Enable complete mock mode
VITE_MOCK_MODE=true
VITE_MOCK_PLC_DATA=true
VITE_MOCK_WEBSOCKET=true
VITE_MOCK_API=true
VITE_AUTO_DISCOVERY=false

# Optional: Set initial scenario
VITE_MOCK_DEFAULT_SCENARIO=normal
VITE_MOCK_UPDATE_FREQUENCY=1000
```

#### Partial Mock Mode
Mix real backend with mock PLC data:

```bash
# Use real backend but mock PLC hardware
VITE_MOCK_PLC_DATA=true
VITE_MOCK_WEBSOCKET=true
VITE_MOCK_API=false
```

#### Network Testing
Simulate network conditions:

```bash
# Add realistic delays and errors
VITE_MOCK_API_DELAY_MIN=200
VITE_MOCK_API_DELAY_MAX=1000
VITE_MOCK_ERROR_RATE=0.1
VITE_MOCK_WS_DISCONNECTIONS=true
```

### Network Discovery Configuration

#### Home Networks
```bash
VITE_QUICK_SCAN_ONLY=false
VITE_MAX_CONCURRENT_SCANS=30
VITE_SCAN_START=1
VITE_SCAN_END=254
```

#### Corporate Networks
```bash
VITE_QUICK_SCAN_ONLY=true
VITE_MAX_CONCURRENT_SCANS=10
VITE_SCAN_START=10
VITE_SCAN_END=50
```

## 🏃 Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Development with network access (for testing on other devices)
npm run dev:network

# Frontend-only development (no backend required)
npm run dev:mock
```

### Production Build

   ```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve on network
npm run preview:network
```

## 🎭 Mock System

The mock system enables complete frontend development without requiring PLC hardware or backend services.

### Available Mock Scenarios

1. **Normal Operation**: Idle chamber with stable pressure
2. **Pressurizing**: Chamber pressurizing to treatment level (30s auto-advance)
3. **Treatment**: Active treatment session with high oxygen
4. **Depressurizing**: Safe pressure reduction (45s auto-advance)
5. **Emergency**: Rapid emergency decompression (10s auto-advance)
6. **Maintenance**: System in maintenance mode
7. **Offline**: PLC communication lost
8. **Startup**: System initialization and self-tests (15s auto-advance)

### Mock Data Features

#### Realistic PLC Data
- Authentic hyperbaric chamber parameters
- Dynamic pressure changes with realistic fluctuations
- Temperature, humidity, and oxygen readings
- Session timers and state management
- Communication error simulation

#### Interactive Controls
- Control panel simulation (lights, AC, intercom)
- Pressure setpoint adjustment
- Session start/stop functionality
- Alarm triggering and clearing
- Real-time data manipulation

### Developer Controls

The mock system includes a developer control panel accessible when mock mode is enabled:

#### Scenario Management
- Switch between operation scenarios
- View current status and parameters
- Auto-advancing scenarios with realistic timing

#### Testing Tools
- Trigger specific alarms (pressure, oxygen, temperature)
- Simulate network issues and API errors
- Control update frequency (100ms to 5s)
- Adjust error rates and network delays

#### Performance Testing
- High-frequency data updates (stress testing)
- Network disconnection simulation
- API timeout and retry testing
- WebSocket reconnection scenarios

### Using the Mock System

#### Enable Mock Mode

1. **Environment Configuration**:
   ```bash
   # In .env.local
   VITE_MOCK_MODE=true
   VITE_MOCK_PLC_DATA=true
   VITE_MOCK_WEBSOCKET=true
   VITE_MOCK_API=true
   ```

2. **Start Development Server**:
   ```bash
   npm run dev:mock
   ```

3. **Access Developer Controls**:
   - Controls appear automatically in mock mode
   - Located in top-right corner of the application
   - Minimize/maximize for better screen real estate

#### Testing Scenarios

1. **Basic Operations**:
   - Start with "Normal Operation" scenario
   - Test UI responsiveness with real-time data
   - Verify control interactions

2. **Session Testing**:
   - Use "Start Session" to trigger pressurization
   - Watch automatic scenario progression
   - Test session controls and indicators

3. **Emergency Scenarios**:
   - Switch to "Emergency" scenario
   - Verify alarm displays and emergency procedures
   - Test rapid data updates

4. **Network Issues**:
   - Use "API Errors" and "WS Issues" buttons
   - Test reconnection logic
   - Verify error handling and user feedback

#### Mock API Endpoints

All backend API endpoints are mocked with realistic responses:

```typescript
// Health check
GET /health
// Returns: { status: 'healthy', service: 'elixir-backend', mode: 'mock' }

// System status
GET /api/status/system
// Returns: Complete PLCStatus object with current mock data

// Control commands
POST /api/control/lights/ceiling/toggle
POST /api/pressure/setpoint
POST /api/session/start
// All return appropriate success/error responses with delays
```

#### Mock WebSocket Messages

Real-time data streaming with configurable behavior:

```typescript
// Automatic status updates
{
  timestamp: "2024-01-01T12:00:00Z",
  type: "status_update",
  data: { /* Complete PLCStatus */ }
}

// Connection simulation
- Configurable connection delays
- Periodic disconnections (optional)
- Network jitter simulation
- Bandwidth optimization (only send on changes)
```

## 🔧 Development

### Project Structure

```
src/
├── components/           # React components
│   ├── ConnectionStatus.tsx    # Connection monitoring
│   └── MockControls.tsx        # Developer controls
├── config/              # Configuration
│   ├── connection.config.ts    # Connection settings
│   └── api-endpoints.ts        # API definitions
├── mocks/               # Mock system
│   ├── plc-data.mock.ts        # PLC data generation
│   ├── api.mock.ts             # API response mocking
│   └── websocket.mock.ts       # WebSocket simulation
├── services/            # Service layer
│   └── api.service.ts          # HTTP client
└── hooks/               # Custom React hooks
    └── useBackendConnection.ts # Connection management
```

### Adding New Mock Scenarios

1. **Define Scenario**:
   ```typescript
   // In src/mocks/plc-data.mock.ts
   export const NEW_SCENARIO: MockScenario = {
     id: 'new_scenario',
     name: 'New Scenario',
     description: 'Description of the scenario',
     duration: 10000, // Optional auto-advance
     nextScenario: 'normal', // Optional next scenario
   };
   ```

2. **Implement Behavior**:
   ```typescript
   private updateNewScenario(elapsed: number): void {
     // Update mock data based on scenario logic
     this.baseData.pressure.internal_pressure_1 = /* custom logic */;
     this.baseData.session.running_state = /* custom state */;
   }
   ```

3. **Add to Switch Statement**:
   ```typescript
   switch (scenario.id) {
     case 'new_scenario':
       this.updateNewScenario(elapsed);
       break;
   }
   ```

### Customizing Mock Behavior

#### Data Generation
```typescript
// Custom sensor readings
this.baseData.sensors.current_temperature = baseTemp + Math.sin(elapsed / 1000) * variation;

// Custom pressure changes
this.baseData.pressure.internal_pressure_1 = calculatePressure(elapsed, scenario);

// Custom session states
this.baseData.session.running_state = isSessionActive(elapsed);
```

#### Network Simulation
```typescript
// Custom API delays
mockApiService.configure({
  responseDelay: { min: 100, max: 2000 },
  errorRate: 0.15, // 15% error rate
  networkJitter: true
});

// WebSocket behavior
mockWebSocketService.configure({
  connectionDelay: 2000,
  simulateDisconnections: true,
  disconnectionRate: 0.02 // 2% chance
});
```

## 🌐 Network Discovery

### How It Works

The application automatically discovers backend services using:

1. **Local IP Detection**: Uses WebRTC to detect the device's local IP
2. **Network Range Scanning**: Tests multiple IP ranges simultaneously
3. **Service Verification**: Confirms services are authentic Elixir backends
4. **Health Checking**: Validates service functionality before connection

### Supported Networks

- **Home Networks**: 192.168.1.x, 192.168.0.x
- **Corporate Networks**: 10.0.0.x, 10.0.1.x, 172.16.0.x
- **Alternative Ranges**: 192.168.2.x

### Discovery Process

1. **Quick Scan** (optional): Tests common IP addresses first
2. **Full Range Scan**: Comprehensive scanning of configured ranges
3. **Concurrent Processing**: Up to 20 simultaneous connection attempts
4. **Caching**: 5-minute cache to avoid redundant scans
5. **Verification**: Service name, version, and endpoint validation

### Troubleshooting Discovery

#### Common Issues

1. **No Backend Found**:
   - Verify backend is running on expected port
   - Check firewall settings
   - Ensure same network segment

2. **Slow Discovery**:
   - Enable quick scan mode: `VITE_QUICK_SCAN_ONLY=true`
   - Reduce concurrent scans: `VITE_MAX_CONCURRENT_SCANS=10`
   - Limit scan range: `VITE_SCAN_START=10 VITE_SCAN_END=50`

3. **False Connections**:
   - Verify service verification settings
   - Check `VITE_EXPECTED_SERVICE` and `VITE_EXPECTED_VERSION`

#### Manual Configuration

If auto-discovery fails, manually configure:

```bash
# .env.local
VITE_API_BASE_URL=http://192.168.1.100:8000
VITE_WS_BASE_URL=ws://192.168.1.100:8000
VITE_AUTO_DISCOVERY=false
```

## 📱 Device Compatibility

### Supported Devices
- **Desktop**: Windows, macOS, Linux browsers
- **Tablets**: iPad, Android tablets
- **Mobile**: iOS Safari, Android Chrome (limited functionality)

### Network Requirements
- **WiFi**: Must be on same network as backend
- **Ethernet**: Direct network access
- **Mobile Hotspot**: May work if backend accessible

### Browser Support
- Chrome/Chromium 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 🔍 Monitoring and Debugging

### Connection Status

The application provides detailed connection monitoring:

- **Discovery Progress**: Live scan progress and results
- **Connection Quality**: Latency and error rates
- **Service Information**: Backend version and capabilities
- **Network Statistics**: IP ranges, scan times, cache status

### Debug Mode

Enable detailed logging:

```bash
VITE_DEBUG_MODE=true
VITE_CONSOLE_LOGGING=true
```

### Log Categories

- **🔍 Discovery**: Backend discovery process
- **🔌 Connection**: WebSocket connections
- **📡 API**: HTTP request/response
- **🎭 Mock**: Mock system operations
- **⚠️ Error**: Error conditions and recovery

## 🚀 Production Deployment

### Build Configuration

```bash
# Production environment variables
VITE_NODE_ENV=production
VITE_AUTO_DISCOVERY=true
VITE_QUICK_SCAN_ONLY=true
VITE_DEBUG_MODE=false
VITE_MOCK_MODE=false

# Timeout adjustments
VITE_API_TIMEOUT=10000
VITE_WS_CONNECTION_TIMEOUT=15000

# Security
VITE_MAX_CONCURRENT_SCANS=10
```

### Build and Deploy

```bash
# Build for production
npm run build

# Serve locally (testing)
npm run preview:network

# Deploy to web server
cp -r dist/* /var/www/html/
```

### Production Considerations

1. **Network Security**: Ensure backend ports are accessible
2. **Firewall Rules**: Allow HTTP/WebSocket connections
3. **Resource Limits**: Adjust scan concurrency for server load
4. **Monitoring**: Enable error reporting and analytics
5. **Backup**: Configure fallback backend URLs

## 🧪 Testing

### Mock System Testing

```bash
# Run with different scenarios
VITE_MOCK_DEFAULT_SCENARIO=emergency npm run dev:mock
VITE_MOCK_UPDATE_FREQUENCY=100 npm run dev:mock

# Test error conditions
VITE_MOCK_ERROR_RATE=0.5 npm run dev:mock
VITE_MOCK_WS_DISCONNECTIONS=true npm run dev:mock
```

### Network Testing

```bash
# Test discovery on different networks
VITE_SCAN_START=1 VITE_SCAN_END=10 npm run dev

# Test manual configuration
VITE_AUTO_DISCOVERY=false VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

### Integration Testing

1. **Backend Integration**: Test with real backend service
2. **PLC Integration**: Verify with actual PLC hardware
3. **Network Simulation**: Test various network conditions
4. **Device Testing**: Verify on different devices/browsers

## 📚 API Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MOCK_MODE` | `false` | Enable complete mock mode |
| `VITE_MOCK_PLC_DATA` | `false` | Mock PLC data generation |
| `VITE_MOCK_API` | `false` | Mock API responses |
| `VITE_MOCK_WEBSOCKET` | `false` | Mock WebSocket connections |
| `VITE_AUTO_DISCOVERY` | `true` | Enable backend discovery |
| `VITE_BACKEND_PORT` | `8000` | Backend service port |
| `VITE_MAX_CONCURRENT_SCANS` | `20` | Concurrent discovery attempts |
| `VITE_QUICK_SCAN_ONLY` | `false` | Quick scan mode |

### Mock API

#### Configuration
```typescript
import { mockApiService } from './mocks/api.mock';

mockApiService.configure({
  responseDelay: { min: 100, max: 500 },
  errorRate: 0.05,
  networkJitter: true
});
```

#### Available Methods
- `getHealth()`: Health check endpoint
- `getSystemStatus()`: Complete PLC status
- `toggleCeilingLights()`: Control ceiling lights
- `startSession()`: Start treatment session
- `setPressureSetpoint(pressure)`: Set pressure target
- `triggerAlarm(type)`: Trigger alarm conditions
- `injectError(duration)`: Simulate API errors

### Mock Data

#### PLC Data Generation
```typescript
import { plcDataMock } from './mocks/plc-data.mock';

// Subscribe to data updates
const unsubscribe = plcDataMock.subscribe((data) => {
  console.log('PLC Data:', data);
});

// Control scenarios
plcDataMock.setScenario('emergency');
plcDataMock.setUpdateFrequency(500);
plcDataMock.triggerAlarm('pressure_high');
```

#### Available Scenarios
- `normal`: Standard operation
- `pressurizing`: Pressure increasing
- `treatment`: Active treatment
- `depressurizing`: Pressure decreasing  
- `emergency`: Emergency decompression
- `maintenance`: Maintenance mode
- `offline`: Connection lost
- `startup`: System initialization

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Install dependencies: `npm install`
4. Start development: `npm run dev:mock`
5. Make changes and test thoroughly
6. Submit pull request

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- React hooks for state management
- TailwindCSS for styling

### Testing Guidelines

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test mock system integration
3. **E2E Tests**: Test complete user workflows
4. **Network Tests**: Test discovery and connections
5. **Device Tests**: Test on multiple devices

## 📄 License

[Add your license information here]

## 🆘 Support

For support and questions:

1. **Check Documentation**: Review this README thoroughly
2. **Debug Mode**: Enable debug logging for detailed information
3. **Mock Mode**: Use mock system to isolate issues
4. **Network Testing**: Verify network connectivity and discovery
5. **Issue Reports**: Provide detailed logs and environment configuration

---

**Happy coding! 🚀** The mock system enables rapid frontend development and testing without requiring physical PLC hardware.
