#!/usr/bin/env bash
# Hugo Parallel — spin up multiple Hugo instances simultaneously
# ─────────────────────────────────────────────────────────────
# Run hugo-setup.sh first to create your agent and environment.
# Then: bash hugo-parallel.sh

set -euo pipefail

# ── Load saved IDs ───────────────────────────────────────────
if [[ ! -f /home/user/h2568/.hugo-ids ]]; then
  echo "ERROR: Run hugo-setup.sh first to create your agent and environment."
  exit 1
fi
source /home/user/h2568/.hugo-ids
echo "✓ Loaded AGENT_ID=$AGENT_ID"
echo "✓ Loaded ENVIRONMENT_ID=$ENVIRONMENT_ID"

# ── Define tasks for each Hugo instance ─────────────────────
# Edit these tasks to whatever you need
TASKS=(
  "Audit my Google Ads account and produce a health score report."
  "Write LinkedIn ad copy for Vantor Crew Ltd — a professional event crewing company in London and Manchester."
  "Run a budget allocation review using the 70/20/10 rule and the 3x Kill Rule. What should I pause and what should I scale?"
)

# ── Spawn one session per task in parallel ───────────────────
SESSION_IDS=()

echo ""
echo "Spinning up ${#TASKS[@]} Hugo instances..."

for TASK in "${TASKS[@]}"; do
  SESSION_ID=$(ant beta:sessions create \
    --agent "$AGENT_ID" \
    --environment-id "$ENVIRONMENT_ID" \
    --transform id --raw-output)

  ant beta:sessions:events send \
    --session-id "$SESSION_ID" \
    --event "{type: user.message, content: [{type: text, text: \"$TASK\"}]}" \
    > /dev/null &

  SESSION_IDS+=("$SESSION_ID")
  echo "✓ Started session $SESSION_ID → $TASK"
done

wait
echo ""
echo "All ${#TASKS[@]} Hugo instances running."
echo ""
echo "Stream each one:"
for i in "${!SESSION_IDS[@]}"; do
  echo "  Instance $((i+1)): ant beta:sessions:events stream --session-id ${SESSION_IDS[$i]}"
done

echo ""
echo "Read results when done:"
for i in "${!SESSION_IDS[@]}"; do
  echo "  Instance $((i+1)): ant beta:sessions:events list --session-id ${SESSION_IDS[$i]} --transform 'content.0.text' --format auto --raw-output"
done
