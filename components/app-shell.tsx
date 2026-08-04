import { Sidebar } from "./sidebar";
import { WorkspaceHeader } from "./workspace-header";
import { QuickActions } from "./quick-actions";
export function AppShell({children}:{children:React.ReactNode}){return <div className="shell"><Sidebar/><main className="main"><WorkspaceHeader/>{children}</main><QuickActions/></div>}
