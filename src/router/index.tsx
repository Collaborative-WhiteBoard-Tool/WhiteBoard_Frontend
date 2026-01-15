import Home from "@/pages/Client/Home";
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import ListBoard from "@/pages/dashboard/layout/AllBoard";
import DashboardLayout from "@/pages/dashboard/layout/DashboardLayout";

import NotFound from "@/pages/NotFound";
import ProductPage from "@/pages/dashboard/layout/ProductPage";
import UserPage from "@/pages/dashboard/layout/UserPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { WhiteboardPage } from "@/pages/whiteboard/whiteboardPage";

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard/user" element={<UserPage />} />
                <Route path="/dashboard/products" element={<ProductPage />} />
                <Route path="/dashboard/listboard" element={<ListBoard />} />
            </Route>
            <Route path="/whiteboard/:id" element={<WhiteboardPage />} />
            <Route path="/homepage" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRouter