import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LuArrowDownLeft, LuArrowUpRight, LuEqual } from "react-icons/lu";
import { ROUTES } from "@/constants/routes";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";

interface TransactionSummaryBarProps {
  expense: number;
  income: number;
}

interface Cell {
  key: string;
  label: string;
  shortLabel: string;
  value: string;
  compact: string;
  valueClassName: string;
  icon: ReactNode;
  iconClassName: string;
}

/** Keluar / Masuk / Selisih for the current filter (desktop strip, phone tiles). */
export function TransactionSummaryBar({ expense, income }: TransactionSummaryBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatNumber, formatCompact, formatSigned } = useMoneyFormat();
  const net = income - expense;
  const signedCompact = (value: number) =>
    `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatCompact(Math.abs(value))}`;

  const cells: Cell[] = [
    {
      key: "expense",
      label: t("transaction.summaryExpense"),
      shortLabel: t("transaction.summaryExpenseShort"),
      value: expense > 0 ? `−${formatNumber(expense)}` : formatNumber(0),
      compact: signedCompact(-expense),
      valueClassName: "text-expense-text",
      icon: <LuArrowUpRight />,
      iconClassName: "bg-expense-soft text-expense-text",
    },
    {
      key: "income",
      label: t("transaction.summaryIncome"),
      shortLabel: t("transaction.summaryIncomeShort"),
      value: income > 0 ? `+${formatNumber(income)}` : formatNumber(0),
      compact: signedCompact(income),
      valueClassName: "text-income-text",
      icon: <LuArrowDownLeft />,
      iconClassName: "bg-income-soft text-income-text",
    },
    {
      key: "net",
      label: t("transaction.summaryNet"),
      shortLabel: t("transaction.summaryNet"),
      value: formatSigned(net),
      compact: signedCompact(net),
      valueClassName: net < 0 ? "text-expense-text" : "text-primary-text",
      icon: <LuEqual />,
      iconClassName: "bg-primary-soft text-primary-text",
    },
  ];

  return (
    <>
      {/* Phone / tablet: three compact tiles */}
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        {cells.map((cell) => (
          <button
            key={cell.key}
            type="button"
            onClick={() => navigate(ROUTES.REPORTS)}
            className="pressable flex min-w-0 flex-col gap-0.5 rounded-control bg-surface px-3 py-2.5 text-left shadow-card"
          >
            <span className="truncate text-[12px] text-text-3">{cell.shortLabel}</span>
            <span
              key={cell.compact}
              className={cn(
                "animate-fade-in truncate font-num text-[16px] font-semibold tabular",
                cell.valueClassName,
              )}
            >
              {cell.compact}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: one strip with dividers */}
      <div className="hidden overflow-hidden rounded-card bg-surface shadow-card lg:grid lg:grid-cols-3">
        {cells.map((cell, index) => (
          <div
            key={cell.key}
            className={cn(
              "flex min-w-0 items-center gap-3 px-5 py-4",
              index > 0 && "border-l border-border",
            )}
          >
            <span
              className={cn(
                "flex size-[38px] shrink-0 items-center justify-center rounded-full [&_svg]:size-[17px]",
                cell.iconClassName,
              )}
            >
              {cell.icon}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="truncate text-[12.5px] text-text-3">{cell.label}</span>
              <span
                key={cell.value}
                className={cn(
                  "animate-fade-in truncate font-num text-[19px] font-semibold tabular",
                  cell.valueClassName,
                )}
              >
                {cell.value}
              </span>
            </span>
            {cell.key === "net" && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.REPORTS)}
                className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
              >
                {t("transaction.reportsLink")}
                <LuArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
