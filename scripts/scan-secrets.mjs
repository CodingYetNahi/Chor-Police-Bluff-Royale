import { execFileSync } from 'node:child_process';
const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((f) => f && !f.endsWith('package-lock.json') && !f.includes('scan-secrets'));
const pattern = /(-----BEGIN (RSA |EC )?PRIVATE KEY-----|rzp_live_[A-Za-z0-9]+|AIza[0-9A-Za-z_-]{30,})/;
for (const f of files) {
  if (pattern.test(execFileSync('cat', [f], { encoding: 'utf8' }))) {
    console.error(`Possible secret in ${f}`);
    process.exit(1);
  }
}
console.log('Secret-pattern scan passed.');
