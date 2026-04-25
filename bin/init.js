#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync, spawnSync } = require('child_process');

const PKG_META = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const CURRENT_VERSION = PKG_META.version;

const PKG_ROOT = path.resolve(__dirname, '..');
const DEST = process.cwd();
const FORCE = process.argv.includes('--force');
const SKIP_MCP = process.argv.includes('--skip-mcp');
const DRY_RUN = process.argv.includes('--dry-run');
const YES = process.argv.includes('--yes');
const SUBCOMMAND = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : null;

const skillsArg = process.argv.find(a => a.startsWith('--skills='));
const SKILLS = skillsArg ? skillsArg.slice(9) : 'all';

const WHITELIST = ['.claude', 'CLAUDE.md', '.mcp.json', 'setup.sh', 'setup.ps1'];
const MARKER = '.claude-workflow-kit';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npx claude-workflow-kit [subcommand] [options]');
  console.log('');
  console.log('Subcommands:');
  console.log('  (default)    Install workflow files + MCP servers');
  console.log('  uninstall    Remove files previously installed by this tool');
  console.log('');
  console.log('Options:');
  console.log('  --force              Overwrite existing files');
  console.log('  --skip-mcp           Copy files only, skip MCP server installs');
  console.log('  --skills=<list>      Comma list of skill names, or "all" (default), or "none"');
  console.log('  --yes                Skip confirmation on uninstall');
  console.log('  --dry-run            Preview actions without writing');
  console.log('  --help, -h           Show this help');
  process.exit(0);
}

if (DRY_RUN) console.log('[dry-run mode — no changes will be made]\n');

