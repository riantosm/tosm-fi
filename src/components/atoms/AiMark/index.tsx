import { LuSparkles } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface AiMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  xs: "size-7 [&_svg]:size-3.5",
  sm: "size-9 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-[18px]",
  lg: "size-12 [&_svg]:size-[22px]",
};

/** The AI identity: solid primary circle + white sparkles (used everywhere Catat Cepat appears). */
export function AiMark({ size = "md", className }: AiMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg",
        SIZE_CLASS[size],
        className,
      )}
    >
      <LuSparkles />
    </span>
  );
}
