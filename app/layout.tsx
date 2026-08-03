import "./globals.css";
import { AppShell } from "@/components/app-shell";
export const metadata={title:"Covenant Motors",description:"Dealership management web application"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppShell>{children}</AppShell></body></html>}