#!/usr/bin/env bash
# Telegram bot setup — run this ONCE on your machine to get your chat ID
# Usage: source /home/user/h2568/.hugo-ids && bash /home/user/h2568/telegram-setup.sh

set -euo pipefail

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  source /home/user/h2568/.hugo-ids 2>/dev/null || true
  TOKEN="${TELEGRAM_BOT_TOKEN:-}"
fi
if [[ -z "$TOKEN" ]]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN not set. Run: source /home/user/h2568/.hugo-ids"
  exit 1
fi

echo "── Step 1: Verify bot ─────────────────────────────────────"
BOT_INFO=$(curl -s "https://api.telegram.org/bot${TOKEN}/getMe")
BOT_NAME=$(echo "$BOT_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin)['result']; print(d.get('username','?'))")
echo "✓ Bot: @$BOT_NAME"

echo ""
echo "── Step 2: Get your chat ID ───────────────────────────────"
echo "  → Open Telegram and send ANY message to @$BOT_NAME now."
echo "  → Then press ENTER here to continue."
read -r

UPDATES=$(curl -s "https://api.telegram.org/bot${TOKEN}/getUpdates")
CHAT_ID=$(echo "$UPDATES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
results = data.get('result', [])
if not results:
    print('')
else:
    last = results[-1]
    msg = last.get('message') or last.get('channel_post') or {}
    chat = msg.get('chat', {})
    print(chat.get('id', ''))
")

if [[ -z "$CHAT_ID" ]]; then
  echo "No messages found. Did you message the bot? Try again."
  exit 1
fi

echo "✓ Chat ID found: $CHAT_ID"

# Save to .hugo-ids
if ! grep -q "TELEGRAM_CHAT_ID" /home/user/h2568/.hugo-ids 2>/dev/null; then
  echo "export TELEGRAM_CHAT_ID=\"$CHAT_ID\"" >> /home/user/h2568/.hugo-ids
else
  sed -i "s/export TELEGRAM_CHAT_ID=.*/export TELEGRAM_CHAT_ID=\"$CHAT_ID\"/" /home/user/h2568/.hugo-ids
fi
echo "✓ Saved to .hugo-ids"

echo ""
echo "── Step 3: Send test message ──────────────────────────────"
RESULT=$(curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"$CHAT_ID\", \"text\": \"✅ Hugo is connected. Updates from Vantor Crew command centre will appear here.\", \"parse_mode\": \"Markdown\"}")

OK=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok','false'))")
if [[ "$OK" == "True" ]]; then
  echo "✓ Test message sent to Telegram!"
else
  echo "✗ Send failed: $RESULT"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Telegram is wired up."
echo "  Bot:     @$BOT_NAME"
echo "  Chat ID: $CHAT_ID"
echo ""
echo "To send a message to George:"
echo "  source /home/user/h2568/.hugo-ids"
echo "  bash /home/user/h2568/george-update.sh \"Your message here\""
echo "═══════════════════════════════════════════════════════════"
