import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ROUTES } from "@/constants/routes";
import { AppLayout } from "@/components/templates/AppLayout";
import { LoadingScreen } from "@/components/molecules/LoadingScreen";

// A lazy chunk fetch can fail from a plain transient network blip, not just a
// stale deploy — retrying the same import a couple of times recovers from
// that without the disruption of a full page reload (which is still the
// ErrorBoundary's fallback if the chunk genuinely no longer exists).
function retryImport<T>(factory: () => Promise<T>, retriesLeft = 2, delayMs = 800): Promise<T> {
  return factory().catch((error) => {
    if (retriesLeft <= 0) throw error;
    return new Promise<void>((resolve) => setTimeout(resolve, delayMs)).then(() =>
      retryImport(factory, retriesLeft - 1, delayMs),
    );
  });
}

const LoginPage = lazy(() =>
  retryImport(() => import("@/app/pages/LoginPage").then((m) => ({ default: m.LoginPage }))),
);
const RegisterPage = lazy(() =>
  retryImport(() => import("@/app/pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))),
);
const DashboardPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
  ),
);
const TransactionsPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/TransactionsPage").then((m) => ({ default: m.TransactionsPage })),
  ),
);
const SchedulePage = lazy(() =>
  retryImport(() => import("@/app/pages/SchedulePage").then((m) => ({ default: m.SchedulePage }))),
);
const WalletPage = lazy(() =>
  retryImport(() => import("@/app/pages/WalletPage").then((m) => ({ default: m.WalletPage }))),
);
const CategoriesPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
  ),
);
const InvestmentPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/InvestmentPage").then((m) => ({ default: m.InvestmentPage })),
  ),
);
const BudgetsPage = lazy(() =>
  retryImport(() => import("@/app/pages/BudgetsPage").then((m) => ({ default: m.BudgetsPage }))),
);
const ReportsPage = lazy(() =>
  retryImport(() => import("@/app/pages/ReportsPage").then((m) => ({ default: m.ReportsPage }))),
);
const EditProfilePage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/EditProfilePage").then((m) => ({ default: m.EditProfilePage })),
  ),
);
const SettingsPage = lazy(() =>
  retryImport(() => import("@/app/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))),
);
const SettingsApiDocPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/SettingsApiDocPage").then((m) => ({ default: m.SettingsApiDocPage })),
  ),
);
const SettingsCurrencyPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/SettingsCurrencyPage").then((m) => ({ default: m.SettingsCurrencyPage })),
  ),
);
const SettingsUserApprovalPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/SettingsUserApprovalPage").then((m) => ({
      default: m.SettingsUserApprovalPage,
    })),
  ),
);
const SettingsErrorLogPage = lazy(() =>
  retryImport(() =>
    import("@/app/pages/SettingsErrorLogPage").then((m) => ({
      default: m.SettingsErrorLogPage,
    })),
  ),
);

function RouteFallback() {
  return <LoadingScreen />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path={ROUTES.SCHEDULE} element={<SchedulePage />} />
          <Route path={ROUTES.WALLET} element={<WalletPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.INVESTMENT} element={<InvestmentPage />} />
          <Route path={ROUTES.BUDGETS} element={<BudgetsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.PROFILE} element={<EditProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.SETTINGS_API_DOC} element={<SettingsApiDocPage />} />
          <Route path={ROUTES.SETTINGS_CURRENCY} element={<SettingsCurrencyPage />} />
          <Route path={ROUTES.SETTINGS_USER_APPROVAL} element={<SettingsUserApprovalPage />} />
          <Route path={ROUTES.SETTINGS_ERROR_LOG} element={<SettingsErrorLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
}
