/** Source-derived public example; anonymized. See docs/FIXTURE-SOURCES.md and its MIT notice. */
export const PUBLIC_TOURNAMENT = `PokerStars Hand #900001: Tournament #900002, $1.84+$0.16 USD Hold'em No Limit - Level I (10/20) - 2026/01/01 00:00:00 ET
Table 'Public Example' 3-max Seat #1 is the button
Seat 1: PlayerA (500 in chips)
Seat 2: PlayerB (500 in chips)
Seat 3: PlayerC (500 in chips)
PlayerB: posts small blind 10
PlayerC: posts big blind 20
*** HOLE CARDS ***
Dealt to PlayerB [6h Ks]
PlayerC is disconnected
PlayerA: folds
PlayerB: calls 10
PlayerC: checks
*** FLOP *** [4d Qs Qd]
PlayerB: checks
PlayerC: checks
*** TURN *** [4d Qs Qd] [3s]
PlayerB: checks
PlayerC: bets 20
PlayerB: folds
Uncalled bet (20) returned to PlayerC
PlayerC collected 40 from pot
PlayerC: doesn't show hand
*** SUMMARY ***
Total pot 40 | Rake 0
Board [4d Qs Qd 3s]
Seat 1: PlayerA (button) folded before Flop (didn't bet)
Seat 2: PlayerB (small blind) folded on the Turn
Seat 3: PlayerC (big blind) collected (40)`;

/** Original synthetic four-way unequal all-in. Main 200, side 150, side 200. */
export const MULTI_SIDE = `PokerStars Hand #900003: Tournament #900002, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 4-max Seat #4 is the button
Seat 1: A (50 in chips)
Seat 2: B (100 in chips)
Seat 3: C (200 in chips)
Seat 4: D (400 in chips)
A: posts small blind 5
B: posts big blind 10
*** HOLE CARDS ***
C: raises 190 to 200 and is all-in
D: calls 200
A: calls 45 and is all-in
B: calls 90 and is all-in
*** FLOP *** [2c 3d 7h]
*** TURN *** [2c 3d 7h] [8s]
*** RIVER *** [2c 3d 7h 8s] [9c]
*** SHOW DOWN ***
A: shows [Ah Ad] (a pair of Aces)
B: shows [Kh Kd] (a pair of Kings)
C: shows [Qh Qd] (a pair of Queens)
D: shows [Jh Jd] (a pair of Jacks)
A collected 200 from main pot
B collected 150 from side pot-1
C collected 200 from side pot-2
*** SUMMARY ***
Total pot 550 Main pot 200. Side pot-1 150. Side pot-2 200. | Rake 0
Board [2c 3d 7h 8s 9c]`;

export const HU_WALK = `PokerStars Hand #900004: Hold'em No Limit ($0.05/$0.10 USD) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 2-max Seat #1 is the button
Seat 1: A ($10 in chips)
Seat 2: B ($10 in chips)
A: posts small blind $0.05
B: posts big blind $0.10
*** HOLE CARDS ***
A: folds
Uncalled bet ($0.05) returned to B
B collected $0.10 from pot
*** SUMMARY ***
Total pot $0.10 | Rake $0`;

export const SPLIT_RAKE = `PokerStars Hand #900005: Hold'em No Limit ($0.50/$1.00 USD) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 2-max Seat #1 is the button
Seat 1: A ($2 in chips)
Seat 2: B ($2 in chips)
A: posts small blind $0.50
B: posts big blind $1
*** HOLE CARDS ***
A: raises $1 to $2 and is all-in
B: calls $1 and is all-in
*** FLOP *** [Ac Kc Qc]
*** TURN *** [Ac Kc Qc] [Jc]
*** RIVER *** [Ac Kc Qc Jc] [Tc]
*** SHOW DOWN ***
A: shows [2h 3h] (a flush)
B: shows [4h 5h] (a flush)
A collected $1.90 from pot
B collected $1.90 from pot
*** SUMMARY ***
Total pot $4 | Rake $0.20
Board [Ac Kc Qc Jc Tc]`;

