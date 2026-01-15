import { Outlet } from "react-router-dom"
import HeaderDashboard from "../Header"
import SidebarDashboard from "../Sidebar"
import { SidebarProvider } from "../../../components/ui/sidebar"

const DashboardLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-700">
            <HeaderDashboard />
            <SidebarProvider>
                <div className="flex flex-1 ">
                    <div className=" w-64 p-2"><SidebarDashboard /></div>
                    <div className="flex-1">
                        <main >
                            <Outlet />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    )
}
export default DashboardLayout