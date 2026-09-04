import { expect, it } from 'vitest';
import { parseReplay } from '../../src/core';
import { PUBLIC_CASH } from './source-cash';

it('replays the full source-derived cash hand with independently calculated exact results', () => {
  const result = parseReplay(PUBLIC_CASH);
  expect(result, JSON.stringify(result.ok ? {} : result)).toMatchObject({ ok: true });
  if (!result.ok) return;
  expect(result.hand.kind).toBe('cash');
  const last = result.states.at(-1)!;
  expect(last.players.map(player => player.stack)).toEqual([1615, 985, 1125, 320, 0, 1520]);
  expect(last).toMatchObject({ pot: 0, rake: 10, complete: true });
  expect(result.events.find(event => event.type === 'return')?.amount).toBe(105);
  for (const state of result.states) expect(state.players.reduce((sum, player) => sum + player.stack, 0) + state.pot + state.rake).toBe(5575);
});

it('reveals source-only mucked cards at the summary event and never during earlier playback', () => {
  const result = parseReplay(PUBLIC_CASH);
  expect(result).toMatchObject({ ok: true });
  if (!result.ok) return;
  const index = result.events.findIndex(event => event.type === 'summary-reveal');
  expect(index).toBeGreaterThan(result.events.findIndex(event => event.type === 'award'));
  const player = result.hand.players.find(p => p.name === 'CashE')!;
  expect(result.states.slice(0, index + 1).every(state => state.players.find(p => p.id === player.id)!.cards.length === 0)).toBe(true);
  expect(result.states[index + 1].players.find(p => p.id === player.id)).toMatchObject({ cards: ['Th', '8h'], mucked: true });
});

it('rejects summary-only cards that duplicate another player’s known card', () => {
  expect(parseReplay(PUBLIC_CASH.replace('mucked [Th 8h]', 'mucked [Ac 8h]'))).toMatchObject({ ok: false, status: 'invalid' });
});
