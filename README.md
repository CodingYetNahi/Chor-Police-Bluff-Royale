# Chor Police: Bluff Royale

An English, six-seat anonymous social-deduction game. Public play is free; private hosting has one server-recorded trial and an optional two-hour test-mode host pass. Bots are visibly labelled and use seeded rules.

## Architecture and trust boundary

The React client signs in with Firebase Anonymous Authentication, calls App Check-protected callable Functions, and observes Firestore snapshots. Cloud Functions transactionally own seats, policies, deadlines, roles, actions, votes, scoring, entitlements, and payment state. Public room data, per-user private state, and server-only bot/vote data are separate. Firestore rules deny writes to authoritative collections.

Collections include `players`, `rooms` with `members`, `privateState`, `actions`, and `votes`, plus `cases`, `entitlements`, `paymentOrders`, `payments`, `reports`, `systemConfig`, and rate-limit records.

## Local prerequisites and installation

Use Node 22, npm 10+, Java 21+, and Firebase CLI. Run:

```bash
npm ci
npm ci --prefix functions
cp .env.example .env.local
firebase emulators:start
npm run dev
```

Set `VITE_USE_FIREBASE_EMULATORS=true` only locally. Enable Anonymous Authentication in the emulator/console. Emulator ports are Auth 9099, Functions 5001, Firestore 8080, Hosting 5000, and UI 4000. Separate browser contexts create independent anonymous accounts.

## Configuration

Fill every `VITE_FIREBASE_*` placeholder with the Firebase web-app configuration. Create a reCAPTCHA Enterprise site key and configure its allowed domains for App Check; Functions bypass enforcement only when `FUNCTIONS_EMULATOR=true`. Never commit an App Check debug token.

Create Firestore and deploy `firestore.rules` and `firestore.indexes.json`. Grant administrators with a Firebase Auth `admin: true` custom claim; there is no shared PIN.

Set backend secrets, never frontend variables:

```bash
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET
```

Use Razorpay test-mode keys. Configure the webhook to the `processRazorpayWebhook` URL and subscribe to `payment.captured`. Purchasing remains disabled when secrets are absent; public play and joining private rooms remain available. Before production, confirm captured-payment API behaviour, webhook retry policy, allowed origins, App Check enforcement, budgets, alerts, backups, and retention.

## Quality and testing

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:rules
npm run test:e2e
npm run build
npm --prefix functions run build
npm run verify
```

Rules and browser suites require the Emulator Suite. See `docs/MANUAL_MULTIPLAYER.md` for the six-context security and reconnection procedure.

## Build, deployment, and rollback

Build with `npm run build`, then deploy reviewed targets with `firebase deploy --only firestore:rules,firestore:indexes,functions,hosting`. Do not deploy from an unreviewed workstation. Record the Hosting release and Functions revisions. Roll back Hosting in the Firebase console and redeploy the previous tagged Functions commit; rules should be rolled back only with compatible clients and schemas.

## Data retention and security assumptions

Anonymous accounts persist in browser-local Firebase Auth storage. Match records and reports should be retained only for the documented operational period; payment ledger retention must follow applicable accounting law. Schedule deletion/export processes before launch. The system assumes protected project IAM, secret manager, App Check, TLS, reviewed rules, and monitored Functions. Clients are hostile and never authoritative.

## Operational limitations

Live project IDs, App Check domain registration, administrator claims, Razorpay test credentials/webhook registration, alerting, backup policy, legal retention periods, and a final multi-device staging exercise require account-owner access. Offline clients cannot play; a match continues and missing actions safely abstain.

## Credits and licence

Application source is project-owned. Runtime dependency licences are recorded in their npm packages. Icons in `public/` are original geometric artwork created for this project; Lucide icons retain the Lucide licence. No third-party case text is included. Add a repository `LICENSE` before public redistribution.
