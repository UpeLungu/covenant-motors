"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useMemo,useState} from "react";
import {ChevronRight,Search,X} from "lucide-react";

const pages=[
 ["/","Dashboard"],["/vehicles","Vehicle Stock"],["/vehicles/new","Add Vehicle"],["/sales","Sales"],["/customers","Customers"],["/trips","Collection Trips"],["/drivers","Drivers"],["/expenses","Expenses"],["/finance","Finance"],["/cost-analysis","Cost Analysis"],["/tax","Tax Centre"],["/reports","Reports"]
] as const;
const labelFor=(segment:string)=>segment.replaceAll("-"," ").replace(/\b\w/g,m=>m.toUpperCase());

export function WorkspaceHeader(){
 const pathname=usePathname();
 const [query,setQuery]=useState("");
 const [open,setOpen]=useState(false);
 const crumbs=pathname==="/"?[]:pathname.split("/").filter(Boolean).map((segment,index,array)=>({label:labelFor(segment),href:`/${array.slice(0,index+1).join("/")}`}));
 const results=useMemo(()=>query.trim()?pages.filter(([,label])=>label.toLowerCase().includes(query.toLowerCase())).slice(0,6):pages.slice(0,6),[query]);
 return <>
  <header className="workspace-header">
   <div className="breadcrumbs"><Link href="/">Dashboard</Link>{crumbs.map((crumb,index)=><span key={crumb.href}><ChevronRight size={13}/>{index===crumbs.length-1?<b>{crumb.label}</b>:<Link href={crumb.href}>{crumb.label}</Link>}</span>)}</div>
   <button className="global-search-trigger" type="button" onClick={()=>setOpen(true)}><Search size={17}/><span>Search modules</span><kbd>⌘ K</kbd></button>
  </header>
  {open&&<div className="command-overlay" role="dialog" aria-modal="true"><button className="command-backdrop" onClick={()=>setOpen(false)} aria-label="Close search"/><div className="command-palette"><div className="command-input"><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search vehicles, sales, finance, reports..."/><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="command-results">{results.map(([href,label])=><Link href={href} key={href} onClick={()=>{setOpen(false);setQuery("")}}><span>{label}</span><ChevronRight size={16}/></Link>)}{!results.length&&<div className="command-empty">No matching module.</div>}</div></div></div>}
 </>;
}
