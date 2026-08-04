"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {Car,ChevronRight,Filter,MapPin,Plus,Search,Wallet} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {Vehicle} from "@/lib/types";
import {formatCurrency,normalizeCurrency} from "@/lib/currency";
export default function VehiclesPage(){
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [query,setQuery]=useState("");const [status,setStatus]=useState("All");
 useEffect(()=>setVehicles(loadVehicles()),[]);
 const filtered=useMemo(()=>vehicles.filter(v=>{const text=`${v.stockId} ${v.vin} ${v.registrationNumber||""} ${v.make} ${v.model}`.toLowerCase();return text.includes(query.toLowerCase())&&(status==="All"||v.status===status)}),[vehicles,query,status]);
 const activeStock=vehicles.filter(v=>v.status!=="Sold"),available=vehicles.filter(v=>v.status==="Available").length,transit=vehicles.filter(v=>v.status==="In Transit").length;
 const zmwStock=activeStock.filter(v=>normalizeCurrency(v.purchaseCurrency)==="ZMW"),usdStock=activeStock.filter(v=>normalizeCurrency(v.purchaseCurrency)==="USD");
 const zmwValue=zmwStock.reduce((s,v)=>s+Number(v.totalCost||0),0),usdValue=usdStock.reduce((s,v)=>s+Number(v.totalCost||0),0);
 const badge=(s:string)=>s==="Available"?"available":s==="In Transit"?"transit":s==="Sold"?"sold":"awaiting";
 return <>
  <div className="page-heading"><div><span className="eyebrow dark">INVENTORY MANAGEMENT</span><h1>Vehicle Stock</h1><p>Manage every vehicle from acquisition and collection through sale and profitability.</p></div><Link className="button" href="/vehicles/new"><Plus size={18}/><span>Add Vehicle</span></Link></div>
  <div className="inventory-summary"><div className="mini-stat"><Car/><span><small>Total vehicles</small><b>{vehicles.length}</b></span></div><div className="mini-stat"><MapPin/><span><small>Available</small><b>{available}</b></span></div><div className="mini-stat"><Car/><span><small>In transit</small><b>{transit}</b></span></div><div className="mini-stat"><Wallet/><span><small>ZMW stock · {zmwStock.length} vehicle{zmwStock.length===1?"":"s"}</small><b>{formatCurrency(zmwValue,"ZMW")}</b><small>USD stock · {usdStock.length} vehicle{usdStock.length===1?"":"s"}: {formatCurrency(usdValue,"USD")}</small></span></div></div>
  <section className="panel inventory-panel"><div className="inventory-toolbar"><div className="search-control"><Search size={18}/><input placeholder="Search stock ID, VIN, registration, make or model" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-control"><Filter size={17}/><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Awaiting Collection</option><option>In Transit</option><option>Available</option><option>Reserved</option><option>Under Repair</option><option>Sold</option></select></div><span className="result-count">{filtered.length} result{filtered.length===1?"":"s"}</span></div>
   <div className="desktop-stock-table table-wrap"><table><thead><tr><th>Stock ID</th><th>Vehicle</th><th>Identification</th><th>Location</th><th>Status</th><th>Currency</th><th>Total Cost</th><th/></tr></thead><tbody>{filtered.map(v=>{const currency=normalizeCurrency(v.purchaseCurrency);return <tr key={v.id}><td><Link className="stock-link" href={`/vehicles/${v.id}`}>{v.stockId}</Link></td><td><div className="vehicle-cell"><div className="vehicle-thumb"><Car size={19}/></div><span><b>{v.make} {v.model}</b><small>{v.year}{v.colour?` · ${v.colour}`:""}</small></span></div></td><td><b className="mono-text">{v.vin}</b><small>{v.registrationNumber||"Not registered"}</small></td><td><span className="location-cell"><MapPin size={14}/>{v.currentLocation}</span></td><td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td><td><b>{currency}</b></td><td><b>{formatCurrency(v.totalCost,currency)}</b></td><td><Link className="row-action" href={`/vehicles/${v.id}`} aria-label={`Open ${v.stockId}`}><ChevronRight size={18}/></Link></td></tr>})}</tbody></table></div>
   <div className="mobile-stock-list">{filtered.map(v=>{const currency=normalizeCurrency(v.purchaseCurrency);return <Link href={`/vehicles/${v.id}`} className="mobile-stock-card" key={v.id}><div className="mobile-stock-top"><div className="vehicle-thumb"><Car size={19}/></div><div><b>{v.make} {v.model} {v.year}</b><small>{v.stockId} · {v.registrationNumber||"Not registered"}</small></div><ChevronRight size={18}/></div><div className="mobile-stock-meta"><span><small>Status</small><b className={`badge ${badge(v.status)}`}>{v.status}</b></span><span><small>Currency</small><b>{currency}</b></span><span><small>Total cost</small><b>{formatCurrency(v.totalCost,currency)}</b></span></div></Link>})}</div>
   {filtered.length===0&&<div className="empty"><Search size={32}/><h3>No matching vehicles</h3><p>Try changing the search term or status filter.</p></div>}
  </section>
 </>;
}
