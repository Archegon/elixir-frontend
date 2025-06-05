# Elixir Hyperbaric Chamber - Frontend Application

A modern React frontend application for monitoring and controlling hyperbaric chamber operations via PLC (S7-200) integration.

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
