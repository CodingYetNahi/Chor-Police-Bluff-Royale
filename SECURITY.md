# Security policy

Report vulnerabilities privately to the repository owner; do not open a public issue containing credentials, private roles, payment data, or an exploit. Include affected commit, reproduction, impact, and suggested mitigation. Do not test against production accounts without written authorisation.

Supported releases are the current production tag and current default branch. Rotate a suspected secret immediately, disable affected Functions, preserve audit logs, revoke sessions when appropriate, patch and test with emulators, and publish a concise incident notice. Payment data is limited to provider identifiers, amount, currency, ownership, and status; card or bank credentials must never enter this application.
