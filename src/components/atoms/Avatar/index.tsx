import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/initials";

interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const SIZE_CLASS = {
  sm: "size-8 text-[11px]",
  md: "size-10 text-[13px]",
  lg: "size-14 text-[18px]",
  xl: "size-24 text-[32px]",
};

export function Avatar({ name, size = "md", className, ring = false }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary-soft font-display font-semibold text-primary-text",
        ring && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
        SIZE_CLASS[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
