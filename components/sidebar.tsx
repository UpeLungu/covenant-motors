"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {LayoutDashboard,Car,Users,Route,Receipt,ShoppingCart,FileBarChart,Settings,ContactRound,Landmark,FileCheck2} from "lucide-react";
const items=[["/","Dashboard",LayoutDashboard],["/vehicles","Vehicles",Car],["/drivers","Drivers",Users],["/trips","Collection Trips",Route],["/customers","Customers",ContactRound],["/expenses","Expenses",Receipt],["/sales","Sales",ShoppingCart],["/finance","Finance",Landmark],["/tax","Tax Centre",FileCheck2],["/reports","Reports",FileBarChart],["#","Settings",Settings]] as const;
export function Sidebar(){const pathname=usePathname();return <aside className="sidebar"><div className="brand"><div className="brand-badge"><Car size={21}/></div><div>Covenant Motors<br/><small>Dealership Management</small></div></div><nav className="nav">{items.map(([href,label,Icon])=><Link className={href!=="#"&&(pathname===href||(href!=="/"&&pathname.startsWith(`${href}/`)))?"active":""} href={href} key={label}><Icon size={18}/>{label}</Link>)}</nav></aside>;}
