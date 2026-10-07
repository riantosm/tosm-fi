import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder block — size it with className (h-*, w-*, rounded-*). */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("skeleton rounded-control", className)} />;
}
