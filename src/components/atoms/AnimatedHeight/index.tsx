import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface AnimatedHeightProps {
  children: ReactNode;
  className?: string;
}

// CSS can't transition to/from `height: auto`, so this measures the content's
// actual height via ResizeObserver and animates the wrapper to that pixel
// value instead — used wherever a layout toggle (e.g. carousel <-> grid)
// changes how tall its content is.
export function AnimatedHeight({ children, className }: AnimatedHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    setHeight(el.getBoundingClientRect().height);

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("overflow-hidden transition-[height] duration-300 ease-in-out", className)}
      style={{ height }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
