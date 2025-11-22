#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="${PROJECT_ROOT}/var/git-tracker"
PID_FILE="${DATA_DIR}/git-tracker.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Git tracker is not running (no PID file found)"
  exit 0
fi

PID=$(cat "$PID_FILE")

if ! ps -p "$PID" > /dev/null 2>&1; then
  echo "Git tracker is not running (stale PID file)"
  rm -f "$PID_FILE"
  exit 0
fi

echo "Stopping Git Commit Tracker (PID: $PID)..."

# Try graceful shutdown first
kill "$PID" 2>/dev/null || true

# Wait up to 5 seconds for graceful shutdown
for i in {1..5}; do
  if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Git tracker stopped gracefully"
    rm -f "$PID_FILE"
    exit 0
  fi
  sleep 1
done

# Force kill if still running
if ps -p "$PID" > /dev/null 2>&1; then
  echo "Force killing git tracker..."
  kill -9 "$PID" 2>/dev/null || true
  sleep 1
  
  if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Git tracker stopped"
    rm -f "$PID_FILE"
  else
    echo "❌ Failed to stop git tracker"
    exit 1
  fi
fi

