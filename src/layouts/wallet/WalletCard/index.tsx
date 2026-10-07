import { useTranslation } from "react-i18next";
import { LuChevronRight, LuPencil } from "react-icons/lu";
import { Badge } from "@/components/atoms/Badge";
import { WalletAmount } from "@/layouts/wallet/WalletAmount";
import { WalletShareTrack } from "@/layouts/wallet/WalletShareTrack";
import { WalletTile } from "@/layouts/wallet/WalletTile";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface WalletCardProps {
  wallet: WalletAccount;
  /** Share of the total balance, 0–100. */
  share: number;
  /** card = grid tile · row = list view row (inside a Card). */
  variant?: "card" | "row";
  onClick: () => void;
}

export function WalletCard({ wallet, share, variant = "card", onClick }: WalletCardProps) {
  const { t } = useTranslation();
  const { format, formatNumber } = useMoneyFormat();
  const pct = Math.round(share);
  const transactionLabel = t("wallet.transactionCount", { n: wallet.transactionCount });

  const primaryBadge = wallet.isPrimary && <Badge tone="primary">{t("wallet.primary")}</Badge>;

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group -mx-2 flex items-center gap-3 rounded-control px-2 py-3.5 text-left transition-colors hover:bg-surface-2/70 sm:-mx-3 sm:gap-3.5 sm:px-3"
      >
        <WalletTile
          color={wallet.color}
          className="size-[38px] rounded-[12px] transition-transform duration-300 group-hover:scale-105 sm:size-10"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:w-[200px] md:flex-none lg:w-[260px]">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-text">
              {wallet.nameWallet}
            </span>
            {primaryBadge}
          </span>
          <span className="truncate text-[12px] text-text-3 sm:text-[12.5px]">
            {transactionLabel}
            <span className="md:hidden"> · {pct}%</span>
          </span>
        </span>

        <span className="hidden min-w-0 flex-1 items-center gap-2.5 md:flex">
          <WalletShareTrack share={share} color={wallet.color} />
          <span className="w-10 shrink-0 text-right text-[12.5px] text-text-3 tabular">{pct}%</span>
        </span>

        <span className="shrink-0 text-right font-num text-[14px] font-semibold text-text tabular sm:hidden">
          {formatNumber(wallet.balance)}
        </span>
        <span className="hidden min-w-0 max-w-[45%] truncate text-right font-num text-[16px] font-semibold text-text tabular sm:block md:max-w-none lg:w-[180px]">
          {format(wallet.balance)}
        </span>
        <LuChevronRight className="hidden size-[18px] shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5 sm:block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "lift group flex h-full w-full flex-col gap-3.5 rounded-card border-[1.5px] bg-surface p-5 text-left shadow-card sm:gap-[18px] lg:p-6",
        wallet.isPrimary ? "border-primary" : "border-transparent",
      )}
    >
      <span className="flex w-full items-center gap-3">
        <WalletTile
          color={wallet.color}
          className="size-10 rounded-[12px] transition-transform duration-300 group-hover:scale-105 sm:size-11 sm:rounded-[14px]"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-text sm:text-[16px]">
              {wallet.nameWallet}
            </span>
            {primaryBadge}
          </span>
          <span className="truncate text-[12px] text-text-3 sm:text-[12.5px]">
            {transactionLabel}
          </span>
        </span>
        <span className="shrink-0 text-[12.5px] text-text-3 tabular sm:hidden">{pct}%</span>
        <LuPencil className="hidden size-4 shrink-0 text-text-3 transition-colors group-hover:text-text sm:block" />
      </span>

      <WalletAmount
        value={wallet.balance}
        className="w-full gap-1.5 sm:gap-2"
        currencyClassName="text-[13px] text-text-3 sm:text-[15px]"
        numberClassName="text-[24px] tracking-[-0.02em] text-text sm:text-[28px]"
      />

      <span className="hidden w-full items-center gap-2.5 sm:flex">
        <WalletShareTrack share={share} color={wallet.color} />
        <span className="shrink-0 text-[12px] text-text-3">
          {t("wallet.shareOfTotal", { pct })}
        </span>
      </span>
    </button>
  );
}
