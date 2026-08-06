"use client";
import {useEffect,useMemo,useState} from "react";
import {Download,FileBarChart2,Printer} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {loadSales,Sale} from "@/lib/sales-store";
import {loadTrips,tripSpent} from "@/lib/operations-store";
import {loadVehicleExpenses} from "@/lib/ledger-store";
import {loadFinanceEntries,loadAccounts} from "@/lib/finance-store";
import {loadTaxReturns} from "@/lib/tax-store";
import {formatCurrency} from "@/lib/currency";
import {saleProfitAnalysis,vehicleCostZmw} from "@/lib/financial-analysis";
type Report="vehicle-profit"|"sales"|"stock"|"cashbook"|"customers"|"suppliers"|"drivers"|"tax";
type Row=Record<string,string|number>;
const titles:Record<Report,string>={"vehicle-profit":"Vehicle Profit","sales":"Sales Register","stock":"Vehicle Stock","cashbook":"Cash Book","customers":"Customer Balances","suppliers":"Supplier Balances","drivers":"Driver Performance","tax":"Tax Returns"};
const saleValue=(s:Sale)=>Number(s.sellingPriceZmw??s.sellingPrice??0);
const paidValue=(s:Sale)=>Number(s.amountPaidZmw??s.amountPaid??0);
const balanceValue=(s:Sale)=>Math.max(0,Number(s.balanceZmw??s.balance??saleValue(s)-paidValue(s)));
export default function ReportsPage(){
 const [report,setReport]=useState<Report>("vehicle-profit"),[vehicles,setVehicles]=useState<any[]>([]),[sales,setSales]=useState<Sale[]>([]),[trips,setTrips]=useState<any[]>([]),[expenses,setExpenses]=useState<any[]>([]),[finance,setFinance]=useState<any[]>([]),[accounts,setAccounts]=useState<any[]>([]),[tax,setTax]=useState<any[]>([]);
 useEffect(()=>{setVehicles(loadVehicles());setSales(loadSales());setTrips(loadTrips());setExpenses(loadVehicleExpenses());setFinance(loadFinanceEntries());setAccounts(loadAccounts());setTax(loadTaxReturns())},[]);
 const supplierPaid=(vehicleId:string)=>Math.max(0,finance.filter(x=>x.type==="Supplier Payment"&&x.relatedId===vehicleId&&!String(x.reference||"").startsWith("REV-")).reduce((a:number,b:any)=>a+Number(b.moneyOut||0),0)-finance.filter(x=>x.relatedId===vehicleId&&String(x.reference||"").startsWith("REV-")).reduce((a:number,b:any)=>a+Number(b.moneyIn||0),0));
 const rows=useMemo<Row[]>(()=>{
  if(report==="vehicle-profit")return sales.map(s=>{const a=saleProfitAnalysis(s,vehicles.find(v=>v.id===s.vehicleId),expenses);return {"Stock ID":s.stockId,Vehicle:s.vehicleName,Customer:s.customerName,"Selling Price":saleValue(s),"Vehicle Cost":a.cost,"Gross Profit":a.profit,Status:s.status}});
  if(report==="sales")return sales.map(s=>({"Sale ID":s.saleId,Date:s.saleDate,"Stock ID":s.stockId,Customer:s.customerName,"Selling Price":saleValue(s),Paid:paidValue(s),Balance:balanceValue(s),Status:s.status}));
  if(report==="stock")return vehicles.map(v=>({"Stock ID":v.stockId,Vehicle:`${v.make} ${v.model} ${v.year}`,VIN:v.vin,Supplier:v.supplier,Location:v.currentLocation,"Cost Price":Number(v.purchasePriceZmw??v.purchasePrice??0),"Vehicle Cost":vehicleCostZmw(v,expenses),"Estimated Selling Price":Number(v.estimatedSellingPriceZmw??v.estimatedSellingPrice??0),Status:v.status}));
  if(report==="cashbook")return finance.map(x=>({Date:x.date,Account:accounts.find(a=>a.id===x.accountId)?.name||"Unknown",Type:x.type,Reference:x.reference||"",Description:x.description,"Money In":Number(x.moneyIn||0),"Money Out":Number(x.moneyOut||0),Entry:String(x.reference||"").startsWith("REV-")?"Reversal":"Original"}));
  if(report==="customers")return sales.map(s=>({Customer:s.customerName,"Sale ID":s.saleId,Vehicle:s.stockId,"Selling Price":saleValue(s),Paid:paidValue(s),Balance:balanceValue(s),Status:s.status}));
  if(report==="suppliers")return vehicles.map(v=>{const price=Number(v.purchasePriceZmw??v.purchasePrice??0),paid=supplierPaid(v.id);return {Supplier:v.supplier,"Stock ID":v.stockId,Vehicle:`${v.make} ${v.model}`,"Cost Price":price,Paid:paid,Balance:Math.max(0,price-paid)}});
  if(report==="drivers")return trips.map(t=>{const spent=tripSpent(t),advance=Number((t.advanceZmw??t.advance)??0);return {Driver:t.driverName,"Trip ID":t.tripId,Vehicle:t.vehicleStockId,Route:`${t.collectionPoint} to ${t.destination}`,Advance:advance,Expenses:spent,Balance:advance-spent,Status:t.status}});
  return tax.map(t=>({Type:t.type,Period:t.period,"Taxable Amount":t.taxableAmount,"Tax Due":t.taxDue,"Due Date":t.dueDate,Status:t.status,Reference:t.reference||""}));
 },[report,vehicles,sales,trips,expenses,finance,accounts,tax]);
 const revenue=sales.reduce((sum,s)=>sum+saleValue(s),0),outstanding=sales.reduce((sum,s)=>sum+balanceValue(s),0),profit=sales.reduce((sum,s)=>sum+saleProfitAnalysis(s,vehicles.find(v=>v.id===s.vehicleId),expenses).profit,0);
 function exportCsv(){if(!rows.length)return alert("There is no data to export.");const h=Object.keys(rows[0]);const csv=[h.join(","),...rows.map(r=>h.map(k=>`"${String(r[k]??"").replaceAll('"','""')}"`).join(","))].join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`covenant-motors-${report}.csv`;a.click();URL.revokeObjectURL(url)}
 const headers=rows.length?Object.keys(rows[0]):[];
 return <><div className="topbar"><div className="title"><h1>Reports</h1><p>Vehicle stock, sales, payments, expenses and profit reports in Zambian Kwacha.</p></div><div className="quick-actions"><button className="button secondary" onClick={()=>window.print()}><Printer size={17}/>Print</button><button className="button" onClick={exportCsv}><Download size={17}/>Export CSV</button></div></div>
 <div className="cards"><div className="card metric"><div><div className="metric-label">Report Records</div><div className="metric-value">{rows.length}</div></div><div className="metric-icon"><FileBarChart2/></div></div><div className="card"><div className="metric-label">Total Sales</div><div className="metric-value small-money">{formatCurrency(revenue,"ZMW")}</div></div><div className="card"><div className="metric-label">Gross Profit</div><div className="metric-value small-money">{formatCurrency(profit,"ZMW")}</div></div><div className="card"><div className="metric-label">Outstanding</div><div className="metric-value small-money">{formatCurrency(outstanding,"ZMW")}</div></div></div>
 <div className="deal-tabs">{(Object.keys(titles) as Report[]).map(k=><button key={k} className={report===k?"active":""} onClick={()=>setReport(k)}>{titles[k]}</button>)}</div><section className="panel report-print"><div className="panel-head"><div><h2>{titles[report]} Report</h2><small className="muted">Generated {new Date().toLocaleString("en-ZM")}</small></div><span className="badge available">{rows.length} records</span></div><div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{headers.map(h=><td key={h}>{typeof r[h]==="number"&&["Selling Price","Vehicle Cost","Cost Price","Estimated Selling Price","Paid","Balance","Gross Profit","Money In","Money Out","Advance","Expenses","Taxable Amount","Tax Due"].includes(h)?formatCurrency(Number(r[h]),"ZMW"):String(r[h]??"")}</td>)}</tr>)}</tbody></table>{!rows.length&&<div className="empty">No data is available for this report yet.</div>}</div></section></>;
}
