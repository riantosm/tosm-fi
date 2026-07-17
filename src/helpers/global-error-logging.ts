import { logCrash } from "@/utils/crash-logger";

// Covers the two crash classes an ErrorBoundary can never catch: errors
// thrown outside React's render/lifecycle (event handlers, timers) and
// rejected promises nobody awaited/caught. Neither can be recovered from
// with a fallback UI — this only ensures they're logged instead of silently
// vanishing, which is what made the intermittent crashes hard to diagnose.
export function setupGlobalErrorLogging() {
  window.addEventListener("error", (event) => {
    logCrash("window.onerror", {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error instanceof Error ? event.error.stack : undefined,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    logCrash("unhandledrejection", {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
