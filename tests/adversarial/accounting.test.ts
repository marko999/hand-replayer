import { describe, expect, it } from 'vitest';
import { parseReplay } from '../../src/core';
import type { Replay } from '../../src/core/types';
import { CUMULATIVE_REOPEN, HU_WALK, MULTI_SIDE, PUBLIC_TOURNAMENT, SPLIT_RAKE, nineSeatAnte, shortRaise } from './fixtures';

function valid(text: string): Replay {
  const result = parseReplay(text);
  expect(result, JSON.stringify(result.ok ? {} : result)).toMatchObject({ ok: true });
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result;
}

function rejected(text: string, status = 'invalid') {
  const result = parseReplay(text);
  expect(result).toMatchObject({ ok: false, status });
}

describe('independently calculated replay invariants', () => {
  it.each([['public tournament', PUBLIC_TOURNAMENT], ['multiple side pots', MULTI_SIDE], ['heads-up walk', HU_WALK], ['split cash with rake', SPLIT_RAKE], ['short all-in call', shortRaise()]])('%s conserves every smallest unit at every event', (_, text) => {
    const replay = valid(text);
    const initial = replay.hand.players.reduce((n, p) => n + p.startingStack, 0);
    for (const state of replay.states) {
      expect(state.players.reduce((n, p) => n + p.stack, 0) + state.pot + state.rake).toBe(initial);
      expect(state.players.every(p => Number.isSafeInteger(p.stack) && p.stack >= 0)).toBe(true);
      expect(state.pot).toBeGreaterThanOrEqual(0);
    }
    expect(replay.states.at(-1)).toMatchObject({ pot: 0, complete: true });
    // Browsing a timeline must not mutate any earlier or later snapshot.
    const frozen = JSON.stringify(replay.states);
    const indices = [0, replay.states.length - 1, 2, 1, replay.states.length - 2];
    for (const index of indices) expect(replay.states[index]).toBeDefined();
    expect(JSON.stringify(replay.states)).toBe(frozen);
    expect(valid(text).states).toEqual(replay.states);
  });

  it('public tournament restores the uncalled turn bet exactly', () => {
    const r = valid(PUBLIC_TOURNAMENT);
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([500, 480, 520]);
    expect(r.hand.kind).toBe('tournament');
    expect(r.states.at(-1)!.players[2].cards).toEqual([]);
  });

  it('four unequal all-ins independently yield pots 200/150/200 and stack vector 200/150/200/200', () => {
    const r = valid(MULTI_SIDE);
    const i = r.events.findIndex(e => e.type === 'street' && e.street === 'flop');
    const state = r.states[i + 1];
    expect(state.pots.map(p => p.amount)).toEqual([200, 150, 200]);
    expect(state.pots.map(p => p.eligiblePlayerIds.length)).toEqual([4, 3, 2]);
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([200, 150, 200, 200]);
  });

  it('the heads-up button acts first preflop and a blind walk awards only matched chips', () => {
    const r = valid(HU_WALK);
    const fold = r.events.findIndex(e => e.type === 'fold');
    expect(r.states[fold].toAct).toBe(r.hand.players[0].id);
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([995, 1005]);
  });

  it('retains exact cents for a split with rake', () => {
    const r = valid(SPLIT_RAKE);
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([190, 190]);
    expect(r.states.at(-1)!.rake).toBe(20);
  });

  it('assigns a split-pot odd cent to the winner first clockwise from the button', () => {
    const r = valid(SPLIT_RAKE.replace('A collected $1.90', 'A collected $1.99').replace('B collected $1.90', 'B collected $2.00').replace('Rake $0.20', 'Rake $0.01'));
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([199, 200]);
  });

  it('allows cumulative short all-ins to reopen a full raise', () => {
    const r = valid(CUMULATIVE_REOPEN);
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([100, 50, 70, 200]);
  });

  it('nine players with antes fold to the big blind', () => {
    const r = valid(nineSeatAnte());
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([994, 1013, 999, 999, 999, 999, 999, 999, 999]);
  });

  it('nine players include a player all-in for only the ante; no redundant BB check is needed', () => {
    const r = valid(nineSeatAnte(true));
    expect(r.states.at(-1)!.players.map(p => p.stack)).toEqual([994, 1004, 9, 999, 999, 999, 999, 999, 999]);
  });

  it('does not reveal opposing showdown holdings before their show event', () => {
    const r = valid(MULTI_SIDE);
    const firstShow = r.events.findIndex(e => e.type === 'show');
    expect(r.states.slice(0, firstShow + 1).every(s => s.players.every(p => p.cards.length === 0))).toBe(true);
    expect(r.states[firstShow + 1].players.filter(p => p.cards.length > 0)).toHaveLength(1);
  });

  it('removes the explicitly awarded side pot rather than the main pot during payout', () => {
    const reordered = MULTI_SIDE.replace('A collected 200 from main pot\nB collected 150 from side pot-1\nC collected 200 from side pot-2', 'C collected 200 from side pot-2\nB collected 150 from side pot-1\nA collected 200 from main pot');
    const r = valid(reordered);
    const firstAward = r.events.findIndex(e => e.type === 'award');
    expect(r.states[firstAward + 1].pots.map(p => p.amount)).toEqual([200, 150]);
    expect(r.states[firstAward + 1].pots.map(p => p.index)).toEqual([0, 1]);
    expect(r.states[firstAward + 1].pot).toBe(350);
  });
});

