#!/usr/bin/env bash
# Hugo Multi-Agent Setup — run this once to bootstrap everything
# ─────────────────────────────────────────────────────────────
# Usage:
#   ANTHROPIC_API_KEY=sk-ant-api03-... bash hugo-setup.sh
# Or set it first:
#   export ANTHROPIC_API_KEY=sk-ant-api03-...
#   bash hugo-setup.sh

# ── Guard: fail immediately if no key is set ────────────────
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ERROR: ANTHROPIC_API_KEY is not set."
  echo ""
  echo "Run with:"
  echo "  ANTHROPIC_API_KEY=sk-ant-api03-... bash hugo-setup.sh"
  echo ""
  echo "Get your key from: platform.claude.com/settings/keys"
  exit 1
fi

set -euo pipefail
echo "✓ API key set"

# ── 1. Create the environment ────────────────────────────────
echo "Creating hugo-env environment..."
ENVIRONMENT_ID=$(ant beta:environments create \
  --name "hugo-env" \
  --config '{type: cloud, networking: {type: unrestricted}}' \
  --transform id --raw-output)
echo "✓ ENVIRONMENT_ID=$ENVIRONMENT_ID"

# ── 2. Create the Hugo agent from the prompt file ────────────
echo "Creating Hugo agent..."
AGENT_ID=$(ant beta:agents create \
  --name "Hugo" \
  --model '{id: claude-opus-4-7}' \
  --system @/home/user/h2568/hugo-agent-prompt.md \
  --tool '{type: agent_toolset_20260401}' \
  --transform id --raw-output)
echo "✓ AGENT_ID=$AGENT_ID"

# ── 3. Save IDs for reuse ────────────────────────────────────
cat > /home/user/h2568/.hugo-ids << EOF
export ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
export AGENT_ID="$AGENT_ID"
export ENVIRONMENT_ID="$ENVIRONMENT_ID"
EOF
echo "✓ IDs saved to .hugo-ids"

# ── 4. Create first session and send the Meta Ads task ───────
echo "Creating session..."
SESSION_ID=$(ant beta:sessions create \
  --agent "$AGENT_ID" \
  --environment-id "$ENVIRONMENT_ID" \
  --transform id --raw-output)
echo "✓ SESSION_ID=$SESSION_ID"

echo "Sending task to Hugo..."
ant beta:sessions:events send \
  --session-id "$SESSION_ID" \
  --event '{type: user.message, content: [{type: text, text: "Audit my Meta Ads account and produce a health score report."}]}'

echo ""
echo "═══════════════════════════════════════════════"
echo "Hugo is running. Stream the response with:"
echo "ant beta:sessions:events stream --session-id $SESSION_ID"
echo "═══════════════════════════════════════════════"
