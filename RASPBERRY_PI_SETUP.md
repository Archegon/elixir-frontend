# Elixir Development Servers - Raspberry Pi Setup

This guide helps you set up one-click development server startup on your Raspberry Pi.

## Files Created

1. **`start-dev-servers.sh`** - Main script that starts both servers
2. **`start-elixir-dev.desktop`** - Desktop shortcut file
3. **`RASPBERRY_PI_SETUP.md`** - This instruction file

## Setup Instructions

### Step 1: Copy Files to Raspberry Pi

1. Copy these files to your project root directory on the Raspberry Pi
2. The project structure should look like:
   ```
   /your/project/path/
   ├── elixir-frontend/
   ├── elixir_backend/
   ├── start-dev-servers.sh          ← New file
   ├── start-elixir-dev.desktop      ← New file
   └── RASPBERRY_PI_SETUP.md         ← New file
   ```

### Step 2: Make Script Executable

Open terminal and run:
```bash
chmod +x start-dev-servers.sh
chmod +x start-elixir-dev.desktop
```

### Step 3: Setup Desktop Shortcut (Optional)

To create a desktop shortcut:

1. Copy the `.desktop` file to your desktop:
   ```bash
   cp start-elixir-dev.desktop ~/Desktop/
   ```

2. Make it executable:
   ```bash
   chmod +x ~/Desktop/start-elixir-dev.desktop
   ```

3. Double-click the desktop icon to start both servers

### Step 4: Alternative - Direct Script Usage

You can also run the script directly:
```bash
./start-dev-servers.sh
```

## What the Script Does

✅ **Checks Dependencies**: Verifies Poetry and Node.js are installed  
✅ **Auto-Install**: Installs npm/poetry dependencies if missing  
✅ **Parallel Startup**: Starts both servers simultaneously  
✅ **Clear Output**: Prefixes logs with [FRONTEND] and [BACKEND]  
✅ **Graceful Shutdown**: Press Ctrl+C to stop both servers  
✅ **Error Handling**: Shows helpful error messages  

## Server URLs

Once started, access:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000  
- **API Docs**: http://localhost:8000/docs

## Troubleshooting

### Script Path Issues
If you get "directory not found" errors, edit `start-dev-servers.sh` and update these lines:
```bash
FRONTEND_DIR="$SCRIPT_DIR/elixir-frontend"  # Update path if needed
BACKEND_DIR="$SCRIPT_DIR/elixir_backend"    # Update path if needed
```

### Permission Issues
```bash
chmod +x start-dev-servers.sh
chmod +x start-elixir-dev.desktop
```

### Missing Dependencies
- **Node.js**: `sudo apt install nodejs npm`
- **Poetry**: `curl -sSL https://install.python-poetry.org | python3 -`

### Terminal Not Opening (Desktop Version)
Try changing the terminal command in `start-elixir-dev.desktop`:
```ini
# For different terminals, try one of these:
Exec=lxterminal -e "cd %k && ./start-dev-servers.sh; exec bash"
Exec=xterm -e "cd %k && ./start-dev-servers.sh; exec bash"
Exec=terminator -e "cd %k && ./start-dev-servers.sh; exec bash"
```

## Stopping the Servers

- **Terminal**: Press `Ctrl+C` in the terminal window
- **Desktop**: Close the terminal window or press `Ctrl+C`
- **Force Stop**: `pkill -f "npm run dev"` and `pkill -f "python main.py"`

## Customization

You can modify `start-dev-servers.sh` to:
- Change server ports
- Add environment variables
- Include additional startup commands
- Add custom logging 