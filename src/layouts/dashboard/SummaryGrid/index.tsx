import { StatCard } from "@/components/molecules/StatCard";
import type { SummaryStat } from "@/types/dashboard.types";

interface SummaryGridProps {
  stats: SummaryStat[];
}

export function SummaryGrid({ stats }: SummaryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
