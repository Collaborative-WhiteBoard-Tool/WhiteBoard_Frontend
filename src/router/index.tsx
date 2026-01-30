import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/AuthStore";

import Home from "@/pages/Client/Home";
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import ListBoard from "@/pages/dashboard/layout/AllBoard";
import DashboardLayout from "@/pages/dashboard/layout/DashboardLayout";
import NotFound from "@/pages/NotFound";
import ProductPage from "@/pages/dashboard/layout/ProductPage";
import UserPage from "@/pages/dashboard/layout/UserPage";
import { WhiteboardPage } from "@/pages/whiteboard/whiteboardPage";
import { GoogleSuccessPage } from "@/pages/auth/GoogleSuccessPage";

// ✅ Thành phần bảo vệ route: Nếu chưa login thì đá ra trang login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// ✅ Ngăn chặn vào lại Login/Register khi đã đăng nhập
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // Nếu đã login rồi thì cho thẳng vào dashboard thay vì xem form login
    if (isAuthenticated) return <Navigate to="/dashboard/listboard" replace />;
    return <>{children}</>;
};

const AppRouter = () => {
    return (
        <Routes>
            {/* 2. Public Routes: Ai cũng xem được */}
            <Route path="/homepage" element={<Home />} />
            {/* 1. Mặc định: Truy cập vào domain chính sẽ ra Homepage thay vì Dashboard */}
            <Route path="/" element={<Navigate to="/homepage" replace />} />


            {/* 3. Dashboard Routes (Được bảo vệ bằng ProtectedRoute) */}
            <Route element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard/user" element={<UserPage />} />
                <Route path="/dashboard/products" element={<ProductPage />} />
                <Route path="/dashboard/listboard" element={<ListBoard />} />
            </Route>

            {/* 4. Whiteboard (Yêu cầu đăng nhập) */}
            <Route path="/whiteboard/:id" element={
                <ProtectedRoute>
                    <WhiteboardPage />
                </ProtectedRoute>
            } />

            {/* 5. Auth Routes (Public nhưng có kiểm tra nếu đã login thì bypass) */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/auth/google/success" element={<PublicRoute><GoogleSuccessPage /></PublicRoute>} />

            {/* 6. Trang lỗi 404 */}
            <Route path="/*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;