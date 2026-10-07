import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LuCloudAlert, LuRefreshCw, LuRotateCw } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import i18n from "@/helpers/i18n";
import { logCrash } from "@/utils/crash-logger";

interface ErrorBoundaryImplProps {
  children: ReactNode;
  resetKey: string;
}

interface ErrorBoundaryImplState {
  error: Error | null;
}

// A lazy-loaded route's chunk can 404 when the tab was left open across a
// deploy that changed asset hashes. One silent reload per tab session fixes
// this (the fresh index.html points at the new chunk); if it still fails
// after that, it's a real crash, not a stale cache, so fall through to the
// normal fallback UI instead of reloading forever.
const CHUNK_RELOAD_KEY = "tosmfi:chunk-reload-attempted";

function isStaleChunkError(error: Error): boolean {
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i.test(
    error.message,
  );
}

// A single long-lived instance (never remounted) — only its `error` state
// toggles. Remounting the whole Suspense/Routes tree on every navigation
// (e.g. via a `key={pathname}` on this component) would force every route's
// lazy chunk through Suspense's fallback again on every page change, which
// showed up as an unwanted full-screen loading flash that wasn't there
// before this boundary existed.
class ErrorBoundaryImpl extends Component<ErrorBoundaryImplProps, ErrorBoundaryImplState> {
  state: ErrorBoundaryImplState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryImplState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logCrash("render", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    if (isStaleChunkError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryImplProps) {
    // Navigating away from a crashed page clears the error (without a full
    // remount) so the user isn't stuck on the fallback screen.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-bg px-4">
          <div className="flex w-full max-w-[480px] animate-fade-up flex-col items-center gap-4 rounded-[28px] bg-surface px-6 py-9 text-center shadow-pop sm:px-10">
            <span className="flex size-[88px] items-center justify-center rounded-full bg-expense-soft">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-surface text-expense-text shadow-card">
                <LuCloudAlert className="size-[22px]" />
              </span>
            </span>
            <h1 className="mt-1 font-display text-[22px] font-semibold text-text sm:text-[24px]">
              {i18n.t("errorBoundary.title")}
            </h1>
            <p className="max-w-[400px] text-[13.5px] leading-relaxed text-text-2">
              {i18n.t("errorBoundary.description")}
            </p>
            <div className="mt-2 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Button leftIcon={<LuRefreshCw />} onClick={() => this.setState({ error: null })}>
                {i18n.t("errorBoundary.retryButton")}
              </Button>
              <Button
                variant="outline"
                leftIcon={<LuRotateCw />}
                onClick={() => window.location.reload()}
              >
                {i18n.t("errorBoundary.reloadButton")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundaryImpl resetKey={location.pathname}>{children}</ErrorBoundaryImpl>;
}
