import { useTranslation } from "react-i18next";
import { HiOutlineTrophy } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";
import type { TopSpendingItem } from "@/types/report.types";

const RANK_STYLE: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-ink-300 text-white dark:bg-ink-500",
  3: "bg-orange-400 text-white",
};

function RankBadge({ rank }: { rank: number }) {
  const medalClass = RANK_STYLE[rank];

  if (medalClass) {
    return (
      <div
        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", medalClass)}
      >
        <HiOutlineTrophy className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
      <Words type="xs/bold" as="span" className="text-ink-500 dark:text-ink-400">
        {rank}
      </Words>
    </div>
  );
}

interface TopSpendingListProps {
  items: TopSpendingItem[];
  isLoading?: boolean;
}

export function TopSpendingList({ items, isLoading = false }: TopSpendingListProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat(language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
        {t("reports.topSpending.title")}
      </Words>

      <div className="relative flex-1">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {t("reports.topSpending.empty")}
            </Words>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div
                key={item.idTransaction}
                className="flex items-center gap-3 rounded-xl px-1 py-2"
              >
                <RankBadge rank={item.rank} />
                <div className="min-w-0 flex-1">
                  <Words
                    type="sm/bold"
                    as="span"
                    className="block truncate text-ink-900 dark:text-ink-50"
                  >
                    {item.title}
                  </Words>
                  <Words
                    type="xxs/regular"
                    as="span"
                    className="block truncate text-ink-400 dark:text-ink-500"
                  >
                    {item.subCategoryName
                      ? `${item.categoryName} · ${item.subCategoryName}`
                      : item.categoryName}
                  </Words>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <Words
                    type="sm/bold"
                    as="span"
                    className="whitespace-nowrap text-ink-900 dark:text-ink-50"
                  >
                    {format(item.amount)}
                  </Words>
                  <Words type="xxs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                    {formatDate(item.date)}
                  </Words>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-8 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
