export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete';
export interface Issue { code: string; message: string; line?: number }
export interface Player { id: string; name: string; seat: number; startingStack: number }
export interface Hand { id: string; tableName: string; kind: 'cash' | 'tournament'; currency: string; scale: number; smallBlind: number; bigBlind: number; buttonSeat: number; players: Player[]; heroId?: string }
export type EventType = 'ante' | 'small-blind' | 'big-blind' | 'street' | 'deal' | 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'return' | 'show' | 'muck' | 'no-show' | 'summary-reveal' | 'award' | 'finish';
export interface ReplayEvent { type: EventType; street: Street; playerId?: string; amount?: number; to?: number; cards?: string[]; label: string; line: number; allIn?: boolean; potIndex?: number; summaryMucked?: boolean }
export interface PlayerState extends Player { stack: number; streetBet: number; contributed: number; folded: boolean; mucked: boolean; allIn: boolean; cards: string[]; lastAction: string; won: number }
export interface Pot { index: number; amount: number; eligiblePlayerIds: string[] }
export interface ReplayState { index: number; street: Street; board: string[]; players: PlayerState[]; pot: number; pots: Pot[]; toAct: string | null; complete: boolean; rake: number }
export interface Replay { ok: true; hand: Hand; events: ReplayEvent[]; states: ReplayState[]; warnings: Issue[] }
export interface ReplayFailure { ok: false; status: 'invalid' | 'incomplete' | 'unsupported'; issues: Issue[] }
export type ReplayResult = Replay | ReplayFailure;
export interface ParsedHand { hand: Hand; events: ReplayEvent[]; totalPot: number; rake: number; summaryBoard?: string[]; summaryPots?: Record<number,number> }
export class HandError extends Error { constructor(public status: ReplayFailure['status'], public code: string, message: string, public line?: number) { super(message); } }
