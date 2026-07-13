import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts";
import { cn } from "@/utils/cn";

export interface DonutChartDatum {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  formatValue?: (value: number) => string;
  onSliceClick?: (datum: DonutChartDatum) => void;
  /** Externally controlled highlighted slice (e.g. from hovering a legend row). */
  activeId?: string | null;
  className?: string;
}

const RADIAN = Math.PI / 180;
const POP_OUT_OFFSET = 8;
const POP_OUT_SCALE = 1.05;
const POP_OUT_TRANSITION = "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)";
/** Reserves space around the ring so the popped-out slice never clips against the SVG bounds. */
const HOVER_MARGIN = 14;

export function DonutChart({
  data,
  size = 200,
  thickness = 26,
  centerLabel,
  centerValue,
  formatValue,
  onSliceClick,
  activeId = null,
  className,
}: DonutChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const outerRadius = size / 2 - HOVER_MARGIN;
  const innerRadius = outerRadius - thickness;
  const effectiveActiveId = activeId ?? hoveredId;

  const activeDatum = effectiveActiveId ? data.find((item) => item.id === effectiveActiveId) : undefined;
  const displayLabel = activeDatum ? activeDatum.label : centerLabel;
  const displayValue = activeDatum
    ? (formatValue ? formatValue(activeDatum.value) : String(activeDatum.value))
    : centerValue;

  function renderSlice(props: PieSectorDataItem) {
    const datum = props.payload as DonutChartDatum | undefined;
    const isActive = Boolean(datum && datum.id === effectiveActiveId);
    const cx = props.cx ?? 0;
    const cy = props.cy ?? 0;
    const sectorInnerRadius = Number(props.innerRadius ?? 0);
    const sectorOuterRadius = Number(props.outerRadius ?? 0);
    const midAngle = props.midAngle ?? 0;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const dx = isActive ? POP_OUT_OFFSET * cos : 0;
    const dy = isActive ? POP_OUT_OFFSET * sin : 0;
    const scale = isActive ? POP_OUT_SCALE : 1;

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={sectorInnerRadius}
        outerRadius={sectorOuterRadius}
        startAngle={props.startAngle}
        endAngle={props.endAngle}
        cornerRadius={6}
        fill={props.fill ?? datum?.color}
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: POP_OUT_TRANSITION,
        }}
      />
    );
  }

  return (
    <div
      className={cn("relative shrink-0 outline-none [&_*]:outline-none", className)}
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={data.length > 1 ? 3 : 0}
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
            animationDuration={600}
            animationEasing="ease-out"
            isAnimationActive
            shape={renderSlice}
            style={{ cursor: onSliceClick ? "pointer" : "default" }}
            onMouseEnter={(entry) => setHoveredId((entry.payload as DonutChartDatum | undefined)?.id ?? null)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={
              onSliceClick
                ? (entry: { payload?: DonutChartDatum } & Partial<DonutChartDatum>) =>
                    onSliceClick(entry.payload ?? (entry as DonutChartDatum))
                : undefined
            }
          >
            {data.map((item) => (
              <Cell key={item.id} fill={item.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {(displayLabel || displayValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-4 text-center">
          {displayLabel && (
            <span className="line-clamp-1 text-xs text-ink-500 dark:text-ink-400">{displayLabel}</span>
          )}
          {displayValue && (
            <span className="text-lg leading-tight font-bold text-ink-900 dark:text-ink-50">
              {displayValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
