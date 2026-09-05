# Hand Replayer — completed phase one

Updated 5 September 2026. Canonical checkout: `/Users/m1/Documents/Codex/2026-09-04/hand-replayer`.

## Sites publication update — 5 September 2026

Existing application preserved and rebuilt: 91 tests pass. Static archive contains only index.html, compiled JS/CSS and Sites hosting metadata; no hand histories uploaded to a server, no backend or analytics added.

- Site project: `appgprj_6a9c57ecff6c8191982692107bdd5b36` (persisted in `.openai/hosting.json`).
- Expected origin: `https://hand-replayer.marko99999.chatgpt.site` (not yet verified public/live).
- Source commit pushed to GitHub and Sites: `5d8fded9aaa4872867d2bfa7ef41304c556942e7`.
- Saved version 1: `appgprj_6a9c57ecff6c8191982692107bdd5b36~appgver_a130cfbe98488191aa705ed0f3606811`.
- Public access change was blocked by automatic approval review. A targeted retry with the verified original user request from the coordinating task was also rejected because this task requires a direct user confirmation in its own conversation. No deployment has been performed; current access remains custom/private.
- Next: obtain direct user confirmation in this Site-owner task to publish Hand Replayer publicly on Sites, then deploy saved version 1, verify anonymous HTTP/assets and update this handover. Do not create another Site or replace GitHub origin. Original build timing excludes this publication work.

## Delivered scope
Complete English PokerStars standard No-Limit Hold'em, cash/tournament, 2–9 players, one hand at a time. Browser-local paste/file import, validation and deterministic replay. Play/pause/speed/step/timeline/street jumps, correct reveal timing, side pots, stacks/wagers, responsive table and independent Midnight/Forest themes.

Parser → normalized events → snapshots → UI, with a separate evaluator. Two anonymized public source-derived fixtures have verified MIT attribution; other fixtures are original synthetic cases. Read-only forum research is complete. No public deployment, other rooms, builder, export or plugin.

## Acceptance evidence
- `npm test`: **91 passing tests**, including 61 independent adversarial cases, 16 core tests, 14 evaluator tests. Exhaustive distribution of all 2,598,960 five-card combinations verified.
- `npm run build`: strict TypeScript and production Vite bundle pass. Installed dependency audit reported zero findings.
- Actual Chromium browser QA: desktop, 390×844, 320×740. Paste/file import, all three diagnostic categories and recovery, playback/pause/speed, stepping/seek, street jumps, known-card privacy including summary reveal, theme switch and final balances verified.
- All 2–9 player phone layouts measured with no seat/board or seat/seat intersections and no horizontal overflow. Nine simultaneous street wagers also have no intersections with other seats/board/pot after corrections.
- Production preview imports the public cash fixture; late summary reveal and backward hiding verified, correct final stack, no captured console warnings/errors.
- [QA and screenshots](docs/QA.md), [coverage/limits](docs/COVERAGE.md), [fixture sources](docs/FIXTURE-SOURCES.md), [forum plan](docs/FORUM-INTEGRATION.md), [architecture](docs/ARCHITECTURE.md).

## Git / runtime
- Initial repository: `86633bc2e32318049f2267d3bdaaf85b4bfca4e1`.
- Tested scaffold/evaluator pushed: `ee9886b`.
- Full tested implementation pushed and independently verified with `git ls-remote`: **`3572a5d544e136e6b4054779b93b2ecf78c704bb`**. This handover/documentation checkpoint follows it; use `git log -1` for its own SHA.
- Dev: http://127.0.0.1:5173 (session 92698). Production preview: http://127.0.0.1:4173 (session 91998). These are local processes, not hosted deployments.
- Restart: `npm ci && npm run dev`; verify: `npm test && npm run build`.

## Remaining limits and next step
Only the declared initial grammar: no Zoom/Home Game headers, other variants, dead/combined blinds, multi-board, big-blind ante or unusual currencies. Limits: 2 MiB / 10,000 lines. Multiple distinct pots require explicit main/side payout labels. Unknown cards, authenticity and room rake-policy correctness cannot be established. Physical iOS/Safari/Android are not certified; phone viewport testing is not a physical-device claim. Exact limits are documented in coverage.

No unresolved implementation blocker remains for this phase. Next user action: review the local demo and optionally supply additional anonymized standard PokerStars histories for corpus expansion. Other rooms, public deployment, sharing/export and forum integration require a separate scope decision.
