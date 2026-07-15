import { useTranslation } from "react-i18next";
import { HiOutlineArrowTrendingUp, HiOutlineBanknotes, HiOutlinePencil } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import type { InvestmentAccount } from "@/types/instrument.types";
import { cn } from "@/utils/cn";

interface InvestmentAccountCardProps {
  account: InvestmentAccount;
  instrumentName: string;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onWithdraw: () => void;
  onProfitLoss: () => void;
}

export function InvestmentAccountCard({
  account,
  instrumentName,
  color,
  isSelected,
  onSelect,
  onEdit,
  onWithdraw,
  onProfitLoss,
}: InvestmentAccountCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border bg-white dark:bg-ink-900",
        isSelected ? "" : "border-ink-200 dark:border-ink-800",
      )}
      style={isSelected ? { borderColor: color } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 text-left  h-full p-4"
        >
          <Words type="base/bold" className="truncate text-ink-900 dark:text-ink-50">
            {account.nameInvestmentAccount}
          </Words>
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {instrumentName}
          </Words>
          <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {format(account.currentValue)}
          </Words>
        </button>

        <div className="flex shrink-0 flex-col items-center gap-1 p-4 pl-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label={t("investment.editAccountTitle")}
            title={t("investment.editAccountTitle")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onWithdraw}
            aria-label={t("investment.withdrawalTitle")}
            title={t("investment.withdrawalTitle")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300"
          >
            <HiOutlineBanknotes className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onProfitLoss}
            aria-label={t("investment.profitLossTitle")}
            title={t("investment.profitLossTitle")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300"
          >
            <HiOutlineArrowTrendingUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
