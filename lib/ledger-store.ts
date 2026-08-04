"use client";
export type VehicleExpense={id:string;vehicleId:string;category:string;description:string;amount:number;date:string;reference?:string;createdAt:string};
export type VehicleDocument={id:string;vehicleId:string;type:string;name:string;reference?:string;date:string;createdAt:string;fileName?:string;fileType?:string;fileSize?:number;fileData?:string};
const EXPENSE_KEY="covenant-motors-vehicle-expenses";
const DOCUMENT_KEY="covenant-motors-vehicle-documents";
const demoExpenses:VehicleExpense[]=[
{id:"ve1",vehicleId:"1",category:"Clearing",description:"Clearing and handling charges",amount:4200,date:"2026-07-11",reference:"CLR-001",createdAt:"2026-07-11T10:00:00Z"},
{id:"ve2",vehicleId:"1",category:"Registration",description:"Registration and road tax",amount:1800,date:"2026-07-13",reference:"REG-001",createdAt:"2026-07-13T09:00:00Z"},
{id:"ve3",vehicleId:"1",category:"Repairs",description:"Initial service and minor repairs",amount:2500,date:"2026-07-14",reference:"REP-001",createdAt:"2026-07-14T14:00:00Z"}
];
const demoDocuments:VehicleDocument[]=[
{id:"vd1",vehicleId:"1",type:"Purchase Invoice",name:"Purchase invoice",reference:"INV-001",date:"2026-07-10",createdAt:"2026-07-10T09:00:00Z"},
{id:"vd2",vehicleId:"1",type:"Registration",name:"Registration record",reference:"BBA 1234",date:"2026-07-13",createdAt:"2026-07-13T09:00:00Z"}
];
function load<T>(key:string,demo:T[]):T[]{if(typeof window==="undefined")return demo;const raw=localStorage.getItem(key);if(!raw){localStorage.setItem(key,JSON.stringify(demo));return demo}try{return JSON.parse(raw)}catch{return demo}}
export const loadVehicleExpenses=()=>load<VehicleExpense>(EXPENSE_KEY,demoExpenses);
export const saveVehicleExpenses=(x:VehicleExpense[])=>localStorage.setItem(EXPENSE_KEY,JSON.stringify(x));
export const loadVehicleDocuments=()=>load<VehicleDocument>(DOCUMENT_KEY,demoDocuments);
export const saveVehicleDocuments=(x:VehicleDocument[])=>localStorage.setItem(DOCUMENT_KEY,JSON.stringify(x));