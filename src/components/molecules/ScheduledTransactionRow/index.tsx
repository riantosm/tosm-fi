import { useTranslation } from "react-i18next";
import { LuCalendarClock, LuCheck, LuX } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { Category, SubCategory } from "@/types/category.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";
import type { WalletAccount } from "@/types/wallet.types";
import { toIntlLocale } from "@/utils/locale";

interface ScheduledTransactionRowProps {
  occurrence: ScheduleOccurrence;
  category: Category | undefined;
  subCategory: SubCategory | undefined;
  wallet: WalletAccount | undefined;
  onPay: () => void;
  onCancel: () => void;
}

// A pending schedule occurrence shown inline with real transactions — soft
// investment tint + "terjadwal" so it reads as not-yet-real, with its own
// Bayar/Batal actions instead of TransactionRow's click-to-edit. Phones put
// the actions on their own full-width row (design V2/TxRow scheduled).
export function ScheduledTransactionRow({
  occurrence,
  category,
  subCategory,
  wallet,
  onPay,
  onCancel,
}: ScheduledTransactionRowProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const isPositive = occurrence.type === "income";
  const title = occurrence.title || subCategory?.nameSubCategory || category?.nameCategory || "-";

  const due = new Date(occurrence.dueDate);
  const dueLabel =
    due.toDateString() === new Date().toDateString()
      ? t("schedule.dueToday")
      : t("schedule.dueOn", {
          date: due.toLocaleDateString(toIntlLocale(language), { day: "numeric", month: "short" }),
        });
  const meta = [category?.nameCategory, wallet?.nameWallet, dueLabel].filter(Boolean).join(" · ");

  // Container query: one line when the card is wide (Dashboard), actions on a
  // second line when it is narrow (Transaksi side list, phones).
  return (
    <div className="@container w-full">
      <div className="flex w-full flex-col gap-3 rounded-control bg-investment-soft px-3 py-2.5 @xl:flex-row @xl:items-center @xl:gap-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-surface text-investment-text">
            <LuCalendarClock className="size-[18px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[14px] font-semibold text-text">
              {title} · {t("schedule.scheduledBadge").toLowerCase()}
            </span>
            <span className="truncate text-[12.5px] text-text-2">{meta}</span>
          </span>
          <span className="shrink-0 font-num text-[14px] font-semibold whitespace-nowrap text-text tabular">
            {isPositive ? "+" : "−"}
            {format(occurrence.amount)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 [&>*]:flex-1 @sm:self-end @sm:[&>*]:flex-none @xl:self-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<LuX />}
            onClick={onCancel}
            className="h-8 px-3"
          >
            {t("schedule.cancelButton")}
          </Button>
          <Button
            type="button"
            size="sm"
            leftIcon={<LuCheck />}
            onClick={onPay}
            className="h-8 px-3"
          >
            {t("schedule.payButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