function checkLatestVersion() {
  return new Promise((resolve) => {
    const req = https.get('https://registry.npmjs.org/claude-workflow-kit/latest', { timeout: 2000 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body).version); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function isNewer(latest, current) {
  const a = latest.split('.').map(Number);
  const b = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

function uninstall() {
  const markerPath = path.join(DEST, MARKER);
  if (!fs.existsSync(markerPath)) {
    console.error('ERROR: No ' + MARKER + ' marker found in ' + DEST);
    console.error('This directory was not installed by claude-workflow-kit.');
    process.exit(1);
  }
  const installed = fs.readFileSync(markerPath, 'utf8').trim();
  console.log('Installed version: ' + installed);
  console.log('');
  console.log('Will remove:');
  const present = [];
  for (const item of WHITELIST) {
    if (fs.existsSync(path.join(DEST, item))) {
      console.log('  - ' + item);
      present.push(item);
    }
  }
  console.log('  - ' + MARKER + ' (marker)');
  console.log('');
  console.log('Note: .gitignore entries NOT touched (prune manually if desired).');
  console.log('');

  if (DRY_RUN) { console.log('[dry-run] no changes made.'); return; }

  if (!YES) {
    console.log('Re-run with --yes to confirm removal:');
    console.log('  npx claude-workflow-kit uninstall --yes');
    return;
  }

  for (const item of present) {
    fs.rmSync(path.join(DEST, item), { recursive: true, force: true });
    console.log('  removed ' + item);
  }
  fs.rmSync(markerPath, { force: true });
  console.log('  removed ' + MARKER);
  console.log('');
  console.log('Uninstall complete.');
}

function skillsFilter(src) {
  if (SKILLS === 'all') return true;
  const skillsDir = path.join(PKG_ROOT, '.claude', 'skills');
  const rel = path.relative(skillsDir, src);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return true;
  if (rel === '') return SKILLS !== 'none';
  if (SKILLS === 'none') return false;
  const top = rel.split(path.sep)[0];
  const allow = SKILLS.split(',').map(s => s.trim()).filter(Boolean);
  return allow.includes(top);
}

async function main() {

if (SUBCOMMAND === 'uninstall') { uninstall(); return; }
if (SUBCOMMAND) {
  console.error('ERROR: Unknown subcommand: ' + SUBCOMMAND);
  process.exit(1);
}

// ── Version check (non-blocking) ──────────────────────────────────────────────

const latest = await checkLatestVersion();
if (latest && isNewer(latest, CURRENT_VERSION)) {
  console.log('! Update available: ' + CURRENT_VERSION + ' -> ' + latest);
  console.log('  Run: npx claude-workflow-kit@latest');
  console.log('');
}

// ── Preflight checks ──────────────────────────────────────────────────────────

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error('ERROR: Node.js 18+ required. Current: ' + process.version);
  process.exit(1);
}

function detectPython() {
  for (const cmd of ['python3', 'python']) {
    const r = spawnSync(cmd, ['--version'], { stdio: 'pipe' });
    if (r.status === 0) return cmd;
  }
  return null;
}

const pythonCmd = detectPython();
if (!pythonCmd) {
  console.error('ERROR: Python 3.10+ not found — install from https://python.org');
  process.exit(1);
}

console.log('Node.js : OK');
console.log('Python  : OK (' + pythonCmd + ')');
console.log('');

// ── Validate --skills ─────────────────────────────────────────────────────────

if (SKILLS !== 'all' && SKILLS !== 'none') {
  const skillsDir = path.join(PKG_ROOT, '.claude', 'skills');
  const available = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
    : [];
  const requested = SKILLS.split(',').map(s => s.trim()).filter(Boolean);
  const unknown = requested.filter(r => !available.includes(r));
  if (unknown.length) {
    console.error('ERROR: Unknown skill(s): ' + unknown.join(', '));
    console.error('Available: ' + (available.join(', ') || '(none)'));
    process.exit(1);
  }
}

// ── Copy files ────────────────────────────────────────────────────────────────

console.log('[1/3] Copying Claude Code workflow files...');
if (SKILLS !== 'all') console.log('  (skills filter: ' + SKILLS + ')');

for (const item of WHITELIST) {
  const src = path.join(PKG_ROOT, item);
  const dest = path.join(DEST, item);

  if (!fs.existsSync(src)) continue;

  if (fs.statSync(src).isDirectory()) {
    if (fs.existsSync(dest) && !FORCE) {
      console.log('  skip  ' + item + '/  (exists — use --force to overwrite)');
      continue;
    }
    if (!DRY_RUN) fs.cpSync(src, dest, { recursive: true, filter: skillsFilter });
    console.log('  copy  ' + item + '/');
  } else {
    if (fs.existsSync(dest) && !FORCE) {
      console.log('  skip  ' + item + '  (exists — use --force to overwrite)');
      continue;
    }
    if (!DRY_RUN) fs.copyFileSync(src, dest);
    console.log('  copy  ' + item);
  }
}

// ── Merge .gitignore ──────────────────────────────────────────────────────────

const templateIgnore = path.join(PKG_ROOT, '.gitignore-template');
const destIgnore = path.join(DEST, '.gitignore');

if (fs.existsSync(templateIgnore)) {
  const templateLines = fs.readFileSync(templateIgnore, 'utf8').split('\n');
  const existingLines = fs.existsSync(destIgnore)
    ? fs.readFileSync(destIgnore, 'utf8').split('\n')
    : [];
  const existingSet = new Set(existingLines.map(l => l.trim()));
  const toAppend = templateLines.filter(l => !existingSet.has(l.trim()));

  if (toAppend.length > 0) {
    const sep = existingLines.length > 0 ? '\n' : '';
    if (!DRY_RUN) fs.appendFileSync(destIgnore, sep + toAppend.join('\n'));
    console.log('  merge .gitignore (' + toAppend.filter(l => l.trim()).length + ' entries added)');
  } else {
    console.log('  skip  .gitignore (already up to date)');
  }
}

// ── Drop install marker ───────────────────────────────────────────────────────

const markerPath = path.join(DEST, MARKER);
if (!DRY_RUN) fs.writeFileSync(markerPath, CURRENT_VERSION + '\n');
console.log('  write ' + MARKER);

console.log('');

// ── Install MCP servers ───────────────────────────────────────────────────────

function run(cmd) {
  console.log('  $ ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

if (SKIP_MCP || DRY_RUN) {
  console.log('[2/3] Skipping MCP installs (' + (DRY_RUN ? '--dry-run' : '--skip-mcp') + ')');
  console.log('');
} else {
  console.log('[2/3] Installing MCP servers...');
  console.log('');

  console.log('  -> context-mode');
  run('npm install -g context-mode');
  console.log('');

  console.log('  -> code-review-graph');
  try {
    run('pip install code-review-graph');
  } catch (_) {
    run('pip3 install code-review-graph');
  }
  run('code-review-graph install --platform claude-code');
  console.log('');

  console.log('  -> playwright-cli');
  run('npm install -g @playwright/cli@latest');
  run('playwright-cli install --skills');
  console.log('');
}

// ── Done ──────────────────────────────────────────────────────────────────────

console.log('[3/3] Done.');
console.log('');
console.log('Next steps:');
console.log('  1. Restart Claude Code to activate MCP servers');
console.log('  2. Build the code-review-graph for this project (required by Rule 8):');
console.log('       code-review-graph build');

}

main().catch((e) => { console.error(e); process.exit(1); });
