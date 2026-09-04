import { HandError, type Hand, type ParsedHand, type ReplayEvent, type Street } from './types';

const numberPattern = '[$€£]?[\\d,]+(?:\\.\\d+)?';
const cardsOf = (raw: string, line: number) => {
  const cards = raw.trim().split(/\s+/).filter(Boolean);
  if (cards.some(c => !/^[2-9TJQKA][cdhs]$/.test(c)) || new Set(cards).size !== cards.length) throw new HandError('invalid', 'CARDS', 'Invalid or duplicate cards.', line);
  return cards;
};
export function parseText(text: string): ParsedHand {
  if(text.length>2*1024*1024||new TextEncoder().encode(text).byteLength>2*1024*1024)throw new HandError('unsupported','INPUT_SIZE','Hand histories are limited to 2 MiB.');
  const lines = text.replace(/^\uFEFF/, '').replace(/\r/g, '').trim().split('\n');
  if(lines.length>10000)throw new HandError('unsupported','INPUT_LINES','Hand histories are limited to 10,000 lines.');
  if (!text.trim()) throw new HandError('incomplete', 'EMPTY', 'Paste or upload one complete PokerStars hand history.');
  if (lines.filter(l => /^PokerStars (?:Hand|Game) #/.test(l)).length > 1) throw new HandError('unsupported', 'MULTIPLE_HANDS', 'Import one hand at a time.');
  const header = lines[0];
  if (!/^PokerStars (?:Hand|Game) #\d+:/.test(header)) throw new HandError('unsupported', 'ROOM', 'Expected an English PokerStars hand history header.', 1);
  if (!/Hold'em No Limit/.test(header) || /Zoom|Home Game|Badugi|Omaha|Short Deck|6\+|Run It Twice/i.test(header)) throw new HandError('unsupported', 'GAME', 'This release supports standard PokerStars No-Limit Hold’em cash and tournament hands.', 1);
  if (/^\*\*\* (?:FIRST |SECOND |THIRD |.*RUN IT)|^[^:\n]+: posts (?:straddle|big blind \+ dead|small & big blinds|a dead)/im.test(text)) throw new HandError('unsupported', 'VARIANT', 'Multiple boards, straddles, and dead or combined blinds are not supported.');
  const kind = /Tournament #/.test(header) ? 'tournament' : 'cash';
  const scale = kind === 'cash' ? 100 : 1;
  const blinds = [...header.matchAll(new RegExp(`\\((${numberPattern})/(${numberPattern})(?: ([A-Z]+))?\\)`, 'g'))].at(-1);
  if (!blinds) throw new HandError('unsupported', 'HEADER', 'Cannot read the stakes from this header.', 1);
  const currencyCode=blinds[3];
  if(kind==='cash'&&currencyCode&&!['USD','EUR','GBP'].includes(currencyCode))throw new HandError('unsupported','CURRENCY','Only USD, EUR, GBP and play-chip cash formats are supported.',1);
  const expectedSymbol=kind==='tournament'?'':currencyCode?({USD:'$',EUR:'€',GBP:'£'}[currencyCode]??''):(blinds[1].match(/^[$€£]/)?.[0]??'');
  const money = (raw: string, line: number): number => {
    const symbol=raw.match(/^[$€£]/)?.[0]??'';
    if(symbol && symbol!==expectedSymbol)throw new HandError('invalid','CURRENCY','Amount currency does not match the hand stakes.',line);
    const stripped=raw.replace(/^[$€£]/,'');
    if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(stripped))throw new HandError('invalid','AMOUNT','Invalid numeric grouping or amount.',line);
    const value = stripped.replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(value)) throw new HandError('invalid', 'AMOUNT', 'Invalid amount.', line);
    const [whole, fraction = ''] = value.split('.');
    const digits = scale === 100 ? 2 : 0;
    if (fraction.length > digits && /[1-9]/.test(fraction.slice(digits))) throw new HandError('unsupported', 'PRECISION', `Amounts smaller than ${scale === 100 ? 'one cent' : 'one tournament chip'} are not supported.`, line);
    const n = Number(whole) * scale + Number((fraction.slice(0, digits) + '00').slice(0, digits));
    if (!Number.isSafeInteger(n) || n < 0) throw new HandError('invalid', 'AMOUNT_RANGE', 'Amount exceeds the supported exact integer range.', line);
    return n;
  };
  const hand: Hand = { id: header.match(/#(\d+):/)![1], tableName: '', kind, currency: kind === 'tournament' ? 'chips' : currencyCode ?? (expectedSymbol==='€'?'EUR':expectedSymbol==='£'?'GBP':expectedSymbol==='$'?'USD':'chips'), scale, smallBlind: money(blinds[1], 1), bigBlind: money(blinds[2], 1), buttonSeat: 0, players: [] };
  if (hand.smallBlind <= 0 || hand.bigBlind < hand.smallBlind) throw new HandError('invalid', 'BLINDS', 'Blinds must be positive and the big blind cannot be smaller than the small blind.', 1);
  let tableCapacity = 9;
  const summaryPots:Record<number,number> = {};
  const summarySeats = new Map<number,{text:string,line:number}>();
  let street: Street = 'preflop', started = false, summary = false, totalPot: number | undefined, rake: number | undefined, summaryBoard: string[] | undefined;
  const events: ReplayEvent[] = [];
  const findPlayer = (name: string, line: number) => {
    const p = hand.players.find(p => p.name === name);
    if (!p) throw new HandError('invalid', 'PLAYER', `Unknown player: ${name}.`, line);
    return p.id;
  };
  for (let i = 1; i < lines.length; i++) {
    const line = i + 1, s = lines[i].trim(); if (!s) continue;
    let m: RegExpMatchArray | null;
    const emit = (event: Omit<ReplayEvent, 'line' | 'street' | 'label'> & Partial<Pick<ReplayEvent, 'street'>>) => events.push({ line, street, label: s, ...event });
    if (s === '*** SUMMARY ***') { if(summary)throw new HandError('invalid','SUMMARY','Duplicate summary marker.',line); summary = true; continue; }
    if (summary) {
      if ((m = s.match(new RegExp(`^Total pot (${numberPattern})(.*?) \\| Rake (${numberPattern})$`)))) {
        if (totalPot !== undefined) throw new HandError('invalid','SUMMARY','Duplicate total pot summary.',line);
        totalPot = money(m[1],line); rake = money(m[3],line);
        const detail=m[2].trim();
        const parts=[...detail.matchAll(new RegExp(`(Main pot|Side pot(?:-(\\d+))?) (${numberPattern})\\.`, 'g'))];
        if(detail && (!parts.length || detail.replace(new RegExp(`(Main pot|Side pot(?:-\\d+)?) ${numberPattern}\\.`, 'g'),'').trim()))throw new HandError('unsupported','SUMMARY_POTS','Unrecognized pot breakdown in summary.',line);
        for(const part of parts) {
          const index=part[1]==='Main pot'?0:part[2]?Number(part[2]):1;
          if(index in summaryPots)throw new HandError('invalid','SUMMARY_POTS','Duplicate pot in summary.',line);
          summaryPots[index]=money(part[3],line);
        }
        continue;
      }
      if ((m = s.match(/^Board \[([^\]]*)\]$/))) { if(summaryBoard)throw new HandError('invalid','SUMMARY_BOARD','Duplicate summary board.',line); summaryBoard = cardsOf(m[1], line); continue; }
      if (/^Seat \d+: /.test(s)) {
        const seat = Number(s.match(/^Seat (\d+):/)![1]);
        const player = hand.players.find(p => p.seat === seat);
        if(summarySeats.has(seat))throw new HandError('invalid','SUMMARY_PLAYER','Duplicate summary seat.',line);
        summarySeats.set(seat,{text:s,line});
        if (!player || !s.startsWith(`Seat ${seat}: ${player.name} `)) throw new HandError('invalid','SUMMARY_PLAYER','Summary seat does not match the player list.',line);
        continue;
      }
      throw new HandError('unsupported','SUMMARY_LINE',`Unrecognized summary line: ${s}`,line);
    }
    if ((m = s.match(/^Table '(.+)' (\d+)-max Seat #(\d+) is the button$/))) {
      if (hand.tableName || started) throw new HandError('invalid','TABLE','Duplicate or misplaced table declaration.',line);
      if (+m[2] < 2 || +m[2] > 9) throw new HandError('unsupported','TABLE_SIZE','Only 2–9 seat tables are supported.',line);
      tableCapacity = +m[2]; hand.tableName = m[1]; hand.buttonSeat = +m[3]; continue;
    }
    if ((m = s.match(new RegExp(`^Seat (\\d+): (.+) \\((${numberPattern}) in chips(?:, .+)?\\)(?: is sitting out)?$`)))) {
      if (started) throw new HandError('invalid','SEATS','Seat definitions must precede the action.',line);
      if (/sitting out|bounty/i.test(s)) throw new HandError('unsupported','SEAT_VARIANT','Sitting-out seats and bounty amounts in seat declarations are not supported.',line);
      const seat = +m[1], stack = money(m[3],line);
      if (seat < 1 || seat > tableCapacity || !stack || hand.players.some(p => p.seat === seat || p.name === m![2])) throw new HandError('invalid','SEATS','Seats and names must be unique; seats must be 1–9 and stacks positive.',line);
      hand.players.push({ id:`seat-${seat}`,name:m[2],seat,startingStack:stack }); continue;
    }
    if(hand.players.some(p=>[' is disconnected',' is connected',' has timed out',' has returned',' leaves the table'].some(suffix=>s===p.name+suffix)))continue;
    if (s === '*** HOLE CARDS ***') { if (started && events.some(e => e.type === 'street')) throw new HandError('invalid','STREET','Duplicate hole-card marker.',line); started = true; emit({type:'street'}); continue; }
    if ((m = s.match(/^\*\*\* (FLOP|TURN|RIVER) \*\*\* \[([^\]]+)\](?: \[([^\]]+)\])?$/))) {
      started = true; street = m[1].toLowerCase() as Street;
      const cards = cardsOf([m[2],m[3]].filter(Boolean).join(' '),line);
      emit({type:'street',cards}); continue;
    }
    if (s === '*** SHOW DOWN ***') { street = 'showdown'; emit({type:'street'}); continue; }
    if ((m = s.match(/^Dealt to (.+) \[([^\]]+)\]$/))) {
      const playerId = findPlayer(m[1],line), cards = cardsOf(m[2],line);
      if (hand.heroId || cards.length !== 2) throw new HandError('invalid','DEAL','Expected one dealt hand containing two cards.',line);
      hand.heroId = playerId; emit({type:'deal',playerId,cards}); continue;
    }
    if ((m = s.match(new RegExp(`^Uncalled bet \\((${numberPattern})\\) returned to (.+)$`)))) { emit({type:'return',amount:money(m[1],line),playerId:findPlayer(m[2],line)}); continue; }
    if ((m = s.match(new RegExp(`^(.+) collected (${numberPattern}) from (pot|main pot|side pot(?:-(\\d+))?)$`)))) {
      emit({type:'award',playerId:findPlayer(m[1],line),amount:money(m[2],line),potIndex:m[3] === 'pot' ? undefined : m[3] === 'main pot' ? 0 : m[4] ? Number(m[4]) : 1}); continue;
    }
    // Match names from known seats rather than splitting on a colon (screen names may contain colons).
    const actor = [...hand.players].sort((a,b)=>b.name.length-a.name.length).find(p=>s.startsWith(`${p.name}: `));
    if (actor) {
      const action = s.slice(actor.name.length+2), playerId = actor.id;
      if ((m = action.match(new RegExp(`^posts (small blind|big blind|the ante) (${numberPattern})( and is all-in)?$`)))) {
        started = true; emit({type:m[1] === 'small blind' ? 'small-blind' : m[1] === 'big blind' ? 'big-blind' : 'ante',playerId,amount:money(m[2],line),allIn:!!m[3]}); continue;
      }
      if (action === 'folds') { emit({type:'fold',playerId}); continue; }
      if (action === 'checks') { emit({type:'check',playerId}); continue; }
      if ((m = action.match(new RegExp(`^(calls|bets) (${numberPattern})( and is all-in)?$`)))) { emit({type:m[1] === 'calls' ? 'call' : 'bet',playerId,amount:money(m[2],line),allIn:!!m[3]}); continue; }
      if ((m = action.match(new RegExp(`^raises (${numberPattern}) to (${numberPattern})( and is all-in)?$`)))) { emit({type:'raise',playerId,amount:money(m[1],line),to:money(m[2],line),allIn:!!m[3]}); continue; }
      if ((m = action.match(/^shows \[([^\]]+)\](?: \(.+\))?$/))) { const cards = cardsOf(m[1],line); if (cards.length !== 2) throw new HandError('unsupported','PARTIAL_SHOW','Partial hand reveals are not supported.',line); emit({type:'show',playerId,cards}); continue; }
      if(action==='mucks hand') {emit({type:'muck',playerId});continue;}
      if(action==="doesn't show hand") {emit({type:'no-show',playerId});continue;}
      if(/^said, ".*"$/.test(action))continue;
    }
    throw new HandError('unsupported','UNKNOWN_LINE',`Unrecognized hand-history line: ${s}`,line);
  }
  if (!summary || totalPot === undefined || rake === undefined) throw new HandError('incomplete','MISSING_SUMMARY','The hand is incomplete: a final total pot and rake summary is required.');
  if (!hand.tableName || hand.players.length < 2 || !hand.players.some(p=>p.seat === hand.buttonSeat)) throw new HandError('invalid','TABLE','A table, 2–9 players, and a seated button are required.');
  if(hand.players.length>tableCapacity)throw new HandError('invalid','TABLE_CAPACITY','Player count exceeds table capacity.');
  for(const [seat,row] of summarySeats) {
    const player=hand.players.find(p=>p.seat===seat)!;
    const awards=events.filter(e=>e.type==='award'&&e.playerId===player.id).reduce((n,e)=>n+e.amount!,0);
    const reported=[...row.text.matchAll(new RegExp(`(?:won|collected) \\((${numberPattern})\\)`, 'g'))];
    if(reported.length && reported.reduce((n,m)=>n+money(m[1],row.line),0)!==awards)throw new HandError('invalid','SUMMARY_AWARD','Summary winnings do not match collected amounts.',row.line);
    const folded=events.some(e=>e.type==='fold'&&e.playerId===player.id);
    if(/\bfolded\b/.test(row.text)!==folded)throw new HandError('invalid','SUMMARY_FOLD','Summary fold status does not match the action.',row.line);
    if(/\blost\b/.test(row.text)&&awards>0)throw new HandError('invalid','SUMMARY_AWARD','Summary lists a paid winner as losing.',row.line);
    const shown=row.text.match(/(?:showed|mucked) \[([^\]]+)\]/);
    if(shown) {
      const cards=cardsOf(shown[1],row.line);
      if(cards.length!==2)throw new HandError('invalid','SUMMARY_CARDS','A summary holding must contain exactly two cards.',row.line);
      const summaryMucked=/\bmucked\b/.test(row.text);
      if(summaryMucked&&awards)throw new HandError('invalid','SUMMARY_MUCK','A player listed as mucked cannot collect a pot.',row.line);
      const known=events.find(e=>(e.type==='show'||e.type==='deal')&&e.playerId===player.id)?.cards;
      if(known&&[...known].sort().join('')!==[...cards].sort().join(''))throw new HandError('invalid','SUMMARY_CARDS','Summary cards do not match known hole cards.',row.line);
      if(!known)events.push({type:'summary-reveal',street:'showdown',playerId:player.id,cards,summaryMucked,label:`${player.name}: cards available in summary [${cards.join(' ')}]`,line:row.line});
    }
  }
  if (!Number.isSafeInteger(hand.players.reduce((n,p)=>n+p.startingStack,0))) throw new HandError('invalid','AMOUNT_RANGE','Combined stacks exceed exact integer range.');
  events.push({type:'finish',street:'complete',label:'Hand complete',line:lines.length});
  return {hand,events,totalPot,rake,summaryBoard,summaryPots};
}
