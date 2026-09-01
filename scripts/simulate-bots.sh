#!/usr/bin/env bash

set -euo pipefail

base_url="${TARGET_URL:-http://localhost:3000}"
endpoint="${base_url%/}/api/traffic"

run_scenario() {
  local name="$1"
  local user_agent="$2"
  local category="$3"
  local bot_name="$4"
  local verified="$5"

  printf '\n%s\n' "=== ${name} ==="
  curl --silent --show-error --request POST \
    --header "user-agent: ${user_agent}" \
    --header "x-bot-category: ${category}" \
    --header "x-bot-name: ${bot_name}" \
    --header "x-bot-verified: ${verified}" \
    --write-out '\nHTTP %{http_code}\n' \
    "${endpoint}"
}

printf '%s\n' "Sending requests to ${endpoint}"
printf '%s\n' "Requests include the selected user agent and raw x-bot-* headers."

run_scenario "Command-line client" "curl/8.7.1" "http_client" "curl" "false"
run_scenario "Headless browser" "Mozilla/5.0 HeadlessChrome/128.0 Playwright" "automated_browser" "HeadlessChrome" "false"
run_scenario "Googlebot impersonator" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "unverified_bot" "Googlebot" "false"
run_scenario "Verified crawler example" "Googlebot/2.1" "search_engine" "Googlebot" "true"
