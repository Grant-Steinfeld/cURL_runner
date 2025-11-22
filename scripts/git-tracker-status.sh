#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="${PROJECT_ROOT}/var/git-tracker"
PID_FILE="${DATA_DIR}/git-tracker.pid"
REPORTS_DIR="${PROJECT_ROOT}/var/git-reports"

echo "Git Commit Tracker Status"
echo "========================="
echo ""

# Check if running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Status: ✅ Running (PID: $PID)"
    
    # Get process info
    if command -v ps > /dev/null 2>&1; then
      echo ""
      echo "Process Info:"
      ps -p "$PID" -o pid,etime,command 2>/dev/null || true
    fi
  else
    echo "Status: ❌ Not running (stale PID file)"
    rm -f "$PID_FILE"
  fi
else
  echo "Status: ❌ Not running"
fi

echo ""

# Check data directory
if [ -d "$DATA_DIR" ]; then
  COMMITS_FILE="${DATA_DIR}/commits.json"
  if [ -f "$COMMITS_FILE" ]; then
    if command -v jq > /dev/null 2>&1; then
      COMMIT_COUNT=$(jq '.commits | length' "$COMMITS_FILE" 2>/dev/null || echo "0")
      echo "Tracked Commits: $COMMIT_COUNT"
    else
      echo "Tracked Commits: (install jq to see count)"
    fi
  else
    echo "Tracked Commits: 0"
  fi
else
  echo "Tracked Commits: 0 (data directory not initialized)"
fi

echo ""

# Check reports directory
if [ -d "$REPORTS_DIR" ]; then
  REPORT_COUNT=$(find "$REPORTS_DIR" -name "*.json" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "Generated Reports: $REPORT_COUNT"
  
  if [ -f "${REPORTS_DIR}/summary-report.json" ]; then
    SUMMARY_AGE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "${REPORTS_DIR}/summary-report.json" 2>/dev/null || \
                  stat -c "%y" "${REPORTS_DIR}/summary-report.json" 2>/dev/null | cut -d'.' -f1 || \
                  echo "unknown")
    echo "Latest Summary Report: $SUMMARY_AGE"
  fi
else
  echo "Generated Reports: 0"
fi

echo ""
echo "Directories:"
echo "  Data: $DATA_DIR"
echo "  Reports: $REPORTS_DIR"
echo ""
echo "Commands:"
echo "  Start:  bash scripts/start-git-tracker.sh"
echo "  Stop:   bash scripts/stop-git-tracker.sh"
echo "  Status: bash scripts/git-tracker-status.sh"

