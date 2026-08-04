"use client";
import {Vehicle} from "./types";
const KEY="covenant-motors-vehicles";
const demoVehicles:Vehicle[]=[{id:"1",stockId:"CM-2026-0001",vin:"JT123456789000001",engineNumber:"2GD-10001",registrationNumber:"BBA 1234",make:"Toyota",model:"Hilux",year:2021,colour:"White",purchasePrice:240000,purchaseCurrency:"ZMW",originalPurchasePrice:240000,totalCost:248500,currentLocation:"Lusaka Yard",status:"Available",supplier:"Mwamba Imports",purchaseDate:"2026-07-10",createdAt:"2026-07-10T09:00:00Z"},{id:"2",stockId:"CM-2026-0002",vin:"JM123456789000002",engineNumber:"PE-20002",make:"Mazda",model:"CX-5",year:2019,colour:"Red",purchasePrice:190000,purchaseCurrency:"ZMW",originalPurchasePrice:190000,totalCost:196800,currentLocation:"Nakonde",status:"Awaiting Collection",supplier:"North Auto Traders",purchaseDate:"2026-07-22",createdAt:"2026-07-22T10:00:00Z"},{id:"3",stockId:"CM-2026-0003",vin:"GP123456789000003",engineNumber:"LDA-30003",make:"Honda",model:"Fit Hybrid",year:2020,colour:"Silver",purchasePrice:128000,purchaseCurrency:"ZMW",originalPurchasePrice:128000,totalCost:134400,currentLocation:"In Transit",status:"In Transit",supplier:"Japan Direct",purchaseDate:"2026-07-27",createdAt:"2026-07-27T11:00:00Z"}];
const normalize=(v:Vehicle):Vehicle=>{
 const original=Number(v.originalPurchasePrice??v.purchasePrice??0);
 return {...v,purchaseCurrency:v.purchaseCurrency||"ZMW",originalPurchasePrice:original,purchasePrice:original,totalCost:Number(v.totalCost||original)};
};
export function loadVehicles():Vehicle[]{if(typeof window==="undefined")return demoVehicles;const raw=localStorage.getItem(KEY);if(!raw){localStorage.setItem(KEY,JSON.stringify(demoVehicles));return demoVehicles}try{return (JSON.parse(raw) as Vehicle[]).map(normalize)}catch{return demoVehicles}}
export function saveVehicles(items:Vehicle[]){localStorage.setItem(KEY,JSON.stringify(items));}
export function nextStockId(items:Vehicle[]){const year=new Date().getFullYear();const numbers=items.filter(v=>v.stockId.startsWith(`CM-${year}-`)).map(v=>Number(v.stockId.split("-")[2])).filter(Number.isFinite);return `CM-${year}-${String(Math.max(0,...numbers)+1).padStart(4,"0")}`;}
