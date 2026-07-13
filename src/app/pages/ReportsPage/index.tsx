import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { ReportPeriodFilter } from "@/layouts/report/ReportPeriodFilter";
import { ReportExportMenu } from "@/layouts/report/ReportExportMenu";
import { ReportSummaryCards } from "@/layouts/report/ReportSummaryCards";
import { CashFlowChart } from "@/layouts/report/CashFlowChart";
import { MonthlyTrendChart } from "@/layouts/report/MonthlyTrendChart";
import { WalletUsageCard } from "@/layouts/report/WalletUsageCard";
import { TopSpendingList } from "@/layouts/report/TopSpendingList";
import { ExportSection } from "@/layouts/report/ExportSection";
import { useReports } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { parseIsoDateLocal } from "@/utils/report-period";
import type { ExportDocument } from "@/utils/report-export";
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
    cashFlow,
    expenseBreakdown,
    monthlyTrend,
    walletUsage,
    topSpending,
    categories,
    wallets,
    expenseTransactions,
    incomeExpenseTransactions,
    exportReport,
  } = useReports(period, monthlyTrendMetric);

  const periodLabel =
    period.preset === "custom"
      ? `${new Intl.DateTimeFormat(language, { day: "numeric", month: "short" }).format(
          parseIsoDateLocal(resolvedPeriod.dateFrom),
        )} - ${new Intl.DateTimeFormat(language, { day: "numeric", month: "short" }).format(
          parseIsoDateLocal(resolvedPeriod.dateTo),
        )}`
      : t(`reports.period.${period.preset}`);

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
      rows: expenseBreakdown.map((item) => [
        item.name,
        formatCurrency(item.total),
        `${item.percentage.toFixed(0)}%`,
        item.count,
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
        new Intl.DateTimeFormat(language, {
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
            new Intl.DateTimeFormat(language, {
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
      const { exportDocumentToCsv, exportDocumentToExcel, exportDocumentToPdf } =
        await import("@/utils/report-export");
      if (format === "csv") exportDocumentToCsv(result.fileName, exportDoc);
      else if (format === "excel") exportDocumentToExcel(result.fileName, exportDoc);
      else exportDocumentToPdf(result.fileName, exportDoc);
      showToast(t("reports.export.success", { fileName: result.fileName }), "success");
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("nav.reports")}
          </Words>
          <div className="flex flex-wrap items-center gap-2">
            <ReportPeriodFilter value={period} onChange={setPeriod} />
            <ReportExportMenu onExport={handleExport} exportingFormat={exportingFormat} />
          </div>
        </div>

        <ReportSummaryCards summary={summary} previousLabel={t("reports.summary.previousPeriod")} />

        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex flex-col gap-4 flex-1">
            <div>
              <CashFlowChart data={cashFlow} periodLabel={periodLabel} />
            </div>
            <div className="">
              <MonthlyTrendChart
                data={monthlyTrend}
                metric={monthlyTrendMetric}
                onMetricChange={setMonthlyTrendMetric}
                monthsLabel={t("reports.monthlyTrend.monthsLabel", {
                  count: MONTHLY_TREND_MONTHS_COUNT,
                })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <div>
              <CategoryBreakdownChart
                expenseTransactions={expenseTransactions}
                categories={categories}
                title={t("reports.expenseByCategory.title")}
                periodLabel={periodLabel}
              />
            </div>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              <div className="">
                <TopSpendingList items={topSpending} />
              </div>
              <div className="h-fit">
                <WalletUsageCard items={walletUsage} />
              </div>
            </div>
          </div>
        </div>
        {/* <ExportSection onExport={handleExport} exportingFormat={exportingFormat} /> */}
      </div>
    </DashboardLayout>
  );
}
