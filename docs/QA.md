# Verification evidence

Checked 4–5 September 2026 on the local checkout, Node25.2.1/npm11.6.2. No public app deployment or forum writes.

## Automated

`npm test`: 91 tests pass, including 61 independently authored adversarial cases, core state tests and evaluator tests. The evaluator suite checks all 2,598,960 five-card combinations against the category-frequency oracle. `npm run build`: strict TypeScript and Vite production build pass. Dependency installation reported zero audit findings.

Independent review found and regression-tested accepted-invalid inputs, including table capacity, contradictory/duplicate summary rows, mucked winners, bad split shares, currency mismatch, malformed numeric grouping, ignored action-like metadata, early reveal, duplicate markers and missing uncalled returns before a runout. Tests check independently calculated chip totals and every-state conservation, not only the implementation's own output.

## Actual browser checks

Performed using the Codex in-app Chromium browser against the running local app, using actual controls and file picker uploads. Desktop plus 390×844 and 320×740 phone viewports were exercised.

- Cash demo: flop jump gives action8/three board cards; end gives RiverFox155, NightOwl5, BlueJay97, rake3, remaining pot0 (cash units).
- Play at4× reaches the end and stops;0.5× playback pauses with a stable position. Start/end/previous/next work. Range Home/ArrowRight changes position0→1.
- Showdown jump leaves NightOwl cards hidden; next action reveals Qh/Qd; previous hides them again. Explicit reveal shows only recorded cards. Theme selection changes Midnight/Forest.
- Imported nine-player tournament via the actual file chooser. Ante-only all-in has main9/side10; after main payout the remaining label stays **Side1**, amount10. End shows P2=1,004/P3=9 with correct remaining stacks.
- Imported four-way unequal all-in: main200/side150/side200 with appropriate eligible-player tooltips.
- Unsupported room and truncated supported header show different diagnostics. Incomplete-header classification was corrected during QA. A forged heads-up payout of0.11 from a0.10 pot is rejected with a line-specific error; correcting the pasted amount imports successfully.
- Production preview at127.0.0.1:4173 imports the public six-seat cash fixture. CashE cards stay hidden after payout, reveal Th/8h only on the summary event, and hide again on previous. Final CashD stack3.20 is correct; captured browser console has no warnings/errors.
- Every player count2–9 tested at320px. DOM rectangles showed zero seat/board intersections, zero seat/seat intersections and no horizontal overflow after corrections. At320px with a classic scrollbar, actual document client width is305px.
- Nine simultaneous flop wagers at320px: measured zero wager/other-seat/board/pot intersections after moving lower-side wagers inward. Folded seats retain readable amounts.
- Corrected UI issues during QA: small-phone horizontal scroll, board overlaps for4/5/7/9 seats, live nine-seat wager collisions, future reveal labels, pot renumbering after payout, obsolete wagers after completion, and page jumping from action-log auto-scroll.

Screenshots: [desktop replay](qa/desktop-replayer.png), [nine-seat phone with live wagers](qa/mobile-nine-live.png). Phone dimensions are browser viewport emulation, not a physical-device claim. Arbitrarily long display names are truncated with full names available as titles; unusually long amounts still warrant specific visual review. Automated browser tests are not bundled; this document records the manual/assisted run, while poker regressions are reproducible with `npm test`.
