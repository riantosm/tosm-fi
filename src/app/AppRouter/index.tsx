import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IconLoader } from "@/components/atoms/IconLoader";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ROUTES } from "@/constants/routes";

const LoginPage = lazy(() =>
  import("@/app/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/app/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import("@/app/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const TransactionsPage = lazy(() =>
  import("@/app/pages/TransactionsPage").then((m) => ({ default: m.TransactionsPage })),
);
const WalletPage = lazy(() =>
  import("@/app/pages/WalletPage").then((m) => ({ default: m.WalletPage })),
);
const CategoriesPage = lazy(() =>
  import("@/app/pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
);
const InvestmentPage = lazy(() =>
  import("@/app/pages/InvestmentPage").then((m) => ({ default: m.InvestmentPage })),
);
const ReportsPage = lazy(() =>
  import("@/app/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
const EditProfilePage = lazy(() =>
  import("@/app/pages/EditProfilePage").then((m) => ({ default: m.EditProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/app/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const SettingsApiDocPage = lazy(() =>
  import("@/app/pages/SettingsApiDocPage").then((m) => ({ default: m.SettingsApiDocPage })),
);
const SettingsCurrencyPage = lazy(() =>
  import("@/app/pages/SettingsCurrencyPage").then((m) => ({ default: m.SettingsCurrencyPage })),
);
const SettingsUserApprovalPage = lazy(() =>
  import("@/app/pages/SettingsUserApprovalPage").then((m) => ({
    default: m.SettingsUserApprovalPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex h-svh items-center justify-center bg-ink-50 dark:bg-ink-950">
      <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
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
          path={ROUTES.INVESTMENT}
          element={
            <ProtectedRoute>
              <InvestmentPage />
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
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <EditProfilePage />
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
        <Route
          path={ROUTES.SETTINGS_API_DOC}
          element={
            <ProtectedRoute>
              <SettingsApiDocPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS_CURRENCY}
          element={
            <ProtectedRoute>
              <SettingsCurrencyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS_USER_APPROVAL}
          element={
            <ProtectedRoute>
              <SettingsUserApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
}
