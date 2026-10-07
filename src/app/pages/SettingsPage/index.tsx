import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuRotateCcw, LuTriangleAlert } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SettingsMenuLink } from "@/layouts/settings/SettingsMenuLink";
import { SETTINGS_MENU_ITEMS, type SettingsMenuItem } from "@/constants/settings-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { useResetData } from "@/hooks/use-reset-data";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserApproval } from "@/hooks/use-user-approval";

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currency, decimalPlaces } = useCurrency();
  const { resetData } = useResetData();
  const { users, status: usersStatus, loadUsers } = useUserApproval();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();
  const isAdmin = user.role === "admin";

  // Admins see how many registrations wait for approval (read-only list fetch).
  useEffect(() => {
    if (isAdmin && usersStatus === "idle") void loadUsers().catch(() => {});
  }, [isAdmin, usersStatus, loadUsers]);

  const pendingCount = users.filter((item) => item.status !== "active").length;
  const currencyMeta = `${currency} · ${t("settingsMenu.decimalCount", { n: decimalPlaces })}`;

  async function handleResetData() {
    const confirmed = await confirm({
      title: t("settingsDanger.resetConfirmTitle"),
      description: t("settingsDanger.resetConfirmDescription"),
      confirmLabel: t("settingsDanger.resetConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuRotateCcw,
    });
    if (!confirmed) return;

    try {
      await resetData();
      showToast(t("settingsDanger.resetSuccess"), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("settingsDanger.resetError"), "error");
    }
  }

  function badgeFor(item: SettingsMenuItem): ReactNode {
    if (item.key === "user-approval" && pendingCount > 0) {
      return (
        <span className="shrink-0 rounded-full bg-income-soft px-2.5 py-1 text-[12px] font-semibold text-income-text">
          {t("settingsMenu.newCount", { n: pendingCount })}
        </span>
      );
    }
    if (item.key === "currency") {
      return (
        <span className="hidden shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-text-2 lg:inline">
          {currencyMeta}
        </span>
      );
    }
    return null;
  }

  const groups = [
    {
      key: "admin",
      label: t("settingsMenu.sectionAdmin"),
      items: SETTINGS_MENU_ITEMS.filter((item) => item.adminOnly),
    },
    {
      key: "general",
      label: t("settingsMenu.sectionGeneral"),
      items: SETTINGS_MENU_ITEMS.filter((item) => !item.adminOnly),
    },
  ].filter((group) => group.items.length > 0 && (group.key !== "admin" || isAdmin));

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader title={t("nav.settings")} subtitle={t("settingsMenu.subtitle")} />

      {groups.map((group, index) => (
        <Reveal key={group.key} delay={index * 0.04} className="flex flex-col gap-2.5 lg:gap-3">
          <span className="px-1 text-[12px] font-semibold tracking-[0.08em] text-text-3 uppercase lg:px-0">
            {group.label}
          </span>
          <div className="hidden gap-4 lg:grid lg:grid-cols-2">
            {group.items.map((item) => (
              <SettingsMenuLink key={item.key} item={item} badge={badgeFor(item)} variant="card" />
            ))}
          </div>
          <Card padding="none" className="flex flex-col divide-y divide-border px-4 lg:hidden">
            {group.items.map((item) => (
              <SettingsMenuLink
                key={item.key}
                item={item}
                badge={badgeFor(item)}
                shortDescription={item.key === "currency" ? currencyMeta : undefined}
                variant="row"
              />
            ))}
          </Card>
        </Reveal>
      ))}

      <Reveal delay={0.1}>
        <div className="flex flex-col gap-3 rounded-card border border-expense/60 bg-expense-soft px-4 py-4 lg:flex-row lg:items-center lg:gap-4 lg:px-5">
          <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center lg:gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-[14px] bg-surface text-expense-text lg:flex">
              <LuTriangleAlert className="size-[22px]" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-2 text-[16px] font-semibold text-expense-text">
                <LuTriangleAlert className="size-[18px] lg:hidden" />
                {t("settingsDanger.title")}
              </span>
              <span className="text-[13px] leading-relaxed text-text-2">
                {t("settingsDanger.description")}
              </span>
            </span>
          </div>
          <Button
            type="button"
            variant="danger"
            leftIcon={<LuRotateCcw />}
            onClick={() => void handleResetData()}
            className="w-full shrink-0 lg:w-auto"
          >
            {t("settingsDanger.resetButton")}
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
