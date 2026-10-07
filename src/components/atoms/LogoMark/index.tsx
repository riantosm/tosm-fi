import { LuSprout } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface LogoMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  xs: "size-5 [&_svg]:size-[11px]",
  sm: "size-8 [&_svg]:size-4",
  md: "size-[42px] [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-7",
};

/** Brand mark — solid primary circle with a sprout. */
export function LogoMark({ size = "sm", className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg",
        SIZE_CLASS[size],
        className,
      )}
    >
      <LuSprout />
    </span>
  );
}
