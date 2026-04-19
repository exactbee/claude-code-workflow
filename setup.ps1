# setup.ps1 — Windows setup for claude-code-workflow
# Run: .\setup.ps1  (may need: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser)

$ErrorActionPreference = "Stop"

Write-Host "=== claude-code-workflow setup ===" -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found — install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js: OK" -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command python3 -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Python 3.10+ not found — install from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host "Python: OK" -ForegroundColor Green

Write-Host ""
Write-Host "[1/3] Installing context-mode (global MCP server)..." -ForegroundColor Yellow
npx @mksglu/context-mode install

Write-Host ""
Write-Host "[2/3] Installing code-review-graph..." -ForegroundColor Yellow
pip install code-review-graph

Write-Host ""
Write-Host "[3/3] Installing playwright-cli..." -ForegroundColor Yellow
npm install -g @playwright/cli@latest
playwright-cli install --skills

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "Restart Claude Code to activate all MCP servers." -ForegroundColor Green
Write-Host "Per-project: cd <your-project> && code-review-graph build" -ForegroundColor Green
