"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {ArrowLeft,Download,Printer} from "lucide-react";
import {loadSales,Sale} from "@/lib/sales-store";
import {loadVehicles} from "@/lib/vehicle-store";
import {loadCustomers,Customer} from "@/lib/customer-store";
import {Vehicle} from "@/lib/types";
import {formatCurrency} from "@/lib/currency";

const money=(n:number)=>formatCurrency(n,"ZMW");
const saleValue=(s:Sale)=>Number(s.sellingPriceZmw??s.sellingPrice??0);
const paidValue=(s:Sale)=>Number(s.amountPaidZmw??s.amountPaid??0);
const balanceValue=(s:Sale)=>Number(s.balanceZmw??s.balance??Math.max(0,saleValue(s)-paidValue(s)));

export default function SaleReceiptPage(){
 const params=useParams<{id:string}>();
 const [sale,setSale]=useState<Sale|null>(null),[vehicle,setVehicle]=useState<Vehicle|null>(null),[customer,setCustomer]=useState<Customer|null>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{const s=loadSales().find(x=>x.id===params.id)||null;setSale(s);if(s){setVehicle(loadVehicles().find(v=>v.id===s.vehicleId)||null);setCustomer(loadCustomers().find(c=>c.id===s.customerId)||null)}setLoaded(true)},[params.id]);
 if(!loaded)return <div className="panel"><div className="empty">Loading sale document…</div></div>;
 if(!sale)return <div className="panel"><div className="empty"><h3>Sale not found</h3><Link className="button secondary" href="/sales">Return to Sales</Link></div></div>;
 const selling=saleValue(sale),paid=paidValue(sale),outstanding=balanceValue(sale),isPaid=outstanding<=0;
 const printDocument=()=>window.print();
 return <div className="sale-document-page">
  <div className="sale-document-actions no-print">
   <Link className="button secondary" href="/sales"><ArrowLeft size={16}/>Back to Sales</Link>
   <div><button className="button secondary" type="button" onClick={printDocument}><Printer size={16}/>Print</button><button className="button" type="button" onClick={printDocument}><Download size={16}/>Save PDF</button></div>
  </div>
  <article className="sale-document">
   <header className="sale-document-header"><div><div className="sale-document-brand">COVENANT MOTORS</div><p>Vehicle Sales & Dealership Records</p></div><div className={`sale-document-status ${isPaid?"paid":"pending"}`}>{isPaid?"PAID":"BALANCE DUE"}</div></header>
   <div className="sale-document-title"><div><span>SALE DOCUMENT</span><h1>{isPaid?"Receipt":"Invoice / Receipt"}</h1></div><div className="sale-document-reference"><small>Sale ID</small><b>{sale.saleId}</b><small>Sale Date</small><b>{sale.saleDate}</b></div></div>
   <section className="sale-document-section"><h2>Customer</h2><div className="sale-document-grid"><div><small>Name</small><b>{sale.customerName}</b></div><div><small>Customer ID</small><b>{customer?.customerId||"—"}</b></div><div><small>Phone</small><b>{customer?.phone||"—"}</b></div><div><small>NRC / TPIN</small><b>{customer?.nrcOrTpin||"—"}</b></div><div className="wide"><small>Address</small><b>{customer?.address||"—"}</b></div></div></section>
   <section className="sale-document-section"><h2>Vehicle</h2><div className="sale-document-grid"><div><small>Stock ID</small><b>{sale.stockId}</b></div><div><small>Vehicle</small><b>{sale.vehicleName}</b></div><div><small>Registration</small><b>{vehicle?.registrationNumber||"Not registered"}</b></div><div><small>VIN / Chassis</small><b>{vehicle?.vin||"—"}</b></div><div><small>Engine Number</small><b>{vehicle?.engineNumber||"—"}</b></div><div><small>Colour</small><b>{vehicle?.colour||"—"}</b></div></div></section>
   <section className="sale-document-section"><h2>Payment Summary</h2><div className="sale-document-money"><div><span>Selling Price</span><b>{money(selling)}</b></div><div><span>Amount Paid</span><b>{money(paid)}</b></div><div className={outstanding>0?"due":"settled"}><span>Outstanding</span><b>{money(outstanding)}</b></div></div><div className="sale-document-payment-meta"><span><small>Payment Method</small><b>{sale.paymentMethod||"—"}</b></span><span><small>Payment Status</small><b>{sale.status}</b></span></div></section>
   <section className="sale-document-notes"><p>This document confirms the vehicle sale recorded under <b>{sale.saleId}</b>. Any outstanding balance remains payable until fully settled.</p></section>
   <footer className="sale-document-footer"><div><span>Customer Signature</span></div><div><span>Authorized Signature</span></div></footer>
  </article>
 </div>;
}
