import { spawn } from 'node:child_process';
import os from 'node:os';

console.log('🚀 Starting Game Server and Client...\n');

const isWindows = os.platform() === 'win32';

// Start server
const server = spawn('npx', ['wrangler', 'dev'], {
  cwd: 'tgserver',
  stdio: 'inherit',
  shell: isWindows
});

// Start client
const client = spawn('npm', ['run', 'dev'], {
  cwd: 'tgclient',
  stdio: 'inherit',
  shell: isWindows
});

// Handle graceful shutdown (works partially — you may need to Ctrl+C twice)
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  client.kill();
  process.exit(0);
});