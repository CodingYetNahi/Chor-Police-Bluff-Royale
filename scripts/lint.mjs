import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

execFileSync(
  process.platform === 'win32' ? 'node_modules/.bin/tsc.cmd' : 'node_modules/.bin/tsc',
  ['--noEmit'],
  {
    stdio: 'inherit',
  },
);

const files = execFileSync('git', ['ls-files', '*.ts', '*.tsx', '*.js', '*.mjs'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((file) => file && existsSync(file));
const failures = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  if (/\bdebugger\s*;/.test(source)) failures.push(`${file}: debugger statement`);
  if (file.startsWith('src/') && !file.includes('__tests__') && /\bgameEngine\s*\./.test(source))
    failures.push(`${file}: legacy browser-authoritative engine call`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Linted ${files.length} source files.`);
