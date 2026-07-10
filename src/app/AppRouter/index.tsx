import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/app/pages/LoginPage";
import { DashboardPage } from "@/app/pages/DashboardPage";
import { TransactionsPage } from "@/app/pages/TransactionsPage";
import { WalletPage } from "@/app/pages/WalletPage";
import { CategoriesPage } from "@/app/pages/CategoriesPage";
import { ReportsPage } from "@/app/pages/ReportsPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
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
      <Route
        path={ROUTES.TRANSACTIONS}
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.WALLET}
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
