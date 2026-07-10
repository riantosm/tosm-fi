import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { CurrencyOptionList } from "@/layouts/settings/CurrencyOptionList";
import { DecimalOptionList } from "@/layouts/settings/DecimalOptionList";
import { ROUTES } from "@/constants/routes";

export function SettingsCurrencyPage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            to={ROUTES.SETTINGS}
            className="flex w-fit items-center gap-1.5 text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            <Words type="sm/bold" as="span">
              {t("common.back")}
            </Words>
          </Link>
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("settingsCurrency.title")}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("settingsCurrency.subtitle")}
          </Words>
        </div>

        <CurrencyOptionList />

        <div className="flex flex-col gap-3">
          <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
            {t("settingsCurrency.decimalTitle")}
          </Words>
          <DecimalOptionList />
        </div>
      </div>
    </DashboardLayout>
  );
}
