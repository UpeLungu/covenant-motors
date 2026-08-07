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
const safe=(value:unknown,fallback="—")=>String(value||"").trim()||fallback;

export default function SaleReceiptPage(){
 const params=useParams<{id:string}>();
 const [sale,setSale]=useState<Sale|null>(null),[vehicle,setVehicle]=useState<Vehicle|null>(null),[customer,setCustomer]=useState<Customer|null>(null),[loaded,setLoaded]=useState(false),[downloading,setDownloading]=useState(false);
 useEffect(()=>{const s=loadSales().find(x=>x.id===params.id)||null;setSale(s);if(s){setVehicle(loadVehicles().find(v=>v.id===s.vehicleId)||null);setCustomer(loadCustomers().find(c=>c.id===s.customerId)||null)}setLoaded(true)},[params.id]);
 if(!loaded)return <div className="panel"><div className="empty">Loading sale document…</div></div>;
 if(!sale)return <div className="panel"><div className="empty"><h3>Sale not found</h3><Link className="button secondary" href="/sales">Return to Sales</Link></div></div>;
 const selling=saleValue(sale),paid=paidValue(sale),outstanding=balanceValue(sale),isPaid=outstanding<=0;
 async function downloadPdf(){setDownloading(true);try{const {jsPDF}=await import("jspdf");const doc=new jsPDF({unit:"mm",format:"a4"});const left=18,right=192;let y=20;const field=(label:string,value:string)=>{doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(105);doc.text(label,left,y);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(30);doc.text(value,66,y);y+=8};const heading=(label:string)=>{y+=3;doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(30);doc.text(label,left,y);y+=8};
 doc.setFont("helvetica","bold");doc.setFontSize(20);doc.setTextColor(24,86,65);doc.text("COVENANT MOTORS",left,y);doc.setFontSize(11);doc.setTextColor(30);doc.text(sale.saleId,right,y,{align:"right"});y+=8;doc.setFontSize(13);doc.text(isPaid?"SALES RECEIPT":"SALES INVOICE / RECEIPT",left,y);doc.setFontSize(10);doc.setTextColor(isPaid?36:150,isPaid?120:80,isPaid?85:50);doc.text(isPaid?"PAID":"BALANCE DUE",right,y,{align:"right"});y+=8;doc.setDrawColor(205);doc.line(left,y,right,y);y+=8;
 heading("Sale Details");field("Sale Date",sale.saleDate);field("Payment Method",safe(sale.paymentMethod));field("Payment Status",sale.status);
 heading("Customer Details");field("Customer ID",safe(customer?.customerId));field("Name",sale.customerName);field("Phone",safe(customer?.phone));field("NRC / TPIN",safe(customer?.nrcOrTpin));field("Address",safe(customer?.address));
 heading("Vehicle Details");field("Stock ID",sale.stockId);field("Vehicle",sale.vehicleName);field("Registration",safe(vehicle?.registrationNumber,"Not registered"));field("VIN / Chassis",safe(vehicle?.vin));field("Engine Number",safe(vehicle?.engineNumber));field("Colour",safe(vehicle?.colour));
 heading("Payment Summary");field("Selling Price",money(selling));field("Amount Paid",money(paid));field("Outstanding",money(outstanding));y+=2;doc.setDrawColor(205);doc.line(left,y,right,y);y+=9;doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(isPaid?24:150,isPaid?110:70,isPaid?75:45);doc.text(isPaid?"PAID IN FULL":`OUTSTANDING: ${money(outstanding)}`,left,y);
 y+=22;doc.setDrawColor(150);doc.line(left,y,75,y);doc.line(125,y,right,y);y+=5;doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(90);doc.text("Customer Signature",left,y);doc.text("Authorised Signature",125,y);doc.setFontSize(8);doc.setTextColor(115);doc.text("Generated from Covenant Motors dealership management system.",left,285);
 doc.save(`${sale.saleId}-${isPaid?"receipt":"invoice"}.pdf`)}finally{setDownloading(false)}}
 return <div className="sale-document-page">
  <div className="sale-document-actions no-print">
   <Link className="button secondary" href="/sales"><ArrowLeft size={16}/>Back to Sales</Link>
   <div><button className="button secondary" type="button" onClick={()=>window.print()}><Printer size={16}/>Print</button><button className="button" type="button" onClick={downloadPdf} disabled={downloading}><Download size={16}/>{downloading?"Preparing PDF…":"Download PDF"}</button></div>
  </div>
  <article className="sale-document">
   <header className="sale-document-header"><div><div className="sale-document-brand">COVENANT MOTORS</div><p>Vehicle Sales & Dealership Records</p></div><div className={`sale-document-status ${isPaid?"paid":"pending"}`}>{isPaid?"PAID":"BALANCE DUE"}</div></header>
   <div className="sale-document-title"><div><span>SALE DOCUMENT</span><h1>{isPaid?"Receipt":"Invoice / Receipt"}</h1></div><div className="sale-document-reference"><small>Sale ID</small><b>{sale.saleId}</b><small>Sale Date</small><b>{sale.saleDate}</b></div></div>
   <section className="sale-document-section"><h2>Customer</h2><div className="sale-document-grid"><div><small>Name</small><b>{sale.customerName}</b></div><div><small>Customer ID</small><b>{customer?.customerId||"—"}</b></div><div><small>Phone</small><b>{customer?.phone||"—"}</b></div><div><small>NRC / TPIN</small><b>{customer?.nrcOrTpin||"—"}</b></div><div className="wide"><small>Address</small><b>{customer?.address||"—"}</b></div></div></section>
   <section className="sale-document-section"><h2>Vehicle</h2><div className="sale-document-grid"><div><small>Stock ID</small><b>{sale.stockId}</b></div><div><small>Vehicle</small><b>{sale.vehicleName}</b></div><div><small>Registration</small><b>{vehicle?.registrationNumber||"Not registered"}</b></div><div><small>VIN / Chassis</small><b>{vehicle?.vin||"—"}</b></div><div><small>Engine Number</small><b>{vehicle?.engineNumber||"—"}</b></div><div><small>Colour</small><b>{vehicle?.colour||"—"}</b></div></div></section>
   <section className="sale-document-section"><h2>Payment Summary</h2><div className="sale-document-money"><div><span>Selling Price</span><b>{money(selling)}</b></div><div><span>Amount Paid</span><b>{money(paid)}</b></div><div className={outstanding>0?"due":"settled"}><span>Outstanding</span><b>{money(outstanding)}</b></div></div><div className="sale-document-payment-meta"><span><small>Payment Method</small><b>{sale.paymentMethod||"—"}</b></span><span><small>Payment Status</small><b>{sale.status}</b></span></div></section>
   <section className="sale-document-notes"><p>This document confirms the vehicle sale recorded under <b>{sale.saleId}</b>. Any outstanding balance remains payable until fully settled.</p></section>
   <footer className="sale-document-footer"><div><span>Customer Signature</span></div><div><span>Authorised Signature</span></div></footer>
  </article>
 </div>;
}
