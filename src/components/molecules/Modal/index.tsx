import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useDragControls } from "motion/react";
import { useTranslation } from "react-i18next";
import { LuArrowLeft } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { SHEET_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-[440px]",
  md: "max-w-[480px]",
  lg: "max-w-[520px]",
  xl: "max-w-[560px]",
  "2xl": "max-w-[640px]",
  "3xl": "max-w-[760px]",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: ModalSize;
  /** When set, Modal renders the standard header (title, subtitle, back, close). */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Shows a back arrow before the title (nested pickers). */
  onBack?: () => void;
  /** Extra header buttons, placed before the close button. */
  headerActions?: ReactNode;
  hideClose?: boolean;
  /** Sticky footer (action buttons). Use `form="id"` on submit buttons when the body holds a <form>. */
  footer?: ReactNode;
  bodyClassName?: string;
  /** "center" keeps a centered card on phones too (confirm dialogs); "auto" = bottom sheet below 640px. */
  placement?: "auto" | "center";
}

const openModalCloseHandlers: Array<() => void> = [];
let isEscapeListenerAttached = false;

function handleGlobalEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  openModalCloseHandlers[openModalCloseHandlers.length - 1]?.();
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Shared dialog shell. Desktop/tablet: centered dialog. Phones (<640px): bottom
 * sheet with a drag handle (drag down to dismiss), matching the HP popups in
 * the design. Enter/exit are animated; Escape closes only the top-most modal.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  className,
  size = "sm",
  title,
  subtitle,
  onBack,
  headerActions,
  hideClose = false,
  footer,
  bodyClassName,
  placement = "auto",
}: ModalProps) {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery(SHEET_QUERY);
  const isSheet = isSmallScreen && placement === "auto";
  const dragControls = useDragControls();

  // The footer gets a divider only while there is more content scrolled below it.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const measureBody = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    setHasMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 2);
  }, []);
  const setBodyRef = useCallback(
    (el: HTMLDivElement | null) => {
      bodyRef.current = el;
      if (!el) return;
      const observer = new ResizeObserver(measureBody);
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
      measureBody();
      return () => observer.disconnect();
    },
    [measureBody],
  );

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

  const hasHeader = title !== undefined;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          key="modal"
          className={cn(
            "fixed inset-0 z-50 flex",
            isSheet
              ? "items-end"
              : cn("items-center justify-center", isSmallScreen ? "p-6" : "p-4"),
          )}
        >
          <m.div
            className="absolute inset-0 bg-scrim backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            role="dialog"
            aria-modal="true"
            initial={isSheet ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 10 }}
            animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isSheet ? { y: "100%" } : { opacity: 0, scale: 0.97, y: 6 }}
            transition={
              isSheet
                ? { type: "spring", damping: 34, stiffness: 360, mass: 0.9 }
                : { duration: 0.3, ease: EASE }
            }
            drag={isSheet ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 650) onClose();
            }}
            className={cn(
              "relative flex w-full flex-col bg-surface shadow-pop",
              isSheet
                ? "max-h-[92svh] rounded-t-sheet pb-[env(safe-area-inset-bottom)]"
                : cn("max-h-[calc(100svh-2rem)] rounded-sheet", SIZE_CLASS[size]),
              className,
            )}
          >
            {isSheet && (
              <div
                onPointerDown={(event) => dragControls.start(event)}
                className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
              >
                <span className="h-[5px] w-11 rounded-full bg-border-strong" />
              </div>
            )}

            {hasHeader && (
              <div
                className={cn(
                  "flex shrink-0 items-start justify-between gap-3 px-5 pb-4 sm:px-6",
                  isSheet ? "pt-2" : "pt-6",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {onBack && (
                    <IconButton
                      label={t("common.back")}
                      icon={<LuArrowLeft />}
                      onClick={onBack}
                      size="sm"
                      tooltip={false}
                    />
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="truncate font-display text-[20px] font-semibold text-text sm:text-[21px]">
                      {title}
                    </h2>
                    {subtitle && <p className="truncate text-[13px] text-text-3">{subtitle}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {headerActions}
                  {!hideClose && <ModalCloseButton onClose={onClose} />}
                </div>
              </div>
            )}

            <div
              ref={setBodyRef}
              onScroll={measureBody}
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain",
                hasHeader
                  ? cn("px-5 sm:px-6", footer ? "pb-2" : "pb-6")
                  : cn("px-5 sm:px-6", isSheet ? "pt-2 pb-6" : "py-6"),
                bodyClassName,
              )}
            >
              {children}
            </div>

            {footer && (
              <div
                className={cn(
                  "shrink-0 border-t px-5 pt-4 pb-5 transition-colors duration-200 sm:px-6 sm:pb-6",
                  hasMoreBelow ? "border-border/70" : "border-transparent",
                )}
              >
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Two-button footer row (Batal + primary) used by most form dialogs. */
export function ModalActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-2.5 [&>*]:flex-1", className)}>{children}</div>;
}
