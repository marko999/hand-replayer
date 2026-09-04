import { describe, expect, it } from 'vitest';
import { parseReplay } from '../../src/core';
import { CUMULATIVE_REOPEN, HU_WALK, MULTI_SIDE, PUBLIC_TOURNAMENT, SPLIT_RAKE } from './fixtures';

const reject = (text: string) => expect(parseReplay(text)).toMatchObject({ ok: false });

describe('strict input corruption, independently generated', () => {
  it('rejects malformed thousands grouping instead of silently changing the number', () => reject(HU_WALK.replace('A ($10 in chips)', 'A ($1,0 in chips)')));
  it('rejects a currency-symbol mismatch within a USD hand', () => reject(HU_WALK.replace('A ($10 in chips)', 'A (€10 in chips)')));
  it('rejects a header whose currency code contradicts its symbol', () => reject(HU_WALK.replace('USD)', 'EUR)')));
  it('rejects tournament action denominated in a cash currency', () => reject(PUBLIC_TOURNAMENT.replace('PlayerB: calls 10', 'PlayerB: calls $10')));
  it('does not discard a corrupted action just because it ends like connection metadata', () => reject(HU_WALK.replace('A: folds', 'A: raises $3 to $3.10 is disconnected\nA: folds')));
  it('does not discard unknown-player no-show gameplay', () => reject(HU_WALK.replace('*** SUMMARY ***', "Ghost: doesn't show hand\n*** SUMMARY ***")));
  it('does not discard a no-show action during active betting', () => reject(PUBLIC_TOURNAMENT.replace('PlayerB: calls 10', "PlayerB: doesn't show hand\nPlayerB: calls 10")));
  it('does not let a mucked player show cards again', () => reject(MULTI_SIDE.replace('D: shows [Jh Jd] (a pair of Jacks)', 'D: mucks hand\nD: shows [Jh Jd] (a pair of Jacks)')));
  it('does not let a player muck and continue betting on another street', () => reject(PUBLIC_TOURNAMENT.replace('*** FLOP ***', 'PlayerB: mucks hand\n*** FLOP ***')));
  it('does not allow cards to be exposed in a normal live hand before remaining betting', () => reject(PUBLIC_TOURNAMENT.replace('*** FLOP ***', 'PlayerB: shows [6h Ks]\n*** FLOP ***')));
  it('rejects a repeated showdown marker', () => reject(SPLIT_RAKE.replace('*** SHOW DOWN ***', '*** SHOW DOWN ***\n*** SHOW DOWN ***')));
  it('rejects a repeated summary marker', () => reject(SPLIT_RAKE.replace('*** SUMMARY ***', '*** SUMMARY ***\n*** SUMMARY ***')));
  it('rejects tiny cash fractions without rounding', () => reject(HU_WALK.replace('A ($10 in chips)', 'A ($10.001 in chips)')));
  it('rejects money beyond the exact safe-integer range', () => reject(HU_WALK.replace('A ($10 in chips)', 'A ($90071992547409.93 in chips)')));
  it('rejects cards revealed after payout when they contradict the winning award', () => {
    const text = MULTI_SIDE.replace('A: shows [Ah Ad] (a pair of Aces)\n', '').replace('*** SUMMARY ***', 'A: shows [2h 2d] (three of a kind)\n*** SUMMARY ***');
    // Change board so a pair of twos loses to the shown kings rather than makes a set.
    reject(text.replaceAll('2c 3d 7h', '4c 3d 7h'));
  });
  it('does not excuse an unequal split between known tied winners just because another hand is unknown', () => {
    reject(CUMULATIVE_REOPEN.replace('D: shows [8h 9h] (a flush)\n', '').replace('A collected 50 from main pot', 'A collected 60 from main pot').replace('B collected 50 from main pot', 'B collected 40 from main pot'));
  });
  it('rejects unequal shares among declared winners even when no hole cards are available', () => {
    const text = CUMULATIVE_REOPEN.replace(/^.*: shows .*\n/gm, '').replaceAll('Ac Kc Qc', 'Ac Kd Qc').replace('A collected 50 from main pot', 'A collected 60 from main pot').replace('B collected 50 from main pot', 'B collected 40 from main pot');
    reject(text);
  });
  it('keeps a consistent split replayable without inventing unknown hole cards', () => {
    const text = CUMULATIVE_REOPEN.replace(/^.*: shows .*\n/gm, '').replaceAll('Ac Kc Qc', 'Ac Kd Qc');
    const result = parseReplay(text);
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.states.every(state => state.players.every(player => player.cards.length === 0))).toBe(true);
  });
});
