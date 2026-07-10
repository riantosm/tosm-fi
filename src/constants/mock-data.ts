import type { SummaryStat, Transaction } from "@/types/dashboard.types";

export const SUMMARY_STATS: SummaryStat[] = [
  { id: "balance", label: "Total Saldo", value: 24850000, changePercent: 12.4, trend: "up" },
  { id: "income", label: "Pemasukan Bulan Ini", value: 8500000, changePercent: 4.1, trend: "up" },
  {
    id: "expense",
    label: "Pengeluaran Bulan Ini",
    value: 3120000,
    changePercent: 2.3,
    trend: "down",
  },
  { id: "savings", label: "Tabungan", value: 12400000, changePercent: 8.7, trend: "up" },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "Gaji Bulanan",
    category: "Gaji",
    date: "2026-07-01",
    amount: 8500000,
    type: "income",
  },
  {
    id: "2",
    title: "Belanja Bulanan",
    category: "Kebutuhan",
    date: "2026-07-03",
    amount: 620000,
    type: "expense",
  },
  {
    id: "3",
    title: "Netflix",
    category: "Hiburan",
    date: "2026-07-04",
    amount: 65000,
    type: "expense",
  },
  {
    id: "4",
    title: "Freelance Project",
    category: "Sampingan",
    date: "2026-07-06",
    amount: 1500000,
    type: "income",
  },
  {
    id: "5",
    title: "Bensin",
    category: "Transportasi",
    date: "2026-07-08",
    amount: 150000,
    type: "expense",
  },
  {
    id: "6",
    title: "Makan di Luar",
    category: "Kebutuhan",
    date: "2026-07-09",
    amount: 220000,
    type: "expense",
  },
];
