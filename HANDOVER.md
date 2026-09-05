# Hand Replayer — completed phase one

Updated 5 September 2026. Canonical checkout: `/Users/m1/Documents/Codex/2026-09-04/hand-replayer`.

## Sites publication — private, completed 5 September 2026

The user selected private publication and will change sharing personally if desired. Access was verified owner-only before deployment: custom mode, one allowed account, no external visitors or workspace/tenant groups. No public-access change or bypass was performed.

- Live URL: **https://hand-replayer.marko99999.chatgpt.site** (private; owner sign-in required).
- Site project: `appgprj_6a9c57ecff6c8191982692107bdd5b36`.
- Published version 1: `appgprj_6a9c57ecff6c8191982692107bdd5b36~appgver_a130cfbe98488191aa705ed0f3606811`.
- Deployment: `appgdep_6a9c5952834c8191a654bf10ec2decad`; terminal status **succeeded**, `2026-09-05T18:03:10.808586+00:00`.
- Deployed source: `5d8fded9aaa4872867d2bfa7ef41304c556942e7`, pushed to both GitHub and the Sites source repository. Subsequent handover-only commits do not alter the published app/archive.
- Existing product, npm lockfile and GitHub origin preserved; all 91 tests and production build passed before version save. Archive contains only HTML, compiled JS/CSS and hosting metadata, not internal docs or private histories. Hand import remains browser-local.
- Background publication deliberately skipped browser handoff/visual QA. No anonymous-public or signed-in runtime check is claimed for this private Site; acceptance is the successful Sites deployment receipt plus previously validated build and tests.
- Original demo build duration excludes today's publication work. The user manages any future public sharing change.

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
- Dev: http://127.0.0.1:5173 (session 92698). Production preview: http://127.0.0.1:4173 (session 91998). These are the original local development processes; the private hosted URL is recorded above.
- Restart: `npm ci && npm run dev`; verify: `npm test && npm run build`.

## Remaining limits and next step
Only the declared initial grammar: no Zoom/Home Game headers, other variants, dead/combined blinds, multi-board, big-blind ante or unusual currencies. Limits: 2 MiB / 10,000 lines. Multiple distinct pots require explicit main/side payout labels. Unknown cards, authenticity and room rake-policy correctness cannot be established. Physical iOS/Safari/Android are not certified; phone viewport testing is not a physical-device claim. Exact limits are documented in coverage.

No unresolved implementation blocker remains for this phase. Next user action: review the local demo and optionally supply additional anonymized standard PokerStars histories for corpus expansion. Other rooms, export and forum integration remain separate scope decisions. Private Sites publication is complete; the user will manage any change to public sharing.
