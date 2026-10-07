import type { ReactNode } from "react";
import { LuChevronDown, LuLandmark } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface InvestmentAccountSummaryProps {
  /** Small caps label above the name ("DARI" / "KE"). */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right column ("Nilai" + amount). */
  valueLabel?: string;
  value?: ReactNode;
  /** Makes the card a picker trigger (chevron on the right). */
  onClick?: () => void;
  /** Placeholder look when nothing is picked yet. */
  isEmpty?: boolean;
  className?: string;
}

/** Soft account card at the top of money dialogs (Tarik dana, Update nilai, Transfer). */
export function InvestmentAccountSummary({
  eyebrow,
  title,
  subtitle,
  valueLabel,
  value,
  onClick,
  isEmpty = false,
  className,
}: InvestmentAccountSummaryProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[18px] bg-surface-2 px-3.5 py-3 text-left",
        onClick && "group transition-colors duration-200 hover:bg-surface-3",
        className,
      )}
    >
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary-text">
        <LuLandmark className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        {eyebrow && (
          <span className="text-[10.5px] font-semibold tracking-[0.06em] text-text-3 uppercase">
            {eyebrow}
          </span>
        )}
        <span
          className={cn(
            "truncate text-[14px] font-semibold",
            isEmpty ? "text-text-3" : "text-text",
          )}
        >
          {title}
        </span>
        {subtitle && <span className="truncate text-[12px] text-text-2">{subtitle}</span>}
      </span>
      {value !== undefined && (
        <span className="flex shrink-0 flex-col items-end gap-px">
          {valueLabel && <span className="text-[11px] text-text-3">{valueLabel}</span>}
          <span className="font-num text-[14px] font-semibold text-text tabular">{value}</span>
        </span>
      )}
      {onClick && (
        <LuChevronDown className="size-4 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-y-px" />
      )}
    </Comp>
  );
}
