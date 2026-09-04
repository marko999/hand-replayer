import { expect, it } from 'vitest';
import { evaluateHoldem } from '../../src/poker/evaluate';

// Independent combinatorial oracle: every possible five-card poker hand.
// These category frequencies sum to C(52, 5) = 2,598,960.
it('matches the full 52-card five-card category distribution', () => {
  const deck = [...'23456789TJQKA'].flatMap(rank => [...'cdhs'].map(suit => rank+suit));
  const counts = Array<number>(9).fill(0);
  for (let a=0;a<48;a++) for(let b=a+1;b<49;b++) for(let c=b+1;c<50;c++)
    for(let d=c+1;d<51;d++) for(let e=d+1;e<52;e++) {
      counts[evaluateHoldem([deck[a],deck[b],deck[c],deck[d],deck[e]])[0]]++;
    }
  expect(counts).toEqual([1302540,1098240,123552,54912,10200,5108,3744,624,40]);
}, 60000);
