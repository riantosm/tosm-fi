import { useTranslation } from "react-i18next";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import type { CashFlowPoint } from "@/types/report.types";

const INCOME_COLOR = "#23ac82";
const EXPENSE_COLOR = "#ef4444";

interface CashFlowChartProps {
  data: CashFlowPoint[];
  periodLabel: string;
}

export function CashFlowChart({ data, periodLabel }: CashFlowChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tickColor = isDark ? "#71717a" : "#a1a1aa";
  const isEmpty = data.every((point) => point.income === 0 && point.expense === 0);

  function compactFormat(value: number) {
    return new Intl.NumberFormat(language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {t("reports.cashFlow.title")}
        </Words>
        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1.5 dark:bg-ink-800">
          <Words type="xs/bold" as="span" className="flex items-center justify-center text-ink-600 dark:text-ink-300">
            {periodLabel}
          </Words>
        </span>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-16 dark:border-ink-800">
          <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
            {t("reports.cashFlow.empty")}
          </Words>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={compactFormat}
              />
              <Tooltip
                cursor={{ stroke: gridColor }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${gridColor}`,
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  fontSize: 12,
                }}
                labelStyle={{ color: isDark ? "#fafafa" : "#18181b", fontWeight: 600 }}
                formatter={(value, name) => [
                  format(Number(value)),
                  name === "income" ? t("reports.cashFlow.income") : t("reports.cashFlow.expense"),
                ]}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs text-ink-600 dark:text-ink-300">
                    {value === "income" ? t("reports.cashFlow.income") : t("reports.cashFlow.expense")}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="income"
                stroke={INCOME_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke={EXPENSE_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
