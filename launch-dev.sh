#!/bin/bash

# Simple launcher for development servers
# This script finds the main script regardless of where it's placed

# Get the directory where this launcher script is located
LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Look for start-dev-servers.sh in the same directory
if [ -f "$LAUNCHER_DIR/start-dev-servers.sh" ]; then
    cd "$LAUNCHER_DIR"
    ./start-dev-servers.sh
else
    echo "❌ Error: start-dev-servers.sh not found in $LAUNCHER_DIR"
    echo "Please ensure both files are in the same directory."
    read -p "Press any key to exit..."
fi 