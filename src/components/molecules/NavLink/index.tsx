import { NavLink as RouterNavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiChevronRight } from "react-icons/hi2";
import { GoldShimmerEffect } from "@/components/atoms/GoldShimmerEffect";
import { SparkleEffect } from "@/components/atoms/SparkleEffect";
import { Words } from "@/components/atoms/Words";
import { ROUTES } from "@/constants/routes";
import type { NavItem } from "@/constants/nav";
import { cn } from "@/utils/cn";

interface NavLinkProps {
  item: NavItem;
}

export function NavLink({ item }: NavLinkProps) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const isInvestment = item.path === ROUTES.INVESTMENT;

  return (
    <RouterNavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-3 px-4 py-3 transition-colors",
          isActive
            ? "bg-gradient-to-bl from-primary-400 to-primary-900 text-white"
            : item.isComingSoon
              ? "text-ink-400 hover:bg-ink-50 dark:text-ink-600 dark:hover:bg-ink-800"
              : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-900 dark:bg-ink-800",
          isInvestment && "animate-gold-glow-pulse",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isInvestment && <GoldShimmerEffect />}
          {isInvestment && <SparkleEffect />}
          <Icon
            className={cn(
              "h-5 w-5 shrink-0",
              isActive
                ? "text-white"
                : item.isComingSoon
                  ? "text-ink-300 dark:text-ink-700"
                  : "text-ink-400 dark:text-ink-500",
            )}
          />
          <Words type="sm/bold" as="span" className="flex-1">
            {t(item.labelKey)}
          </Words>
          {item.isComingSoon && (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full px-2 py-0.5",
                isActive
                  ? "bg-white/15 text-white"
                  : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-600",
              )}
            >
              <Words type="xxs/bold" as="span" className="leading-none">
                {t("common.comingSoon")}
              </Words>
            </span>
          )}
          <HiChevronRight
            className={cn(
              "h-4 w-4 shrink-0",
              isInvestment
                ? "text-yellow-600 dark:text-white"
                : isActive
                  ? "text-white/70"
                  : "text-ink-300 dark:text-ink-600",
            )}
          />
        </>
      )}
    </RouterNavLink>
  );
}
