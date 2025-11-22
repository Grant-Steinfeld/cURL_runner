#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DAEMON_SCRIPT="$SCRIPT_DIR/git-tracker-daemon.mjs"
DATA_DIR="${PROJECT_ROOT}/var/git-tracker"
PID_FILE="${DATA_DIR}/git-tracker.pid"
LOG_FILE="${PROJECT_ROOT}/var/logs/git-tracker.log"

# Create necessary directories
mkdir -p "$DATA_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Git tracker is already running (PID: $PID)"
    exit 0
  else
    # Stale PID file, remove it
    rm -f "$PID_FILE"
  fi
fi

# Check if this is a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not a git repository"
  exit 1
fi

echo "Starting Git Commit Tracker daemon..."
echo "Log file: $LOG_FILE"
echo "PID file: $PID_FILE"
echo ""

# Start daemon in background
nohup node "$DAEMON_SCRIPT" > "$LOG_FILE" 2>&1 &

DAEMON_PID=$!

# Wait a moment to check if it started successfully
sleep 2

if ps -p "$DAEMON_PID" > /dev/null 2>&1; then
  echo "$DAEMON_PID" > "$PID_FILE"
  echo "✅ Git tracker started successfully (PID: $DAEMON_PID)"
  echo "📝 Logs: $LOG_FILE"
  echo "🛑 Stop with: bash scripts/stop-git-tracker.sh"
else
  echo "❌ Failed to start git tracker"
  echo "Check logs: $LOG_FILE"
  exit 1
fi

