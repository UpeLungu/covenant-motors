"use client";
export type TaxType="VAT"|"TOT"|"Income Tax"|"PAYE"|"NAPSA"|"NHIMA"|"Withholding Tax"|"Customs & Import Duty";
export type TaxSetting={type:TaxType;rate:number;enabled:boolean;notes:string};
export type TaxReturn={id:string;type:TaxType;period:string;taxableAmount:number;taxDue:number;status:"Draft"|"Ready"|"Submitted"|"Paid";dueDate:string;reference?:string;createdAt:string};
const SETTINGS="cm_tax_settings_v1",RETURNS="cm_tax_returns_v1";
const defaults:TaxSetting[]=[
 {type:"VAT",rate:0,enabled:true,notes:"Set the current approved VAT rate in Tax Settings."},
 {type:"TOT",rate:0,enabled:true,notes:"Set the applicable turnover tax rate."},
 {type:"Income Tax",rate:0,enabled:true,notes:"Use the rate applicable to the taxpayer."},
 {type:"PAYE",rate:0,enabled:false,notes:"Calculated from payroll bands when payroll is added."},
 {type:"NAPSA",rate:0,enabled:false,notes:"Configure contribution rate and ceiling."},
 {type:"NHIMA",rate:0,enabled:false,notes:"Configure employee and employer contribution rules."},
 {type:"Withholding Tax",rate:0,enabled:false,notes:"Configure by payment category."},
 {type:"Customs & Import Duty",rate:0,enabled:true,notes:"Vehicle-specific customs values should be captured per import."}
];
function load<T>(key:string,fallback:T[]):T[]{if(typeof window==="undefined")return fallback;const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(fallback));return fallback}try{return JSON.parse(raw)}catch{return fallback}}
export const loadTaxSettings=()=>load<TaxSetting>(SETTINGS,defaults);
export const saveTaxSettings=(x:TaxSetting[])=>localStorage.setItem(SETTINGS,JSON.stringify(x));
export const loadTaxReturns=()=>load<TaxReturn>(RETURNS,[]);
export const saveTaxReturns=(x:TaxReturn[])=>localStorage.setItem(RETURNS,JSON.stringify(x));