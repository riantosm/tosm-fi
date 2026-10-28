import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { PLAN_LIMIT_EVENT, type PlanLimitEventDetail } from "@/constants/plans";
import { UPGRADE_QUERY } from "@/constants/routes";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeModal } from "@/layouts/plan/UpgradeModal";
import type { PlanFeature, PlanLimits } from "@/types/plan.types";

type CountedFeature = "wallets" | "categories" | "budgets" | "schedules" | "instruments";
type ProFeature = "subCategories" | "monthlyTrend" | "customReportRange" | "exportPdfExcel";

const PRO_FEATURE_REASON: Record<ProFeature, PlanFeature> = {
  subCategories: "subCategories",
  monthlyTrend: "monthlyTrend",
  customReportRange: "reportRange",
  exportPdfExcel: "export",
};

interface UpgradeContextValue {
  openUpgrade: (feature?: PlanFeature) => void;
  /** False (and opens the Upgrade dialog) when `count` already reached the plan's limit. */
  guardLimit: (feature: CountedFeature, count: number) => boolean;
  /** False (and opens the Upgrade dialog) when the plan doesn't include `feature`. */
  guardPro: (feature: ProFeature) => boolean;
  limits: PlanLimits;
}

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

/** Owns the one Upgrade to Pro dialog of the logged-in app shell. */
export function UpgradeProvider({ children }: { children: ReactNode }) {
  const { limits, status, loadPlan } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<PlanFeature | null>(null);

  useEffect(() => {
    if (status === "idle") void loadPlan().catch(() => {});
  }, [status, loadPlan]);

  const openUpgrade = useCallback((reason?: PlanFeature) => {
    setFeature(reason ?? null);
    setIsOpen(true);
  }, []);

  // `?upgrade=1` (the landing page's "buy" after login) keeps the dialog open
  // until it is closed, which also drops the param.
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpenFromQuery = searchParams.has(UPGRADE_QUERY);

  const closeUpgrade = useCallback(() => {
    setIsOpen(false);
    if (!searchParams.has(UPGRADE_QUERY)) return;
    const next = new URLSearchParams(searchParams);
    next.delete(UPGRADE_QUERY);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // A request the frontend didn't pre-check still lands here (http-client).
  useEffect(() => {
    const handle = (event: Event) => {
      openUpgrade((event as CustomEvent<PlanLimitEventDetail>).detail?.feature);
      void loadPlan().catch(() => {});
    };
    window.addEventListener(PLAN_LIMIT_EVENT, handle);
    return () => window.removeEventListener(PLAN_LIMIT_EVENT, handle);
  }, [openUpgrade, loadPlan]);

  const value = useMemo<UpgradeContextValue>(
    () => ({
      openUpgrade,
      guardLimit: (key, count) => {
        const limit = limits[key];
        if (limit === null || count < limit) return true;
        openUpgrade(key);
        return false;
      },
      guardPro: (key) => {
        if (limits[key]) return true;
        openUpgrade(PRO_FEATURE_REASON[key]);
        return false;
      },
      limits,
    }),
    [limits, openUpgrade],
  );

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <UpgradeModal
        isOpen={isOpen || isOpenFromQuery}
        onClose={closeUpgrade}
        feature={isOpen ? feature : null}
      />
    </UpgradeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUpgrade() {
  const context = useContext(UpgradeContext);
  if (!context) throw new Error("useUpgrade harus dipakai di dalam UpgradeProvider");
  return context;
}
