import { useTranslation } from "react-i18next";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IconSearch } from "@/components/atoms/Icons";
import { Logo } from "@/components/atoms/Logo";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { Words } from "@/components/atoms/Words";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";

interface TopbarProps {
  onOpenMenu?: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { format } = useCurrency();

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
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-label={t("topbar.search")}
        >
          <IconSearch className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-bl from-primary-400 to-primary-900 uppercase text-white">
            <Words type="xs/bold" as="span">
              {user.name?.slice(0, 2)}
            </Words>
          </div>
          <div className="hidden flex-col md:flex">
            <Words
              type="sm/bold"
              as="span"
              className="max-w-32 truncate text-ink-700 dark:text-ink-300"
            >
              {user?.name}
            </Words>
            <Words
              type="xxs/regular"
              as="span"
              className="max-w-40 truncate text-ink-400 dark:text-ink-500"
            >
              {t("topbar.netWorth")}: {format(user.netWorth ?? 0)}
            </Words>
          </div>
        </div>
      </div>
    </header>
  );
}
