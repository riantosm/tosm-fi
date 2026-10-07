import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

const SHOW_DELAY_MS = 100;
const VIEWPORT_MARGIN = 8;

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  wrapperClassName?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function Tooltip({ content, children, side = "top", wrapperClassName }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timeoutRef.current = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
  }

  function hide() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setPosition(null);
  }

  // Runs before paint once the bubble mounts (hidden) so we can measure it and
  // flip to whichever side actually has room — avoids the tooltip getting cut
  // off by a scrollable modal or the top edge of the viewport.
  useLayoutEffect(() => {
    if (!isVisible) return;
    const trigger = wrapperRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const triggerRect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    const fitsAbove = triggerRect.top >= bubbleRect.height + VIEWPORT_MARGIN * 2;
    const fitsBelow =
      window.innerHeight - triggerRect.bottom >= bubbleRect.height + VIEWPORT_MARGIN * 2;
    const resolvedSide =
      side === "top"
        ? fitsAbove
          ? "top"
          : fitsBelow
            ? "bottom"
            : "top"
        : fitsBelow
          ? "bottom"
          : fitsAbove
            ? "top"
            : "bottom";

    const top =
      resolvedSide === "top"
        ? triggerRect.top - bubbleRect.height - VIEWPORT_MARGIN
        : triggerRect.bottom + VIEWPORT_MARGIN;

    const left = Math.min(
      Math.max(triggerRect.left + triggerRect.width / 2 - bubbleRect.width / 2, VIEWPORT_MARGIN),
      window.innerWidth - bubbleRect.width - VIEWPORT_MARGIN,
    );

    setPosition({ top, left });
  }, [isVisible, side]);

  if (!content) return <>{children}</>;

  return (
    <span
      ref={wrapperRef}
      className={cn("relative inline-flex", wrapperClassName)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={bubbleRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? "visible" : "hidden",
            }}
            className="pointer-events-none z-[70] whitespace-nowrap rounded-[10px] bg-text px-2.5 py-1.5 text-[12px] font-semibold text-surface shadow-float animate-scale-in"
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
