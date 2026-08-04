"use client";
import Link from "next/link";
import {useState} from "react";
import {Car,ContactRound,Plus,Receipt,Route,ShoppingCart,X} from "lucide-react";
const actions=[
 {href:"/vehicles/new",label:"Add Vehicle",icon:Car},
 {href:"/sales",label:"Record Sale",icon:ShoppingCart},
 {href:"/expenses",label:"Add Expense",icon:Receipt},
 {href:"/customers",label:"Add Customer",icon:ContactRound},
 {href:"/trips",label:"Assign Trip",icon:Route}
];
export function QuickActions(){
 const [open,setOpen]=useState(false);
 return <div className={`quick-action-dock ${open?"open":""}`}>
  {open&&<button className="quick-action-backdrop" type="button" aria-label="Close quick actions" onClick={()=>setOpen(false)}/>} 
  <div className="quick-action-menu">{actions.map(({href,label,icon:Icon})=><Link href={href} key={label} onClick={()=>setOpen(false)}><span><Icon size={17}/></span>{label}</Link>)}</div>
  <button className="quick-action-toggle" type="button" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close quick actions":"Open quick actions"} aria-expanded={open}>{open?<X size={23}/>:<Plus size={25}/>}</button>
 </div>;
}
