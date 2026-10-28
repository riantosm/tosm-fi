// Midtrans Snap popup. The script is loaded on first use with the client key
// the backend returns from checkout, so the frontend needs no Midtrans env.

export interface SnapResult {
  order_id?: string;
  transaction_status?: string;
}

interface SnapCallbacks {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, callbacks: SnapCallbacks) => void;
}

declare global {
  interface Window {
    snap?: Snap;
  }
}

let loading: Promise<Snap> | null = null;
let loadedSrc: string | null = null;

function loadSnap(clientKey: string, isProduction: boolean): Promise<Snap> {
  const src = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
  if (loading && loadedSrc === src) return loading;

  loadedSrc = src;
  loading = new Promise<Snap>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.clientKey = clientKey;
    script.onload = () =>
      window.snap ? resolve(window.snap) : reject(new Error("Snap unavailable"));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Snap failed to load"));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export type SnapOutcome = "success" | "pending" | "error" | "closed";

/** Opens the Snap popup and resolves once the user finishes or closes it. */
export async function paySnap(
  token: string,
  clientKey: string,
  isProduction: boolean,
): Promise<SnapOutcome> {
  const snap = await loadSnap(clientKey, isProduction);
  return new Promise((resolve) => {
    snap.pay(token, {
      onSuccess: () => resolve("success"),
      onPending: () => resolve("pending"),
      onError: () => resolve("error"),
      onClose: () => resolve("closed"),
    });
  });
}
