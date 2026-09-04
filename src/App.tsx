import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEMO_HAND, formatAmount, parseReplay } from './core';
import { Icon } from './ui/Icons';
import { Table } from './ui/Table';
import { ActionLog } from './ui/ActionLog';
import { ImportDialog } from './ui/ImportDialog';
import { PlaybackControls } from './ui/PlaybackControls';
import './styles/theme.css';
import './styles/app.css';

export default function App() {
  const [result, setResult] = useState(() => parseReplay(DEMO_HAND));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [revealCards, setRevealCards] = useState(false);
  const [demo, setDemo] = useState(true);
  const [theme, setTheme] = useState('midnight');
  const max = result.ok ? result.states.length - 1 : 0;
  const seek = useCallback((next: number) => { setPlaying(false); setIndex(Math.min(max, Math.max(0, next))); }, [max]);
  const togglePlay = useCallback(() => {
    if (index >= max) setIndex(0);
    setPlaying(value => !value);
  }, [index, max]);
  useEffect(() => {
    if (!playing || importOpen) return;
    const timer = window.setTimeout(() => {
      if (index < max) setIndex(index + 1);
      if (index + 1 >= max) setPlaying(false);
    }, 1100 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, speed, index, max, importOpen]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (importOpen || event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
      if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); seek(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); seek(index - 1); }
      if (event.key === 'Home') { event.preventDefault(); seek(0); }
      if (event.key === 'End') { event.preventDefault(); seek(max); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, importOpen, max, seek, togglePlay]);
  function load(text: string, isDemo = false) {
    const parsed = parseReplay(text);
    if (!parsed.ok) return { status: parsed.status, issues: parsed.issues };
    setResult(parsed); setIndex(0); setPlaying(false); setRevealCards(false); setDemo(isDemo);
    return null;
  }
  const knownCards = useMemo(() => result.ok ? result.states[result.states.length - 1].players : [], [result]);
  if (!result.ok) return <main className="fatal-error"><h1>Unable to load the example hand</h1><p>{result.issues.map(issue => issue.message).join(' ')}</p></main>;
  const { hand, states, events, warnings } = result;
  const state = states[index];
  const format = (amount: number) => formatAmount(amount, hand);
  const currentEvent = index > 0 ? events[index - 1] : null;
  return <div className="app" data-theme={theme}>
    <a className="skip-link" href="#replayer">Skip to replayer</a>
    <header className="app-header"><div className="header-inner"><a className="wordmark" href="./" aria-label="Hand Replayer home"><span className="brand-mark">♠</span><span>hand<span className="wordmark-light">replayer</span><span className="brand-period">.</span></span></a><div className="header-right"><span className="local-badge"><span />Local & private</span><button className="button button-primary" onClick={() => { setPlaying(false); setImportOpen(true); }}><Icon name="upload" /><span>Import hand</span></button></div></div></header>
    <main className="main-content" id="replayer">
      <div className="page-heading"><div><div className="eyebrow">EVERY DECISION. EVERY STREET.</div><h1>A second look at your hand.</h1><p>Slow it down. Follow the action. Find your edge.</p></div><div className="supported-badge"><span className="pokerstars-mark">♠</span><div><strong>PokerStars</strong><span>No-Limit Hold’em</span></div></div></div>
      <section className="replayer-shell" aria-label="Poker hand replayer">
        <div className="hand-toolbar"><div className="hand-identity"><span className="hand-tag">{demo ? 'EXAMPLE HAND' : hand.kind.toUpperCase()}</span><span className="hand-number">#{hand.id}</span><span className="hand-table-name">{hand.tableName}</span></div><div className="table-options"><label className="reveal-toggle" title="Show only cards eventually recorded in this history"><input type="checkbox" checked={revealCards} onChange={event => setRevealCards(event.target.checked)} /><Icon name="eye" size={16} /><span>Reveal known cards</span></label><label className="theme-picker"><span className="visually-hidden">Table theme</span><select aria-label="Table theme" value={theme} onChange={event => setTheme(event.target.value)}><option value="midnight">Midnight</option><option value="forest">Forest</option></select></label></div></div>
        <div className="replayer-grid"><div className="table-column"><Table hand={hand} state={state} revealCards={revealCards} finalPlayers={knownCards} format={format} /><div className="current-action" aria-live={playing ? 'off' : 'polite'}><span className={`action-indicator ${playing ? 'is-playing' : ''}`} /><span>{currentEvent?.label || 'The table is set. Press play to follow the hand.'}</span>{state.complete && <span className="complete-badge"><Icon name="check" size={14} />Complete</span>}</div><PlaybackControls index={index} max={max} playing={playing} speed={speed} events={events} onSeek={seek} onPlay={togglePlay} onSpeed={setSpeed} /></div><ActionLog hand={hand} state={state} revealCards={revealCards} events={events} index={index} onSeek={seek} format={format} /></div>
      </section>
      {warnings.length > 0 && <div className="hand-warnings" role="status"><Icon name="info" /><div><strong>Hand notes</strong>{warnings.map((warning, i) => <p key={i}>{typeof warning === 'string' ? warning : warning.message}</p>)}</div></div>}
      <div className="below-table"><span><Icon name="shield" size={16} />Your history stays in your browser.</span><span className="keyboard-hint"><kbd>Space</kbd> play / pause <kbd>←</kbd><kbd>→</kbd> step through</span></div>
      <div className="scope-note"><span className="scope-label">MADE FOR REVIEW</span><p>English PokerStars cash and tournament hands · 2–9 players · one hand at a time.<br />Unknown hole cards stay unknown. Revealing known cards never guesses missing cards.</p><button className="text-button" onClick={() => { setPlaying(false); setImportOpen(true); }}>Load your own hand<Icon name="forward" size={15} /></button></div>
    </main>
    <footer className="app-footer"><span>Independent hand history viewer. Not affiliated with PokerStars.</span><span>Built for a closer look.</span></footer>
    <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={text => load(text)} onDemo={() => { load(DEMO_HAND, true); }} />
  </div>;
}
