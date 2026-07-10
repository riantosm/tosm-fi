import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/app/pages/LoginPage";
import { DashboardPage } from "@/app/pages/DashboardPage";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ROUTES } from "@/constants/routes";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
