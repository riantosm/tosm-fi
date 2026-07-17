import { useTranslation } from "react-i18next";
import { HiOutlineListBullet, HiOutlineSquares2X2 } from "react-icons/hi2";
import { Tooltip } from "@/components/atoms/Tooltip";
import type { WalletViewMode } from "@/hooks/use-wallet-view-mode";
import { cn } from "@/utils/cn";

interface ViewModeToggleProps {
  value: WalletViewMode;
  onChange: (mode: WalletViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const { t } = useTranslation();
  const isList = value === "list";

  return (
    <Tooltip content={t("wallet.toggleViewMode")}>
      <button
        type="button"
        onClick={() => onChange(isList ? "grid" : "list")}
        aria-label={t("wallet.toggleViewMode")}
        className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-ink-200 bg-ink-100 transition-colors dark:border-ink-700 dark:bg-ink-800"
      >
        <span
          className={cn(
            "absolute left-1 h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-ink-900",
            isList && "translate-x-7",
          )}
        />
        <span className="relative z-10 flex flex-1 items-center justify-center">
          <HiOutlineSquares2X2
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isList ? "text-ink-400 dark:text-ink-500" : "text-primary-600",
            )}
          />
        </span>
        <span className="relative z-10 flex flex-1 items-center justify-center">
          <HiOutlineListBullet
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isList ? "text-primary-400" : "text-ink-400 dark:text-ink-500",
            )}
          />
        </span>
      </button>
    </Tooltip>
  );
}
