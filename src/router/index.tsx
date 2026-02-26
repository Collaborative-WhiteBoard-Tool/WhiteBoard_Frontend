import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/AuthStore";

import Home from "@/pages/Client/Home";
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import ListBoard from "@/pages/dashboard/layout/AllBoard";
import DashboardLayout from "@/pages/dashboard/layout/DashboardLayout";
import NotFound from "@/pages/NotFound";
import ProductPage from "@/pages/dashboard/layout/ProductPage";
import OwnerPage from "@/pages/dashboard/layout/OwnerPage";
import TrashPage from "@/pages/dashboard/layout/TrashPage";
import { WhiteboardPage } from "@/pages/whiteboard/whiteboardPage";
import { GoogleSuccessPage } from "@/pages/auth/GoogleSuccessPage";
import SharedPage from "@/pages/dashboard/layout/SharePage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard/listboard" replace />;
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/homepage" element={<Home />} />
      <Route path="/" element={<Navigate to="/homepage" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/owned" element={<OwnerPage />} />
        <Route path="/dashboard/shared" element={<SharedPage />} />
        <Route path="/dashboard/products" element={<ProductPage />} />
        <Route path="/dashboard/listboard" element={<ListBoard />} />
        <Route path="/dashboard/trash" element={<TrashPage />} />
      </Route>

      <Route
        path="/whiteboard/:id"
        element={
          <ProtectedRoute>
            <WhiteboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/google/success"
        element={
          <PublicRoute>
            <GoogleSuccessPage />
          </PublicRoute>
        }
      />

      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
