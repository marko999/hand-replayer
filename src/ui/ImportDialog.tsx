import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

export interface ImportIssue { message: string; line?: number; code?: string }
export interface ImportError { status: string; issues: ImportIssue[] }

export function ImportDialog({ open, onClose, onImport, onDemo }: { open: boolean; onClose: () => void; onImport: (text: string) => ImportError | null; onDemo: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<ImportError | null>(null);
  const [fileName, setFileName] = useState('');
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  function importText() {
    const result = onImport(text);
    setError(result);
    if (!result) onClose();
  }
  async function readFile(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError({ status: 'unsupported', issues: [{ message: 'Choose a text hand history smaller than 2 MB.' }] }); return; }
    try {
      setText(await file.text());
      setFileName(file.name);
      setError(null);
    } catch {
      setError({ status: 'invalid', issues: [{ message: 'This file could not be read. Try pasting the text directly.' }] });
    }
  }
  return <dialog ref={dialog} className="import-dialog" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} aria-labelledby="import-title">
    <div className="dialog-heading"><div><span className="eyebrow">YOUR NEXT HAND</span><h2 id="import-title">Bring the action back.</h2></div><button className="icon-button" aria-label="Close import" onClick={onClose}><Icon name="close" /></button></div>
    <p className="dialog-description">Paste one complete English PokerStars No-Limit Hold’em hand history, including its summary. Cash games and tournaments, 2–9 players.</p>
    <label className="textarea-label" htmlFor="hand-history">Hand history <span>Plain text</span></label>
    <textarea id="hand-history" value={text} onChange={event => { setText(event.target.value); setError(null); setFileName(''); }} placeholder={'PokerStars Hand #…: Hold\'em No Limit ($0.50/$1.00 USD)\nTable \'…\' 6-max Seat #1 is the button\n…\n*** SUMMARY ***'} spellCheck={false} />
    <div className="upload-row"><input ref={fileInput} className="visually-hidden" type="file" accept=".txt,.log,text/plain" onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ''; }} /><button className="button button-secondary" onClick={() => fileInput.current?.click()}><Icon name="upload" />Choose text file</button><span className="file-name">{fileName || 'Up to 2 MB · one hand at a time'}</span></div>
    {error && <div className={`import-error error-${error.status}`} role="alert"><strong>{error.status === 'incomplete' ? 'This hand is incomplete' : error.status === 'unsupported' ? 'This format is not supported' : 'This hand could not be validated'}</strong><ul>{error.issues.map((issue, i) => <li key={i}>{issue.line ? `Line ${issue.line}: ` : ''}{issue.message}</li>)}</ul></div>}
    <div className="import-privacy"><Icon name="shield" /><span>Processed on this device. Your hand history is never uploaded.</span></div>
    <div className="dialog-footer"><button className="text-button" onClick={() => { onDemo(); onClose(); }}>Try the example hand</button><button className="button button-primary" onClick={importText} disabled={!text.trim()}>Replay hand<Icon name="forward" /></button></div>
  </dialog>;
}
