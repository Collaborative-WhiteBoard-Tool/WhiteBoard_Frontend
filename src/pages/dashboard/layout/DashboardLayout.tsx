import { Outlet } from "react-router-dom"
import HeaderDashboard from "../Header"
import SidebarDashboard from "../Sidebar"
import { SidebarProvider } from "../../../components/ui/sidebar"

const DashboardLayout = () => {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
            {/* Fixed Header */}
            <HeaderDashboard />
            
            <SidebarProvider>
                <div className="flex flex-1 overflow-hidden">
                    {/* Fixed Sidebar */}
                    <div className="w-64 flex-shrink-0 overflow-y-auto">
                        <SidebarDashboard />
                    </div>
                    
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        <main>
                            <Outlet />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default DashboardLayout