/** Standard Hold'em: lexicographically ordered [category, ...kickers].
 * Enumerating 21 five-card subsets keeps the evaluator small and auditable.
 * Category 0 high card through 8 straight flush. Suits never break ties.
 */
export function compareRanks(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}
function five(cards: readonly string[]): number[] {
  const ranks = cards.map(c => '23456789TJQKA'.indexOf(c[0]) + 2).sort((a,b) => b-a);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const groups = [...counts].sort((a,b) => b[1]-a[1] || b[0]-a[0]);
  const unique = [...counts.keys()].sort((a,b) => b-a);
  const flush = cards.every(c => c[1] === cards[0][1]);
  const straight = unique.length === 5 && unique[0]-unique[4] === 4 ? unique[0]
    : unique.join(',') === '14,5,4,3,2' ? 5 : 0;
  if (flush && straight) return [8, straight];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (flush) return [5, ...ranks];
  if (straight) return [4, straight];
  if (groups[0][1] === 3) return [3, groups[0][0], ...groups.slice(1).map(g=>g[0])];
  if (groups[0][1] === 2 && groups[1][1] === 2) return [2, ...groups.map(g=>g[0])];
  if (groups[0][1] === 2) return [1, ...groups.map(g=>g[0])];
  return [0, ...ranks];
}
export function evaluateHoldem(cards: readonly string[]): number[] {
  if (cards.length < 5 || cards.length > 7 || new Set(cards).size !== cards.length || cards.some(c=> !/^[2-9TJQKA][cdhs]$/.test(c))) {
    throw new Error('Evaluation requires five to seven unique standard cards.');
  }
  let best: number[] = [];
  for(let a=0;a<cards.length-4;a++) for(let b=a+1;b<cards.length-3;b++)
    for(let c=b+1;c<cards.length-2;c++) for(let d=c+1;d<cards.length-1;d++)
      for(let e=d+1;e<cards.length;e++) {
        const rank = five([cards[a],cards[b],cards[c],cards[d],cards[e]]);
        if (compareRanks(rank,best)>0) best=rank;
      }
  return best;
}

export function compareHands(a: readonly string[], b: readonly string[], board: readonly string[]): number {
  return compareRanks(evaluateHoldem([...board, ...a]), evaluateHoldem([...board, ...b]));
}
