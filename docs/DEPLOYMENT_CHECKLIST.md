# Deployment checklist

- [ ] `npm ci` succeeds at root and in `functions`.
- [ ] `npm run verify` and emulator browser tests pass.
- [ ] Prohibited metadata and secret scans pass.
- [ ] Anonymous Auth, Firestore indexes, rules, App Check, allowed domains, IAM and budgets are reviewed.
- [ ] Functions secrets contain test or authorised production values; no secret is in Hosting configuration.
- [ ] Razorpay webhook signature and captured-payment fixture tests pass.
- [ ] Administrator custom claims are assigned to named operational accounts only.
- [ ] Backup, retention, monitoring, incident and rollback owners approve.
- [ ] Hosting preview is checked on keyboard, screen reader, iOS Safari and Android Chrome.
- [ ] Tag the release and record previous Hosting/Functions revisions.
