import "./globals.css";
import "./modern.css";
import "./professional-modules.css";
import "./navigation-fix.css";
import "./ux-polish.css";
import "./final-ui-polish.css";
import "./interaction-fix.css";
import "./sales-mobile-redesign.css";
import "./product-pass.css";
import "./cleanup-sprint.css";
import "./vehicle-deal-cleanup.css";
import { AppShell } from "@/components/app-shell";
export const metadata={title:"Covenant Motors",description:"Dealership management web application"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppShell>{children}</AppShell></body></html>}
