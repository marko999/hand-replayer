import { Card } from './Card';
import type { HandView, StateView, PlayerView } from './types';

const seatPositions: Record<number, [number, number][]> = {
  2: [[50, 89], [50, 11]],
  3: [[50, 89], [17, 24], [83, 24]],
  4: [[50, 89], [12, 50], [50, 11], [88, 50]],
  5: [[50, 89], [12, 62], [28, 12], [72, 12], [88, 62]],
  6: [[50, 89], [12, 69], [16, 25], [50, 11], [84, 25], [88, 69]],
  7: [[50, 89], [16, 84], [12, 43], [32, 11], [68, 11], [88, 43], [84, 84]],
  8: [[34, 89], [12, 69], [12, 31], [34, 11], [66, 11], [88, 31], [88, 69], [66, 89]],
  9: [[50, 90], [22, 87], [11, 60], [15, 25], [38, 10], [65, 10], [86, 25], [89, 60], [78, 87]],
};

function PlayerSeat({ player, active, isHero, dealer, cards, format }: {
  player: PlayerView; active: boolean; isHero: boolean; dealer: boolean; cards: string[]; format: (n: number) => string;
}) {
  return <div className={`player-seat ${active ? 'is-active' : ''} ${player.folded ? 'is-folded' : ''} ${player.won > 0 ? 'is-winner' : ''}`} aria-label={`${player.name}, stack ${format(player.stack)}${active ? ', next to act' : ''}${player.folded ? ', folded' : ''}`}>
    <div className="seat-cards"><Card card={cards[0]} small /><Card card={cards[1]} small /></div>
    <div className="seat-body">
      {dealer && <span className="dealer-chip" title="Dealer button">D</span>}
      <div className="player-name" title={player.name}>{isHero && <span className="hero-dot" />}{player.name}</div>
      <strong className="player-stack">{format(player.stack)}</strong>
    </div>
    <div className={`seat-status ${player.allIn ? 'status-allin' : ''} ${player.won > 0 ? 'status-winner' : ''}`}>
      {player.won > 0 ? `Won ${format(player.won)}` : player.folded ? 'Folded' : player.mucked ? 'Mucked' : player.allIn ? 'All-in' : active ? 'To act' : player.lastAction || (isHero ? 'Hero' : `Seat ${player.seat}`)}
    </div>
  </div>;
}

export function Table({ hand, state, revealCards, finalPlayers, format }: {
  hand: HandView; state: StateView; revealCards: boolean; finalPlayers: PlayerView[]; format: (n: number) => string;
}) {
  const sortedPlayers = [...state.players].sort((a, b) => a.seat - b.seat);
  const heroIndex = sortedPlayers.findIndex(p => p.id === hand.heroId);
  const players = heroIndex > 0 ? [...sortedPlayers.slice(heroIndex), ...sortedPlayers.slice(0, heroIndex)] : sortedPlayers;
  const positions = seatPositions[players.length] || seatPositions[9];
  const showWagers = !state.complete && state.street !== 'showdown' && !players.some(player => player.won > 0);
  return <div className={`table-stage seats-${players.length}`}>
    <div className="table-rail"><div className="table-felt"><span className="felt-brand">HAND<span>REPLAYER</span></span><span className="felt-game">NO-LIMIT HOLD’EM</span></div></div>
    <div className="table-center">
      <div className="pot-total"><span>{state.complete ? 'Remaining pot' : 'Total pot'}</span><strong>{format(state.pot)}</strong></div>
      <div className="board" aria-label="Community cards">{Array.from({ length: 5 }, (_, i) => <Card key={i} card={state.board[i]} placeholder />)}</div>
      <div className="pot-breakdown">{state.pots.length > 1 || state.pots.some(pot => pot.index > 0) ? state.pots.map(pot => <span key={pot.index} title={`Eligible: ${pot.eligiblePlayerIds.map(id => hand.players.find(p => p.id === id)?.name).join(', ')}`}>{pot.index === 0 ? 'Main' : `Side ${pot.index}`} <b>{format(pot.amount)}</b></span>) : <span>{state.complete ? 'Hand complete' : state.street.replace(/_/g, ' ')}</span>}</div>
    </div>
    {players.map((player, i) => {
      const [x, y] = positions[i];
      const finalCards = finalPlayers.find(p => p.id === player.id)?.cards || [];
      const cards = revealCards && finalCards.length ? finalCards : player.cards;
      return <div key={player.id} className="seat-position" data-seat-position={i} style={{ left: `${x}%`, top: `${y}%` }}>
        <PlayerSeat player={player} isHero={player.id === hand.heroId} active={state.toAct === player.id} dealer={player.seat === hand.buttonSeat} cards={cards} format={format} />
        {showWagers && player.streetBet > 0 && <div className={`wager ${y < 35 ? 'wager-bottom' : y > 70 ? 'wager-top' : x < 50 ? 'wager-right' : 'wager-left'}`}><span className="chip-stack" /><span>{format(player.streetBet)}</span></div>}
      </div>;
    })}
  </div>;
}
