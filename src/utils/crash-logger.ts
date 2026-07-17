import { clientErrorService } from "@/services/client-error.service";

// Single place all crash logging funnels through — console.error for local
// debugging, plus a best-effort report to the backend so an admin can see
// crashes that happened on someone else's machine (the whole point of this:
// intermittent crashes that don't reproduce when you try again yourself).
export function logCrash(source: string, details: Record<string, unknown>) {
  const path = window.location.pathname;
  const timestamp = new Date().toISOString();

  console.error(`[Crash:${source}]`, { path, timestamp, ...details });

  const { message, stack, ...extra } = details;

  void clientErrorService
    .reportError({
      source,
      message: typeof message === "string" ? message : "Unknown error",
      stack: typeof stack === "string" ? stack : undefined,
      path,
      userAgent: navigator.userAgent,
      extra: Object.keys(extra).length > 0 ? extra : undefined,
    })
    .catch(() => {
      // Reporting the crash must never itself throw — if the network/API is
      // down, the console.error above is the only record, which is fine.
    });
}
