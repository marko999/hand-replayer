# Coverage and known limits

Initial release, checked 4 September 2026. The supported boundary is a complete, single-board English PokerStars standard No-Limit Hold'em record, cash or tournament, 2–9 players. The corpus is two anonymized public source-derived hands plus original synthetic cases; this is not evidence of exhaustive historical-format coverage.

| Area | Verified behavior |
| --- | --- |
| Import | Paste and local file; one hand; BOM/CRLF normalization; recognized current `Hand` and older `Game` headers |
| Stakes/amounts | USD/EUR/GBP or play-chip cash, cent precision; whole tournament chips; exact grouping/currency checks and safe-integer limits |
| Setup | Seat uniqueness/capacity, seated button, clockwise blind positions, posted amounts, uniform individual antes |
| Betting | 2–9 players, heads-up action, full raises, short all-in caps, cumulative reopening, calls/checks/folds and next actor |
| Accounting | Every-state conservation; different all-in stacks, multiple side pots, folded dead money, uncalled returns before runouts, intermediate pot balances |
| Results | Known-card hand strength, eligible awards, equal splits and odd-chip seat order, rake, recorded summary totals/cards/fold status |
| Privacy | Unknown cards remain unknown; deal/show/summary-only reveal timing; explicit reveal toggle; backward seek re-hides cards |
| Replay/UI | Immutable snapshots, play/pause, speed, timeline, street jumps, keyboard controls, independent themes; real desktop/mobile browser QA |
| Evaluation | All nine hand categories, kickers, wheel, best five of seven; all 2,598,960 five-card combinations match known category counts |

## Deliberate unsupported cases

- Other rooms, non-English text, other poker variants or limit structures; Zoom/Home Game headers, short-deck, multiple boards/run-it-twice, bomb pots.
- Dead/combined blinds, straddles, sitting-out seat declarations and bounty annotations inside seat declarations. Standard tournament buy-in headers are supported; bounty side payments are not modeled.
- Nonuniform or big-blind ante formats; cash sub-cent amounts, fractional tournament chips and other currency codes.
- Partial one-card reveals and unfamiliar metadata/summary grammar. Only explicitly recognized incidental chat/connection lines are ignored.
- Multiple hand batches; input larger than 2 MiB or 10,000 lines.
- Ambiguous generic `collected ... from pot` awards when several distinct main/side pots exist. Such records must identify the main/side pot rather than require guessed intermediate allocation.
- Hand builder, export, sharing, hosting and forum plugins.

A supported truncated history without its final summary is **incomplete**. A recognized contradiction in the ledger, seats, action or cards is **invalid**. An unknown room/variant/grammar or deliberate capacity limit is **unsupported**. A file can contain more than one problem; the first diagnostic is returned. The app never invents missing actions to make it replayable.

## What validation cannot establish

It cannot establish authenticity, unknown opponents' actual cards, or the correct PokerStars rake schedule for a particular historical game. It reconciles the supplied rake against payouts. With unknown cards, legal allocation and declared split consistency can be checked, but actual hand strength cannot be proved. The free-form hand-category description is not parsed; shown cards determine evaluated strength. Optional summary seat rows may be absent; provided rows are checked against the record.

The real browser checks cover a Chromium-based desktop environment and emulated phone viewport sizes. They do not establish native Safari/iOS/Android behavior, screen-reader certification, or support for every browser/device. Details are in [QA](QA.md).
