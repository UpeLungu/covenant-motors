"use client";

export type Customer = {
  id:string;
  customerId:string;
  name:string;
  phone:string;
  nrcOrTpin:string;
  address:string;
  createdAt:string;
};

const KEY="covenant-motors-customers";
const demoCustomers:Customer[]=[
  {id:"c1",customerId:"CUS-0001",name:"Moses Phiri",phone:"0977000001",nrcOrTpin:"123456/78/1",address:"Lusaka",createdAt:"2026-07-28T10:00:00Z"}
];
export function loadCustomers():Customer[]{
  if(typeof window==="undefined") return demoCustomers;
  const raw=localStorage.getItem(KEY);
  if(!raw){localStorage.setItem(KEY,JSON.stringify(demoCustomers));return demoCustomers;}
  try{return JSON.parse(raw);}catch{return demoCustomers;}
}
export function saveCustomers(items:Customer[]){localStorage.setItem(KEY,JSON.stringify(items));}
export function nextCustomerId(items:Customer[]){
  const nums=items.map(x=>Number(x.customerId.replace("CUS-",""))).filter(Number.isFinite);
  return `CUS-${String(Math.max(0,...nums)+1).padStart(4,"0")}`;
}