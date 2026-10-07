import { useTranslation } from "react-i18next";
import { LogoMark } from "@/components/atoms/LogoMark";
import { cn } from "@/utils/cn";

interface LoadingScreenProps {
  /** full = whole viewport (route chunks, session boot); inline = inside the app shell. */
  variant?: "full" | "inline";
  className?: string;
}

/** Brand loader: the logo inside a spinning progress ring, "TosmFi · Memuat…". */
export function LoadingScreen({ variant = "full", className }: LoadingScreenProps) {
  const { t } = useTranslation();
  const isFull = variant === "full";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-bg",
        isFull ? "h-svh" : "min-h-[50vh] flex-1 bg-transparent",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex items-center justify-center",
          isFull ? "size-[88px]" : "size-16",
        )}
      >
        <svg
          viewBox="0 0 44 44"
          className="absolute inset-0 animate-spin [animation-duration:1.1s]"
          aria-hidden="true"
        >
          <circle
            cx="22"
            cy="22"
            r="19.5"
            fill="none"
            stroke="var(--primary-soft)"
            strokeWidth="3"
          />
          <circle
            cx="22"
            cy="22"
            r="19.5"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="28 72"
          />
        </svg>
        <LogoMark size={isFull ? "md" : "sm"} className="rounded-[14px]" />
      </span>
      {isFull && (
        <span className="flex flex-col items-center gap-0.5">
          <span className="font-display text-[19px] font-semibold text-text">TosmFi</span>
          <span className="text-[13px] text-text-3">{t("common.loading")}</span>
        </span>
      )}
    </div>
  );
}
