"use client";
import {AlertTriangle,Info,Trash2,X} from "lucide-react";

type DialogTone="default"|"danger"|"warning";
type Props={
 open:boolean;
 title:string;
 message:string;
 tone?:DialogTone;
 confirmLabel?:string;
 cancelLabel?:string;
 onConfirm?:()=>void;
 onClose:()=>void;
};

export function AppDialog({open,title,message,tone="default",confirmLabel="OK",cancelLabel="Cancel",onConfirm,onClose}:Props){
 if(!open)return null;
 const Icon=tone==="danger"?Trash2:tone==="warning"?AlertTriangle:Info;
 const confirmation=Boolean(onConfirm);
 return <div className="app-dialog-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
   <div className={`app-dialog-icon ${tone}`}><Icon size={22}/></div>
   <button className="app-dialog-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button>
   <div className="app-dialog-copy"><h2 id="app-dialog-title">{title}</h2><p id="app-dialog-message">{message}</p></div>
   <div className="app-dialog-actions">
    {confirmation&&<button type="button" className="button secondary" onClick={onClose}>{cancelLabel}</button>}
    <button type="button" className={`button ${tone==="danger"?"danger-button":""}`} onClick={()=>{onConfirm?.();if(!onConfirm)onClose()}}>{confirmLabel}</button>
   </div>
  </section>
 </div>;
}
