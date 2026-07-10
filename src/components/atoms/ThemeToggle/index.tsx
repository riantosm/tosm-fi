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
          "absolute left-1 h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-ink-900",
          isDark && "translate-x-7",
        )}
      />
      <span className="relative z-10 flex flex-1 items-center justify-center">
        <IconSun
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isDark ? "text-ink-400 dark:text-ink-500" : "text-primary-600",
          )}
        />
      </span>
      <span className="relative z-10 flex flex-1 items-center justify-center">
        <IconMoon
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isDark ? "text-primary-400" : "text-ink-400 dark:text-ink-500",
          )}
        />
      </span>
    </button>
  );
}
