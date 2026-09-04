import { useEffect, useRef } from 'react';
import type { EventView, HandView, StateView } from './types';
import { Icon } from './Icons';

export function ActionLog({ events, index, hand, state, revealCards, onSeek, format }: { events: EventView[]; index: number; hand: HandView; state: StateView; revealCards: boolean; onSeek: (index: number) => void; format: (n: number) => string }) {
  const active = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = active.current;
    const container = log.current;
    if (!row || !container) return;
    const rowBounds = row.getBoundingClientRect();
    const bounds = container.getBoundingClientRect();
    if (rowBounds.top < bounds.top) container.scrollTop += rowBounds.top - bounds.top - 5;
    else if (rowBounds.bottom > bounds.bottom) container.scrollTop += rowBounds.bottom - bounds.bottom + 5;
  }, [index]);
  return <aside className="action-panel" aria-label="Hand details and action history">
    <div className="panel-title"><h2>Action history</h2><span className="panel-count">{events.length}</span></div>
    <div className="action-log" ref={log}>
      <button ref={index === 0 ? active : undefined} className={`log-start ${index === 0 ? 'log-active' : ''}`} onClick={() => onSeek(0)}><span className="log-number">00</span><span>Hand starts</span></button>
      {events.map((event, i) => <div key={i}>
        {(i === 0 || event.street !== events[i - 1].street) && <div className="log-street"><span>{event.street}</span><span className="log-street-line" /></div>}
        <button ref={index === i + 1 ? active : undefined} className={`log-event ${index === i + 1 ? 'log-active' : ''} ${index < i + 1 ? 'log-future' : ''}`} onClick={() => onSeek(i + 1)} aria-current={index === i + 1 ? 'step' : undefined}>
          <span className="log-number">{String(i + 1).padStart(2, '0')}</span><span className="log-label">{!revealCards && index < i + 1 && ['show', 'deal', 'summary-reveal'].includes(event.type) ? `${hand.players.find(player => player.id === event.playerId)?.name || 'Player'}: cards not revealed yet` : event.label}</span>{index === i + 1 && <span className="log-current-dot" />}
        </button>
      </div>)}
    </div>
    <div className="hand-facts"><div><span>Players</span><strong>{hand.players.length}</strong></div><div><span>Blinds</span><strong>{format(hand.smallBlind)} / {format(hand.bigBlind)}</strong></div><div><span>Rake recorded</span><strong>{format(state.rake)}</strong></div></div>
    <div className="consistency-note"><Icon name="check" size={15} /><span>Consistency checked · not authenticity</span></div>
  </aside>;
}
