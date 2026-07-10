import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertDialog } from "@/components/molecules/AlertDialog";
import type { ConfirmOptions } from "@/types/dialog.types";

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
}

const INITIAL_STATE: DialogState = { isOpen: false, title: "" };

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, isOpen: true });
    });
  }, []);

  function resolveDialog(result: boolean) {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolverRef.current?.(result);
    resolverRef.current = null;
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        isOpen={state.isOpen}
        variant={state.variant}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        destructive={state.destructive}
        onConfirm={() => resolveDialog(true)}
        onCancel={state.cancelLabel ? () => resolveDialog(false) : undefined}
      />
    </ConfirmDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error("useConfirmDialog harus dipakai di dalam ConfirmDialogProvider");
  return context;
}
