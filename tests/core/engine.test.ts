import {describe,it,expect} from 'vitest';
import {parseReplay,DEMO_HAND,formatAmount,type Replay} from '../../src/core';

const valid=(text:string):Replay=>{const r=parseReplay(text);if(!r.ok)throw new Error(JSON.stringify(r));return r;};
const header=(seats:string,actions:string,ending:string)=>`PokerStars Hand #101: Tournament #20, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 12:00:00 ET
Table 'Synthetic' 9-max Seat #4 is the button
${seats}
${actions}
${ending}`;
const runout=`*** FLOP *** [Ac Kc Qc]
*** TURN *** [Ac Kc Qc] [Jc]
*** RIVER *** [Ac Kc Qc Jc] [Tc]
*** SHOW DOWN ***`;

describe('core samples and boundaries',()=>{
 it('demo has exact stacks and hides the opponent until the reveal event',()=>{
  const r=valid(DEMO_HAND);expect(r.states.at(-1)!.players.map(p=>p.stack)).toEqual([15500,500,9700]);
  const reveal=r.events.findIndex(e=>e.type==='show'&&e.playerId==='seat-3');
  expect(r.states[reveal].players.find(p=>p.id==='seat-3')!.cards).toEqual([]);
  expect(r.states[reveal+1].players.find(p=>p.id==='seat-3')!.cards).toEqual(['Qh','Qd']);
 });
 it('formats integers without floating point accounting',()=>{
  expect(formatAmount(101,{scale:100,currency:'USD'})).toBe('$1.01');
  expect(formatAmount(100001,{scale:1,currency:'chips'})).toBe('100,001');
 });
 it('rejects multi-hand imports and unknown gameplay explicitly',()=>{
  expect(parseReplay(DEMO_HAND+'\n'+DEMO_HAND)).toMatchObject({ok:false,status:'unsupported'});
  expect(parseReplay(DEMO_HAND.replace('RiverFox: bets $5.00','RiverFox: teleports $5.00'))).toMatchObject({ok:false,status:'unsupported'});
 });
 it('does not silently truncate fractional cents',()=>{
  expect(parseReplay(DEMO_HAND.replace('$0.50/$1.00','$0.501/$1.00'))).toMatchObject({ok:false,status:'unsupported'});
 });
 it('rejects contradictory summary cards',()=>{
  expect(parseReplay(DEMO_HAND.replace('showed [As Ks]','showed [Ah Kh]'))).toMatchObject({ok:false,status:'invalid'});
 });
 it('rejects unsafe combined stacks before arithmetic loses precision',()=>{
  expect(parseReplay(DEMO_HAND.replaceAll('$100.00 in chips','$9007199254740991 in chips'))).toMatchObject({ok:false,status:'invalid'});
 });
 it('allows cumulative short all-ins to reopen the original raiser',()=>{
  const text=header(`Seat 1: A (60 in chips)
Seat 2: B (80 in chips)
Seat 3: C (200 in chips)
Seat 4: D (200 in chips)`,`A: posts small blind 5
B: posts big blind 10
*** HOLE CARDS ***
C: raises 30 to 40
D: calls 40
A: raises 20 to 60 and is all-in
B: raises 20 to 80 and is all-in
C: raises 30 to 110
D: calls 70`,`${runout.replace('*** TURN ***','C: checks\nD: checks\n*** TURN ***').replace('*** RIVER ***','C: checks\nD: checks\n*** RIVER ***').replace('*** SHOW DOWN ***','C: checks\nD: checks\n*** SHOW DOWN ***')}
A: shows [2h 3h] (a flush)
B: shows [4h 5h] (a flush)
C: shows [6h 7h] (a flush)
D: shows [8h 9h] (a flush)
A collected 60 from main pot
B collected 60 from main pot
C collected 60 from main pot
D collected 60 from main pot
B collected 20 from side pot-1
C collected 20 from side pot-1
D collected 20 from side pot-1
C collected 30 from side pot-2
D collected 30 from side pot-2
*** SUMMARY ***
Total pot 360 | Rake 0
Board [Ac Kc Qc Jc Tc]`);
  expect(valid(text).states.at(-1)!.players.map(p=>p.stack)).toEqual([60,80,200,200]);
 });
 it('handles nine players, uniform antes and a preflop fold finish',()=>{
  const seats=Array.from({length:9},(_,i)=>`Seat ${i+1}: P${i+1} (100 in chips)`).join('\n');
  const antes=Array.from({length:9},(_,i)=>`P${i+1}: posts the ante 1`).join('\n');
  const text=header(seats,`${antes}
P5: posts small blind 5
P6: posts big blind 10
*** HOLE CARDS ***
P7: folds
P8: folds
P9: folds
P1: folds
P2: folds
P3: folds
P4: folds
P5: folds
Uncalled bet (5) returned to P6
P6 collected 19 from pot`,`*** SUMMARY ***
Total pot 19 | Rake 0`);
  const r=valid(text);expect(r.states.at(-1)!.players.find(p=>p.name==='P6')!.stack).toBe(113);
  expect(r.states.at(-1)!.players.reduce((s,p)=>s+p.stack,0)).toBe(900);
  expect(parseReplay(text.replace('P9: posts the ante 1\n',''))).toMatchObject({ok:false,status:'invalid'});
 });
});

