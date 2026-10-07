import { useNavigate } from "react-router-dom";
import { LogoMark } from "@/components/atoms/LogoMark";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  /** Wordmark color — `hero` sits on the gradient hero/auth panel. */
  tone?: "default" | "hero";
}

export function Logo({ className, tone = "default" }: LogoProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.DASHBOARD)}
      className={cn("pressable flex items-center gap-2.5 rounded-full", className)}
    >
      <LogoMark size="sm" />
      <span
        className={cn(
          "font-display text-[19px] font-semibold tracking-[-0.01em]",
          tone === "hero" ? "text-hero-fg" : "text-text",
        )}
      >
        TosmFi
      </span>
    </button>
  );
}
