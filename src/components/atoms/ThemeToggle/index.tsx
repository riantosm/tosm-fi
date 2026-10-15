import { useTranslation } from "react-i18next";
import { LuMonitorSmartphone, LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/types/theme.types";
import { cn } from "@/utils/cn";

const OPTIONS = [
  ["light", LuSun],
  ["dark", LuMoon],
  ["system", LuMonitorSmartphone],
] as const satisfies readonly (readonly [ThemePreference, unknown])[];

interface ThemeToggleProps {
  className?: string;
}

/** Light / dark / follow-system segmented switch with a sliding thumb. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();
  const activeIndex = OPTIONS.findIndex(([value]) => value === preference);

  return (
    <div
      role="radiogroup"
      aria-label={t("theme.toggle")}
      className={cn("relative inline-flex rounded-full bg-surface-2 p-[3px]", className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-[3px] left-[3px] h-[30px] w-[36px] rounded-full bg-surface shadow-[0_2px_6px_var(--shadow-color)] transition-transform duration-300 ease-[var(--ease-smooth)]"
        style={{ transform: `translateX(${activeIndex * 36}px)` }}
      />
      {OPTIONS.map(([value, Icon]) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(`theme.${value}`)}
            title={t(`theme.${value}`)}
            onClick={() => setPreference(value)}
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
