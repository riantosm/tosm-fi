import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiChevronRight, HiOutlineTrash } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { SETTINGS_MENU_ITEMS } from "@/constants/settings-menu";
import { useResetData } from "@/hooks/use-reset-data";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
  const { t } = useTranslation();
  const { resetData } = useResetData();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  async function handleResetData() {
    const confirmed = await confirm({
      title: t("settingsDanger.resetConfirmTitle"),
      description: t("settingsDanger.resetConfirmDescription"),
      confirmLabel: t("settingsDanger.resetConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    resetData();
    showToast(t("settingsDanger.resetSuccess"), "success");
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
          {t("nav.settings")}
        </Words>

        <nav className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {SETTINGS_MENU_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-ink-50 dark:bg-ink-900 dark:hover:bg-ink-800"
                >
                  <Icon className="h-5 w-5 shrink-0 text-ink-400 dark:text-ink-500" />
                  <div className="flex flex-1 flex-col">
                    <Words type="sm/bold" as="span" className="text-ink-800 dark:text-ink-200">
                      {t(item.titleKey)}
                    </Words>
                    <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                      {t(item.descriptionKey)}
                    </Words>
                  </div>
                  <HiChevronRight className="h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 p-4 dark:border-red-500/30">
          <div className="flex flex-col gap-1">
            <Words type="sm/bold" className="text-red-600 dark:text-red-400">
              {t("settingsDanger.title")}
            </Words>
            <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
              {t("settingsDanger.description")}
            </Words>
          </div>
          <Button
            variant="danger"
            onClick={() => void handleResetData()}
            className="w-fit"
          >
            <HiOutlineTrash className="h-4 w-4" />
            <Words type="sm/bold" as="span">
              {t("settingsDanger.resetButton")}
            </Words>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
