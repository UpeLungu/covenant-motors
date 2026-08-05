"use client";
import Link from "next/link";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {AlertTriangle,Calculator,CheckCircle2,Save} from "lucide-react";
import {loadVehicles} from "@/lib/vehicle-store";
import {loadSales} from "@/lib/sales-store";
import {loadVehicleExpenses} from "@/lib/ledger-store";
import {loadCostAnalyses,saveCostAnalyses,totalIndirectCost,VehicleCostAnalysis} from "@/lib/cost-analysis-store";
import {Currency,formatCurrency,normalizeCurrency} from "@/lib/currency";
import {saleProfitAnalysis,vehicleCostTotals} from "@/lib/financial-analysis";

export default function CostAnalysisPage(){
 const [vehicles,setVehicles]=useState<any[]>([]),[sales,setSales]=useState<any[]>([]),[expenses,setExpenses]=useState<any[]>([]),[analyses,setAnalyses]=useState<VehicleCostAnalysis[]>([]),[selected,setSelected]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{const v=loadVehicles();setVehicles(v);setSales(loadSales());setExpenses(loadVehicleExpenses());setAnalyses(loadCostAnalyses());if(v.length)setSelected(v[0].id)},[]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),2800);return()=>clearTimeout(timer)},[notice]);

 const rows=useMemo(()=>vehicles.map(v=>{
  const sale=sales.find(s=>s.vehicleId===v.id);
  const costs=vehicleCostTotals(v,expenses);
  const analysis=analyses.find(a=>a.vehicleId===v.id);
  const indirect=totalIndirectCost(analysis);
  const indirectCurrency=normalizeCurrency(analysis?.currency);
  const result=sale?saleProfitAnalysis(sale,v,expenses):null;
  const saleCurrency=result?.currency;
  const comparable=!!result&&!result.mixed&&(!indirect||indirectCurrency===saleCurrency);
  const gross=comparable&&result?result.profit:0;
  const net=comparable?gross-indirect:0;
  const status=!sale?"Not Sold":result?.mixed?"Mixed Direct Costs":indirect&&indirectCurrency!==saleCurrency?"Indirect Cost Currency Mismatch":"Comparable";
  return {v,sale,costs,analysis,indirect,indirectCurrency,result,comparable,gross,net,status};
 }),[vehicles,sales,expenses,analyses]);

 const current=rows.find(r=>r.v.id===selected);
 const totals=(currency:Currency)=>rows.filter(r=>r.comparable&&r.result?.currency===currency).reduce((a,r)=>({gross:a.gross+r.gross,indirect:a.indirect+r.indirect,net:a.net+r.net}),{gross:0,indirect:0,net:0});
 const zmw=totals("ZMW"),usd=totals("USD");

 function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!selected)return;
  const f=new FormData(e.currentTarget);
  const item:VehicleCostAnalysis={vehicleId:selected,currency:String(f.get("currency")||"ZMW") as Currency,allocatedOverheads:Number(f.get("allocatedOverheads")||0),salesCommission:Number(f.get("salesCommission")||0),financeCharges:Number(f.get("financeCharges")||0),taxCost:Number(f.get("taxCost")||0),otherIndirectCosts:Number(f.get("otherIndirectCosts")||0),notes:String(f.get("notes")||""),updatedAt:new Date().toISOString()};
  const next=[item,...analyses.filter(x=>x.vehicleId!==selected)];saveCostAnalyses(next);setAnalyses(next);setNotice("Cost analysis saved.");
 }

 return <>
  {notice&&<div className="app-toast"><CheckCircle2 size={17}/>{notice}</div>}
  <div className="page-heading"><div><span className="eyebrow dark">PROFITABILITY</span><h1>Vehicle Cost Analysis</h1><p>Review direct costs, allocate indirect costs and confirm net profit or loss for each sold vehicle.</p></div></div>

  <div className="cost-summary-grid">
   <section><span>Comparable Vehicles</span><b>{rows.filter(r=>r.comparable).length}</b><small>{rows.filter(r=>r.sale).length} sold</small></section>
   <section><span>Gross Profit</span><p><small>ZMW</small><b>{formatCurrency(zmw.gross,"ZMW")}</b></p><p><small>USD</small><b>{formatCurrency(usd.gross,"USD")}</b></p></section>
   <section><span>Indirect Costs</span><p><small>ZMW</small><b>{formatCurrency(zmw.indirect,"ZMW")}</b></p><p><small>USD</small><b>{formatCurrency(usd.indirect,"USD")}</b></p></section>
   <section><span>Net Profit / Loss</span><p><small>ZMW</small><b className={zmw.net<0?"loss":"profit"}>{formatCurrency(zmw.net,"ZMW")}</b></p><p><small>USD</small><b className={usd.net<0?"loss":"profit"}>{formatCurrency(usd.net,"USD")}</b></p></section>
  </div>

  <section className="panel cost-vehicle-picker"><div className="panel-body"><div className="field"><label>Vehicle</label><select className="select" value={selected} onChange={e=>setSelected(e.target.value)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.stockId} — {v.make} {v.model} {v.year}</option>)}</select></div></div></section>

  {current&&<>
   <div className="cost-current-grid">
    <section><span>Sale</span><b>{current.sale?formatCurrency(current.sale.sellingPrice,normalizeCurrency(current.sale.currency)):"Not sold"}</b></section>
    <section><span>Direct Costs</span><p><small>ZMW</small><b>{formatCurrency(current.costs.ZMW,"ZMW")}</b></p><p><small>USD</small><b>{formatCurrency(current.costs.USD,"USD")}</b></p></section>
    <section><span>Gross Profit / Loss</span><b className={current.comparable&&current.gross<0?"loss":"profit"}>{current.comparable&&current.result?formatCurrency(current.gross,current.result.currency):"Not available"}</b></section>
    <section><span>Net Profit / Loss</span><b className={current.comparable&&current.net<0?"loss":"profit"}>{current.comparable&&current.result?formatCurrency(current.net,current.result.currency):"Manual review"}</b></section>
   </div>

   {!current.comparable&&current.sale&&<div className="cost-warning"><AlertTriangle size={19}/><div><b>{current.status}</b><span>ZMW and USD are not automatically converted. Align the relevant cost currency before a net profit is calculated.</span></div></div>}

   <div className="grid-2 cost-workspace">
    <form key={`${selected}-${current.analysis?.updatedAt||"new"}`} className="form-card professional-form" onSubmit={save}>
     <div className="form-heading"><div><h2>Indirect Costs</h2><p>Allocate costs attributable to this vehicle sale.</p></div></div>
     <div className="form-grid">
      <div className="field"><label>Currency</label><select className="select" name="currency" defaultValue={current.analysis?.currency||current.sale?.currency||"ZMW"}><option value="ZMW">ZMW</option><option value="USD">USD</option></select></div>
      {[["allocatedOverheads","Operating overheads"],["salesCommission","Sales commission"],["financeCharges","Finance charges"],["taxCost","Tax attributable to sale"],["otherIndirectCosts","Other indirect costs"]].map(([name,label])=><div className="field" key={name}><label>{label}</label><input className="input" type="number" min="0" step="0.01" name={name} defaultValue={Number(current.analysis?.[name as keyof VehicleCostAnalysis]||0)}/></div>)}
      <div className="field full"><label>Notes</label><textarea className="textarea" name="notes" defaultValue={current.analysis?.notes||""} placeholder="Optional explanation or management note"/></div>
     </div>
     <div className="actions"><button className="button"><Save size={17}/>Save Analysis</button></div>
    </form>

    <section className="panel cost-profit-bridge">
     <div className="panel-head"><h2>Profit Bridge</h2><Calculator size={19}/></div>
     <div className="ledger-list">
      <div className="ledger-sale"><span>Selling Price</span><b>{current.sale?formatCurrency(current.sale.sellingPrice,normalizeCurrency(current.sale.currency)):"Not sold"}</b></div>
      <div className="ledger-row"><span>Direct Costs — ZMW</span><b>{formatCurrency(current.costs.ZMW,"ZMW")}</b></div>
      <div className="ledger-row"><span>Direct Costs — USD</span><b>{formatCurrency(current.costs.USD,"USD")}</b></div>
      <div className="ledger-row"><span>Indirect Costs</span><b>{formatCurrency(current.indirect,current.indirectCurrency)}</b></div>
      <div className={current.comparable&&current.net>=0?"ledger-profit":"ledger-loss"}><span>Net Profit / Loss</span><b>{current.comparable&&current.result?formatCurrency(current.net,current.result.currency):"Manual review required"}</b></div>
     </div>
     <div className="panel-body"><Link className="button secondary" href={`/vehicles/${current.v.id}`}>Open Deal Jacket</Link></div>
    </section>
   </div>
  </>}

  <section className="panel cost-register"><div className="panel-head"><h2>Vehicle Profitability Register</h2></div><div className="table-wrap"><table><thead><tr><th>Vehicle</th><th>Sale</th><th>ZMW Costs</th><th>USD Costs</th><th>Status</th><th>Net Profit / Loss</th></tr></thead><tbody>{rows.map(r=><tr key={r.v.id}><td><Link href={`/vehicles/${r.v.id}`}><b>{r.v.stockId}</b></Link><br/><small>{r.v.make} {r.v.model} {r.v.year}</small></td><td>{r.sale?formatCurrency(r.sale.sellingPrice,normalizeCurrency(r.sale.currency)):"Not sold"}</td><td>{formatCurrency(r.costs.ZMW,"ZMW")}</td><td>{formatCurrency(r.costs.USD,"USD")}</td><td><span className={`badge ${r.comparable?"available":r.sale?"awaiting":"transit"}`}>{r.status}</span></td><td className={r.comparable&&r.net<0?"loss":"profit"}><b>{r.comparable&&r.result?formatCurrency(r.net,r.result.currency):"—"}</b></td></tr>)}</tbody></table></div></section>
 </>;
}
