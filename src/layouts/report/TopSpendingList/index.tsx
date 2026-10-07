import { useTranslation } from "react-i18next";
import { LuTrophy } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import type { TopSpendingItem } from "@/types/report.types";

/** Gold / silver / bronze trophies for the top three; plain numbers after. */
const MEDAL_CLASS: Record<number, string> = {
  1: "bg-investment text-white",
  2: "bg-text-3/45 text-white",
  3: "bg-[color-mix(in_oklab,var(--expense),var(--investment-text)_35%)] text-white",
};

function RankBadge({ rank }: { rank: number }) {
  const medalClass = MEDAL_CLASS[rank];
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular",
        medalClass ?? "bg-surface-2 text-text-3",
      )}
    >
      {medalClass ? <LuTrophy className="size-4" /> : rank}
    </span>
  );
}

interface TopSpendingListProps {
  items: TopSpendingItem[];
  /** "LAPORAN · TERBESAR" */
  eyebrow: string;
  isLoading?: boolean;
  className?: string;
}

export function TopSpendingList({
  items,
  eyebrow,
  isLoading = false,
  className,
}: TopSpendingListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatNumber } = useMoneyFormat();
  const locale = toIntlLocale(language);
  const isInitialLoading = isLoading && items.length === 0;

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <Card className={cn("flex flex-col gap-4 lg:gap-[18px]", className)}>
      <SectionHead eyebrow={eyebrow} title={t("reports.topSpending.title")} />

      {isInitialLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-3/5 rounded-full" />
                <Skeleton className="h-3 w-2/5 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<LuTrophy />} title={t("reports.topSpending.empty")} className="flex-1" />
      ) : (
        <div
          className={cn(
            "flex flex-col gap-1 transition-opacity duration-300",
            isLoading && "opacity-60",
          )}
        >
          {items.map((item) => (
            <div
              key={item.idTransaction}
              className="flex animate-fade-in items-center gap-3 py-1.5"
            >
              <RankBadge rank={item.rank} />
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="truncate text-[14px] font-semibold text-text">{item.title}</span>
                <span className="truncate text-[12px] text-text-3">
                  {formatDate(item.date)} ·{" "}
                  {item.subCategoryName
                    ? `${item.categoryName} · ${item.subCategoryName}`
                    : item.categoryName}
                </span>
              </span>
              <span className="shrink-0 font-num text-[14px] font-semibold text-expense-text tabular">
                −{formatNumber(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
