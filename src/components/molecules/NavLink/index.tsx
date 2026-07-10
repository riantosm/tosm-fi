import { NavLink as RouterNavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiChevronRight } from "react-icons/hi2";
import type { NavItem } from "@/constants/nav";
import { cn } from "@/utils/cn";

interface NavLinkProps {
  item: NavItem;
}

export function NavLink({ item }: NavLinkProps) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <RouterNavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
          isActive
            ? "bg-gradient-to-bl from-primary-400 to-primary-900 text-white"
            : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-5 w-5 shrink-0",
              isActive ? "text-white" : "text-ink-400 dark:text-ink-500",
            )}
          />
          <span className="flex-1">{t(item.labelKey)}</span>
          <HiChevronRight
            className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-white/70" : "text-ink-300 dark:text-ink-600",
            )}
          />
        </>
      )}
    </RouterNavLink>
  );
}
