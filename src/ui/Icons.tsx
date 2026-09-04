type IconName = 'play' | 'pause' | 'back' | 'forward' | 'first' | 'last' | 'upload' | 'close' | 'check' | 'eye' | 'file' | 'chevron' | 'shield' | 'info' | 'copy' | 'reset';

const paths: Record<IconName, React.ReactNode> = {
  play: <path d="m9 5 11 7-11 7V5Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  back: <path d="m15 6-7 6 7 6" />,
  forward: <path d="m9 6 7 6-7 6" />,
  first: <><path d="M5 5v14m13-13-8 6 8 6" /></>,
  last: <><path d="M19 5v14M6 6l8 6-8 6" /></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  file: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h4M9 12h6m-6 4h6" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-11v1" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>,
  reset: <><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></>,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
