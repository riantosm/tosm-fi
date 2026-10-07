import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type CardPadding = "none" | "sm" | "md";
export type CardTone = "surface" | "soft" | "hero";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** md = design card padding (20 on phones, 24 from lg). */
  padding?: CardPadding;
  tone?: CardTone;
  /** Hover lift + pointer — for cards that are clickable as a whole. */
  interactive?: boolean;
  children?: ReactNode;
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 lg:p-6",
};

const TONE_CLASS: Record<CardTone, string> = {
  surface: "bg-surface shadow-card",
  soft: "bg-surface-2",
  hero: "bg-gradient-to-br from-hero-bg to-hero-bg-2 text-hero-fg",
};

export function Card({
  as: Tag = "section",
  padding = "md",
  tone = "surface",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card",
        TONE_CLASS[tone],
        PADDING_CLASS[padding],
        interactive ? "lift cursor-pointer" : "transition-shadow duration-300",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
