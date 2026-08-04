"use client";
export type Currency="ZMW"|"USD";
export const BASE_CURRENCY:Currency="ZMW";
export const normalizeCurrency=(value?:string):Currency=>value==="USD"?"USD":"ZMW";
export const normalizeRate=(currency:Currency,rate?:number)=>currency==="USD"?Math.max(0,Number(rate||0)):1;
export const toZmw=(amount:number,currency:Currency="ZMW",rate?:number)=>Number(amount||0)*normalizeRate(currency,rate);
export const formatCurrency=(amount:number,currency:Currency="ZMW")=>new Intl.NumberFormat(currency==="USD"?"en-US":"en-ZM",{style:"currency",currency,maximumFractionDigits:2}).format(Number(amount||0));
export const formatZmw=(amount:number)=>new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:2}).format(Number(amount||0));
export const currencyLabel=(currency:Currency)=>currency==="USD"?"US Dollar (USD)":"Zambian Kwacha (ZMW)";
