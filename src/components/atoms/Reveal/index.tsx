import type { ReactNode } from "react";
import { m } from "motion/react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds (e.g. index * 0.05). */
  delay?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
  as?: "div" | "section" | "li";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades + lifts its content in the first time it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
  as = "div",
}: RevealProps) {
  const Comp = m[as];
  const target = { opacity: 1, y: 0 };

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 14 }}
      {...(immediate
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, margin: "-40px 0px" } })}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}
