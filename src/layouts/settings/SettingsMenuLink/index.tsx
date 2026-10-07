import { createElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuChevronRight, LuShield } from "react-icons/lu";
import { SETTINGS_TONE_CLASS, type SettingsMenuItem } from "@/constants/settings-menu";
import { cn } from "@/utils/cn";

interface SettingsMenuLinkProps {
  item: SettingsMenuItem;
  /** Right-side pill ("2 baru", "IDR · 0 desimal"). */
  badge?: ReactNode;
  /** Phone: replaces the description (e.g. the current currency). */
  shortDescription?: string;
  /** card = standalone desktop card; row = a row inside a grouped phone card. */
  variant: "card" | "row";
}

/** One Pengaturan entry — icon tile, title (+ Admin tag), description, optional pill, chevron. */
export function SettingsMenuLink({
  item,
  badge,
  shortDescription,
  variant,
}: SettingsMenuLinkProps) {
  const { t } = useTranslation();
  const isCard = variant === "card";

  return (
    <Link
      to={item.path}
      className={cn(
        "group flex min-w-0 items-center text-left",
        isCard
          ? "lift gap-4 rounded-card bg-surface p-6 shadow-card"
          : "gap-3 py-3.5 transition-opacity active:opacity-70",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105",
          isCard
            ? "size-12 rounded-[14px] [&_svg]:size-[22px]"
            : "size-10 rounded-[12px] [&_svg]:size-[19px]",
          SETTINGS_TONE_CLASS[item.tone],
        )}
      >
        {createElement(item.icon)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "truncate font-semibold text-text",
              isCard ? "text-[16px]" : "text-[15px]",
            )}
          >
            {t(item.titleKey)}
          </span>
          {item.adminOnly && isCard && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-2">
              <LuShield className="size-3" />
              {t("settingsMenu.adminBadge")}
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-text-2",
            isCard ? "truncate text-[13.5px]" : "line-clamp-2 text-[12.5px]",
          )}
        >
          {!isCard && shortDescription ? shortDescription : t(item.descriptionKey)}
        </span>
      </span>
      {badge}
      <LuChevronRight
        className={cn(
          "shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5",
          isCard ? "size-[18px]" : "size-4",
        )}
      />
    </Link>
  );
}
