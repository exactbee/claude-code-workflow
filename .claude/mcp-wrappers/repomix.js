#!/usr/bin/env node
const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const command = isWindows ? 'cmd' : 'npx';
const args = isWindows ? ['/c', 'npx', '-y', 'repomix', '--mcp'] : ['-y', 'repomix', '--mcp'];

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: false,
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));

child.on('exit', (code) => {
  process.exit(code);
});
