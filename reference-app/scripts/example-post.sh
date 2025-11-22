#!/usr/bin/env bash

# Example POST request with JSON data
curl -X POST "https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"message": "Hello from curl-runner-reference", "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' \
  --silent \
  --show-error \
  --fail \
  --write-out "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n"

