"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {LayoutDashboard,Car,Users,Route,Receipt,ShoppingCart,FileBarChart,Settings,ContactRound,Landmark,FileCheck2,ChartNoAxesCombined,ChevronRight} from "lucide-react";

const groups=[
 {label:"Workspace",items:[["/","Dashboard",LayoutDashboard],["/vehicles","Vehicles",Car]]},
 {label:"Operations",items:[["/drivers","Drivers",Users],["/trips","Collection Trips",Route],["/customers","Customers",ContactRound],["/sales","Sales",ShoppingCart],["/expenses","Expenses",Receipt]]},
 {label:"Finance & Compliance",items:[["/finance","Finance",Landmark],["/cost-analysis","Cost Analysis",ChartNoAxesCombined],["/tax","Tax Centre",FileCheck2],["/reports","Reports",FileBarChart]]},
 {label:"Administration",items:[["#","Settings",Settings]]}
] as const;

export function Sidebar(){
 const pathname=usePathname();
 const active=(href:string)=>href!=="#"&&(pathname===href||(href!=="/"&&pathname.startsWith(`${href}/`)));
 return <aside className="sidebar">
  <div className="brand"><div className="brand-badge"><Car size={22}/></div><div><strong>Covenant Motors</strong><small>Dealer Management Suite</small></div></div>
  <div className="sidebar-company"><div className="company-avatar">CM</div><div><b>Covenant Motors</b><span>Commercial workspace</span></div></div>
  <nav className="nav">{groups.map(group=><div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(([href,label,Icon])=><Link className={active(href)?"active":""} href={href} key={label}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text">{label}</span>{active(href)&&<ChevronRight className="nav-arrow" size={15}/>}</Link>)}</div>)}</nav>
  <div className="sidebar-footer"><span>System status</span><b><i/>Operational</b></div>
 </aside>;
}
