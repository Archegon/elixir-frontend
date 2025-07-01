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

# Function to start backend server
start_backend() {
    echo "🔧 Starting Backend Server (FastAPI)..."
    cd "$BACKEND_DIR"
    
    # Check if poetry is installed
    if ! command -v poetry &> /dev/null; then
        echo "❌ Poetry not found! Please install Poetry first."
        echo "Visit: https://python-poetry.org/docs/#installation"
        exit 1
    fi
    
    # Install dependencies if needed
    echo "📦 Ensuring backend dependencies are installed..."
    poetry install
    
    echo "🚀 Backend server starting on http://localhost:8000"
    poetry run python main.py
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