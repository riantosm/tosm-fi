import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { Tooltip } from "@/components/atoms/Tooltip";
import { cn } from "@/utils/cn";

interface AddInstrumentCardProps {
  onClick: () => void;
  /** "carousel" (default): fixed width for a horizontal scroll row. "grid": fills its grid cell. */
  layout?: "carousel" | "grid";
}

export function AddInstrumentCard({ onClick, layout = "carousel" }: AddInstrumentCardProps) {
  const { t } = useTranslation();

  return (
    <Tooltip
      content={t("investment.addTitle")}
      wrapperClassName={cn(
        "transition-all duration-300 ease-in-out",
        layout === "grid" ? "w-full" : "w-56 shrink-0",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={t("investment.addTitle")}
        className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
      >
        <HiOutlinePlus className="h-6 w-6" />
      </button>
    </Tooltip>
  );
}
