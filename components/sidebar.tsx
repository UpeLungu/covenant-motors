"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Users, Route, Receipt, ShoppingCart, FileBarChart, Settings } from "lucide-react";
const items = [["/","Dashboard",LayoutDashboard],["/vehicles","Vehicles",Car],["#","Drivers",Users],["#","Collection Trips",Route],["#","Expenses",Receipt],["#","Sales",ShoppingCart],["#","Reports",FileBarChart],["#","Settings",Settings]] as const;
export function Sidebar(){
  const pathname=usePathname();
  return <aside className="sidebar"><div className="brand"><div className="brand-badge"><Car size={21}/></div><div>Covenant Motors<br/><small>Dealership Management</small></div></div><nav className="nav">{items.map(([href,label,Icon])=><Link className={href!=="#"&&(pathname===href||pathname.startsWith(`${href}/`))?"active":""} href={href} key={label}><Icon size={18}/>{label}</Link>)}</nav></aside>;
}