"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useMemo,useState} from "react";
import {Car,ChevronRight,ContactRound,LayoutGrid,Search,ShoppingCart,UserRound,X} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {loadCustomers} from "@/lib/customer-store";
import {loadDrivers} from "@/lib/operations-store";
import {loadSales} from "@/lib/sales-store";

const pages=[
 ["/","Dashboard"],["/vehicles","Vehicle Stock"],["/vehicles/new","Add Vehicle"],["/sales","Sales"],["/customers","Customers"],["/trips","Collection Trips"],["/drivers","Drivers"],["/expenses","Expenses"],["/finance","Finance"],["/cost-analysis","Cost Analysis"],["/tax","Tax Centre"],["/reports","Reports"],["/settings","Settings"]
] as const;
const labelFor=(segment:string)=>segment.replaceAll("-"," ").replace(/\b\w/g,m=>m.toUpperCase());
type SearchItem={href:string;title:string;subtitle:string;kind:"Module"|"Vehicle"|"Customer"|"Driver"|"Sale"};

export function WorkspaceHeader(){
 const pathname=usePathname();
 const [query,setQuery]=useState("");
 const [open,setOpen]=useState(false);
 const [records,setRecords]=useState<SearchItem[]>([]);
 useEffect(()=>{
  const vehicles=loadVehicles().map(v=>({href:`/vehicles/${v.id}`,title:`${v.stockId} · ${v.make} ${v.model}`,subtitle:`${v.vin} · ${v.supplier} · ${v.currentLocation}`,kind:"Vehicle" as const}));
  const customers=loadCustomers().map(c=>({href:"/customers",title:`${c.customerId} · ${c.name}`,subtitle:`${c.phone} · ${c.nrcOrTpin}`,kind:"Customer" as const}));
  const drivers=loadDrivers().map(d=>({href:"/drivers",title:`${d.driverId} · ${d.name}`,subtitle:`${d.phone||""} · ${d.licence||""}`,kind:"Driver" as const}));
  const sales=loadSales().map(s=>({href:"/sales",title:`${s.saleId} · ${s.stockId}`,subtitle:`${s.vehicleName} · ${s.customerName}`,kind:"Sale" as const}));
  setRecords([...vehicles,...customers,...drivers,...sales]);
 },[open]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(true)}if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[]);
 const crumbs=pathname==="/"?[]:pathname.split("/").filter(Boolean).map((segment,index,array)=>({label:labelFor(segment),href:`/${array.slice(0,index+1).join("/")}`}));
 const results=useMemo(()=>{const modules:SearchItem[]=pages.map(([href,title])=>({href,title,subtitle:"Open module",kind:"Module"}));const all=[...records,...modules];if(!query.trim())return all.slice(0,8);const q=query.toLowerCase();return all.filter(x=>`${x.title} ${x.subtitle} ${x.kind}`.toLowerCase().includes(q)).slice(0,12)},[query,records]);
 const icon=(kind:SearchItem["kind"])=>kind==="Vehicle"?<Car size={17}/>:kind==="Customer"?<ContactRound size={17}/>:kind==="Driver"?<UserRound size={17}/>:kind==="Sale"?<ShoppingCart size={17}/>:<LayoutGrid size={17}/>;
 return <>
  <header className="workspace-header">
   <div className="breadcrumbs"><Link href="/">Dashboard</Link>{crumbs.map((crumb,index)=><span key={crumb.href}><ChevronRight size={13}/>{index===crumbs.length-1?<b>{crumb.label}</b>:<Link href={crumb.href}>{crumb.label}</Link>}</span>)}</div>
   <button className="global-search-trigger" type="button" onClick={()=>setOpen(true)}><Search size={17}/><span>Search anything</span><kbd>Ctrl K</kbd></button>
  </header>
  {open&&<div className="command-overlay" role="dialog" aria-modal="true"><button className="command-backdrop" onClick={()=>setOpen(false)} aria-label="Close search"/><div className="command-palette"><div className="command-input"><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Stock ID, VIN, customer, driver, sale or module..."/><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="command-results record-search-results">{results.map((item,index)=><Link href={item.href} key={`${item.kind}-${item.href}-${index}`} onClick={()=>{setOpen(false);setQuery("")}}><span className="search-result-icon">{icon(item.kind)}</span><span className="search-result-copy"><b>{item.title}</b><small>{item.kind} · {item.subtitle}</small></span><ChevronRight size={16}/></Link>)}{!results.length&&<div className="command-empty">No matching record or module.</div>}</div></div></div>}
 </>;
}
