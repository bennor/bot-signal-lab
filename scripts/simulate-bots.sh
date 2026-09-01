#!/usr/bin/env bash

set -euo pipefail

base_url="${TARGET_URL:-http://localhost:3000}"
endpoint="${base_url%/}/api/traffic"

run_scenario() {
  local name="$1"
  local user_agent="$2"

  printf '\n%s\n' "=== ${name} ==="
  curl --silent --show-error --request POST \
    --header "user-agent: ${user_agent}" \
    --write-out '\nHTTP %{http_code}\n' \
    "${endpoint}"
}

printf '%s\n' "Sending requests to ${endpoint}"
printf '%s\n' "Requests include only the selected user agent."

run_scenario "Command-line client" "curl/8.7.1"
run_scenario "Headless browser" "Mozilla/5.0 HeadlessChrome/128.0 Playwright"
run_scenario "Googlebot impersonator" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
run_scenario "OpenAI GPTBot" "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot"
