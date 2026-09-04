# Fixture provenance

Checked 4 September 2026. Tests use original synthetic hands unless explicitly identified below. They verify internal consistency, not authenticity or PokerStars endorsement. Public input is never taken from the user's private hand history.

## Public format references

- [pokerdf README example](https://github.com/murilogmamaral/pokerdf): complete 3-player tournament history with a turn fold, uncalled return, disconnect metadata and no showdown. `tests/adversarial/fixtures.ts` includes a source-derived version: identities, IDs, table name and timestamp replaced; original action/card/amount sequence retained. The source repository is MIT licensed; attribution and license are recorded below.
- [hhp cash.2010.txt at commit 5d24712d](https://github.com/thlorenz/hhp/blob/5d24712d75dca9f9b66622a2066994be39d65497/test/fixtures/holdem/pokerstars/cash.2010.txt): complete six-seat USD cash hand. `tests/adversarial/source-cash.ts` preserves the original betting/card/amount sequence while replacing names, table, hand ID and timestamp. Hero folds; the flop produces a short all-in, a $1.05 uncalled return, a $2.05 pot and $0.10 rake. The source includes two mucked cards only in the summary, which is an important reveal-timing boundary. The source archive and MIT license were read directly; the commit is recorded in its archive metadata. This is a 2010 format reference, not a claim of recent production compatibility.
- [Two Plus Two February 2026 PKO discussion](https://twoplustwo.com/No-Limit-Tournaments/13tr4/Sunday-Warm-up-22-PKO?isFirstNewPost=true): current raw English PokerStars tournament header, 8-max table with 7 seated players, individual antes and a deliberately unfinished preflop question. Used to establish that forum pastes may be incomplete; no original usernames or log are copied into this repository.
- [Two Plus Two November 2025 cash example](https://forumserver.twoplustwo.com/69/online-no-limit-holdem-cash/2nl-zoom-3b-pot-oop-1853009/): search-indexed converted 6-player Zoom hand. A converted forum post is **not** a raw hand-history fixture. Direct page retrieval failed; do not claim it was imported or replayed.
- [PokerStars hand-history help](https://www.pokerstars.com/help/articles/save-hand-histories/214105/?ooac=1): official source for obtaining local histories. It is not a versioned grammar specification.

## Independent rule checks

[PokerStars betting rules](https://www.pokerstars.com/help/articles/poker-rules-master/) describe minimum raises, short all-ins and side pots. [Poker TDA rule 47 and examples](https://www.pokertda.com/view-poker-tda-rules/) provide explicit cumulative-short-all-in examples. TDA is supporting rule evidence, not proof that every PokerStars historical variant uses identical rules.

Synthetic adversarial cases deliberately isolate: two-player button/SB action order, blind walk and uncalled excess; unequal all-in contributions; folded dead money; split payouts and rake; duplicate cards; missing streets/actions/summary; excessive or misdirected payouts; and short-raise reopening. The assertions use independently calculated stacks and pot totals. A rejected case does not demonstrate universal format support.

Additional synthetic coverage includes nine-seat uniform antes, an ante-only all-in winner, cumulative short raises that reopen betting, and odd-cent allocation clockwise from the button. Public-source coverage is intentionally small: one complete source-derived tournament hand, one complete source-derived cash hand, and format references. This is not a broad historical PokerStars corpus.

Independent verification: `npm test -- tests/adversarial/accounting.test.ts` passed 40/40 cases on 4 September 2026 after finding and reproducing six issues: table capacity validation, contradictory summary amounts, duplicate summary seats, incorrect remaining side-pot display during reversed payout order, explicit-muck eligibility, and a redundant pending big-blind action against an ante-only all-in. The engine author fixed those issues; the independently owned regressions remain in this suite. Browser verification is recorded separately by the main task.

A second review added strict monetary grouping/currency checks, metadata and reveal/muck sequencing mutations, duplicate markers, and split fairness with partially or wholly unknown hole cards. The complete source-derived cash hand now replays without dropping any original card/action/amount data: its summary-only mucked cards appear in a distinct summary reveal after payouts, remain hidden in every earlier snapshot, and are still checked for duplicate cards. Its expected final stacks are $16.15/$9.85/$11.25/$3.20/$0/$15.20, with $0.10 rake; every state conserves the original $55.75.

Latest independent run: `npm test` passed 91/91 tests, including 61 independently owned cases across the three `tests/adversarial/*.test.ts` files. The test total is a point-in-time result, not a percentage claim about all possible PokerStars formats.

For short opening all-ins, [Robert's Rules of Poker v11, No-Limit rule 2](https://homepokertourney.org/docs/rulebook/roberts-rules-of-poker-booklet.pdf) explicitly describes adding at least the normal minimum bet to the short bet when raising. PokerStars' general minimum-raise and reopening documentation is consistent with this interpretation but does not itself include that exact worked example. No claim is made about every historical room implementation.

## Attribution for the source-derived examples

Source: murilogmamaral/pokerdf, README example. [MIT license](https://github.com/murilogmamaral/pokerdf/blob/main/LICENSE) (exact notice fetched from the public source repository):

Copyright (c) 2025 Murilo Amaral

Source: thlorenz/hhp, cash.2010.txt. [MIT license at the retrieved commit](https://github.com/thlorenz/hhp/blob/5d24712d75dca9f9b66622a2066994be39d65497/LICENSE) (verified from the public source archive):

Copyright 2015 Thorsten Lorenz. All rights reserved.

Both source licenses grant the following permissions and disclaim warranties:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
