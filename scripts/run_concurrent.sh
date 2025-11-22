#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/run-concurrent.mjs"

SCRIPTS_DIR="${1-}"
LOGS_DIR="${2-}"
BATCH_SIZE="${3-}"
DELAY="${4-}"

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

if [[ -n "${BATCH_SIZE}" ]]; then
  export CURL_RUNNER_BATCH_SIZE="${BATCH_SIZE}"
else
  unset CURL_RUNNER_BATCH_SIZE 2>/dev/null || true
fi

if [[ -n "${DELAY}" ]]; then
  export CURL_RUNNER_DELAY="${DELAY}"
else
  unset CURL_RUNNER_DELAY 2>/dev/null || true
fi

node "$NODE_SCRIPT"

