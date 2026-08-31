export default [
  { ignores: ['dist/**', 'functions/lib/**', 'node_modules/**', '**/*.{ts,tsx}'] },
  {
    files: ['**/*.{js,mjs}'],
    rules: { 'no-debugger': 'error', 'no-constant-condition': 'error', 'no-empty': 'error' },
  },
];
