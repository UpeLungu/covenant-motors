"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,ArrowRight,Car,Clock3,FileWarning,MapPin,Plus,Receipt,Route,ShoppingCart,TrendingUp,Truck,Users,Wallet} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {Vehicle} from "@/lib/types";
import {loadTrips,tripSpent,CollectionTrip} from "@/lib/operations-store";
import {loadSales,Sale} from "@/lib/sales-store";
import {loadVehicleDocuments,loadVehicleExpenses,VehicleDocument,VehicleExpense} from "@/lib/ledger-store";

const money=(n:number)=>new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:0}).format(n);
const badge=(status:string)=>status==="Available"?"available":status==="In Transit"?"transit":status==="Sold"?"sold":"awaiting";

export default function Dashboard(){
 const [vehicles,setVehicles]=useState<Vehicle[]>([]),[trips,setTrips]=useState<CollectionTrip[]>([]),[sales,setSales]=useState<Sale[]>([]),[expenses,setExpenses]=useState<VehicleExpense[]>([]),[documents,setDocuments]=useState<VehicleDocument[]>([]);
 useEffect(()=>{setVehicles(loadVehicles());setTrips(loadTrips());setSales(loadSales());setExpenses(loadVehicleExpenses());setDocuments(loadVehicleDocuments())},[]);
 const stats=useMemo(()=>{
  const unsold=vehicles.filter(v=>v.status!=="Sold");
  const available=vehicles.filter(v=>v.status==="Available").length;
  const transit=vehicles.filter(v=>v.status==="In Transit").length;
  const awaiting=vehicles.filter(v=>v.status==="Awaiting Collection").length;
  const repair=vehicles.filter(v=>v.status==="Under Repair").length;
  const sold=vehicles.filter(v=>v.status==="Sold").length;
  const stockValue=unsold.reduce((s,v)=>s+v.totalCost,0);
  const revenue=sales.reduce((s,x)=>s+x.sellingPrice,0);
  const received=sales.reduce((s,x)=>s+x.amountPaid,0);
  const outstanding=sales.reduce((s,x)=>s+x.balance,0);
  const profit=sales.reduce((s,x)=>s+x.profit,0);
  const activeTrips=trips.filter(t=>t.status!=="Reconciled").length;
  const unreconciled=trips.filter(t=>t.status!=="Reconciled").reduce((s,t)=>s+Math.abs(t.advance-tripSpent(t)),0);
  const missingDocs=vehicles.filter(v=>!documents.some(d=>d.vehicleId===v.id&&d.type==="Purchase Invoice")).length;
  return {available,transit,awaiting,repair,sold,stockValue,revenue,received,outstanding,profit,activeTrips,unreconciled,missingDocs,total:vehicles.length};
 },[vehicles,trips,sales,documents]);
 const activity=useMemo(()=>{
  const rows=[
   ...vehicles.map(v=>({date:v.createdAt,title:`${v.stockId} registered`,detail:`${v.make} ${v.model} ${v.year}`,kind:"vehicle"})),
   ...expenses.map(x=>{const v=vehicles.find(v=>v.id===x.vehicleId);return {date:x.createdAt,title:`${x.category} expense added`,detail:`${v?.stockId||"Vehicle"} · ${money(x.amount)}`,kind:"expense"}}),
   ...trips.map(t=>({date:t.departureDate,title:`${t.tripId} ${t.status}`,detail:`${t.vehicleStockId} · ${t.driverName}`,kind:"trip"})),
   ...sales.map(s=>({date:s.createdAt,title:`${s.saleId} completed`,detail:`${s.stockId} · ${s.customerName}`,kind:"sale"}))
  ];
  return rows.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,7);
 },[vehicles,expenses,trips,sales]);
 const maxStatus=Math.max(1,stats.total);
 return <>
  <div className="dashboard-hero"><div><span className="eyebrow">DEALERSHIP CONTROL CENTRE</span><h1>Covenant Motors Dashboard</h1><p>Live visibility across inventory, collection trips, sales, costs and outstanding actions.</p></div><div className="quick-actions"><Link className="button" href="/vehicles/new"><Plus size={17}/>Add Vehicle</Link><Link className="button secondary" href="/trips"><Route size={17}/>Assign Trip</Link><Link className="button secondary" href="/sales"><ShoppingCart size={17}/>Record Sale</Link></div></div>
  <div className="dashboard-kpis">
   <div className="kpi-card"><div><span>Total Stock Value</span><strong>{money(stats.stockValue)}</strong><small>{stats.total-stats.sold} unsold vehicles</small></div><Wallet/></div>
   <div className="kpi-card"><div><span>Gross Profit</span><strong>{money(stats.profit)}</strong><small>{stats.sold} completed sale(s)</small></div><TrendingUp/></div>
   <div className="kpi-card"><div><span>Outstanding Customer Balances</span><strong>{money(stats.outstanding)}</strong><small>{money(stats.received)} received</small></div><Receipt/></div>
   <div className="kpi-card alert-card"><div><span>Operational Attention</span><strong>{stats.activeTrips+stats.missingDocs}</strong><small>Trips and missing documents</small></div><AlertTriangle/></div>
  </div>
  <div className="status-strip">
   <Link href="/vehicles"><Car/><span><b>{stats.total}</b>Total Vehicles</span></Link>
   <Link href="/vehicles"><MapPin/><span><b>{stats.available}</b>Available</span></Link>
   <Link href="/vehicles"><Truck/><span><b>{stats.transit}</b>In Transit</span></Link>
   <Link href="/vehicles"><Clock3/><span><b>{stats.awaiting}</b>Awaiting Collection</span></Link>
   <Link href="/vehicles"><AlertTriangle/><span><b>{stats.repair}</b>Under Repair</span></Link>
   <Link href="/sales"><ShoppingCart/><span><b>{stats.sold}</b>Sold</span></Link>
  </div>
  <div className="dashboard-grid">
   <section className="panel"><div className="panel-head"><div><h2>Vehicle Status Overview</h2><p className="muted tiny">Current distribution across the dealership pipeline.</p></div><Link href="/vehicles">View stock <ArrowRight size={15}/></Link></div><div className="panel-body status-bars">
    {[['Available',stats.available],['In Transit',stats.transit],['Awaiting Collection',stats.awaiting],['Under Repair',stats.repair],['Sold',stats.sold]].map(([label,value])=><div key={String(label)}><div className="bar-label"><span>{label}</span><b>{value}</b></div><div className="bar-track"><span style={{width:`${Number(value)/maxStatus*100}%`}}/></div></div>)}
   </div></section>
   <section className="panel"><div className="panel-head"><div><h2>Action Centre</h2><p className="muted tiny">Items requiring management attention.</p></div></div><div className="attention-list">
    <Link href="/trips"><div className="attention-icon"><Route/></div><span><b>{stats.activeTrips} active collection trip(s)</b><small>{money(stats.unreconciled)} pending reconciliation</small></span><ArrowRight/></Link>
    <Link href="/vehicles"><div className="attention-icon"><FileWarning/></div><span><b>{stats.missingDocs} vehicle(s) missing purchase invoices</b><small>Complete the digital deal jacket</small></span><ArrowRight/></Link>
    <Link href="/sales"><div className="attention-icon"><Wallet/></div><span><b>{money(stats.outstanding)} customer balance</b><small>Follow up on unpaid vehicle sales</small></span><ArrowRight/></Link>
    <Link href="/drivers"><div className="attention-icon"><Users/></div><span><b>Driver register</b><small>Review assignments and licence records</small></span><ArrowRight/></Link>
   </div></section>
  </div>
  <div className="dashboard-grid lower-grid">
   <section className="panel"><div className="panel-head"><h2>Recent Vehicles</h2><Link href="/vehicles">View all <ArrowRight size={15}/></Link></div><div className="table-wrap"><table><thead><tr><th>Stock ID</th><th>Vehicle</th><th>Status</th><th>Landed Cost</th></tr></thead><tbody>{vehicles.slice().sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,6).map(v=><tr key={v.id}><td><Link href={`/vehicles/${v.id}`}><b>{v.stockId}</b></Link></td><td>{v.make} {v.model} {v.year}</td><td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td><td><b>{money(v.totalCost)}</b></td></tr>)}</tbody></table>{!vehicles.length&&<div className="empty">No vehicles registered.</div>}</div></section>
   <section className="panel"><div className="panel-head"><h2>Recent Activity</h2></div><div className="activity-list">{activity.map((x,i)=><div key={`${x.date}-${i}`}><div className={`activity-dot ${x.kind}`}/><span><b>{x.title}</b><small>{x.detail}</small></span><time>{new Date(x.date).toLocaleDateString("en-ZM",{day:"2-digit",month:"short"})}</time></div>)}{!activity.length&&<div className="empty">No recent activity.</div>}</div></section>
  </div>
 </>;
}
