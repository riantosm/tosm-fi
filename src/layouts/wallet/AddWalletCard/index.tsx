import { useTranslation } from "react-i18next";
import { LuPlus } from "react-icons/lu";

interface AddWalletCardProps {
  onClick: () => void;
  /** card = grid tile (outlined pill on phones) · row = last row of the list view. */
  variant?: "card" | "row";
}

export function AddWalletCard({ onClick, variant = "card" }: AddWalletCardProps) {
  const { t } = useTranslation();

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group -mx-2 flex items-center gap-2 rounded-control px-2 py-3.5 text-left text-[14px] font-semibold text-primary-text transition-colors hover:bg-surface-2/70 sm:-mx-3 sm:gap-3 sm:px-3 sm:py-4"
      >
        <span className="flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:size-10 sm:rounded-[12px] sm:bg-primary-soft">
          <LuPlus className="size-[17px] sm:size-[18px]" />
        </span>
        {t("wallet.addTitle")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable group flex h-full w-full items-center justify-center gap-2.5 rounded-[22px] border-[1.5px] border-border p-4 text-[14px] font-semibold text-primary-text hover:border-primary hover:bg-surface sm:min-h-[167px] sm:flex-col sm:rounded-card sm:border-dashed sm:border-border-strong sm:bg-surface/40"
    >
      <span className="flex items-center justify-center transition-transform duration-300 sm:size-12 sm:rounded-full sm:bg-primary-soft sm:group-hover:scale-110">
        <LuPlus className="size-[18px] sm:size-[22px]" />
      </span>
      {t("wallet.addTitle")}
    </button>
  );
}
