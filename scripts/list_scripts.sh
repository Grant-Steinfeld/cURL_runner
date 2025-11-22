#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/list-scripts.mjs"

SCRIPTS_DIR="${1-}"

if [[ -n "${SCRIPTS_DIR}" ]]; then
  export CURL_RUNNER_SCRIPTS_DIR="${SCRIPTS_DIR}"
else
  unset CURL_RUNNER_SCRIPTS_DIR 2>/dev/null || true
fi

node "$NODE_SCRIPT"

