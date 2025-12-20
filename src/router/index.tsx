import Home from "@/components/Client/Home";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import NotFound from "@/pages/NotFound";
import ProductPage from "@/pages/ProductPage";
import UserPage from "@/pages/UserPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
const AppRouter = () => {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/user" element={<UserPage />} />
                <Route path="/dashboard/products" element={<ProductPage />} />
            </Route>

            <Route path="/homepage" element={<Home />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRouter