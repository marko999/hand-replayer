# Hand Replayer — current state

## Scope
English PokerStars No-Limit Hold'em, cash/tournament, 2–9 players. Local browser processing; React/TypeScript/Vite. Parser → normalized events → immutable replay snapshots → separately themed UI. No deployment, other rooms, hand builder, export, or forum plugin.

## In progress
- Engine/parser plus accounting/rules tests: engine worker (src/core, tests/core).
- Responsive UI and modular styles: UI worker (src/ui, src/styles, entrypoints).
- Independent adversarial tests and forum/source research: verifier worker.
- Root owns integration, browser QA, documentation and all git operations.

## Evidence
Initial clean checkout confirmed at 86633bc2e32318049f2267d3bdaaf85b4bfca4e1. No app existed. Remote check from sandbox encountered DNS restriction; retry with network authorization needed.

## Next
Install dependencies, integrate APIs, run tests/build and real desktop/mobile browser QA. Record checked pushed milestones and limitations here.
