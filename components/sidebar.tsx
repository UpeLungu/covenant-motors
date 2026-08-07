"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {LayoutDashboard,Car,Users,Route,Receipt,ShoppingCart,FileBarChart,ContactRound,Landmark,FileCheck2,ChartNoAxesCombined,ChevronDown,Menu,X,Plus,FileText} from "lucide-react";

const groups=[
 {id:"vehicles",label:"Vehicle Management",icon:Car,items:[["/vehicles","Vehicle Stock",Car],["/vehicles/new","Add Vehicle",Plus]]},
 {id:"sales",label:"Sales & Customers",icon:ShoppingCart,items:[["/quotations","Quotations",FileText],["/sales","Sales",ShoppingCart],["/customers","Customers",ContactRound]]},
 {id:"operations",label:"Operations",icon:Route,items:[["/trips","Collection Trips",Route],["/drivers","Drivers",Users],["/expenses","Expenses",Receipt]]},
 {id:"finance",label:"Finance & Compliance",icon:Landmark,items:[["/finance","Finance",Landmark],["/cost-analysis","Cost Analysis",ChartNoAxesCombined],["/tax","Tax Centre",FileCheck2],["/reports","Reports",FileBarChart]]}
] as const;

export function Sidebar(){
 const pathname=usePathname();
 const [mobileOpen,setMobileOpen]=useState(false);
 const active=(href:string)=>pathname===href||(href!=="/"&&pathname.startsWith(`${href}/`));
 const activeGroup=groups.find(group=>group.items.some(([href])=>active(href)))?.id;
 const [openGroups,setOpenGroups]=useState<Record<string,boolean>>(()=>Object.fromEntries(groups.map(g=>[g.id,g.id===activeGroup||g.id==="vehicles"])));
 useEffect(()=>{if(activeGroup)setOpenGroups(current=>({...current,[activeGroup]:true}));setMobileOpen(false)},[pathname,activeGroup]);
 const toggle=(id:string)=>setOpenGroups(current=>({...current,[id]:!current[id]}));
 return <>
  <div className="mobile-appbar"><button type="button" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu/></button><div><b>Covenant Motors</b><span>Dealer Management Suite</span></div></div>
  {mobileOpen&&<button className="sidebar-backdrop" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>} 
  <aside className={`sidebar ${mobileOpen?"mobile-open":""}`}>
   <div className="brand"><div className="brand-badge"><Car size={22}/></div><div><strong>Covenant Motors</strong><small>Dealer Management Suite</small></div><button className="sidebar-close" type="button" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"><X size={20}/></button></div>
   <div className="sidebar-company"><div className="company-avatar">CM</div><div><b>Covenant Motors</b><span>Commercial workspace</span></div></div>
   <nav className="nav">
    <Link className={pathname==="/"?"active nav-dashboard":"nav-dashboard"} href="/"><span className="nav-icon"><LayoutDashboard size={18}/></span><span className="nav-text">Dashboard</span></Link>
    {groups.map(group=>{const GroupIcon=group.icon;const isOpen=!!openGroups[group.id];const isActive=group.items.some(([href])=>active(href));return <div className={`nav-section ${isOpen?"open":""}`} key={group.id}>
      <button className={`nav-section-trigger ${isActive?"active":""}`} type="button" onClick={()=>toggle(group.id)}><span className="nav-icon"><GroupIcon size={18}/></span><span className="nav-text">{group.label}</span><ChevronDown className="nav-chevron" size={16}/></button>
      <div className="nav-section-items">{group.items.map(([href,label,Icon])=><Link className={active(href)?"active":""} href={href} key={label}><span className="nav-child-line"/><span className="nav-icon child"><Icon size={16}/></span><span className="nav-text">{label}</span></Link>)}</div>
     </div>})}
   </nav>
   <div className="sidebar-footer"><span>System status</span><b><i/>Operational</b></div>
  </aside>
 </>;
}
