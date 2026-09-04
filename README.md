# Hand Replayer

A local browser replayer for complete **English PokerStars No-Limit Hold'em** hand histories. Paste a hand or choose a text file, validate its consistency, and replay each action. Cash games and tournaments, 2–9 seated players.

Phase one is implemented. This is an independently tested initial release with a deliberately limited grammar, **not universal PokerStars format support**. It is not affiliated with PokerStars and does not verify a history's authenticity.

## Run locally

Requires Node.js 22.12+ (or 20.19+) and npm. Tested on Node 25.2.1.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The page starts with a fictional example hand. Use **Import hand** to paste/upload one complete hand including its summary. Imported hands are held in browser memory and discarded on reload; there is no backend, account, telemetry or remote hand-history storage.

```sh
npm test          # rules, adversarial cases and exhaustive five-card ranking distribution
npm run build    # strict TypeScript check + production bundle
npm run preview  # serve the built bundle locally, normally port 4173
```

## Replay controls

- Play/pause; 0.5×, 1×, 2× and 4× playback speeds.
- Previous/next action, start/end, timeline seek and street jumps.
- Space to play/pause, arrows to step, Home/End to seek when focus is outside a form control. Controls also work with their native keyboard behavior.
- Known cards appear at their recorded reveal event. **Reveal known cards** explicitly shows cards eventually recorded in the history; missing cards remain unknown.
- Main/side pots, eligibility tooltips, street contributions, remaining stacks, dealer and next actor are shown at each snapshot.
- Midnight and Forest themes are independent of the poker engine.

## Validation and coverage

The parser produces normalized events; the engine produces deterministic snapshots. Playback and backward seeking never recalculate or mutate the ledger. All chip amounts use exact integer minor units, guarded against unsafe integer overflow. Cash supports USD/EUR/GBP or play chips with two decimal places; tournaments use whole chips.

Checks cover seat/button/blind consistency, individual uniform antes, action order, call/check/bet/raise/fold legality, all-in stack caps, minimum raises and cumulative short-all-in reopening, uncalled returns, multiple side pots, payout eligibility, known winning hand strength, split pots/odd chips, rake reconciliation, duplicate cards and contradictions in provided summary fields.

Unknown cards cannot prove the actual winner; the record still must have legal eligible payouts, equal declared split shares and balanced accounting. Rake is reconciled from the record, not recalculated from PokerStars fee schedules. Hand-category prose such as “a flush” is descriptive text; actual cards determine ranking.

See [coverage and known limitations](docs/COVERAGE.md), [fixture provenance](docs/FIXTURE-SOURCES.md) and [browser QA evidence](docs/QA.md). Tests include independent counterexamples and the complete **2,598,960 five-card hand category distribution**, not just a small set of handpicked evaluator examples.

## Architecture and themes

- `src/core/`: parser, types, rule validation and snapshot generation.
- `src/poker/`: Hold'em hand evaluation.
- `src/ui/` and `src/App.tsx`: import, table and controls.
- `src/styles/theme.css`: theme tokens; `src/styles/app.css`: layout/components.

See [architecture](docs/ARCHITECTURE.md). There are no React or CSS dependencies inside the poker engine. The UI consumes core types directly.

## Later phases

[Forum integration research](docs/FORUM-INTEGRATION.md) records concrete Two Plus Two, Reddit and CardsChat examples and a future link/text/preview proposal. No forum integration or public deployment is included. Other rooms, manual hand authoring and export remain outside this release.
