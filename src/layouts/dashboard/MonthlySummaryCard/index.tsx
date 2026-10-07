import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { m } from "motion/react";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { SectionHead } from "@/components/molecules/SectionHead";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { toIntlLocale } from "@/utils/locale";
import type { DashboardSummary } from "@/types/report.types";
import { cn } from "@/utils/cn";

interface MonthlySummaryCardProps {
  summary: DashboardSummary | null;
  transactionCount: number;
  isLoading: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_BAR_HEIGHT = 150;
const MIN_BAR_HEIGHT = 6;

interface Column {
  key: string;
  label: string;
  value: number;
  barClassName: string;
  valueClassName: string;
  onClick: () => void;
}

/** "Ringkasan · <bulan>" — income / expense / investment bars + this month's net. */
export function MonthlySummaryCard({
  summary,
  transactionCount,
  isLoading,
}: MonthlySummaryCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { formatCompact, formatSigned } = useMoneyFormat();

  const income = summary?.monthly.income ?? 0;
  const expense = summary?.monthly.expense ?? 0;
  const savings = summary?.monthly.savings ?? 0;
  const investmentInflow = summary?.monthly.investmentInflow ?? 0;
  const isInitialLoading = isLoading && !summary;

  const monthLabel = new Intl.DateTimeFormat(toIntlLocale(language), {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const columns: Column[] = [
    {
      key: "income",
      label: t("dashboard.income"),
      value: income,
      barClassName: "bg-income",
      valueClassName: "text-income-text",
      onClick: () => navigate(ROUTES.TRANSACTIONS, { state: { typeFilter: "income" } }),
    },
    {
      key: "expense",
      label: t("dashboard.expense"),
      value: expense,
      barClassName: "bg-expense",
      valueClassName: "text-expense-text",
      onClick: () => navigate(ROUTES.TRANSACTIONS, { state: { typeFilter: "expense" } }),
    },
    {
      key: "investment",
      label: t("nav.investment"),
      value: investmentInflow,
      barClassName: "bg-investment",
      valueClassName: "text-investment-text",
      onClick: () => navigate(ROUTES.INVESTMENT),
    },
  ];
  const max = Math.max(...columns.map((column) => Math.abs(column.value)), 1);
  const isNegative = savings < 0;

  return (
    <Card className="flex h-full flex-col gap-[18px]">
      <SectionHead
        eyebrow={t("dashboard.summaryEyebrow")}
        title={<span className="first-letter:uppercase">{monthLabel}</span>}
      />

      <div
        className={cn(
          "flex flex-col transition-opacity duration-300",
          isLoading && !isInitialLoading && "opacity-60",
        )}
      >
        <div className="flex h-[200px] items-end gap-2 border-b border-border px-1 sm:gap-5 sm:px-2">
          {columns.map((column, index) => {
            const height =
              column.value > 0
                ? Math.max(MIN_BAR_HEIGHT, (Math.abs(column.value) / max) * MAX_BAR_HEIGHT)
                : 0;
            return (
              <button
                key={column.key}
                type="button"
                onClick={column.onClick}
                aria-label={column.label}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2 rounded-t-[14px] outline-offset-4"
              >
                {isInitialLoading ? (
                  <Skeleton
                    className={cn(
                      "w-12 rounded-[12px_12px_4px_4px] sm:w-14",
                      ["h-[120px]", "h-[80px]", "h-[44px]"][index],
                    )}
                  />
                ) : (
                  <>
                    <span
                      className={cn(
                        "font-num text-[14px] font-semibold tabular",
                        column.valueClassName,
                      )}
                    >
                      {formatCompact(column.value)}
                    </span>
                    <m.span
                      className={cn(
                        "block w-12 rounded-[12px_12px_4px_4px] transition-[filter,transform] duration-200 group-hover:brightness-[1.04] group-hover:-translate-y-0.5 sm:w-14",
                        column.barClassName,
                      )}
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.7, ease: EASE, delay: index * 0.06 }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 px-1 pt-2.5 sm:gap-5 sm:px-2">
          {columns.map((column) => (
            <span
              key={column.key}
              className="min-w-0 flex-1 truncate text-center text-[12px] text-text-3"
            >
              {column.label}
            </span>
          ))}
        </div>
      </div>

      {isInitialLoading ? (
        <Skeleton className="h-11 rounded-control" />
      ) : (
        <div
          className={cn(
            "mt-auto flex items-center justify-between gap-3 rounded-control px-3.5 py-3",
            isNegative ? "bg-expense-soft text-expense-text" : "bg-income-soft text-income-text",
          )}
        >
          <span className="truncate text-[12.5px]">
            {t("dashboard.differenceFooter", { count: transactionCount })}
          </span>
          <span className="shrink-0 font-num text-[16px] font-semibold tabular">
            {formatSigned(savings)}
          </span>
        </div>
      )}
    </Card>
  );
}
