# Architecture

The application runs in the browser. Imported hand histories remain in page memory; no account, API, analytics, remote fonts, or hand-history upload service is needed. Reloading discards the imported hand.

## Boundaries

- `src/core`: PokerStars input parsing, normalized events, validation and deterministic snapshots. It does not import React or styles.
- `src/poker/evaluate.ts`: small standard Hold'em evaluator. It enumerates every five-card subset of the available cards and compares category/kickers; suits never break ties. Known cards can disprove an award; hidden cards cannot establish an unknown opponent's hand.
- `src/ui`, `src/App.tsx`: import workflow, presentation and replay controls. Seeking selects an already computed snapshot rather than mutating chip accounting.
- `src/styles`: layout/component styling and independent theme tokens. A visual redesign does not require changing the parser or engine.

Amounts are represented as integer minor units, with a cash scale of 100 and tournament scale of 1. Parsing must reject values that cannot be represented exactly within safe integer bounds. Formatting is a display concern. No action adds floating-point currency values.

`parseReplay(text)` returns either a validated replay or structured issues categorized as invalid, incomplete or unsupported. `states[0]` is the initial state; `states[n+1]` is the state after `events[n]`. Cards become visible when their deal/show event happens. Any optional reveal mode must be an explicit UI choice.

## Validation is consistency, not authenticity

A well-formed text file can be fabricated. The validator checks the supported rules, transitions and chip ledger. It cannot verify that PokerStars issued the record or identify cards missing from that record. Rake is reconciled against the summary, not recalculated from a current room fee schedule.

## Changing a theme

Keep colors, felt, borders, typography and shadows in the theme layer. Keep seat/card geometry in the table layout stylesheet. Do not encode game decisions (folding, pot membership, next actor, legal raises) in CSS or components; consume the normalized state.
