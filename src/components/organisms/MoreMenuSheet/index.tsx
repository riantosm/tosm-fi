import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuChevronRight, LuLanguages, LuLogOut, LuSunMoon } from "react-icons/lu";
import { Avatar } from "@/components/atoms/Avatar";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Modal } from "@/components/molecules/Modal";
import { LanguageSwitcher } from "@/components/organisms/LanguageSwitcher";
import { useLogoutFlow } from "@/components/organisms/UserMenu";
import { MORE_MENU_ITEMS, type NavItem } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { cn } from "@/utils/cn";

const TONE_CLASS: Record<NonNullable<NavItem["tone"]>, string> = {
  primary: "bg-primary-soft text-primary-text",
  expense: "bg-expense-soft text-expense-text",
  investment: "bg-investment-soft text-investment-text",
  income: "bg-income-soft text-income-text",
  neutral: "bg-surface text-text-2",
};

/** Phone "Lainnya" bottom sheet — secondary pages, profile, theme, language, logout. */
export function MoreMenuSheet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMoreOpen, setMoreOpen } = useQuickAdd();
  const handleLogout = useLogoutFlow();

  function go(path: string) {
    setMoreOpen(false);
    navigate(path);
  }

  return (
    <Modal isOpen={isMoreOpen} onClose={() => setMoreOpen(false)} size="md">
      <div className="flex flex-col gap-3.5">
        <button
          type="button"
          onClick={() => go(ROUTES.PROFILE)}
          className="pressable flex items-center gap-3 rounded-[18px] bg-surface-2 p-3 text-left"
        >
          <Avatar name={user?.nameUser} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-semibold text-text">{user?.nameUser}</span>
            <span className="text-[12px] font-semibold text-primary-text">
              {t("topbar.editProfile")}
            </span>
          </span>
          <LuChevronRight className="size-4 text-text-3" />
        </button>

        <div className="grid grid-cols-3 gap-2.5">
          {MORE_MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                style={{ animationDelay: `${index * 35}ms` }}
                className="pressable flex animate-fade-up flex-col items-center gap-2 rounded-[18px] bg-surface-2 px-1.5 py-3.5 hover:bg-surface-3"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[13px] [&_svg]:size-[19px]",
                    TONE_CLASS[item.tone ?? "neutral"],
                  )}
                >
                  <Icon />
                </span>
                <span className="max-w-full truncate text-[12.5px] font-semibold text-text">
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 rounded-[16px] bg-surface-2 py-2 pr-2 pl-3">
            <LuSunMoon className="size-4 shrink-0 text-text-2" aria-label={t("topbar.theme")} />
            <span className="flex-1" />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 rounded-[16px] bg-surface-2 py-2 pr-2 pl-3">
            <LuLanguages
              className="size-4 shrink-0 text-text-2"
              aria-label={t("topbar.language")}
            />
            <span className="flex-1" />
            <LanguageSwitcher />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMoreOpen(false);
            void handleLogout();
          }}
          className="pressable flex h-12 items-center justify-center gap-2 rounded-full bg-expense-soft text-[14px] font-semibold text-expense-text"
        >
          <LuLogOut className="size-4" />
          {t("topbar.logout")}
        </button>
      </div>
    </Modal>
  );
}
