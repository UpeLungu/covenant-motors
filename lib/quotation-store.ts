"use client";

export type QuotationStatus="Draft"|"Sent"|"Accepted"|"Expired"|"Converted";
export type Quotation={
 id:string;
 quotationId:string;
 vehicleId:string;
 stockId:string;
 vehicleName:string;
 customerId:string;
 customerName:string;
 quotationDate:string;
 validUntil:string;
 quotedPrice:number;
 status:QuotationStatus;
 paymentTerms:string;
 notes:string;
 convertedSaleId?:string;
 createdAt:string;
};

const KEY="covenant-motors-quotations";
export function loadQuotations():Quotation[]{if(typeof window==="undefined")return[];const raw=localStorage.getItem(KEY);if(!raw)return[];try{return JSON.parse(raw) as Quotation[]}catch{return[]}}
export function saveQuotations(items:Quotation[]){localStorage.setItem(KEY,JSON.stringify(items));}
export function nextQuotationId(items:Quotation[]){const year=new Date().getFullYear();const nums=items.filter(x=>x.quotationId.startsWith(`QUO-${year}-`)).map(x=>Number(x.quotationId.split("-")[2])).filter(Number.isFinite);return `QUO-${year}-${String(Math.max(0,...nums)+1).padStart(4,"0")}`;}
