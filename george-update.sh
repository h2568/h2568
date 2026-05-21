#!/usr/bin/env bash
# Send a formatted update to George via Telegram
# Usage: bash george-update.sh "Your message"
#   Or:  bash george-update.sh  (interactive mode)
#
# Run telegram-setup.sh first to get TELEGRAM_CHAT_ID

set -euo pipefail

source /home/user/h2568/.hugo-ids 2>/dev/null || true

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [[ -z "$TOKEN" || -z "$CHAT_ID" ]]; then
  echo "ERROR: Run telegram-setup.sh first to configure your bot and chat ID."
  exit 1
fi

# Message from argument or interactive prompt
if [[ $# -ge 1 ]]; then
  MESSAGE="$*"
else
  echo "George update message (press ENTER twice when done):"
  MESSAGE=""
  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    MESSAGE="${MESSAGE}${line}\n"
  done
  MESSAGE="${MESSAGE%\\n}"
fi

if [[ -z "$MESSAGE" ]]; then
  echo "No message provided."
  exit 1
fi

# Format with timestamp and Vantor branding
TIMESTAMP=$(date "+%d %b %Y, %H:%M")
FULL_MSG="*Vantor Crew — Site Update*
_${TIMESTAMP}_

${MESSAGE}

— Harry"

RESULT=$(curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": \"${CHAT_ID}\",
    \"text\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$FULL_MSG"),
    \"parse_mode\": \"Markdown\"
  }")

OK=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',False))")
if [[ "$OK" == "True" ]]; then
  echo "✓ Message sent to George via Telegram"
else
  echo "✗ Failed: $RESULT"
  exit 1
fi
