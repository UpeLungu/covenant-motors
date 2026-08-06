"use client";
import Link from "next/link";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {Car,Eye,Filter,MapPin,PenLine,Plus,Search,ShoppingCart,Wallet,X} from "lucide-react";
import {loadVehicles,saveVehicles} from "@/lib/vehicle-store";
import {Vehicle} from "@/lib/types";
import {formatCurrency} from "@/lib/currency";

type SortOption="newest"|"stock"|"vehicle"|"value-high"|"value-low";

export default function VehiclesPage(){
 const [vehicles,setVehicles]=useState<Vehicle[]>([]),[query,setQuery]=useState(""),[status,setStatus]=useState("All"),[sort,setSort]=useState<SortOption>("newest"),[editing,setEditing]=useState<Vehicle|null>(null),[notice,setNotice]=useState("");
 useEffect(()=>setVehicles(loadVehicles()),[]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),2800);return()=>clearTimeout(timer)},[notice]);
 const value=(v:Vehicle)=>Number(v.estimatedSellingPriceZmw??v.estimatedSellingPrice??0);
 const cost=(v:Vehicle)=>Number(v.purchasePriceZmw??v.purchasePrice??0);
 const filtered=useMemo(()=>vehicles.filter(v=>`${v.stockId} ${v.vin} ${v.registrationNumber||""} ${v.make} ${v.model} ${v.supplier} ${v.currentLocation}`.toLowerCase().includes(query.toLowerCase())&&(status==="All"||v.status===status)).sort((a,b)=>sort==="stock"?a.stockId.localeCompare(b.stockId):sort==="vehicle"?`${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`):sort==="value-high"?value(b)-value(a):sort==="value-low"?value(a)-value(b):new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),[vehicles,query,status,sort]);
 const active=vehicles.filter(v=>v.status!=="Sold"),available=vehicles.filter(v=>v.status==="Available").length,transit=vehicles.filter(v=>v.status==="In Transit").length,stockValue=active.reduce((s,v)=>s+value(v),0);
 const badge=(s:string)=>s==="Available"?"available":s==="In Transit"?"transit":s==="Sold"?"sold":"awaiting";
 function saveValuation(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!editing)return;const f=new FormData(e.currentTarget),estimatedSellingPrice=Number(f.get("estimatedSellingPrice")||0);const next=vehicles.map(v=>v.id===editing.id?{...v,estimatedSellingPrice,estimatedSellingCurrency:"ZMW" as const,estimatedSellingExchangeRate:1,estimatedSellingPriceZmw:estimatedSellingPrice}:v);saveVehicles(next);setVehicles(next);setNotice(`${editing.stockId} selling value updated`);setEditing(null)}
 const clearFilters=()=>{setQuery("");setStatus("All");setSort("newest")};
 return <>
 {notice&&<div className="app-toast"><span>✓</span>{notice}</div>}
 <div className="page-heading"><div><span className="eyebrow dark">INVENTORY MANAGEMENT</span><h1>Vehicle Stock</h1><p>View and manage every vehicle from registration through sale.</p></div><Link className="button" href="/vehicles/new"><Plus size={18}/>Add Vehicle</Link></div>
 <div className="inventory-summary">
  <div className="mini-stat"><Car/><span><small>Total Vehicles</small><b>{vehicles.length}</b></span></div>
  <div className="mini-stat"><MapPin/><span><small>Available</small><b>{available}</b></span></div>
  <div className="mini-stat"><Car/><span><small>In Transit</small><b>{transit}</b></span></div>
  <div className="mini-stat dual-value-stat"><Wallet/><span><small>Expected Selling Value</small><b>{formatCurrency(stockValue,"ZMW")}</b></span></div>
 </div>
 {editing&&<form className="form-card section-gap professional-form valuation-editor" onSubmit={saveValuation}><div className="form-heading"><div><span className="eyebrow dark">UPDATE SELLING VALUE</span><h2>{editing.stockId} · {editing.make} {editing.model}</h2><p>Update the estimated selling price in Zambian Kwacha.</p></div><button type="button" className="icon-button" onClick={()=>setEditing(null)} aria-label="Close"><X size={18}/></button></div><div className="form-grid"><div className="field"><label>Estimated Selling Price (ZMW)</label><input className="input" name="estimatedSellingPrice" type="number" min="0" step="0.01" defaultValue={value(editing)} required/></div></div><div className="actions"><button type="button" className="button secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="button">Save Value</button></div></form>}
 <section className="panel inventory-panel">
  <div className="panel-head"><div><h2>Stock Register</h2><small className="muted">{filtered.length} of {vehicles.length} vehicle{vehicles.length===1?"":"s"}</small></div></div>
  <div className="inventory-toolbar advanced-toolbar">
   <div className="search-control"><Search size={18}/><input placeholder="Search stock ID, VIN, vehicle, supplier or location" value={query} onChange={e=>setQuery(e.target.value)}/></div>
   <div className="filter-control"><Filter size={17}/><select value={status} onChange={e=>setStatus(e.target.value)} aria-label="Filter by status"><option>All</option><option>Awaiting Collection</option><option>In Transit</option><option>Available</option><option>Reserved</option><option>Under Repair</option><option>Sold</option></select></div>
   <div className="filter-control"><select value={sort} onChange={e=>setSort(e.target.value as SortOption)} aria-label="Sort vehicles"><option value="newest">Newest first</option><option value="stock">Stock ID</option><option value="vehicle">Vehicle name</option><option value="value-high">Highest value</option><option value="value-low">Lowest value</option></select></div>
   {(query||status!=="All"||sort!=="newest")&&<button className="clear-filter" type="button" onClick={clearFilters}>Reset</button>}
  </div>
  <div className="desktop-stock-table table-wrap"><table><thead><tr><th>Vehicle</th><th>Stock Details</th><th>Status</th><th>Cost Price</th><th>Estimated Selling Price</th><th>Actions</th></tr></thead><tbody>{filtered.map(v=><tr key={v.id}><td><div className="vehicle-cell"><div className="vehicle-thumb"><Car size={19}/></div><span><b>{v.make} {v.model}</b><small>{v.year} · {v.currentLocation}</small></span></div></td><td><b>{v.stockId}</b><small>{v.registrationNumber||"Not registered"}</small></td><td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td><td><b>{formatCurrency(cost(v),"ZMW")}</b></td><td><b>{value(v)?formatCurrency(value(v),"ZMW"):"Not valued"}</b></td><td><div className="row-actions"><Link className="button secondary compact-button" href={`/vehicles/${v.id}`}><Eye size={14}/>View</Link><Link className="button secondary compact-button" href={`/vehicles/${v.id}/edit`}><PenLine size={14}/>Edit</Link><button className="button secondary compact-button" type="button" onClick={()=>setEditing(v)}><Wallet size={14}/>Value</button>{v.status!=="Sold"&&<Link className="button compact-button" href={`/sales?vehicle=${v.id}`}><ShoppingCart size={14}/>Sell</Link>}</div></td></tr>)}</tbody></table></div>
  <div className="mobile-stock-list">{filtered.map(v=><article className="mobile-stock-card" key={v.id}><div className="mobile-stock-top"><div className="vehicle-thumb"><Car size={19}/></div><div><b>{v.make} {v.model} {v.year}</b><small>{v.stockId} · {v.registrationNumber||"Not registered"}</small></div><span className={`badge ${badge(v.status)}`}>{v.status}</span></div><div className="mobile-stock-meta"><span><small>Location</small><b>{v.currentLocation}</b></span><span><small>Cost Price</small><b>{formatCurrency(cost(v),"ZMW")}</b></span><span><small>Estimated Selling Price</small><b>{value(v)?formatCurrency(value(v),"ZMW"):"Not valued"}</b></span></div><div className="mobile-card-actions"><Link className="button secondary compact-button" href={`/vehicles/${v.id}`}><Eye size={15}/>View</Link><Link className="button secondary compact-button" href={`/vehicles/${v.id}/edit`}><PenLine size={15}/>Edit</Link><button className="button secondary compact-button" type="button" onClick={()=>setEditing(v)}><Wallet size={15}/>Value</button>{v.status!=="Sold"&&<Link className="button compact-button" href={`/sales?vehicle=${v.id}`}><ShoppingCart size={15}/>Sell</Link>}</div></article>)}</div>
  {!filtered.length&&<div className="empty"><Search size={32}/><h3>{vehicles.length?"No matching vehicles":"No vehicles recorded"}</h3><p>{vehicles.length?"Change the search or filters to view other stock.":"Add the first vehicle to begin tracking stock, expenses and sales."}</p>{vehicles.length?<button className="button secondary" type="button" onClick={clearFilters}>Reset Filters</button>:<Link className="button" href="/vehicles/new"><Plus size={16}/>Add First Vehicle</Link>}</div>}
 </section>
 </>;
}
