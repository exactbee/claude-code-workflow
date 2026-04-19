#!/usr/bin/env bash
set -e

echo "=== claude-code-workflow setup ==="

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found — install from https://nodejs.org"
  exit 1
fi
echo "Node.js: OK"

# Check Python
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
  echo "ERROR: Python 3.10+ not found — install from https://python.org"
  exit 1
fi
echo "Python: OK"

echo ""
echo "[1/3] Installing context-mode (global MCP server)..."
npx @mksglu/context-mode install

echo ""
echo "[2/3] Installing code-review-graph..."
pip install code-review-graph

echo ""
echo "[3/3] Installing playwright-cli..."
npm install -g @playwright/cli@latest
playwright-cli install --skills

echo ""
echo "=== Done ==="
echo "Restart Claude Code to activate all MCP servers."
echo "Per-project: cd <your-project> && code-review-graph build"
