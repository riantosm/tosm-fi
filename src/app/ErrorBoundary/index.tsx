import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import i18n from "@/helpers/i18n";
import { logCrash } from "@/utils/crash-logger";

interface ErrorBoundaryImplProps {
  children: ReactNode;
  resetKey: string;
}

interface ErrorBoundaryImplState {
  error: Error | null;
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
        <div className="flex h-svh flex-col items-center justify-center gap-4 bg-ink-50 px-6 text-center dark:bg-ink-950">
          <Words type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {i18n.t("errorBoundary.title")}
          </Words>
          <Words type="sm/regular" className="max-w-sm text-ink-500 dark:text-ink-400">
            {i18n.t("errorBoundary.description")}
          </Words>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => this.setState({ error: null })}>
              {i18n.t("errorBoundary.retryButton")}
            </Button>
            <Button variant="primary" onClick={() => window.location.reload()}>
              {i18n.t("errorBoundary.reloadButton")}
            </Button>
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
