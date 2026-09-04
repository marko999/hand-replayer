import { compareHands, evaluateHoldem } from '../poker/evaluate';
import { HandError, type ParsedHand, type PlayerState, type Pot, type ReplayEvent, type ReplayState } from './types';

export function buildPots(players: PlayerState[]): Pot[] {
  // Only live/all-in contribution limits create a separate pot. Folded dead money
  // stays in the pot it contributed to; mucking does not renumber existing pots.
  const levels = [...new Set(players.filter(p=>!p.folded&&p.allIn).map(p=>p.contributed).filter(Boolean))].sort((a,b)=>a-b);
  const maximum=Math.max(0,...players.map(p=>p.contributed));
  if(maximum && !levels.includes(maximum))levels.push(maximum);
  let previous = 0;
  return levels.map((level,index)=>{
    const amount=players.reduce((sum,p)=>sum+Math.max(0,Math.min(p.contributed,level)-previous),0);
    const pot={index,amount,eligiblePlayerIds:players.filter(p=>!p.folded&&!p.mucked&&(!p.allIn||p.contributed>=level)).map(p=>p.id)};
    previous=level;return pot;
  });
}
export function replayParsed({ hand, events, totalPot, rake, summaryBoard, summaryPots }: ParsedHand): ReplayState[] {
  let state: ReplayState = {index:0,street:'preflop',board:[],players:hand.players.map(p=>({...p,stack:p.startingStack,streetBet:0,contributed:0,folded:false,mucked:false,allIn:false,cards:[],lastAction:'',won:0})),pot:0,pots:[],toAct:null,complete:false,rake:0};
  const states: ReplayState[] = [structuredClone(state)];
  const initialTotal = hand.players.reduce((sum,p)=>sum+p.startingStack,0);
  let pending = new Set<string>(), currentBet = 0, fullRaise = hand.bigBlind, began = false, postedSB: string | undefined, postedBB: string | undefined, awarding = false, totalAwarded = 0, bettingStreet = 'preflop';
  const postedAnte = new Map<string,number>(), faced = new Map<string,number>(), awardEvents: ReplayEvent[] = [];
  const eligible = () => state.players.filter(p=>!p.folded);
  const canAct = () => eligible().filter(p=>!p.allIn);
  const clockwise = (seat:number) => [...state.players].sort((a,b)=>((a.seat-seat+10)%10 || 10)-((b.seat-seat+10)%10 || 10));
  const next = (seat:number) => clockwise(seat).find(p=>pending.has(p.id))?.id ?? null;
  const fail = (code:string,message:string,e:ReplayEvent,status:'invalid'|'incomplete'|'unsupported'='invalid'): never => { throw new HandError(status,code,message,e.line); };
  const openRound = (seat:number) => { pending = new Set(canAct().map(p=>p.id)); if(canAct().length <= 1 && canAct().every(p=>p.streetBet>=currentBet)) pending.clear(); state.toAct=next(seat); };
  const settled = () => eligible().length <= 1 || pending.size === 0;
  const put = (p:PlayerState,n:number,e:ReplayEvent,ante=false) => {
    if (!Number.isSafeInteger(n) || n<=0 || n>p.stack) fail('STACK',`${p.name} cannot contribute that amount from the remaining stack.`,e);
    if (!!e.allIn !== (n===p.stack)) fail('ALL_IN',`${p.name}'s all-in marker does not match the remaining stack.`,e);
    p.stack-=n;p.contributed+=n;if(!ante)p.streetBet+=n;p.allIn=p.stack===0;
  };
  const checkCards = (p:PlayerState,cards:string[],e:ReplayEvent) => {
    if (p.cards.length && [...p.cards].sort().join('') !== [...cards].sort().join('')) fail('CARD_CHANGE','A player’s known cards changed.',e);
    const others=state.players.filter(q=>q.id!==p.id).flatMap(q=>q.cards);
    if(cards.some(c=>state.board.includes(c)||others.includes(c))) fail('DUPLICATE_CARD','The same card appears in more than one hand or on the board.',e);
    p.cards=[...cards];
  };
  for (const e of events) {
    state=structuredClone(state); state.index++;
    const p=e.playerId ? state.players.find(p=>p.id===e.playerId)! : undefined;
    if (awarding && !['award','finish','muck','no-show','show','summary-reveal'].includes(e.type)) fail('AFTER_AWARD','Gameplay cannot continue after the pot has been awarded.',e);
    if (e.type==='ante'||e.type==='small-blind'||e.type==='big-blind') {
      if(began || !p) fail('FORCED_ORDER','Forced bets must precede the hole-card marker.',e);
      if(e.type==='ante') {
        if(postedSB||postedBB) fail('ANTE_ORDER','Antes must be posted before the blinds.',e);
        if(postedAnte.has(p!.id)) fail('ANTE_DUPLICATE','A player posted an ante twice.',e);
        postedAnte.set(p!.id,e.amount!);put(p!,e.amount!,e,true);
      } else {
        const expected=hand.players.length===2 ? (e.type==='small-blind' ? state.players.find(p=>p.seat===hand.buttonSeat)! : clockwise(hand.buttonSeat)[0]) : clockwise(hand.buttonSeat)[e.type==='small-blind'?0:1];
        if(p!.id!==expected.id) fail('BLIND_POSITION','The blinds do not match the button and occupied seats.',e);
        if(e.type==='small-blind') {if(postedSB||postedBB)fail('BLIND_ORDER','Small blind must be posted once before the big blind.',e); postedSB=p!.id;}
        else {if(postedBB||!postedSB)fail('BLIND_ORDER','Big blind must be posted once after the small blind.',e);postedBB=p!.id;}
        const nominal=e.type==='small-blind'?hand.smallBlind:hand.bigBlind;
        if(e.amount!==Math.min(p!.stack,nominal))fail('BLIND_AMOUNT','Posted blind does not match stakes or all-in stack.',e);
        put(p!,e.amount!,e);currentBet=hand.bigBlind;
      }
      p!.lastAction=e.type==='ante'?'Ante':e.type==='small-blind'?'Small blind':'Big blind';
    } else if(e.type==='street') {
      if(e.street==='preflop') {
        if(began||!postedSB||!postedBB) fail('BLINDS','Exactly one small blind and big blind are required before play.',e);
        if(postedAnte.size) {
          if(postedAnte.size!==state.players.length)fail('ANTE_MISSING','Every seated player must post the uniform ante.',e);
          const nominal=Math.max(...postedAnte.values());
          if(state.players.some(p=>postedAnte.get(p.id)!==Math.min(nominal,p.startingStack)))fail('ANTE_AMOUNT','Ante amounts are inconsistent.',e);
        }
        began=true; openRound(state.players.find(p=>p.id===postedBB)!.seat);
      } else if(e.street==='showdown') {
        if(state.street==='showdown')fail('STREET_ORDER','Duplicate showdown marker.',e);
        if(!began||!settled())fail('UNFINISHED_ROUND','Showdown began before betting was complete.',e);
        if(eligible().length>1&&state.board.length!==5)fail('MISSING_BOARD','A contested showdown needs five board cards.',e,'incomplete');
        state.street='showdown';state.toAct=null;
      } else {
        if(!began||!settled())fail('UNFINISHED_ROUND','The next street began before all players completed their action.',e);
        const priorBets=state.players.map(p=>p.streetBet).sort((a,b)=>b-a);
        if(priorBets[0]>priorBets[1])fail('MISSING_RETURN','An unmatched bet must be returned before dealing the next street.',e);
        if(eligible().length<2)fail('EXTRA_BOARD','The board cannot continue after everyone but one player folds.',e);
        const required=e.street==='flop'?3:e.street==='turn'?4:5;
        const before=e.street==='flop'?'preflop':e.street==='turn'?'flop':'turn';
        if(bettingStreet!==before||e.cards?.length!==required)fail('STREET_ORDER','Board streets are missing or out of order.',e);
        if(state.board.some((c,i)=>e.cards![i]!==c))fail('BOARD_CHANGE','Previously dealt board cards changed.',e);
        if(e.cards!.some(c=>state.players.some(p=>p.cards.includes(c))))fail('DUPLICATE_CARD','A board card is already held by a player.',e);
        state.board=[...e.cards!];state.street=e.street;bettingStreet=e.street;currentBet=0;fullRaise=hand.bigBlind;faced.clear();
        state.players.forEach(p=>{p.streetBet=0;p.lastAction='';});openRound(hand.buttonSeat);
      }
    } else if(e.type==='deal') {
      if(!began||bettingStreet!=='preflop'||state.players.some(p=>['Fold','Check','Call','Bet','Raise'].includes(p.lastAction))) fail('DEAL_ORDER','Dealt hole cards must appear at the beginning of preflop.',e);
      checkCards(p!,e.cards!,e);
    } else if(['fold','check','call','bet','raise'].includes(e.type)) {
      if(!began||state.street==='showdown'||state.toAct!==p!.id||p!.folded||p!.allIn)fail('ACTION_ORDER',`Unexpected action by ${p!.name}; ${state.toAct ? state.players.find(p=>p.id===state.toAct)!.name : 'no player'} is next to act.`,e);
      const owed=Math.max(0,currentBet-p!.streetBet);
      if(e.type==='fold') {p!.folded=true;p!.lastAction='Fold';}
      if(e.type==='check') {if(owed)fail('CHECK_FACING_BET','A player facing a bet cannot check.',e);p!.lastAction='Check';}
      if(e.type==='call') {if(!owed||e.amount!==Math.min(owed,p!.stack))fail('CALL_AMOUNT','Call amount must match the outstanding bet, capped by the remaining stack.',e);put(p!,e.amount!,e);p!.lastAction='Call';}
      if(e.type==='bet'||e.type==='raise') {
        if(canAct().filter(q=>q.id!==p!.id).length===0)fail('NO_OPPONENT','Cannot bet or raise when no opponent can call more chips.',e);
        if(e.type==='bet'&&currentBet!==0)fail('BET_FACING_BET','Use a raise when a bet is already open.',e);
        if(e.type==='raise'&&currentBet===0)fail('RAISE_WITHOUT_BET','Cannot raise before a bet is made.',e);
        if(faced.has(p!.id)&&currentBet-faced.get(p!.id)!<fullRaise)fail('NOT_REOPENED','A short all-in has not reopened raising for this player.',e);
        const target=e.type==='bet'?e.amount!:e.to!;
        const increase=target-currentBet;
        if(increase<=0||(e.type==='raise'&&e.amount!==increase))fail('RAISE_AMOUNT','Raise increment and raise-to amount are inconsistent.',e);
        const contribution=target-p!.streetBet;
        if(increase<fullRaise&&contribution!==p!.stack)fail('MIN_RAISE','A raise below the minimum is only legal as an all-in.',e);
        put(p!,contribution,e);
        if(increase>=fullRaise){fullRaise=increase;pending=new Set(canAct().map(q=>q.id));}
        else for(const q of canAct())if(q.streetBet<target)pending.add(q.id);
        currentBet=target;p!.lastAction=e.type==='bet'?'Bet':'Raise';
      }
      faced.set(p!.id,currentBet);pending.delete(p!.id);
      if(eligible().length<=1||(canAct().length<=1&&canAct().every(q=>q.streetBet>=currentBet)))pending.clear();
      state.toAct=next(p!.seat);
    } else if(e.type==='return') {
      if(!began||!settled()||p!.folded)fail('RETURN_ORDER','An uncalled return must follow completed betting and belong to an active player.',e);
      const second=Math.max(0,...state.players.filter(q=>q.id!==p!.id).map(q=>q.streetBet));
      const excess=p!.streetBet-second;
      if(excess<=0||e.amount!==excess)fail('RETURN_AMOUNT','The uncalled return must equal the unmatched portion of the final bet.',e);
      p!.stack+=e.amount!;p!.contributed-=e.amount!;p!.streetBet-=e.amount!;p!.allIn=p!.stack===0;p!.lastAction='Uncalled return';currentBet=second;
    } else if(e.type==='show') {
      if(!began||!settled()||p!.folded||p!.mucked||(state.board.length<5&&eligible().length>1&&canAct().length>1))fail('SHOW_ORDER','Cards can only be shown after betting is settled by a player still in the hand.',e);
      checkCards(p!,e.cards!,e);p!.lastAction='Show';
    } else if(e.type==='muck') {
      if(!began||!settled()||p!.folded||p!.mucked||state.board.length<5)fail('MUCK_ORDER','Mucking must follow completed action by an active player.',e);
      p!.lastAction='Muck';p!.mucked=true;
    } else if(e.type==='summary-reveal') {
      if(!awarding)fail('SUMMARY_ORDER','Summary-only cards require completed play and payouts.',e);
      checkCards(p!,e.cards!,e);
      if(e.summaryMucked)p!.mucked=true;
      p!.lastAction='Summary reveal';
    } else if(e.type==='no-show') {
      if(!began||!settled()||p!.folded||(state.board.length<5&&eligible().length>1&&canAct().length>1))fail('SHOW_ORDER','A no-show declaration must follow the end of betting.',e);
    } else if(e.type==='award') {
      if(!began||!settled()||p!.folded||p!.mucked||!e.amount||e.amount<0)fail('AWARD','The pot cannot be awarded before action is complete or to a folded player.',e);
      if(eligible().length>1&&state.board.length!==5)fail('MISSING_BOARD','A contested pot requires a complete five-card board.',e,'incomplete');
      const bets=state.players.map(p=>p.streetBet).sort((a,b)=>b-a);
      if(bets[0]>bets[1])fail('MISSING_RETURN','The unmatched portion of a bet must be returned before awarding the pot.',e);
      if(e.potIndex===undefined&&buildPots(state.players).length>1)fail('AMBIGUOUS_POT','A multi-pot hand must identify each award as main pot or a numbered side pot.',e,'unsupported');
      awarding=true;p!.stack+=e.amount!;p!.won+=e.amount!;totalAwarded+=e.amount!;awardEvents.push(e);p!.lastAction='Collected';state.toAct=null;
      if(totalAwarded>state.players.reduce((s,p)=>s+p.contributed,0))fail('OVERPAYMENT','Payouts exceed the contributed pot.',e);
    } else if(e.type==='finish') {
      if(!began||!settled()||!awarding)fail('MISSING_RESULT','The hand ends before betting and payouts are complete.',e,'incomplete');
      const contributed=state.players.reduce((s,p)=>s+p.contributed,0);
      if(totalPot!==contributed)fail('TOTAL_POT','Summary total pot does not match contributions after uncalled returns.',e);
      if(rake<0||rake>totalPot||totalAwarded+rake!==totalPot)fail('PAYOUT_ACCOUNTING','Collected amounts plus rake do not equal the total pot.',e);
      if(hand.kind==='tournament'&&rake!==0)fail('TOURNAMENT_RAKE','Tournament pots cannot have cash-game rake.',e);
      if(summaryBoard&&summaryBoard.join(' ')!==state.board.join(' '))fail('SUMMARY_BOARD','The summary board does not match the dealt board.',e);
      const pots=buildPots(state.players),remaining=pots.map(p=>p.amount),allocated=pots.map(()=>new Map<string,number>());
      for(const [key,amount] of Object.entries(summaryPots??{}))if(pots[Number(key)]?.amount!==amount)fail('SUMMARY_POTS','Summary pot breakdown does not match the contributed main and side pots.',e);
      for(const award of awardEvents) {
        let amount=award.amount!;
        const candidates=pots.map((pot,i)=>({pot,i})).filter(({pot,i})=>pot.eligiblePlayerIds.includes(award.playerId!)&&(award.potIndex===undefined||award.potIndex===i)).reverse();
        for(const {pot,i} of candidates) {
          const contenders=state.players.filter(p=>pot.eligiblePlayerIds.includes(p.id));
          const winner=state.players.find(p=>p.id===award.playerId)!;
          if(state.board.length===5&&winner.cards.length===2&&contenders.some(q=>q.cards.length===2&&compareHands(q.cards,winner.cards,state.board)>0))continue;
          const n=Math.min(amount,remaining[i]);remaining[i]-=n;amount-=n;allocated[i].set(award.playerId!,(allocated[i].get(award.playerId!)??0)+n);
        }
        if(amount)fail('POT_ELIGIBILITY','A payout exceeds the player’s eligible pot or contradicts the known showdown cards.',award);
      }
      for(const [i,pot] of pots.entries()) {
        const contenders=state.players.filter(p=>pot.eligiblePlayerIds.includes(p.id));
        const declared=clockwise(hand.buttonSeat).filter(p=>(allocated[i].get(p.id)??0)>0);
        const paidShares=declared.map(p=>allocated[i].get(p.id)!);
        if(paidShares.length>1&&(Math.max(...paidShares)-Math.min(...paidShares)>1||paidShares.some((n,j)=>j>0&&n>paidShares[j-1])))fail('SPLIT_POT','Declared winners of a pot must split it equally; odd chips go left of the button first.',e);
        if(state.board.length!==5)continue;
        const boardRank=evaluateHoldem(state.board),royalBoard=boardRank[0]===8&&boardRank[1]===14;
        const known=contenders.filter(p=>p.cards.length===2);
        if(!royalBoard&&!known.length)continue;
        const best=known.length?known.reduce((a,b)=>compareHands(a.cards,b.cards,state.board)>=0?a:b):undefined;
        const winners=royalBoard?contenders:known.filter(p=>compareHands(p.cards,best!.cards,state.board)===0);
        const shares=winners.map(p=>allocated[i].get(p.id)??0);
        if(Math.max(...shares)-Math.min(...shares)>1)fail('SPLIT_POT','Known tied winners must split each pot equally, allowing one odd chip.',e);
        if(!royalBoard&&known.length!==contenders.length)continue;
        const totalPaid=shares.reduce((n,v)=>n+v,0),base=Math.floor(totalPaid/winners.length),odd=totalPaid%winners.length;
        const ordered=clockwise(hand.buttonSeat).filter(p=>winners.some(w=>w.id===p.id));
        if(ordered.some((p,j)=>(allocated[i].get(p.id)??0)!==base+(j<odd?1:0)))fail('ODD_CHIP','Odd chips in a tied pot go to the first tied winners left of the button.',e);
      }
      state.players.forEach(p=>{p.streetBet=0;});
      state.complete=true;state.street='complete';state.rake=rake;state.toAct=null;
    }
    state.pot=state.players.reduce((s,p)=>s+p.contributed,0)-totalAwarded-state.rake;
    state.pots=buildPots(state.players);
    if(awarding) {
      // During payout, show only the undistributed balance; original pots remain in earlier snapshots.
      for(const award of awardEvents) {
        let distributed=award.amount!;
        for(let i=state.pots.length-1;i>=0;i--) {
          const pot=state.pots[i];
          if(!pot.eligiblePlayerIds.includes(award.playerId!)||(award.potIndex!==undefined&&award.potIndex!==i))continue;
          const paid=Math.min(distributed,pot.amount);distributed-=paid;pot.amount-=paid;
        }
      }
      let undistributedRake=state.rake;
      state.pots=state.pots.map(pot=>{const paid=Math.min(undistributedRake,pot.amount);undistributedRake-=paid;return {...pot,amount:pot.amount-paid};}).filter(pot=>pot.amount>0);
    }
    if(state.players.some(p=>p.stack<0)||state.players.reduce((s,p)=>s+p.stack,0)+state.pot+state.rake!==initialTotal)fail('CONSERVATION','Chip conservation failed.',e);
    states.push(state);
  }
  return states;
}
