import { describe, it, expect } from 'vitest';
import { evaluateHoldem, compareRanks } from '../../src/poker/evaluate';
const rank = (cards: string) => evaluateHoldem(cards.split(' '));
describe('independent five-card ranking and seven-card selection', () => {
  it.each([
    ['As Ks Qs Js Ts 2d 3c',[8,14]],
    ['As Ah Ad Ac 2d Ks 3c',[7,14,13]],
    ['As Ah Ad Ks Kh Kd 3c',[6,14,13]],
    ['As Js 9s 5s 2s Kd Qc',[5,14,11,9,5,2]],
    ['As 2s 3d 4c 5h Kd Qc',[4,5]],
    ['As Ah Ad Ks Qh 2d 3c',[3,14,13,12]],
    ['As Ah Ks Kh Qh Qd 3c',[2,14,13,12]],
    ['As Ah Ks Qh Jh 2d 3c',[1,14,13,12,11]],
    ['As Kd Jh 9c 7h 2d 3c',[0,14,13,11,9,7]],
  ])('evaluates %s', (cards, expected) => expect(rank(cards)).toEqual(expected));
  it('uses board for tied royal flush regardless of hole cards', () => {
    expect(compareRanks(rank('As Ks Qs Js Ts 2d 3c'),rank('As Ks Qs Js Ts Ah Ad'))).toBe(0);
  });
  it('uses only the best five, not a sixth-card kicker', () => {
    expect(compareRanks(rank('As Ah Ks Kh Qd 2c 3s'),rank('Ad Ac Kd Kc Qh Js 9s'))).toBe(0);
  });
  it('rejects duplicates and invalid ranks', () => {
    expect(()=>rank('As As Ks Qs Js')).toThrow();
    expect(()=>rank('1s 2s 3s 4s 5s')).toThrow();
  });
  it('straight flush defeats quads and a wheel loses to six high', () => {
    expect(compareRanks(rank('2h 3h 4h 5h 6h'),rank('As Ah Ad Ac Ks'))).toBe(1);
    expect(compareRanks(rank('As 2h 3d 4c 5s'),rank('2s 3h 4d 5c 6s'))).toBe(-1);
  });
});
