"use client";
import type {Currency} from "./currency";
export type Account={id:string;name:string;type:"Bank"|"Cash"|"Mobile Money";openingBalance:number;currency?:Currency;originalOpeningBalance?:number;openingBalanceZmw?:number};
export type FinanceEntry={id:string;date:string;type:"Customer Payment"|"Supplier Payment"|"General Expense"|"Capital"|"Other Income";reference:string;description:string;accountId:string;moneyIn:number;moneyOut:number;currency?:Currency;exchangeRate?:number;originalAmount?:number;moneyInZmw?:number;moneyOutZmw?:number;relatedId?:string;createdAt:string};
const ACCOUNTS_KEY="cm_finance_accounts_v1",ENTRIES_KEY="cm_finance_entries_v1";
const starterAccounts:Account[]=[{id:"acc1",name:"Zanaco Main Account",type:"Bank",openingBalance:0,currency:"ZMW"},{id:"acc2",name:"Cash on Hand",type:"Cash",openingBalance:0,currency:"ZMW"},{id:"acc3",name:"Mobile Money",type:"Mobile Money",openingBalance:0,currency:"ZMW"}];
function load<T>(key:string,starter:T[]):T[]{if(typeof window==="undefined")return starter;const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(starter));return starter}try{return JSON.parse(raw)}catch{return starter}}
export const loadAccounts=()=>load<Account>(ACCOUNTS_KEY,starterAccounts).map(x=>({...x,currency:"ZMW" as Currency,openingBalance:Number(x.openingBalanceZmw??x.openingBalance??0)}));
export const saveAccounts=(x:Account[])=>localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(x.map(a=>({...a,currency:"ZMW",openingBalanceZmw:Number(a.openingBalance||0)}))));
export const loadFinanceEntries=()=>load<FinanceEntry>(ENTRIES_KEY,[]).map(x=>({...x,currency:"ZMW" as Currency,moneyIn:Number(x.moneyInZmw??x.moneyIn??0),moneyOut:Number(x.moneyOutZmw??x.moneyOut??0)}));
export const saveFinanceEntries=(x:FinanceEntry[])=>localStorage.setItem(ENTRIES_KEY,JSON.stringify(x.map(e=>({...e,currency:"ZMW",moneyInZmw:Number(e.moneyIn||0),moneyOutZmw:Number(e.moneyOut||0)}))));
export const accountBalance=(account:Account,entries:FinanceEntry[])=>Number(account.openingBalance||0)+entries.filter(e=>e.accountId===account.id).reduce((s,e)=>s+Number(e.moneyIn||0)-Number(e.moneyOut||0),0);
export function postAmount(type:FinanceEntry["type"],amount:number){const incoming=type==="Customer Payment"||type==="Capital"||type==="Other Income";return{moneyIn:incoming?amount:0,moneyOut:incoming?0:amount}}
