"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { Car,Truck,MapPin,Wallet,Plus } from "lucide-react";
import { loadVehicles } from "@/lib/vehicle-store";
import { Vehicle } from "@/lib/types";
const money=(n:number)=>new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:0}).format(n);
export default function Dashboard(){
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);
 useEffect(()=>setVehicles(loadVehicles()),[]);
 const available=vehicles.filter(v=>v.status==="Available").length;
 const transit=vehicles.filter(v=>v.status==="In Transit").length;
 const awaiting=vehicles.filter(v=>v.status==="Awaiting Collection").length;
 const value=vehicles.filter(v=>v.status!=="Sold").reduce((s,v)=>s+v.totalCost,0);
 const cards=[{label:"Vehicles in Stock",value:vehicles.length,Icon:Car},{label:"Available",value:available,Icon:MapPin},{label:"In Transit",value:transit,Icon:Truck},{label:"Stock Value",value:money(value),Icon:Wallet}];
 return <><div className="topbar"><div className="title"><h1>Covenant Motors Dashboard</h1><p>Vehicle stock, collection and cost overview.</p></div><Link className="button" href="/vehicles/new"><Plus size={18}/><span>Add Vehicle</span></Link></div><div className="cards">{cards.map(({label,value,Icon})=><div className="card" key={label}><div className="metric"><div><div className="metric-label">{label}</div><div className="metric-value">{value}</div></div><div className="metric-icon"><Icon size={21}/></div></div></div>)}</div><div className="grid-2"><section className="panel"><div className="panel-head"><h2>Recent Vehicles</h2><Link href="/vehicles">View all</Link></div><div className="table-wrap"><table><thead><tr><th>Stock ID</th><th>Vehicle</th><th>Status</th><th>Total Cost</th></tr></thead><tbody>{vehicles.slice(0,6).map(v=><tr key={v.id}><td><Link href={`/vehicles/${v.id}`}><b>{v.stockId}</b></Link></td><td>{v.make} {v.model} {v.year}</td><td><span className={`badge ${v.status==="Available"?"available":v.status==="In Transit"?"transit":"awaiting"}`}>{v.status}</span></td><td>{money(v.totalCost)}</td></tr>)}</tbody></table></div></section><section className="panel"><div className="panel-head"><h2>Collection Attention</h2></div><div className="panel-body"><div className="summary-grid" style={{gridTemplateColumns:"1fr"}}><div className="summary-item"><span>Awaiting collection</span><strong>{awaiting} vehicle(s)</strong></div><div className="summary-item"><span>In transit</span><strong>{transit} vehicle(s)</strong></div><div className="summary-item"><span>Next operational module</span><strong>Drivers and trip reconciliation</strong></div></div></div></section></div></>;
}