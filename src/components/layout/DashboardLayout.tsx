import { Outlet } from "react-router-dom"
import HeaderDashboard from "./Header"
import SidebarDashboard from "./Sidebar"

const DashboardLayout = () => {
    return (
        <>
            <HeaderDashboard></HeaderDashboard>

            <div style={{ display: 'flex' }}>
                <SidebarDashboard />
                <main style={{ padding: 20 }}>
                    <Outlet /> {/* 👈 RẤT QUAN TRỌNG */}
                </main>
            </div>
        </>
    )
}
export default DashboardLayout