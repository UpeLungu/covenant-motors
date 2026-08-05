import { Sidebar } from "./sidebar";
import { WorkspaceHeader } from "./workspace-header";
export function AppShell({children}:{children:React.ReactNode}){return <div className="shell"><Sidebar/><main className="main"><WorkspaceHeader/>{children}</main></div>}
