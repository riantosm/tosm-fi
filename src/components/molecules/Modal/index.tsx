import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: ModalSize;
}

const openModalCloseHandlers: Array<() => void> = [];
let isEscapeListenerAttached = false;

function handleGlobalEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  openModalCloseHandlers[openModalCloseHandlers.length - 1]?.();
}

export function Modal({ isOpen, onClose, children, className, size = "sm" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    if (!isEscapeListenerAttached) {
      document.addEventListener("keydown", handleGlobalEscape);
      isEscapeListenerAttached = true;
    }

    const closeHandler = () => onClose();
    openModalCloseHandlers.push(closeHandler);

    return () => {
      const index = openModalCloseHandlers.lastIndexOf(closeHandler);
      if (index !== -1) openModalCloseHandlers.splice(index, 1);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border border-ink-200 bg-white p-6 shadow-xl dark:border-ink-800 dark:bg-ink-900",
          SIZE_CLASS[size],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
