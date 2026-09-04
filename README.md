# Hand Replayer

A planned browser-based poker hand replayer: paste a complete hand history, validate it, and replay the action at an interactive table.

Status: planning. No application has been implemented yet.

## Roadmap

### Phase 1: Import, validate, replay

- Read players, seats, starting stacks, button, blinds, antes, cards and actions from a hand history.
- Validate the recorded action and chip accounting, including all-ins, side pots, uncalled returns and split pots.
- Display the table and the exact state after each action.
- Support play/pause, stepping backward and forward, and seeking through the hand.
- Distinguish invalid input, incomplete histories and unsupported formats; preserve unknown cards as unknown.
- Add support for multiple major poker rooms over time.

Proposed initial coverage: English PokerStars No-Limit Hold'em, followed by GGPoker. Detailed coverage remains to be confirmed.

### Phase 2: Forum integration

- Make the replayer publicly available and free to use.
- Allow forum administrators to install an integration so members can embed a replay in a post.
- Reuse the same replay engine in the standalone app and embedded player.
- Choose the first forum platform before implementing its specific adapter.

### Later phase: Hand builder and export

- Manually configure players, seats, stacks, button, blinds/antes and cards.
- Author the desired action sequence with rules validation.
- Replay and edit the constructed hand.
- Generate textual hand-history notation for copying or downloading.
- Verify that exporting and importing the hand reconstructs the same actions and states.

Export formats will be selected separately; supporting a format for import does not automatically imply export support.

## Development checkpoints

- Make regular, meaningful commits after coherent changes and appropriate checks.
- Push checked commits to this repository during development, rather than leaving all work local until the end.
- Report meaningful progress, blockers and validation evidence.
- Never commit credentials or private hand histories; use synthetic or appropriately anonymized test data.
- Public application deployment is a separate decision from pushing source code.
