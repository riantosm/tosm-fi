import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { UnderConstruction } from "@/components/molecules/UnderConstruction";

export function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-6">
        <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
          {t("nav.category")}
        </Words>
        <UnderConstruction title={t("nav.category")} />
      </div>
    </DashboardLayout>
  );
}
