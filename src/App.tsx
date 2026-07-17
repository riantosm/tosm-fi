import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AppRouter } from "@/app/AppRouter";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { IconLoader } from "@/components/atoms/IconLoader";
import { ThemeProvider } from "@/hooks/use-theme";
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog";
import { ToastProvider } from "@/hooks/use-toast";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { store, persistor } from "@/redux";

function AppShell() {
  const { isChecking } = useSessionBootstrap();

  if (isChecking) {
    return (
      <div className="flex h-svh items-center justify-center bg-ink-50 dark:bg-ink-950">
        <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <AppShell />
            </ConfirmDialogProvider>
          </ToastProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
