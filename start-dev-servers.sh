#!/bin/bash

# Elixir Development Servers Startup Script
# This script starts both the frontend (React/Vite) and backend (FastAPI) development servers
# Place this file on the Raspberry Pi desktop and double-click to run

echo "🚀 Starting Elixir Development Servers..."
echo "========================================"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define project paths (adjust these paths to match your Raspberry Pi setup)
FRONTEND_DIR="$SCRIPT_DIR/elixir-frontend"
BACKEND_DIR="$SCRIPT_DIR/elixir_backend"

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        echo "❌ Error: Directory $1 not found!"
        echo "Please update the paths in this script to match your setup."
        read -p "Press any key to exit..."
        exit 1
    fi
}

# Check if project directories exist
check_directory "$FRONTEND_DIR"
check_directory "$BACKEND_DIR"

# Function to start frontend server
start_frontend() {
    echo "📱 Starting Frontend Server (React/Vite)..."
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    echo "🌐 Frontend server starting on http://localhost:5173"
    npm run dev
}

# Function to find poetry executable
find_poetry() {
    # Try common locations for poetry
    local poetry_paths=(
        "poetry"                              # In PATH
        "$HOME/.local/bin/poetry"             # User installation
        "$HOME/.poetry/bin/poetry"            # Old Poetry installation
        "/usr/local/bin/poetry"               # System installation
        "$(which poetry 2>/dev/null)"         # Use which command
    )
    
    for poetry_path in "${poetry_paths[@]}"; do
        if [ -n "$poetry_path" ] && [ -x "$poetry_path" ] 2>/dev/null; then
            echo "$poetry_path"
            return 0
        fi
    done
    
    return 1
}

# Function to start backend server
start_backend() {
    echo "🔧 Starting Backend Server (FastAPI)..."
    cd "$BACKEND_DIR"
    
    # Find poetry executable
    POETRY_CMD=$(find_poetry)
    if [ $? -ne 0 ]; then
        echo "❌ Poetry not found! Trying to locate..."
        echo "🔍 Checking common locations..."
        
        # Additional debug info
        echo "PATH: $PATH"
        echo "User: $(whoami)"
        echo "Home: $HOME"
        
        # Try to find it manually
        if [ -f "$HOME/.local/bin/poetry" ]; then
            POETRY_CMD="$HOME/.local/bin/poetry"
            echo "✅ Found Poetry at: $POETRY_CMD"
        elif [ -f "$HOME/.poetry/bin/poetry" ]; then
            POETRY_CMD="$HOME/.poetry/bin/poetry"
            echo "✅ Found Poetry at: $POETRY_CMD"
        else
            echo "❌ Poetry still not found! Please check your installation."
            echo "Try running: curl -sSL https://install.python-poetry.org | python3 -"
            exit 1
        fi
    fi
    
    echo "✅ Using Poetry: $POETRY_CMD"
    
    # Install dependencies if needed
    echo "📦 Ensuring backend dependencies are installed..."
    "$POETRY_CMD" install
    
    echo "🚀 Backend server starting on http://localhost:8000"
    "$POETRY_CMD" run python main.py
}

# Function to cleanup when script is terminated
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    echo "✅ Cleanup complete. Goodbye!"
    exit 0
}

# Set up signal handling for graceful shutdown
trap cleanup SIGINT SIGTERM

# Create log directory
mkdir -p "$SCRIPT_DIR/logs"

echo "📂 Project directories:"
echo "   Frontend: $FRONTEND_DIR"
echo "   Backend:  $BACKEND_DIR"
echo ""
echo "🎯 Starting servers in parallel..."
echo "   Press Ctrl+C to stop both servers"
echo ""

# Start both servers in background with output redirection
{
    start_frontend 2>&1 | sed 's/^/[FRONTEND] /'
} &

{
    start_backend 2>&1 | sed 's/^/[BACKEND] /'
} &

# Wait for user input or signals
echo "✅ Both servers are starting..."
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🚀 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers, or close this window."

# Wait for all background jobs to complete
wait 