const OVERBET_ALLIN=`PokerStars Hand #100010: Tournament #2000, $1+$0.10 USD Hold'em No Limit - Level I (5/10) - 2026/01/01 00:00:00 ET
Table 'Unmatched' 2-max Seat #1 is the button
Seat 1: A (200 in chips)
Seat 2: B (100 in chips)
A: posts small blind 5
B: posts big blind 10
*** HOLE CARDS ***
A: raises 190 to 200 and is all-in
B: calls 90 and is all-in
Uncalled bet (100) returned to A
*** FLOP *** [2c 3d 7h]
*** TURN *** [2c 3d 7h] [8s]
*** RIVER *** [2c 3d 7h 8s] [9c]
*** SHOW DOWN ***
A: shows [Ah Ad] (a pair of Aces)
B: shows [Kh Kd] (a pair of Kings)
A collected 200 from pot
*** SUMMARY ***
Total pot 200 | Rake 0
Board [2c 3d 7h 8s 9c]`;

describe('uncalled overbets across streets',()=>{
 it('returns an overbet before all-in board runout',()=>{
  const r=valid(OVERBET_ALLIN);
  expect(r.states.at(-1)!.players.map(p=>p.stack)).toEqual([300,0]);
 });
 it('rejects a missing return even when the summary and payout include the erroneous excess',()=>{
  const text=OVERBET_ALLIN.replace('Uncalled bet (100) returned to A\n','').replace('collected 200','collected 300').replace('Total pot 200','Total pot 300');
  expect(parseReplay(text)).toMatchObject({ok:false,status:'invalid',issues:[{code:'MISSING_RETURN'}]});
 });
});

it('ordinary blind posting and open bets do not create premature side pots',()=>{
 const replay=valid(DEMO_HAND);
 for(let i=0;i<replay.events.length;i++) {
  const state=replay.states[i+1];
  if(!state.complete&&state.pot>0)expect(state.pots).toHaveLength(1);
 }
 expect(replay.states.at(-1)!.players.every(p=>p.streetBet===0)).toBe(true);
});

it('classifies a supported header-only truncation as incomplete',()=>{
 expect(parseReplay(DEMO_HAND.split('\n')[0])).toMatchObject({ok:false,status:'incomplete'});
 expect(parseReplay(DEMO_HAND.replace("Table 'Orbit Demo' 6-max Seat #1 is the button\n",''))).toMatchObject({ok:false,status:'invalid'});
});

it('bounds byte and line counts for paste and upload alike',()=>{
 expect(parseReplay('a'.repeat(2*1024*1024+1))).toMatchObject({ok:false,status:'unsupported',issues:[{code:'INPUT_SIZE'}]});
 expect(parseReplay(DEMO_HAND+'\n'.repeat(10000)+'x')).toMatchObject({ok:false,status:'unsupported',issues:[{code:'INPUT_LINES'}]});
});
it('retains EUR currency when coherent header stakes omit currency symbols',()=>{
 const text=DEMO_HAND.replaceAll('$','').replace('USD)','EUR)');
 const replay=valid(text);expect(replay.hand.currency).toBe('EUR');
 expect(formatAmount(101,replay.hand)).toBe('€1.01');
});
it('does not treat a normal player name as a multiple-board marker',()=>{
 expect(valid(DEMO_HAND.replaceAll('RiverFox','FirstPlayer')).hand.players[0].name).toBe('FirstPlayer');
});

it('requires identified pots when several pots make generic awards ambiguous',async()=>{
 const {MULTI_SIDE}=await import('../adversarial/fixtures');
 const text=MULTI_SIDE.replace(/from (?:main pot|side pot-\d+)/g,'from pot');
 expect(parseReplay(text)).toMatchObject({ok:false,status:'unsupported',issues:[{code:'AMBIGUOUS_POT'}]});
});
