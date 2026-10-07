import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { TimelinePoint } from "@/types/investment-transaction.types";
import { cn } from "@/utils/cn";

interface InvestmentSparklineProps {
  data: TimelinePoint[];
  /** Instrument hex color. */
  color: string;
  className?: string;
  /** Line only (no gradient fill) — compact list rows. */
  lineOnly?: boolean;
  strokeWidth?: number;
}

/** Axis-less value sparkline (instrument + account cards). */
export function InvestmentSparkline({
  data,
  color,
  className,
  lineOnly = false,
  strokeWidth = 2,
}: InvestmentSparklineProps) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`;

  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Area
              type="monotone"
              dataKey="current"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={lineOnly ? "none" : `url(#${gradientId})`}
              baseValue="dataMin"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
