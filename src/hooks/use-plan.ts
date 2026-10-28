import { useCallback } from "react";
import { PLAN_LIMITS } from "@/constants/plans";
import { authService } from "@/services/auth.service";
import { planService } from "@/services/plan.service";
import {
  onSetUserDetail,
  setPlanInfo,
  setPlanLoading,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import type { UserPlan } from "@/types/auth.types";

export function usePlan() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.authentication.token);
  const userPlan = useAppSelector((state) => state.authentication.userDetail.plan);
  const info = useAppSelector((state) => state.plan.info);
  const status = useAppSelector((state) => state.plan.status);

  // `/user/me` carries the plan, so it is known before `/user/me/plan` loads.
  const plan: UserPlan = info?.plan ?? userPlan ?? "free";
  const isPro = plan === "pro";
  const limits = info?.limits ?? PLAN_LIMITS[plan];

  const loadPlan = useCallback(async () => {
    dispatch(setPlanLoading());
    const data = await planService.getPlanInfo();
    dispatch(setPlanInfo(data));
    return data;
  }, [dispatch]);

  /** Re-reads both the user (plan badge) and the plan info, e.g. after a payment. */
  const refreshPlan = useCallback(async () => {
    if (token) dispatch(onSetUserDetail(await authService.getMe(token)));
    return loadPlan();
  }, [dispatch, loadPlan, token]);

  return { plan, isPro, limits, info, status, loadPlan, refreshPlan };
}
