export interface SummaryStat {
  id: string;
  label: string;
  value: number;
  changePercent: number;
  trend: "up" | "down";
}
