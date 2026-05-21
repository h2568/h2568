#!/usr/bin/env bash
# Hugo → Telegram notification sender
# Called automatically by Hugo whenever a significant change is made.
# Usage: bash hugo-notify.sh "message"
#
# Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from environment or .hugo-ids

set -euo pipefail

source /home/user/h2568/.hugo-ids 2>/dev/null || true

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-7276691513}"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN not set."
  exit 1
fi

MESSAGE="${*:-Hugo notification}"
TIMESTAMP=$(date "+%d %b %Y, %H:%M")

PAYLOAD=$(python3 -c "
import json, sys
msg = sys.argv[1]
ts  = sys.argv[2]
full = f'*Hugo — Vantor Crew*\n_{ts}_\n\n{msg}'
print(json.dumps({'chat_id': '${CHAT_ID}', 'text': full, 'parse_mode': 'Markdown'}))
" "$MESSAGE" "$TIMESTAMP")

RESULT=$(curl -s -X POST \
  "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

OK=$(python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',False))" <<< "$RESULT")
if [[ "$OK" == "True" ]]; then
  echo "✓ Telegram notification sent"
else
  echo "✗ Failed: $RESULT"
  exit 1
fi
