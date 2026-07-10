import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
        {t("nav.reports")}
      </Words>
    </DashboardLayout>
  );
}
