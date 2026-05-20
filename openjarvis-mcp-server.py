#!/usr/bin/env python3
"""OpenJarvis MCP stdio server — exposes OpenJarvis tools to Claude Code / Hugo.

Usage (Claude Code MCP config):
  command: uv
  args: ["run", "python3", "/home/user/h2568/openjarvis-mcp-server.py"]
  cwd: /home/user/h2568/openjarvis
"""

from __future__ import annotations

import json
import logging
import sys
import os

# Suppress all internal logging to stdout
logging.disable(logging.CRITICAL)
os.environ.setdefault("OPENJARVIS_TELEMETRY", "false")

from openjarvis.mcp.server import MCPServer
from openjarvis.mcp.protocol import MCPRequest


def serve() -> None:
    server = MCPServer()

    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue

        req = MCPRequest(
            method=data.get("method", ""),
            params=data.get("params", {}),
            id=data.get("id"),
        )

        try:
            resp = server.handle(req)
            out: dict = {"jsonrpc": "2.0", "id": resp.id}
            if resp.error is not None:
                out["error"] = resp.error
            else:
                out["result"] = resp.result
        except Exception as exc:
            out = {
                "jsonrpc": "2.0",
                "id": data.get("id"),
                "error": {"code": -32603, "message": str(exc)},
            }

        sys.stdout.write(json.dumps(out) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    serve()
