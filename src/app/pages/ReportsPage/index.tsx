import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/atoms/Reveal";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ReportPeriodFilter } from "@/layouts/report/ReportPeriodFilter";
import { ReportExportMenu } from "@/layouts/report/ReportExportMenu";
import { ReportSummaryCards } from "@/layouts/report/ReportSummaryCards";
import { CashFlowChart } from "@/layouts/report/CashFlowChart";
import { MonthlyTrendChart } from "@/layouts/report/MonthlyTrendChart";
import { WalletUsageCard } from "@/layouts/report/WalletUsageCard";
import { TopSpendingList } from "@/layouts/report/TopSpendingList";
import { useReports } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { buildCategoryBreakdown } from "@/utils/category-breakdown";
import { toIntlLocale } from "@/utils/locale";
import { parseIsoDateLocal } from "@/utils/report-period";
import type { ExportDocument } from "@/utils/report-export-types";
import type {
  MonthlyTrendMetric,
  ReportExportFormat,
  ReportPeriodFilter as ReportPeriodFilterValue,
} from "@/types/report.types";

const MONTHLY_TREND_MONTHS_COUNT = 12;

type ExportFormat = Exclude<ReportExportFormat, "print">;

export function ReportsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { format: formatCurrency } = useCurrency();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<ReportPeriodFilterValue>({
    preset: "month",
    dateFrom: "",
    dateTo: "",
  });
  const [monthlyTrendMetric, setMonthlyTrendMetric] = useState<MonthlyTrendMetric>("expense");
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const {
    resolvedPeriod,
    summary,
    isSummaryLoading,
    cashFlow,
    isCashFlowLoading,
    categoryBreakdown,
    monthlyTrend,
    isMonthlyTrendLoading,
    walletUsage,
    isWalletUsageLoading,
    topSpending,
    isTopSpendingLoading,
    categories,
    wallets,
    incomeExpenseTransactions,
    exportReport,
  } = useReports(period, monthlyTrendMetric);

  const periodLabel = period.preset.startsWith("month:")
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
        parseIsoDateLocal(resolvedPeriod.dateFrom),
      )
    : period.preset === "custom"
      ? `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
          parseIsoDateLocal(resolvedPeriod.dateFrom),
        )} - ${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
          parseIsoDateLocal(resolvedPeriod.dateTo),
        )}`
      : t(`reports.period.${period.preset}`);

  /** Header subtitle: "1 – 31 Oktober 2026", or "Hari ini · 5 Oktober 2026" for a single day. */
  const rangeLabel = useMemo(() => {
    if (!resolvedPeriod.dateFrom || !resolvedPeriod.dateTo) return "";
    const from = parseIsoDateLocal(resolvedPeriod.dateFrom);
    const to = parseIsoDateLocal(resolvedPeriod.dateTo);
    const formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (resolvedPeriod.dateFrom === resolvedPeriod.dateTo) {
      const day = formatter.format(from);
      return period.preset === "today" ? `${t("reports.period.today")} · ${day}` : day;
    }
    return formatter.formatRange(from, to);
  }, [resolvedPeriod.dateFrom, resolvedPeriod.dateTo, locale, period.preset, t]);

  function buildExportDocument(): ExportDocument {
    const summarySection = {
      heading: t("reports.export.sections.summary"),
      columns: [
        t("reports.export.columns.metric"),
        t("reports.export.columns.value"),
        t("reports.export.columns.change"),
      ],
      rows: summary
        ? [
            [
              t("reports.summary.totalIncome"),
              formatCurrency(summary.totalIncome.value),
              `${summary.totalIncome.changePercent.toFixed(0)}%`,
            ],
            [
              t("reports.summary.totalExpense"),
              formatCurrency(summary.totalExpense.value),
              `${summary.totalExpense.changePercent.toFixed(0)}%`,
            ],
            [
              t("reports.summary.netCashFlow"),
              formatCurrency(summary.netCashFlow.value),
              `${summary.netCashFlow.changePercent.toFixed(0)}%`,
            ],
            [
              t("reports.summary.transactionCount"),
              summary.transactionCount.value,
              `${summary.transactionCount.changePercent.toFixed(0)}%`,
            ],
          ]
        : [],
    };

    const expenseSection = {
      heading: t("reports.expenseByCategory.title"),
      columns: [
        t("reports.export.columns.category"),
        t("reports.export.columns.total"),
        t("reports.export.columns.percentage"),
        t("reports.export.columns.transactions"),
      ],
      rows: categoryBreakdown.map((item) => [
        item.nameCategory,
        formatCurrency(item.amount),
        `${item.percentage.toFixed(0)}%`,
        item.transactionCount,
      ]),
    };

    const walletSection = {
      heading: t("reports.walletUsage.title"),
      columns: [
        t("reports.export.columns.wallet"),
        t("reports.export.columns.percentage"),
        t("reports.export.columns.transactions"),
      ],
      rows: walletUsage.map((item) => [
        item.nameWallet,
        `${item.percentage.toFixed(0)}%`,
        item.transactionCount,
      ]),
    };

    const topSpendingSection = {
      heading: t("reports.topSpending.title"),
      columns: [
        t("reports.export.columns.rank"),
        t("reports.export.columns.title"),
        t("reports.export.columns.category"),
        t("reports.export.columns.amount"),
        t("reports.export.columns.date"),
      ],
      rows: topSpending.map((item) => [
        item.rank,
        item.title,
        item.subCategoryName ? `${item.categoryName} · ${item.subCategoryName}` : item.categoryName,
        formatCurrency(item.amount),
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(item.date)),
      ]),
    };

    const transactionListSection = {
      heading: t("reports.transactionList.title"),
      columns: [
        t("reports.export.columns.date"),
        t("reports.export.columns.title"),
        t("reports.export.columns.category"),
        t("reports.export.columns.wallet"),
        t("reports.export.columns.type"),
        t("reports.export.columns.amount"),
      ],
      rows: [...incomeExpenseTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((transaction) => {
          const category = categories.find((item) => item.idCategory === transaction.idCategory);
          const subCategory = category?.subCategories.find(
            (item) => item.idSubCategory === transaction.idSubCategory,
          );
          const wallet = wallets.find((item) => item.idWallet === transaction.idWallet);
          return [
            new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(transaction.date)),
            transaction.title || category?.nameCategory || "-",
            subCategory
              ? `${category?.nameCategory ?? "-"} · ${subCategory.nameSubCategory}`
              : (category?.nameCategory ?? "-"),
            wallet?.nameWallet ?? "-",
            transaction.type === "income" ? t("transaction.income") : t("transaction.expense"),
            formatCurrency(transaction.amount),
          ];
        }),
    };

    return {
      title: t("nav.reports"),
      subtitle: `${periodLabel} (${resolvedPeriod.dateFrom} - ${resolvedPeriod.dateTo})`,
      sections: [
        summarySection,
        expenseSection,
        walletSection,
        topSpendingSection,
        transactionListSection,
      ],
    };
  }

  async function handleExport(format: ExportFormat) {
    setExportingFormat(format);
    try {
      const result = await exportReport(format);
      const exportDoc = buildExportDocument();
      // Each format's heavy library (xlsx / jspdf+autotable) only loads
      // when that specific format is used, instead of one shared chunk
      // pulling in all three regardless of what was picked.
      if (format === "csv") {
        const { exportDocumentToCsv } = await import("@/utils/report-export-csv");
        exportDocumentToCsv(result.fileName, exportDoc);
      } else if (format === "excel") {
        const { exportDocumentToExcel } = await import("@/utils/report-export-excel");
        exportDocumentToExcel(result.fileName, exportDoc);
      } else {
        const { exportDocumentToPdf } = await import("@/utils/report-export-pdf");
        exportDocumentToPdf(result.fileName, exportDoc);
      }
      showToast(t("reports.export.success", { fileName: result.fileName }), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("reports.genericError"), "error");
    } finally {
      setExportingFormat(null);
    }
  }

  const categoryBreakdownSlices = useMemo(
    () => buildCategoryBreakdown(categoryBreakdown),
    [categoryBreakdown],
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("nav.reports")}
        subtitle={rangeLabel}
        actions={<ReportExportMenu onExport={handleExport} exportingFormat={exportingFormat} />}
        mobileActions={
          <ReportExportMenu
            onExport={handleExport}
            exportingFormat={exportingFormat}
            variant="icon"
          />
        }
      />

      <ReportPeriodFilter value={period} onChange={setPeriod} />

      <ReportSummaryCards
        summary={summary}
        previousLabel={t("reports.summary.previousPeriod")}
        isLoading={isSummaryLoading}
      />

      <Reveal delay={0.04}>
        <CashFlowChart
          data={cashFlow}
          eyebrow={t("reports.eyebrow.cashFlow")}
          isLoading={isCashFlowLoading}
        />
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Reveal delay={0.04} className="min-w-0 lg:col-start-1 lg:row-start-1">
          <CategoryBreakdownChart
            slices={categoryBreakdownSlices}
            title={t("reports.expenseByCategory.title")}
            periodLabel={t("reports.eyebrow.category")}
            isLoading={isSummaryLoading}
            className="h-full"
          />
        </Reveal>
        <Reveal delay={0.04} className="min-w-0 lg:col-start-1 lg:row-start-2">
          <MonthlyTrendChart
            data={monthlyTrend}
            metric={monthlyTrendMetric}
            onMetricChange={setMonthlyTrendMetric}
            eyebrow={t("reports.eyebrow.monthlyTrend", { count: MONTHLY_TREND_MONTHS_COUNT })}
            isLoading={isMonthlyTrendLoading}
            className="h-full"
          />
        </Reveal>
        <Reveal delay={0.06} className="min-w-0 lg:col-start-2 lg:row-start-1">
          <TopSpendingList
            items={topSpending}
            eyebrow={t("reports.eyebrow.topSpending")}
            isLoading={isTopSpendingLoading}
            className="h-full"
          />
        </Reveal>
        <Reveal delay={0.06} className="min-w-0 lg:col-start-2 lg:row-start-2">
          <WalletUsageCard
            items={walletUsage}
            eyebrow={t("reports.eyebrow.walletUsage")}
            isLoading={isWalletUsageLoading}
            className="h-full"
          />
        </Reveal>
      </div>
    </div>
  );
}
