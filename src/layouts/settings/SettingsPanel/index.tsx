import type { ReactNode } from "react";
import { Card } from "@/components/molecules/Card";
import { cn } from "@/utils/cn";

interface SettingsPanelProps {
  icon: ReactNode;
  /** Soft tile classes for the icon (defaults to primary). */
  iconClassName?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

/** Card with an icon-tile heading — Mata Uang, Format Desimal, Informasi Akun, Ubah Password. */
export function SettingsPanel({
  icon,
  iconClassName = "bg-primary-soft text-primary-text",
  title,
  subtitle,
  className,
  children,
}: SettingsPanelProps) {
  return (
    <Card className={cn("flex flex-col gap-4 lg:gap-5", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-[11px] [&_svg]:size-[18px]",
            iconClassName,
          )}
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <h2 className="truncate font-display text-[17px] font-semibold text-text lg:text-[18px]">
            {title}
          </h2>
          {subtitle && <span className="truncate text-[12.5px] text-text-3">{subtitle}</span>}
        </span>
      </div>
      {children}
    </Card>
  );
}
