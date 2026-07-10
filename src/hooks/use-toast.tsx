import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Toast } from "@/components/molecules/Toast";
import type { ToastItem, ToastVariant } from "@/types/toast.types";

const TOAST_DURATION_MS = 2500;

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-[60] flex flex-col items-end gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} variant={toast.variant} message={toast.message} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return context;
}
