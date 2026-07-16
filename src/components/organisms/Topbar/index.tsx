import { IconSearch } from "@/components/atoms/Icons";
import { Logo } from "@/components/atoms/Logo";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { UserMenu } from "@/components/organisms/UserMenu";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "react-i18next";
import { HiOutlineBars3 } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  onOpenMenu?: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-ink-800 dark:bg-ink-900/80 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-initial">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 lg:hidden"
          aria-label={t("topbar.openMenu")}
        >
          <HiOutlineBars3 className="h-4 w-4" />
        </button>

        <Logo className="lg:hidden" />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => navigate(ROUTES.TRANSACTIONS, { state: { focusSearch: true } })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-label={t("topbar.search")}
        >
          <IconSearch className="h-4 w-4" />
        </button>
        <UserMenu className="hidden sm:block" panelAlign="end" />
      </div>
    </header>
  );
}
