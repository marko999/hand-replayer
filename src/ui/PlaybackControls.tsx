import { Icon } from './Icons';
import type { EventView } from './types';

export function PlaybackControls({ index, max, playing, speed, events, onSeek, onPlay, onSpeed }: {
  index: number; max: number; playing: boolean; speed: number; events: EventView[]; onSeek: (index: number) => void; onPlay: () => void; onSpeed: (speed: number) => void;
}) {
  const streets = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const targets = streets.map(street => ({ street, index: events.findIndex(e => e.street === street) + 1 }));
  const currentStreet = index ? events[index - 1]?.street : 'preflop';
  return <div className="playback">
    <div className="street-jumps" aria-label="Jump to street">{targets.map(target => <button key={target.street} disabled={target.index === 0} className={currentStreet === target.street ? 'current-street' : ''} onClick={() => onSeek(target.index)}>{target.street}<span className="street-dot" /></button>)}</div>
    <label className="visually-hidden" htmlFor="timeline">Replay position</label>
    <input id="timeline" className="timeline" type="range" min={0} max={max} value={index} onChange={event => onSeek(Number(event.target.value))} aria-valuetext={`Action ${index} of ${max}`} style={{ '--progress': `${max ? index / max * 100 : 0}%` } as React.CSSProperties} />
    <div className="playback-bottom">
      <div className="action-count"><strong>{String(index).padStart(2, '0')}</strong><span> / {String(max).padStart(2, '0')}</span><span className="action-count-label">actions</span></div>
      <div className="transport"><button className="icon-button" disabled={index === 0} onClick={() => onSeek(0)} title="Go to start (Home)" aria-label="Go to start"><Icon name="first" /></button><button className="icon-button" disabled={index === 0} onClick={() => onSeek(index - 1)} title="Previous action (←)" aria-label="Previous action"><Icon name="back" /></button><button className="play-button" onClick={onPlay} title={playing ? 'Pause (Space)' : 'Play (Space)'} aria-label={playing ? 'Pause replay' : index === max ? 'Replay from start' : 'Play replay'}><Icon name={playing ? 'pause' : index === max ? 'reset' : 'play'} size={22} /></button><button className="icon-button" disabled={index === max} onClick={() => onSeek(index + 1)} title="Next action (→)" aria-label="Next action"><Icon name="forward" /></button><button className="icon-button" disabled={index === max} onClick={() => onSeek(max)} title="Go to end (End)" aria-label="Go to end"><Icon name="last" /></button></div>
      <label className="speed-control"><span>Speed</span><select value={speed} onChange={event => onSpeed(Number(event.target.value))} aria-label="Playback speed"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label>
    </div>
  </div>;
}
