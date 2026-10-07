import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ChartTooltipRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Series color (CSS color / var). */
  color: string;
  /** "dot" for area/value series, "line" for the dashed/step capital line. */
  marker?: "dot" | "line";
  muted?: boolean;
}

interface ChartTooltipProps {
  title: ReactNode;
  rows: ChartTooltipRow[];
}

/** Custom Recharts tooltip card (01 Design System · Grafik) — investment, cash flow and trend charts. */
export function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div className="flex min-w-[150px] flex-col gap-1.5 rounded-[14px] border border-border bg-surface px-3 py-2.5 shadow-pop">
      <span className="text-[11.5px] text-text-3">{title}</span>
      {rows.map((row) => (
        <span key={row.key} className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0",
              row.marker === "line" ? "h-0.5 w-2 rounded-full" : "size-2 rounded-full",
            )}
            style={{ backgroundColor: row.color }}
          />
          <span
            className={cn(
              "text-[12.5px] tabular",
              row.muted ? "text-text-2" : "font-semibold text-text",
            )}
          >
            {row.label} {row.value}
          </span>
        </span>
      ))}
    </div>
  );
}
