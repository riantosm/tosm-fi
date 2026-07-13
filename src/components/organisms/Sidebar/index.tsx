import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiChevronRight, HiOutlineArrowRightOnRectangle, HiXMark } from "react-icons/hi2";
import { Logo } from "@/components/atoms/Logo";
import { Words } from "@/components/atoms/Words";
import { NavLink } from "@/components/molecules/NavLink";
import { LanguageSwitcher } from "@/components/organisms/LanguageSwitcher";
import { NAV_GROUPS, SETTINGS_NAV_ITEM } from "@/constants/nav";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

interface SidebarProps {
  variant?: "desktop" | "drawer";
  onClose?: () => void;
}

export function Sidebar({ variant = "desktop", onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { confirm } = useConfirmDialog();
  const navigate = useNavigate();

  async function handleLogout() {
    const confirmed = await confirm({
      title: t("auth.logoutConfirmTitle"),
      description: t("auth.logoutConfirmDescription"),
      confirmLabel: t("auth.logoutConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });

    if (confirmed) {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }

  return (
    <aside
      className={cn(
        "w-72 shrink-0 flex-col bg-white px-4 py-6 dark:bg-ink-900",
        variant === "desktop" && "hidden border-r border-ink-200 dark:border-ink-800 lg:flex",
        variant === "drawer" && "flex h-full w-full",
      )}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between px-2">
        <Logo />
        {variant === "drawer" && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 dark:text-ink-500 dark:hover:bg-ink-800"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto mt-4">
        {NAV_GROUPS.map((group, index) => (
          <nav
            key={index}
            className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800"
          >
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {group.map((item) => (
                <NavLink key={item.labelKey} item={item} />
              ))}
            </div>
          </nav>
        ))}

        <nav className="shrink-0 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
          <NavLink item={SETTINGS_NAV_ITEM} />
        </nav>

        <LanguageSwitcher />
      </div>

      <div className="mt-4 shrink-0 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />
          <Words type="sm/bold" as="span" className="flex-1 text-left">
            {t("topbar.logout")}
          </Words>
          <HiChevronRight className="h-4 w-4 shrink-0 text-red-300 dark:text-red-500/60" />
        </button>
      </div>
    </aside>
  );
}
