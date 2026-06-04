#!/usr/bin/env bash
set -euo pipefail

# Check Node.js >= 18
if ! command -v node &>/dev/null; then
  echo "Error: node is not installed. Install Node.js >= 18 from https://nodejs.org" >&2
  exit 1
fi

node_major=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$node_major" -lt 18 ]; then
  echo "Error: Node.js >= 18 required (found $(node --version))" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install --silent
fi

# Build if dist-cjs is missing or sources are newer
if [ ! -f dist-cjs/src/cli/simple-cli.js ] || \
   find src -name "*.ts" -newer dist-cjs/src/cli/simple-cli.js | grep -q .; then
  echo "Building..."
  npm run build --silent
fi

exec node bin/claude-flow.js "$@"
