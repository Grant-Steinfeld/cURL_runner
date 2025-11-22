#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") <script-name> [scripts-dir] [logs-dir]" >&2
  exit 1
fi

SCRIPT_NAME="$1"
shift

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/run-script.mjs"

SCRIPTS_DIR="${1-}"
LOGS_DIR="${2-}"

export CURL_RUNNER_SCRIPT="${SCRIPT_NAME}"

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

node "$NODE_SCRIPT"

