#!/usr/bin/env bash

# Example GET request
curl -X GET "https://httpbin.org/get" \
  -H "Accept: application/json" \
  -H "User-Agent: curl-runner-reference/1.0" \
  --silent \
  --show-error \
  --fail \
  --write-out "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n"

