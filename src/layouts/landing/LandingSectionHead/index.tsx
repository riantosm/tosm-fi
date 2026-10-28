import { cn } from "@/utils/cn";

interface LandingSectionHeadProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function LandingSectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: LandingSectionHeadProps) {
  return (
    <div
      className={cn(
        "flex max-w-[720px] flex-col gap-3.5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <span className="text-[12px] font-semibold tracking-[0.1em] text-primary-text uppercase">
        {eyebrow}
      </span>
      <h2 className="font-display text-[34px] leading-[1.1] font-semibold tracking-[-0.02em] text-hero-fg sm:text-[44px]">
        {title}
      </h2>
      {subtitle && <p className="text-[17px] leading-[1.55] text-text-2">{subtitle}</p>}
    </div>
  );
}
