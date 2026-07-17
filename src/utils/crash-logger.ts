// Single place all crash logging funnels through, so wiring up a real
// telemetry/error-tracking backend later only means changing this file.
export function logCrash(source: string, details: Record<string, unknown>) {
  console.error(`[Crash:${source}]`, {
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...details,
  });
}
