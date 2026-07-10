import { useTranslation } from "react-i18next";
import { IconMoon, IconSun } from "@/components/atoms/Icons";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full border transition-colors",
        "border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-800",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm transition-transform duration-200 dark:bg-ink-900 dark:text-primary-400",
          isDark && "translate-x-7",
        )}
      >
        {isDark ? <IconMoon className="h-3.5 w-3.5" /> : <IconSun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
