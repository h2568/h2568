#!/usr/bin/env python3
"""
coinbase_sync.py  –  Sync Coinbase trades to AI-Trader automatically.

Setup
-----
1. Install dependencies:
       pip install requests PyJWT cryptography

2. Create a Coinbase Advanced Trade API key at:
       https://www.coinbase.com/settings/api
   Give it "View" permission (read-only is enough).

3. Export your credentials before running:
       export COINBASE_API_KEY="organizations/xxx/apiKeys/yyy"
       export COINBASE_API_SECRET="-----BEGIN EC PRIVATE KEY-----\n..."
       export AITRADER_EMAIL="your@email.com"
       export AITRADER_PASSWORD="your_password"

4. Run:
       python coinbase_sync.py

The script polls Coinbase every 60 seconds and publishes any new fills to
AI-Trader so your followers can see and copy your trades.
"""

import os
import json
import time
import secrets
import requests
import jwt  # PyJWT
from datetime import datetime, timezone, timedelta
from pathlib import Path
from cryptography.hazmat.primitives.serialization import load_pem_private_key

# ── Configuration ─────────────────────────────────────────────────────────────

CB_KEY_NAME   = os.environ.get("COINBASE_API_KEY", "")
CB_KEY_SECRET = os.environ.get("COINBASE_API_SECRET", "")
AT_EMAIL      = os.environ.get("AITRADER_EMAIL", "")
AT_PASSWORD   = os.environ.get("AITRADER_PASSWORD", "")

COINBASE_BASE = "https://api.coinbase.com"
AITRADER_BASE = "https://ai4trade.ai/api"
SYNCED_FILE   = Path("synced_trades.json")
POLL_INTERVAL = 60   # seconds between Coinbase checks
TOKEN_TTL     = 1700 # re-login to AI-Trader every ~28 min (tokens expire at 30)

# ── Coinbase JWT Auth ─────────────────────────────────────────────────────────

def _coinbase_jwt() -> str:
    private_key = load_pem_private_key(
        CB_KEY_SECRET.replace("\\n", "\n").encode(), password=None
    )
    payload = {
        "sub": CB_KEY_NAME,
        "iss": "coinbase-cloud",
        "nbf": int(time.time()),
        "exp": int(time.time()) + 120,
    }
    return jwt.encode(
        payload,
        private_key,
        algorithm="ES256",
        headers={"kid": CB_KEY_NAME, "nonce": secrets.token_hex(16)},
    )

def cb_headers() -> dict:
    return {"Authorization": f"Bearer {_coinbase_jwt()}"}

# ── Synced-trade tracking (stored locally so restarts don't re-publish) ───────

def load_synced() -> set:
    if SYNCED_FILE.exists():
        return set(json.loads(SYNCED_FILE.read_text()))
    return set()

def save_synced(synced: set):
    SYNCED_FILE.write_text(json.dumps(list(synced), indent=2))

# ── AI-Trader Auth ────────────────────────────────────────────────────────────

def aitrader_login() -> str:
    resp = requests.post(f"{AITRADER_BASE}/claw/agents/login", json={
        "email": AT_EMAIL,
        "password": AT_PASSWORD,
    }, timeout=10)
    resp.raise_for_status()
    return resp.json()["token"]

# ── Fetch Coinbase fills ──────────────────────────────────────────────────────

def fetch_fills(since_iso: str) -> list:
    resp = requests.get(
        f"{COINBASE_BASE}/api/v3/brokerage/orders/historical/fills",
        headers=cb_headers(),
        params={"start_sequence_timestamp": since_iso, "limit": 100},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("fills", [])

# ── Map a Coinbase fill to an AI-Trader signal payload ────────────────────────

def map_fill(fill: dict) -> dict:
    side = fill.get("side", "BUY").upper()
    action = "buy" if side == "BUY" else "sell"

    # Coinbase product_id is like "BTC-USD" → take the base asset
    symbol = fill.get("product_id", "BTC-USD").split("-")[0]

    return {
        "market": "crypto",
        "action": action,
        "symbol": symbol,
        "price": float(fill.get("price", 0)),
        "quantity": float(fill.get("size", 0)),
        "content": f"Synced from Coinbase | order {fill.get('order_id', '')}",
        "executed_at": fill.get("trade_time", datetime.now(timezone.utc).isoformat()),
    }

# ── Publish one signal to AI-Trader ──────────────────────────────────────────

def publish_signal(token: str, payload: dict) -> bool:
    resp = requests.post(
        f"{AITRADER_BASE}/signals/realtime",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
        timeout=10,
    )
    if resp.ok:
        print(
            f"  [OK] {payload['action'].upper()} "
            f"{payload['quantity']} {payload['symbol']} "
            f"@ {payload['price']}"
        )
        return True
    print(f"  [FAIL] {resp.status_code}: {resp.text}")
    return False

# ── Validation ────────────────────────────────────────────────────────────────

def validate_config():
    required = {
        "COINBASE_API_KEY": CB_KEY_NAME,
        "COINBASE_API_SECRET": CB_KEY_SECRET,
        "AITRADER_EMAIL": AT_EMAIL,
        "AITRADER_PASSWORD": AT_PASSWORD,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        print("ERROR: Missing environment variables:")
        for m in missing:
            print(f"  export {m}=\"...\"")
        raise SystemExit(1)

# ── Main loop ─────────────────────────────────────────────────────────────────

def main():
    validate_config()

    print("Logging in to AI-Trader...")
    at_token = aitrader_login()
    token_refreshed_at = time.time()
    print("Logged in.\n")

    synced = load_synced()
    # First run: look back 24 hours so we catch today's trades
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

    print(f"Watching Coinbase for new fills (every {POLL_INTERVAL}s).")
    print("Press Ctrl+C to stop.\n")

    while True:
        try:
            # Refresh AI-Trader token before it expires
            if time.time() - token_refreshed_at > TOKEN_TTL:
                at_token = aitrader_login()
                token_refreshed_at = time.time()
                print("[Auth] AI-Trader token refreshed.")

            fills = fetch_fills(since)
            new_fills = [f for f in fills if f.get("trade_id") not in synced]

            if new_fills:
                print(f"Found {len(new_fills)} new fill(s):")
                latest_time = since
                for fill in new_fills:
                    signal = map_fill(fill)
                    if publish_signal(at_token, signal):
                        synced.add(fill["trade_id"])
                        # Track the most recent trade time
                        t = fill.get("trade_time", "")
                        if t > latest_time:
                            latest_time = t
                save_synced(synced)
                since = latest_time
                print()
            else:
                now = datetime.now().strftime("%H:%M:%S")
                print(f"[{now}] No new fills. Next check in {POLL_INTERVAL}s...")

        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except requests.HTTPError as e:
            print(f"[HTTP Error] {e}")
        except Exception as e:
            print(f"[Error] {e}")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
