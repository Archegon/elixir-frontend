# Elixir Hyperbaric Chamber - Frontend Application

A modern React frontend application for monitoring and controlling hyperbaric chamber operations via PLC (S7-200) integration with comprehensive automatic backend discovery for seamless local network connectivity.

## 🏗️ Project Overview

This frontend interfaces with the [Elixir Backend](https://github.com/Archegon/elixir_backend) to provide real-time monitoring and control of hyperbaric chamber systems. The backend communicates with a Siemens S7-200 PLC on a Raspberry Pi, while this React application provides the user interface for operators and medical staff.

### Architecture
```
[Frontend (React)] ←→ [Backend (FastAPI)] ←→ [Raspberry Pi + PLC (S7-200)]
     This App              Port 8000            192.168.2.1
```

### Display Requirements
- **Target Display**: 1280x720 fixed resolution
- **No Responsive Design**: Optimized specifically for control panel displays
- **No Scrolling**: All interface elements fit within the viewport
- **Touch-Friendly**: Large buttons suitable for gloved operation

## 🎛️ Current Features

### ✅ Implemented
- **Professional Dashboard Layout** - Fixed 1280x720 grid layout
- **Real-time Metrics Display** - Pressure, Oxygen, Temperature, Session Timer
- **Control Panel** - Start, Pause, Adjust, Emergency Stop buttons
- **System Alerts** - Color-coded notification system
- **Session History** - Table of recent chamber sessions
- **Status Indicators** - Visual chamber status with progress bars
- **TypeScript Architecture** - Complete type definitions for chamber operations

### 🔄 In Development
- Real-time data integration with backend
- WebSocket connections for live updates
- Control action implementations
- Alert management system

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elixir-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **View the application**
   
   Navigate to [http://localhost:5173](http://localhost:5173) to view the control panel.

## 🍓 Raspberry Pi Setup

### Installing Node.js on Raspberry Pi

For production deployment on Raspberry Pi (aarch64), follow these steps to install Node.js v22.16.0:

```bash
# 1. Navigate to home directory
cd ~

# 2. Download Node.js v22.16.0 for aarch64
wget https://nodejs.org/dist/v22.16.0/node-v22.16.0-linux-arm64.tar.xz

# 3. Extract the archive
tar -xf node-v22.16.0-linux-arm64.tar.xz

# 4. Install Node.js by copying to /usr/local
sudo cp -r node-v22.16.0-linux-arm64/{bin,include,lib,share} /usr/local/

# 5. Verify installation
node -v
npm -v
```

**Expected Output:**
```
v22.16.0
10.x.x
```

### Additional Raspberry Pi Configuration

After installing Node.js:

1. **Clone and setup the frontend**
   ```bash
   git clone <repository-url>
   cd elixir-frontend
   npm install
   ```

2. **Configure environment for Pi**
   ```bash
   cp config.example.env .env.local
   # Edit .env.local with your specific configuration
   ```

3. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📜 Available Scripts

In the project directory, you can run:

- **`npm run dev`** - Starts the development server with hot reload
- **`npm run build`** - Builds the app for production to the `dist` folder
- **`npm run lint`** - Runs ESLint to check for code quality issues
- **`npm run preview`** - Locally preview the production build

## 🛠️ Tech Stack

- **React 19** - UI library with modern hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling with custom medical interface design
- **ESLint** - Code linting and formatting

## 🏭 Backend Integration

This frontend connects to the Elixir Backend (FastAPI) running on port 8000. Make sure the backend is running before starting the frontend application.

### Environment Configuration

Create a `.env` file in the root directory to configure backend connection:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_PLC_IP=192.168.2.1
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── chamber/        # Chamber-specific components
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components
├── pages/
│   └── Dashboard.tsx  # Main control panel dashboard
├── types/
│   └── chamber.ts     # TypeScript definitions
├── hooks/             # Custom React hooks
├── services/          # API services and utilities
└── utils/             # Helper functions
```

### Key Type Definitions

```typescript
// Chamber operational states
enum ChamberStatus {
  IDLE = 'idle',
  PRESSURIZING = 'pressurizing',
  TREATMENT = 'treatment',
  DEPRESSURIZING = 'depressurizing',
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance'
}

// Core metrics interface
interface ChamberMetrics {
  pressure: { current: number; target: number; unit: string; };
  oxygen: { level: number; unit: string; };
  temperature: { current: number; unit: string; };
  session: { elapsed: number; remaining: number; total: number; };
}
```

## 🎨 Design System

### Color Palette
- **Status Colors**: Green (safe), Yellow (warning), Red (danger), Blue (info)
- **UI Colors**: Slate backgrounds for professional medical interface
- **Typography**: Optimized for control panel readability

### Layout Grid
- **Header**: 64px fixed height with branding and connection status
- **Status Banner**: 48px chamber status indicator
- **Main Content**: 8/12 columns (metrics) + 4/12 columns (controls)
- **Metrics Cards**: Pressure, Oxygen, Temperature, Session Timer
- **Controls**: Touch-friendly buttons with color coding

## 🔧 Development Guidelines

### Code Quality Standards
- Follow TypeScript best practices
- Use meaningful component and variable names
- Write clean, readable code with proper comments
- Ensure all components are properly typed
- Run `npm run lint` before committing changes

### Component Architecture
- **Atomic Design**: Build reusable components
- **Type Safety**: All props and states properly typed
- **Medical Standards**: Follow medical interface guidelines
- **Touch Accessibility**: Large touch targets for gloved operation

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: If port 5173 is busy, Vite will automatically try the next available port
2. **Backend connection issues**: Ensure the backend is running on port 8000
3. **Display alignment**: Ensure 1280x720 resolution is set correctly
4. **Node version compatibility**: Use Node.js 18+ for best compatibility

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Ensure all dependencies are installed correctly
3. Verify the backend is running and accessible
4. Check the network connection to the PLC system
5. Verify display resolution is set to 1280x720

## 📝 Contributing

1. Create a feature branch from `main`
2. Make your changes with proper TypeScript types
3. Run `npm run lint` to check code quality
4. Test your changes on 1280x720 display
5. Submit a pull request with a clear description

## 📄 License

[Add your license information here]

---

**O2genes Medical Systems**  
For questions or support, please contact the development team.

## 🌟 Features

- **Comprehensive Backend Discovery**: Automatically scans entire IP ranges to find your backend server
- **Smart Backend Verification**: Ensures discovered services are your specific backend (not random services)
- **Full Network Range Scanning**: Tests complete subnet ranges (192.168.x.1-254) with configurable concurrency
- **Network Device Support**: Works on any device in your local network
- **Localhost Compatible**: Seamlessly works on both localhost and network devices
- **Real-time Connection Status**: Visual feedback for backend connection status with detailed discovery info
- **WebSocket Support**: Auto-discovery works for both HTTP API and WebSocket connections
- **Development-Friendly**: Easy setup with extensive configuration options

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy the example configuration:
```bash
cp config.example.env .env.local
```

The comprehensive auto-discovery works out of the box, but you can customize it by editing `.env.local`:

```env
# Basic Discovery Settings
VITE_AUTO_DISCOVERY=true
VITE_BACKEND_PORT=8000
VITE_DISCOVERY_TIMEOUT=2000

# IP Range Scanning
VITE_SCAN_START=1
VITE_SCAN_END=254
VITE_MAX_CONCURRENT_SCANS=20
VITE_QUICK_SCAN_ONLY=false

# Backend Verification
VITE_EXPECTED_SERVICE=elixir-backend
VITE_EXPECTED_VERSION=^1\.
```

### 3. Start Development Server

For **network access** (recommended):
```bash
npm run dev:network
# or simply
npm run dev
```

For **localhost only**:
```bash
npm run dev:local
```

## 🔧 Comprehensive Backend Discovery

### How It Works

The enhanced discovery system performs comprehensive network scanning with verification:

1. **Environment Check**: First checks if `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` are explicitly set
2. **Local Priority**: Tests `localhost` and `127.0.0.1` first (highest priority)
3. **Network Detection**: Automatically detects your local network IP and subnet
4. **Full Range Scanning**: Tests entire IP ranges (1-254) across multiple subnets
5. **Concurrent Testing**: Scans multiple IPs simultaneously with configurable concurrency limits
6. **Service Verification**: Validates each discovered service is your specific backend
7. **Intelligent Caching**: Caches results to avoid redundant testing
8. **Smart Fallback**: Uses localhost as fallback if discovery fails

### Discovery Process

The system tests IPs in this optimized order:

**Priority 1 - Local**:
- `http://localhost:8000`
- `http://127.0.0.1:8000`
- `http://[your-detected-ip]:8000`

**Priority 2 - Network Range Scanning**:
- `192.168.1.1-254` (detected subnet)
- `192.168.0.1-254` (common subnet)
- `192.168.2.1-254` (alternative subnet)
- `10.0.0.1-254` (corporate networks)
- `10.0.1.1-254` (corporate networks)
- `172.16.0.1-254` (Docker/container networks)

**Concurrent Processing**: Tests up to 20 IPs simultaneously (configurable)

### Backend Verification

Each discovered service is verified to ensure it's your backend:

1. **Health Endpoint**: Tests `/api/health` for 200 response
2. **Service Identification**: Checks for expected service name (e.g., "elixir-backend")
3. **Version Verification**: Validates API version matches expected pattern
4. **Field Validation**: Ensures response contains required fields (`status`, `service`, `version`)
5. **Additional Endpoints**: Tests `/api/status` and `/api/info` for completeness

Example expected health response:
```json
{
  "status": "healthy",
  "service": "elixir-backend",
  "version": "1.2.3",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Configuration Options

#### **Scan Range Configuration**
```env
# IP range to scan (default: 1-254)
VITE_SCAN_START=1
VITE_SCAN_END=254

# Maximum concurrent scans (default: 20)
VITE_MAX_CONCURRENT_SCANS=20

# Quick scan - only test common IPs (default: false)
VITE_QUICK_SCAN_ONLY=false
```

#### **Verification Settings**
```env
# Expected service name in health response
VITE_EXPECTED_SERVICE=elixir-backend

# Expected version pattern (regex)
VITE_EXPECTED_VERSION=^1\.

# Discovery timeout per attempt (default: 2000ms)
VITE_DISCOVERY_TIMEOUT=2000
```

#### **Network-Specific Examples**

**For Large Corporate Networks**:
```env
VITE_QUICK_SCAN_ONLY=true          # Only test common IPs
VITE_MAX_CONCURRENT_SCANS=10       # Reduce network load
VITE_DISCOVERY_TIMEOUT=1000        # Faster timeout
```

**For Home Networks**:
```env
VITE_QUICK_SCAN_ONLY=false         # Full range scan
VITE_MAX_CONCURRENT_SCANS=30       # Higher concurrency
VITE_DISCOVERY_TIMEOUT=3000        # Longer timeout
```

**For Specific Subnets**:
```env
VITE_SCAN_START=10                 # Start from .10
VITE_SCAN_END=50                   # End at .50
```

### Advanced Connection Status

Monitor the comprehensive discovery process:

```tsx
import { ConnectionStatus } from '@components/ConnectionStatus';

function App() {
  return (
    <div>
      {/* Basic status */}
      <ConnectionStatus />
      
      {/* Detailed with discovery info */}
      <ConnectionStatus 
        showDetails={true} 
        showControls={true}
        showDiscoveryInfo={true}
      />
    </div>
  );
}
```

The enhanced status component shows:
- ✅ **Connection Status**: Real-time backend connectivity
- 🔍 **Discovery Progress**: Live scanning progress with animations
- 📊 **Configuration Details**: Scan settings, verification rules, subnets
- 🌐 **Network Information**: Detected subnets and IP ranges
- 📋 **Cache Statistics**: Number of cached discovery results
- 🛡️ **Verification Status**: Service validation confirmation

## 📱 Network Access

### Access from Other Devices

1. Start the dev server with network access:
   ```bash
   npm run dev:network
   ```

2. The discovery system automatically detects your network configuration

3. Access from any device on the same network:
   ```
   http://[your-ip]:5173
   ```
   Example: `http://192.168.1.50:5173`

### Performance Optimization

The system includes several optimizations:

- **Intelligent Caching**: Results cached for 5 minutes
- **Concurrent Scanning**: Configurable parallel testing
- **Quick Scan Mode**: Test only common IPs for faster discovery
- **Priority Ordering**: Local IPs tested first
- **Smart Timeouts**: Configurable per-connection timeouts

## 🛠️ Development Scripts

- `npm run dev` - Start dev server with network access
- `npm run dev:network` - Explicitly start with network access (0.0.0.0)
- `npm run dev:local` - Start with localhost only
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run preview:network` - Preview production build with network access

## 🔧 Troubleshooting

### Backend Not Discovered

1. **Check Backend Health Endpoint**: Ensure `/api/health` returns proper response:
   ```json
   {
     "status": "healthy",
     "service": "elixir-backend",
     "version": "1.0.0"
   }
   ```

2. **Verify Service Name**: Check if `VITE_EXPECTED_SERVICE` matches your backend's service identifier

3. **Check Network Range**: Ensure your backend is in the scanned IP range (1-254)

4. **Increase Concurrency**: Try `VITE_MAX_CONCURRENT_SCANS=50` for faster discovery

5. **Enable Quick Scan**: Set `VITE_QUICK_SCAN_ONLY=true` for initial testing

### Discovery Too Slow

**For faster discovery**:
```env
VITE_QUICK_SCAN_ONLY=true          # Test only common IPs
VITE_MAX_CONCURRENT_SCANS=50       # Higher concurrency
VITE_DISCOVERY_TIMEOUT=1000        # Shorter timeout
VITE_SCAN_START=1                  # Smaller range
VITE_SCAN_END=50
```

### False Positives

**If connecting to wrong services**:
```env
VITE_EXPECTED_SERVICE=my-specific-backend    # Unique service name
VITE_EXPECTED_VERSION=^2\.1\.                # Specific version pattern
```

### Network Issues

**For firewall/network problems**:
```env
VITE_DISCOVERY_TIMEOUT=5000        # Longer timeout
VITE_MAX_CONCURRENT_SCANS=5        # Reduce network load
```

### Manual Override

**Bypass discovery entirely**:
```env
VITE_API_BASE_URL=http://192.168.1.100:8000
VITE_WS_BASE_URL=ws://192.168.1.100:8000
VITE_AUTO_DISCOVERY=false
```

## 🏗️ Architecture

### Enhanced Discovery Components

- **`connection.config.ts`**: Comprehensive discovery with IP range scanning and verification
- **`api.service.ts`**: Enhanced API service with discovery integration
- **`useBackendConnection.ts`**: React hook for connection management
- **`ConnectionStatus.tsx`**: Advanced UI component with detailed discovery information

### Configuration Reference

All configuration is done through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_AUTO_DISCOVERY` | `true` | Enable/disable auto-discovery |
| `VITE_BACKEND_PORT` | `8000` | Backend port to search for |
| `VITE_DISCOVERY_TIMEOUT` | `2000` | Timeout per connection attempt (ms) |
| `VITE_SCAN_START` | `1` | Start of IP range to scan |
| `VITE_SCAN_END` | `254` | End of IP range to scan |
| `VITE_MAX_CONCURRENT_SCANS` | `20` | Maximum parallel scans |
| `VITE_QUICK_SCAN_ONLY` | `false` | Only scan common IPs |
| `VITE_EXPECTED_SERVICE` | `elixir-backend` | Expected service identifier |
| `VITE_EXPECTED_VERSION` | `^1\.` | Expected version pattern (regex) |
| `VITE_API_BASE_URL` | Auto-discovered | Manual API URL override |
| `VITE_WS_BASE_URL` | Auto-discovered | Manual WebSocket URL override |

### Discovery Statistics

The system provides detailed discovery statistics:

- **Scan Coverage**: Number of IPs tested across subnets
- **Cache Performance**: Hit rate for cached results
- **Verification Success**: Rate of successful service verification
- **Discovery Time**: Time taken for complete network scan

## 📝 License

This project is licensed under the MIT License.
