# Manual multiplayer emulator checklist

1. Start all emulators and the Vite client; open six isolated browser contexts.
2. Confirm each context receives a distinct anonymous UID and refresh preserves it.
3. Create a private room, share `?join=CODE`, confirm in five contexts, and verify a seventh cannot join.
4. Inspect Firestore: roles occur only in each human's private document; another context receives permission denied.
5. Test all policies: six ready humans; host-filled bots; and 30-second invitation priority followed by 20-second public window then bot fill.
6. Start two public players, confirm no fabricated count, wait 20 seconds, fill bots, and confirm all bots have a permanent BOT label.
7. Refresh during every phase; confirm seat restoration and server deadline progression. Attempt early and duplicate phase advancement.
8. Attempt self/invalid/duplicate/late votes and special actions; each must be rejected. Disconnect a voter and confirm abstention.
9. Complete a tie, protector action, reveal, scoring, and rematch. Confirm exactly-once statistics and rotated case.
10. Test keyboard-only and mobile viewports, offline fallback, worker update notice, 404, and purchasing-unavailable state.
