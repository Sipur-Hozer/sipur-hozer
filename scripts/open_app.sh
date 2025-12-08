#!/bin/bash

echo "⏳ Waiting 5 seconds for the server to initialize..."
sleep 5 # Waits 5 seconds to let Next.js start compiling

echo "🚀 Opening browser..."

# 1. Detect Git Bash / MinGW (Standard Windows Terminal)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start http://localhost:3000

# 2. Detect macOS
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000

# 3. Detect WSL (Windows Subsystem for Linux) - The fix for you
elif grep -qi microsoft /proc/version; then
    # Use Windows cmd to open the browser from inside Linux
    cmd.exe /c start http://localhost:3000

# 4. Standard Linux (Ubuntu/Debian desktop)
else
    xdg-open http://localhost:3000
fi