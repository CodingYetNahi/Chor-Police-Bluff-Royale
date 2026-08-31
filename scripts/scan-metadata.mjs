import { execFileSync } from 'node:child_process';
const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((f) => f && !f.endsWith('package-lock.json') && !f.endsWith('scan-metadata.mjs'));
const encoded = [
  'Z29vZ2xlIGFpIHN0dWRpbw==',
  'YWkgc3R1ZGlv',
  'Z2VtaW5p',
  'b3BlbmFp',
  'Z2VuZXJhdGl2ZSBhaQ==',
  'YnVpbHQgd2l0aCBhaQ==',
  'Z2VuZXJhdGVkIGJ5IGFp',
];
const patterns = encoded.map((value) => new RegExp(Buffer.from(value, 'base64').toString(), 'i'));
let bad = [];
for (const file of files) {
  const value = execFileSync('cat', [file], { encoding: 'utf8' });
  for (const pattern of patterns) if (pattern.test(value)) bad.push(file);
}
if (bad.length) {
  console.error([...new Set(bad)].join('\n'));
  process.exit(1);
}
console.log('Application metadata scan passed.');
