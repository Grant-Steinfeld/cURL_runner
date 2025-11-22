#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/run-all.mjs"

SCRIPTS_DIR="${1-}"
LOGS_DIR="${2-}"

# Set environment variables if provided
if [[ -n "${SCRIPTS_DIR}" ]]; then
  export CURL_RUNNER_SCRIPTS_DIR="${SCRIPTS_DIR}"
else
  unset CURL_RUNNER_SCRIPTS_DIR 2>/dev/null || true
fi

if [[ -n "${LOGS_DIR}" ]]; then
  export CURL_RUNNER_LOGS_DIR="${LOGS_DIR}"
else
  unset CURL_RUNNER_LOGS_DIR 2>/dev/null || true
fi

# Create logs directory if it doesn't exist
LOG_OUTPUT_DIR="${LOGS_DIR:-$PROJECT_ROOT/var/logs}"
mkdir -p "$LOG_OUTPUT_DIR"

# Generate timestamped log filename
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S")
LOG_FILE="$LOG_OUTPUT_DIR/curl-runner-stdout_${TIMESTAMP}.log"

echo "Running cURL processor..."
echo "Output will be logged to: $LOG_FILE"
echo ""

# Run the node script and redirect both stdout and stderr to log file
# Using tee to also show output on screen
node "$NODE_SCRIPT" 2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

if [[ $EXIT_CODE -eq 0 ]]; then
  echo ""
  echo "✅ Execution completed successfully"
  echo "📝 Full log saved to: $LOG_FILE"
else
  echo ""
  echo "❌ Execution failed with exit code: $EXIT_CODE"
  echo "📝 Error log saved to: $LOG_FILE"
fi

exit $EXIT_CODE

