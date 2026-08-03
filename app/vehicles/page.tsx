"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { Plus } from "lucide-react";
import { loadVehicles } from "@/lib/vehicle-store";
import { Vehicle } from "@/lib/types";
const money=(n:number)=>new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:0}).format(n);
export default function VehiclesPage(){
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [query,setQuery]=useState("");const [status,setStatus]=useState("All");
 useEffect(()=>setVehicles(loadVehicles()),[]);
 const filtered=useMemo(()=>vehicles.filter(v=>{const text=`${v.stockId} ${v.vin} ${v.registrationNumber||""} ${v.make} ${v.model}`.toLowerCase();return text.includes(query.toLowerCase())&&(status==="All"||v.status===status)}),[vehicles,query,status]);
 return <><div className="topbar"><div className="title"><h1>Vehicle Stock</h1><p>Register, search and manage every Covenant Motors vehicle.</p></div><Link className="button" href="/vehicles/new"><Plus size={18}/><span>Add Vehicle</span></Link></div><div className="toolbar"><input className="input" placeholder="Search stock ID, VIN, registration, make or model" value={query} onChange={e=>setQuery(e.target.value)}/><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Awaiting Collection</option><option>In Transit</option><option>Available</option><option>Reserved</option><option>Under Repair</option><option>Sold</option></select></div><section className="panel"><div className="table-wrap"><table><thead><tr><th>Stock ID</th><th>Vehicle</th><th>VIN</th><th>Location</th><th>Status</th><th>Total Cost</th></tr></thead><tbody>{filtered.map(v=><tr key={v.id}><td><Link href={`/vehicles/${v.id}`}><b>{v.stockId}</b></Link></td><td>{v.make} {v.model} {v.year}</td><td>{v.vin}</td><td>{v.currentLocation}</td><td><span className={`badge ${v.status==="Available"?"available":v.status==="In Transit"?"transit":v.status==="Sold"?"sold":"awaiting"}`}>{v.status}</span></td><td>{money(v.totalCost)}</td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty">No vehicles match the selected search.</div>}</div></section></>;
}