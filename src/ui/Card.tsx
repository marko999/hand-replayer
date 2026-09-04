const suits: Record<string, { symbol: string; name: string }> = {
  s: { symbol: '♠', name: 'spades' },
  h: { symbol: '♥', name: 'hearts' },
  d: { symbol: '♦', name: 'diamonds' },
  c: { symbol: '♣', name: 'clubs' },
};
const ranks: Record<string, string> = { A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack', T: '10' };

export function Card({ card, small = false, placeholder = false }: { card?: string; small?: boolean; placeholder?: boolean }) {
  if (!card) return <div className={`card ${small ? 'card-small' : ''} ${placeholder ? 'card-placeholder' : 'card-back'}`} aria-label={placeholder ? 'Undealt card' : 'Unknown card'}>{!placeholder && <span>♠</span>}</div>;
  const suit = suits[card.slice(-1).toLowerCase()];
  const rank = card.slice(0, -1);
  return <div className={`card ${small ? 'card-small' : ''} suit-${card.slice(-1).toLowerCase()}`} aria-label={`${ranks[rank] || rank} of ${suit?.name || 'unknown suit'}`}><span className="card-rank">{rank === 'T' ? '10' : rank}</span><span className="card-suit">{suit?.symbol}</span></div>;
}
