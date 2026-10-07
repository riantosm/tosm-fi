import { useTranslation } from "react-i18next";
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

/** Sun / moon segmented switch with a sliding thumb. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="radiogroup"
      aria-label={t("theme.toggle")}
      className={cn("relative inline-flex rounded-full bg-surface-2 p-[3px]", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[3px] left-[3px] h-[30px] w-[36px] rounded-full bg-surface shadow-[0_2px_6px_var(--shadow-color)] transition-transform duration-300 ease-[var(--ease-smooth)]",
          isDark && "translate-x-[36px]",
        )}
      />
      {(
        [
          ["light", LuSun],
          ["dark", LuMoon],
        ] as const
      ).map(([value, Icon]) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={value === "light" ? "Light" : "Dark"}
            onClick={() => setTheme(value)}
            className={cn(
              "relative z-10 flex h-[30px] w-[36px] items-center justify-center rounded-full transition-colors duration-200",
              active ? "text-primary-text" : "text-text-3 hover:text-text-2",
            )}
          >
            <Icon className="size-[15px]" />
          </button>
        );
      })}
    </div>
  );
}
