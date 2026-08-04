"use client";
import type {Currency} from "./currency";
export type Account={id:string;name:string;type:"Bank"|"Cash"|"Mobile Money";openingBalance:number;currency?:Currency;openingBalanceZmw?:number};
export type FinanceEntry={id:string;date:string;type:"Customer Payment"|"Supplier Payment"|"General Expense"|"Capital"|"Other Income";reference:string;description:string;accountId:string;moneyIn:number;moneyOut:number;currency?:Currency;exchangeRate?:number;moneyInZmw?:number;moneyOutZmw?:number;relatedId?:string;createdAt:string};
const ACCOUNTS_KEY="cm_finance_accounts_v1",ENTRIES_KEY="cm_finance_entries_v1";
const starterAccounts:Account[]=[{id:"acc1",name:"Zanaco Main Account",type:"Bank",openingBalance:0,currency:"ZMW",openingBalanceZmw:0},{id:"acc2",name:"Cash on Hand",type:"Cash",openingBalance:0,currency:"ZMW",openingBalanceZmw:0},{id:"acc3",name:"Mobile Money",type:"Mobile Money",openingBalance:0,currency:"ZMW",openingBalanceZmw:0}];
function load<T>(key:string,starter:T[]):T[]{if(typeof window==="undefined")return starter;const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(starter));return starter}try{return JSON.parse(raw)}catch{return starter}}
export const loadAccounts=()=>load<Account>(ACCOUNTS_KEY,starterAccounts).map(x=>({...x,currency:x.currency||"ZMW",openingBalanceZmw:x.openingBalanceZmw??x.openingBalance}));
export const saveAccounts=(x:Account[])=>localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(x));
export const loadFinanceEntries=()=>load<FinanceEntry>(ENTRIES_KEY,[]).map(x=>({...x,currency:x.currency||"ZMW",exchangeRate:x.exchangeRate||1,moneyInZmw:x.moneyInZmw??x.moneyIn,moneyOutZmw:x.moneyOutZmw??x.moneyOut}));
export const saveFinanceEntries=(x:FinanceEntry[])=>localStorage.setItem(ENTRIES_KEY,JSON.stringify(x));
export const accountBalance=(account:Account,entries:FinanceEntry[])=>(account.openingBalanceZmw??account.openingBalance)+entries.filter(e=>e.accountId===account.id).reduce((s,e)=>s+Number(e.moneyInZmw??e.moneyIn)-Number(e.moneyOutZmw??e.moneyOut),0);
