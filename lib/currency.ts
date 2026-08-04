"use client";
export type Currency="ZMW"|"USD";
export type CurrencyTotals={ZMW:number;USD:number};
export const BASE_CURRENCY:Currency="ZMW";
export const SUPPORTED_CURRENCIES:Currency[]=["ZMW","USD"];
export const normalizeCurrency=(value?:string):Currency=>value==="USD"?"USD":"ZMW";
export const normalizeRate=(_currency:Currency,_rate?:number)=>1;
export const formatCurrency=(amount:number,currency:Currency="ZMW")=>new Intl.NumberFormat(currency==="USD"?"en-US":"en-ZM",{style:"currency",currency,maximumFractionDigits:2}).format(Number(amount||0));
export const currencyLabel=(currency:Currency)=>currency==="USD"?"US Dollar (USD)":"Zambian Kwacha (ZMW)";
export const emptyCurrencyTotals=():CurrencyTotals=>({ZMW:0,USD:0});
export const addCurrencyAmount=(totals:CurrencyTotals,amount:number,currency?:Currency):CurrencyTotals=>{const key=normalizeCurrency(currency);return {...totals,[key]:totals[key]+Number(amount||0)}};
export const groupCurrencyAmounts=<T>(items:T[],amount:(item:T)=>number,currency:(item:T)=>Currency|undefined)=>items.reduce((totals,item)=>addCurrencyAmount(totals,amount(item),currency(item)),emptyCurrencyTotals());
export const sameCurrency=(...currencies:(Currency|undefined)[])=>new Set(currencies.map(normalizeCurrency)).size<=1;
// Legacy signature retained only so older screens compile. No conversion occurs.
export const toZmw=(amount:number,_currency:Currency="ZMW",_rate?:number)=>Number(amount||0);
export const formatZmw=(amount:number)=>formatCurrency(amount,"ZMW");
