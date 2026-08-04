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
 return <>
  {open&&<button type="button" aria-label="Close quick actions" onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:998,border:0,background:"rgba(2,6,23,.28)",backdropFilter:"blur(2px)"}}/>}
  <div style={{position:"fixed",right:18,bottom:20,zIndex:999,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10,pointerEvents:"none"}}>
   {open&&<div style={{display:"flex",flexDirection:"column",alignItems:"stretch",gap:8,pointerEvents:"auto"}}>{actions.map(({href,label,icon:Icon})=><Link href={href} key={label} onClick={()=>setOpen(false)} style={{minWidth:190,height:48,display:"flex",alignItems:"center",gap:11,padding:"0 13px",border:"1px solid #e2e8f0",borderRadius:13,background:"#fff",color:"#1e293b",fontSize:14,fontWeight:750,textDecoration:"none",boxShadow:"0 14px 38px rgba(15,23,42,.18)"}}><span style={{width:32,height:32,borderRadius:9,background:"#f0fdfa",color:"#0f766e",display:"grid",placeItems:"center",flex:"0 0 auto"}}><Icon size={17}/></span><span>{label}</span></Link>)}</div>}
   <button type="button" onClick={()=>setOpen(v=>!v)} aria-label={open?"Close quick actions":"Open quick actions"} aria-expanded={open} style={{width:58,height:58,border:0,borderRadius:18,background:"linear-gradient(135deg,#0f766e,#0d9488)",color:"#fff",display:"grid",placeItems:"center",boxShadow:"0 18px 44px rgba(15,118,110,.38)",cursor:"pointer",pointerEvents:"auto"}}>{open?<X size={25}/>:<Plus size={27}/>}</button>
  </div>
 </>;
}
