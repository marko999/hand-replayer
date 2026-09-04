# Hand Replayer — current state

## Scope and implementation
English PokerStars standard No-Limit Hold'em, cash/tournament, 2–9 players. Complete single hand at a time; local browser processing. React/TypeScript/Vite; parser → normalized events → deterministic snapshots → independently themed UI. No deployment, other rooms, hand builder, export or forum plugin.

Engine/parser, evaluator, responsive UI, independent adversarial tests and forum research are implemented. Two public source-derived anonymized fixtures have verified MIT attribution; other fixtures are original synthetic cases. Summary-only hole cards reveal at their own late event.

## Verified
- 91 automated tests pass, including61 independent adversarial tests and exhaustive2,598,960 five-card ranking distribution.
- TypeScript/Vite production build passes. npm dependency audit clean at installation.
- Desktop and390/320 phone browser QA: import, playback/speed/pause, step/seek, reveal/backward privacy, street jumps, side-pot labels, all2–9 seat layouts and9 simultaneous street wagers. Corrections rechecked.
- Details: docs/QA.md, docs/COVERAGE.md, docs/FIXTURE-SOURCES.md, docs/FORUM-INTEGRATION.md.

## Git and runtime
Last confirmed pushed checkpoint: ee9886b (scaffold/evaluator). Full app integration is being committed next; root alone runs Git. Canonical checkout: /Users/m1/Documents/Codex/2026-09-04/hand-replayer. Vite dev server: http://127.0.0.1:5173 (session92698).

## Limits
One English standard hand, no unusual rooms/variants/dead blinds/multi-board/big-blind ante.2MiB/10,000line input limit; supported currencies USD/EUR/GBP/play chips. Multiple pots require explicit main/side payout labels. Unknown cards and authenticity remain unverifiable. See coverage for exact boundaries.

## Next
Finish final production-preview/summary-reveal browser checks, save QA screenshots, commit/push coherent integration, independently verify remote SHA and finish documentation push. No user approval needed for already-authorized source pushes. Public deployment remains outside scope.
