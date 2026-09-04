import { parseText } from './parser';
import { replayParsed } from './engine';
import { HandError, type Hand, type ReplayResult } from './types';
export * from './types';
export { buildPots } from './engine';
export { DEMO_HAND } from './sample';
export function parseReplay(text: string): ReplayResult {
  try {
    const parsed=parseText(text);
    return {ok:true,hand:parsed.hand,events:parsed.events,states:replayParsed(parsed),warnings:[]};
  } catch(error) {
    if(error instanceof HandError)return {ok:false,status:error.status,issues:[{code:error.code,message:error.message,line:error.line}]};
    throw error;
  }
}
export function formatAmount(amount:number, hand:Pick<Hand,'currency'|'scale'>):string {
  const whole=Math.trunc(amount/hand.scale).toLocaleString('en-US');
  const value=hand.scale===100?`${whole}.${String(Math.abs(amount%100)).padStart(2,'0')}`:whole;
  return `${hand.currency==='USD'?'$':hand.currency==='EUR'?'€':hand.currency==='GBP'?'£':''}${value}`;
}
