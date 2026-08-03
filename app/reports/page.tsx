"use client";
import {useEffect,useMemo,useState} from "react";
import {Download,FileBarChart2,Printer} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {loadSales} from "@/lib/sales-store";
import {loadTrips,tripSpent} from "@/lib/operations-store";
import {loadVehicleExpenses} from "@/lib/ledger-store";
import {loadFinanceEntries} from "@/lib/finance-store";
import {loadTaxReturns} from "@/lib/tax-store";

type Report="vehicle-profit"|"sales"|"stock"|"cashbook"|"customers"|"suppliers"|"drivers"|"tax";
type Row=Record<string,string|number>;
const money=(n:number)=>new Intl.NumberFormat("en-ZM",{style:"currency",currency:"ZMW",maximumFractionDigits:0}).format(n);
const titles:Record<Report,string>={"vehicle-profit":"Vehicle Profit","sales":"Sales Register","stock":"Vehicle Stock","cashbook":"Cash Book","customers":"Customer Balances","suppliers":"Supplier Balances","drivers":"Driver Performance","tax":"Tax Returns"};

export default function ReportsPage(){
 const [report,setReport]=useState<Report>("vehicle-profit"),[vehicles,setVehicles]=useState<any[]>([]),[sales,setSales]=useState<any[]>([]),[trips,setTrips]=useState<any[]>([]),[expenses,setExpenses]=useState<any[]>([]),[finance,setFinance]=useState<any[]>([]),[tax,setTax]=useState<any[]>([]);
 useEffect(()=>{setVehicles(loadVehicles());setSales(loadSales());setTrips(loadTrips());setExpenses(loadVehicleExpenses());setFinance(loadFinanceEntries());setTax(loadTaxReturns())},[]);
 const rows=useMemo<Row[]>(()=>{
  if(report==="vehicle-profit")return sales.map(s=>({"Stock ID":s.stockId,Vehicle:s.vehicleName,Customer:s.customerName,"Landed Cost":s.vehicleCost,"Selling Price":s.sellingPrice,Profit:s.sellingPrice-s.vehicleCost,Status:s.status}));
  if(report==="sales")return sales.map(s=>({"Sale ID":s.saleId,Date:s.saleDate,"Stock ID":s.stockId,Customer:s.customerName,"Selling Price":s.sellingPrice,Paid:s.amountPaid,Balance:s.balance,Profit:s.profit,Status:s.status}));
  if(report==="stock")return vehicles.map(v=>({"Stock ID":v.stockId,Vehicle:`${v.make} ${v.model} ${v.year}`,VIN:v.vin,Supplier:v.supplier,Location:v.currentLocation,"Purchase Price":v.purchasePrice,"Total Cost":v.totalCost,Status:v.status}));
  if(report==="cashbook")return finance.map(x=>({Date:x.date,Reference:x.reference||"",Type:x.type,Description:x.description,"Money In":x.moneyIn,"Money Out":x.moneyOut}));
  if(report==="customers")return sales.map(s=>({Customer:s.customerName,"Sale ID":s.saleId,Vehicle:s.stockId,"Selling Price":s.sellingPrice,Paid:s.amountPaid,Balance:s.balance,Status:s.status}));
  if(report==="suppliers")return vehicles.map(v=>{const paid=finance.filter(x=>x.type==="Supplier Payment"&&x.relatedId===v.id).reduce((a:number,b:any)=>a+Number(b.moneyOut||0),0);return {Supplier:v.supplier,"Stock ID":v.stockId,Vehicle:`${v.make} ${v.model}`,"Purchase Price":v.purchasePrice,Paid:paid,Balance:Math.max(0,v.purchasePrice-paid)}});
  if(report==="drivers")return trips.map(t=>({Driver:t.driverName,"Trip ID":t.tripId,Vehicle:t.vehicleStockId,Route:`${t.collectionPoint} to ${t.destination}`,Advance:t.advance,Expenses:tripSpent(t),Balance:t.advance-tripSpent(t),Status:t.status}));
  return tax.map(t=>({Type:t.type,Period:t.period,"Taxable Amount":t.taxableAmount,"Tax Due":t.taxDue,"Due Date":t.dueDate,Status:t.status,Reference:t.reference||""}));
 },[report,vehicles,sales,trips,expenses,finance,tax]);
 const totals=useMemo(()=>({records:rows.length,sales:sales.reduce((a,b)=>a+Number(b.sellingPrice||0),0),profit:sales.reduce((a,b)=>a+Number(b.profit||0),0),outstanding:sales.reduce((a,b)=>a+Number(b.balance||0),0)}),[rows,sales]);
 function exportCsv(){if(!rows.length)return alert("There is no data to export.");const headers=Object.keys(rows[0]);const csv=[headers.join(","),...rows.map(r=>headers.map(h=>`"${String(r[h]??"").replaceAll('"','""')}"`).join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`covenant-motors-${report}.csv`;a.click();URL.revokeObjectURL(url)}
 const headers=rows.length?Object.keys(rows[0]):[];
 const isMoney=(h:string)=>["Landed Cost","Selling Price","Profit","Paid","Balance","Purchase Price","Total Cost","Money In","Money Out","Advance","Expenses","Taxable Amount","Tax Due"].includes(h);
 return <><div className="topbar"><div className="title"><h1>Reports & Analytics</h1><p>Management, finance, operations and tax reports in one centre.</p></div><div className="quick-actions"><button className="button secondary" onClick={()=>window.print()}><Printer size={17}/>Print</button><button className="button" onClick={exportCsv}><Download size={17}/>Export CSV</button></div></div>
 <div className="cards"><div className="card metric"><div><div className="metric-label">Report Records</div><div className="metric-value">{totals.records}</div></div><div className="metric-icon"><FileBarChart2/></div></div><div className="card"><div className="metric-label">Sales Revenue</div><div className="metric-value small-money">{money(totals.sales)}</div></div><div className="card"><div className="metric-label">Gross Profit</div><div className="metric-value small-money">{money(totals.profit)}</div></div><div className="card"><div className="metric-label">Outstanding</div><div className="metric-value small-money">{money(totals.outstanding)}</div></div></div>
 <div className="deal-tabs">{(Object.keys(titles) as Report[]).map(key=><button key={key} className={report===key?"active":""} onClick={()=>setReport(key)}>{titles[key]}</button>)}</div>
 <section className="panel report-print"><div className="panel-head"><div><h2>{titles[report]} Report</h2><small className="muted">Generated {new Date().toLocaleString("en-ZM")}</small></div><span className="badge available">{rows.length} records</span></div><div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{headers.map(h=><td key={h} className={h==="Profit"&&Number(r[h])<0?"loss":h==="Profit"?"profit":""}>{isMoney(h)&&typeof r[h]==="number"?money(Number(r[h])):String(r[h]??"")}</td>)}</tr>)}</tbody></table>{!rows.length&&<div className="empty">No data is available for this report yet.</div>}</div></section>
 </>;
}
