#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/run-all.mjs"

SCRIPTS_DIR="${1-}"
LOGS_DIR="${2-}"

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