/** B's 40-to-50 short raise must not reopen A's action. */
export function shortRaise(raiseAgain = false): string {
  return `PokerStars Hand #900006: Tournament #900002, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 3-max Seat #3 is the button
Seat 1: B (50 in chips)
Seat 2: C (100 in chips)
Seat 3: A (100 in chips)
B: posts small blind 5
C: posts big blind 10
*** HOLE CARDS ***
A: raises 30 to 40
B: raises 10 to 50 and is all-in
C: calls 40
${raiseAgain ? 'A: raises 50 to 100 and is all-in\nC: calls 50 and is all-in' : 'A: calls 10'}
*** FLOP *** [Ac Kc Qc]
${raiseAgain ? '' : 'C: checks\nA: checks\n'}*** TURN *** [Ac Kc Qc] [Jc]
${raiseAgain ? '' : 'C: checks\nA: checks\n'}*** RIVER *** [Ac Kc Qc Jc] [Tc]
${raiseAgain ? '' : 'C: checks\nA: checks\n'}*** SHOW DOWN ***
A: shows [2h 3h] (a flush)
B: shows [4h 5h] (a flush)
C: shows [6h 7h] (a flush)
A collected 50 from main pot
B collected 50 from main pot
C collected 50 from main pot
${raiseAgain ? 'A collected 50 from side pot\nC collected 50 from side pot\n' : ''}*** SUMMARY ***
Total pot ${raiseAgain ? 250 : 150} | Rake 0
Board [Ac Kc Qc Jc Tc]`;
}

/** Original cumulative-short-all-in case: 40 -> 50 -> 70 reopens A's last 30 raise. */
export const CUMULATIVE_REOPEN = `PokerStars Hand #900007: Tournament #900002, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 4-max Seat #2 is the button
Seat 1: A (100 in chips)
Seat 2: B (50 in chips)
Seat 3: C (70 in chips)
Seat 4: D (200 in chips)
C: posts small blind 5
D: posts big blind 10
*** HOLE CARDS ***
A: raises 30 to 40
B: raises 10 to 50 and is all-in
C: raises 20 to 70 and is all-in
D: calls 60
A: raises 30 to 100 and is all-in
D: calls 30
*** FLOP *** [Ac Kc Qc]
*** TURN *** [Ac Kc Qc] [Jc]
*** RIVER *** [Ac Kc Qc Jc] [Tc]
*** SHOW DOWN ***
A: shows [2h 3h] (a flush)
B: shows [4h 5h] (a flush)
C: shows [6h 7h] (a flush)
D: shows [8h 9h] (a flush)
A collected 50 from main pot
B collected 50 from main pot
C collected 50 from main pot
D collected 50 from main pot
A collected 20 from side pot-1
C collected 20 from side pot-1
D collected 20 from side pot-1
A collected 30 from side pot-2
D collected 30 from side pot-2
*** SUMMARY ***
Total pot 320 | Rake 0
Board [Ac Kc Qc Jc Tc]`;

export function nineSeatAnte(short = false): string {
  return `PokerStars Hand #900008: Tournament #900002, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 00:00:00 ET
Table 'Synthetic' 9-max Seat #9 is the button
${Array.from({ length: 9 }, (_, i) => `Seat ${i + 1}: P${i + 1} (${short && i === 2 ? 1 : 1000} in chips)`).join('\n')}
${Array.from({ length: 9 }, (_, i) => `P${i + 1}: posts the ante 1${short && i === 2 ? ' and is all-in' : ''}`).join('\n')}
P1: posts small blind 5
P2: posts big blind 10
*** HOLE CARDS ***
${Array.from({ length: short ? 6 : 7 }, (_, i) => `P${i + (short ? 4 : 3)}: folds`).join('\n')}
P1: folds
Uncalled bet (5) returned to P2
${short ? `*** FLOP *** [2c 3d 7h]
*** TURN *** [2c 3d 7h] [8s]
*** RIVER *** [2c 3d 7h 8s] [9c]
*** SHOW DOWN ***
P2: shows [Kh Kd] (a pair of Kings)
P3: shows [Ah Ad] (a pair of Aces)
P3 collected 9 from main pot
P2 collected 10 from side pot` : 'P2 collected 19 from pot'}
*** SUMMARY ***
Total pot 19 | Rake 0
${short ? 'Board [2c 3d 7h 8s 9c]' : ''}`;
}
