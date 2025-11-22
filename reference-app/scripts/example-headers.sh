#!/usr/bin/env bash

# Example request with custom headers
curl -X GET "https://httpbin.org/headers" \
  -H "Accept: application/json" \
  -H "X-Custom-Header: test-value" \
  -H "X-Request-ID: $(uuidgen 2>/dev/null || echo 'test-123')" \
  --silent \
  --show-error \
  --fail \
  --write-out "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n"

