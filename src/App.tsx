import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LazyMotion, MotionConfig, domMax } from "motion/react";
import { AppRouter } from "@/app/AppRouter";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { IconLoader } from "@/components/atoms/IconLoader";
import { LogoMark } from "@/components/atoms/LogoMark";
import { ThemeProvider } from "@/hooks/use-theme";
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog";
import { ToastProvider } from "@/hooks/use-toast";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { store, persistor } from "@/redux";

/** Full-screen loading state (session check) — design 13 · Loading global. */
function GlobalLoading() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-5 bg-bg">
      <div className="relative flex size-[88px] items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[5px] border-primary-soft" />
        <span className="absolute inset-0 animate-spin rounded-full border-[5px] border-transparent border-t-primary [animation-duration:1.1s]" />
        <LogoMark size="md" />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-display text-[20px] font-semibold text-text">TosmFi</span>
        <IconLoader className="sr-only" />
      </div>
    </div>
  );
}

function AppShell() {
  const { isChecking } = useSessionBootstrap();

  if (isChecking) return <GlobalLoading />;

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
          <LazyMotion features={domMax} strict>
            <MotionConfig reducedMotion="user">
              <ToastProvider>
                <ConfirmDialogProvider>
                  <AppShell />
                </ConfirmDialogProvider>
              </ToastProvider>
            </MotionConfig>
          </LazyMotion>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
