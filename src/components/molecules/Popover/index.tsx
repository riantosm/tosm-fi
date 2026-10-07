import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { Modal } from "@/components/molecules/Modal";
import { SHEET_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  /** The button that toggles the popover (rendered in place). */
  trigger: ReactNode;
  children: ReactNode;
  /** Which edge of the trigger the panel lines up with (desktop). */
  align?: "start" | "end";
  /** Panel classes on desktop (width, padding). */
  panelClassName?: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Anchored panel under its trigger from 640px up; a bottom sheet (via Modal)
 * on phones — same content either way. Closes on outside click and Escape.
 */
export function Popover({
  isOpen,
  onClose,
  trigger,
  children,
  align = "start",
  panelClassName,
  className,
}: PopoverProps) {
  const isSheet = useMediaQuery(SHEET_QUERY);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isSheet) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSheet, onClose]);

  if (isSheet) {
    return (
      <>
        {trigger}
        <Modal isOpen={isOpen} onClose={onClose}>
          {children}
        </Modal>
      </>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ transformOrigin: align === "end" ? "top right" : "top left" }}
            className={cn(
              "absolute top-full z-40 mt-2 rounded-[22px] border border-border bg-surface p-2 shadow-pop",
              align === "end" ? "right-0" : "left-0",
              panelClassName,
            )}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
