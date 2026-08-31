import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((file) => existsSync(file) && /\.(?:css|html|js|json|md|mjs|rules|ts|tsx|yml)$/.test(file));
const failures = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  if (source.includes('\r\n')) failures.push(`${file}: CRLF line endings`);
  if (/[ \t]+$/m.test(source)) failures.push(`${file}: trailing whitespace`);
  if (source && !source.endsWith('\n')) failures.push(`${file}: missing final newline`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Checked formatting invariants for ${files.length} text files.`);