describe('adversarial corruption and illegal actions', () => {
  it('rejects a short all-in reopening a prior raiser', () => rejected(shortRaise(true)));
  it('rejects giving a split-pot odd cent to the wrong tied winner', () => rejected(SPLIT_RAKE.replace('A collected $1.90', 'A collected $2.00').replace('B collected $1.90', 'B collected $1.99').replace('Rake $0.20', 'Rake $0.01')));
  it('rejects heads-up big blind acting before the button', () => rejected(HU_WALK.replace('A: folds', 'B: folds').replace('returned to B', 'returned to A').replace('B collected', 'A collected')));
  it('rejects duplicate cards across opponents', () => rejected(MULTI_SIDE.replace('[Kh Kd]', '[Ah Kd]')));
  it('rejects a duplicate card on the board', () => rejected(SPLIT_RAKE.replaceAll('Ac Kc Qc', 'Ac Ac Qc')));
  it('rejects a board conflicting with a known hero card', () => rejected(PUBLIC_TOURNAMENT.replace('[6h Ks]', '[4d Ks]')));
  it('rejects excess payout even if summary arithmetic is changed to agree', () => rejected(HU_WALK.replace('collected $0.10', 'collected $1.10').replace('Total pot $0.10', 'Total pot $1.10')));
  it('rejects a folded winner', () => rejected(PUBLIC_TOURNAMENT.replace('PlayerC collected 40', 'PlayerA collected 40')));
  it('rejects awarding a side pot to the short stack', () => rejected(MULTI_SIDE.replace('C collected 200 from side pot-2', 'A collected 200 from side pot-2')));
  it('rejects paying a weaker shown hand', () => rejected(MULTI_SIDE.replace('A collected 200 from main pot', 'D collected 200 from main pot')));
  it('rejects a wrong call amount', () => rejected(PUBLIC_TOURNAMENT.replace('PlayerB: calls 10', 'PlayerB: calls 11')));
  it('rejects a false all-in marker', () => rejected(PUBLIC_TOURNAMENT.replace('PlayerB: calls 10', 'PlayerB: calls 10 and is all-in')));
  it('rejects removing an outstanding call before a street', () => rejected(MULTI_SIDE.replace('B: calls 90 and is all-in\n', '')));
  it('rejects a changed previous-board prefix on turn', () => rejected(PUBLIC_TOURNAMENT.replace('*** TURN *** [4d Qs Qd]', '*** TURN *** [4d Qs 2h]')));
  it('classifies missing end as incomplete', () => rejected(PUBLIC_TOURNAMENT.split('*** SUMMARY ***')[0], 'incomplete'));
  it('classifies intentional decision-point truncation as incomplete', () => rejected(MULTI_SIDE.split('D: calls 200')[0], 'incomplete'));
  it('classifies another game as unsupported', () => rejected(HU_WALK.replace("Hold'em No Limit", 'Omaha Pot Limit'), 'unsupported'));
  it('rejects an impossible return from a player with no excess', () => rejected(HU_WALK.replace('returned to B', 'returned to A')));
  it('rejects duplicated seat numbers', () => rejected(HU_WALK.replace('Seat 2:', 'Seat 1:')));
  it('rejects button pointing at an unoccupied seat', () => rejected(HU_WALK.replace('Seat #1', 'Seat #3')));
  it('rejects more players than the declared table maximum', () => rejected(PUBLIC_TOURNAMENT.replace('3-max', '2-max')));
  it('rejects a conflicting summary collection amount', () => rejected(PUBLIC_TOURNAMENT.replace('collected (40)', 'collected (400)')));
  it('rejects duplicate summary seat records', () => rejected(PUBLIC_TOURNAMENT + '\nSeat 3: PlayerC (big blind) collected (40)'));
  it('rejects awarding a hand that was explicitly mucked at showdown', () => rejected(MULTI_SIDE.replace('A: shows [Ah Ad] (a pair of Aces)', 'A: mucks hand')));
  it('rejects unsupported live straddles explicitly', () => rejected(HU_WALK.replace('*** HOLE CARDS ***', 'A: posts straddle $0.20\n*** HOLE CARDS ***'), 'unsupported'));
});
