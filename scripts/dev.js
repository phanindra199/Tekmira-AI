import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children = ['server', 'client'].map((part) => {
  const child = spawn(npmCommand, ['run', 'dev'], {
    cwd: path.join(root, part),
    stdio: 'inherit',
    shell: isWindows
  });
  child.on('error', (error) => {
    console.error(`Could not start ${part}: ${error.message}`);
  });
  return child;
});

function stopChildren() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', stopChildren);
process.on('SIGTERM', stopChildren);
