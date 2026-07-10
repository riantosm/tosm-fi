import { useTranslation } from "react-i18next";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IconBell, IconSearch } from "@/components/atoms/Icons";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Words } from "@/components/atoms/Words";
import { useAuth } from "@/hooks/use-auth";

interface TopbarProps {
  onOpenMenu?: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

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

        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-ink-400 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-500 sm:w-72">
          <IconSearch className="h-4 w-4 shrink-0" />
          <Words type="sm/regular" as="span" className="hidden truncate sm:inline">
            {t("topbar.searchPlaceholder")}
          </Words>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-label={t("topbar.notifications")}
        >
          <IconBell className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-bl from-primary-400 to-primary-900 uppercase text-white">
            <Words type="xs/bold" as="span">
              {user.name?.slice(0, 2)}
            </Words>
          </div>
          <Words
            type="sm/bold"
            as="span"
            className="hidden max-w-32 truncate text-ink-700 dark:text-ink-300 md:inline"
          >
            {user?.name}
          </Words>
        </div>
      </div>
    </header>
  );
}
