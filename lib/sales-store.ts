"use client";
import type {Currency} from "./currency";
export type Sale={
  id:string;saleId:string;vehicleId:string;stockId:string;vehicleName:string;customerId:string;customerName:string;saleDate:string;
  sellingPrice:number;amountPaid:number;balance:number;vehicleCost:number;profit:number;
  currency?:Currency;exchangeRate?:number;sellingPriceZmw?:number;amountPaidZmw?:number;balanceZmw?:number;
  paymentMethod:string;status:"Partially Paid"|"Fully Paid";createdAt:string;
};
const KEY="covenant-motors-sales";
export function loadSales():Sale[]{if(typeof window==="undefined")return[];const raw=localStorage.getItem(KEY);if(!raw)return[];try{return (JSON.parse(raw) as Sale[]).map(x=>({...x,currency:x.currency||"ZMW",exchangeRate:x.exchangeRate||1,sellingPriceZmw:x.sellingPriceZmw??x.sellingPrice,amountPaidZmw:x.amountPaidZmw??x.amountPaid,balanceZmw:x.balanceZmw??x.balance}));}catch{return[];}}
export function saveSales(items:Sale[]){localStorage.setItem(KEY,JSON.stringify(items));}
export function nextSaleId(items:Sale[]){const year=new Date().getFullYear();const nums=items.filter(x=>x.saleId.startsWith(`SAL-${year}-`)).map(x=>Number(x.saleId.split("-")[2])).filter(Number.isFinite);return `SAL-${year}-${String(Math.max(0,...nums)+1).padStart(4,"0")}`;}