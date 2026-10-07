import { useEffect, useState } from "react";
import axios from "axios";
import { authService } from "@/services/auth.service";
import {
  onSessionExpired,
  onSetUserDetail,
  resetAccountData,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

// Runs once per full page load (not per navigation): redux-persist restores
// `isLogin`/`token` instantly from localStorage, but that only proves a
// session existed at the last visit — it says nothing about whether the
// token is still valid right now, or whether the account was changed
// directly via the API since then (role/status). Re-validating against
// `/user/me` here is what actually enforces both.
export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.authentication.isLogin);
  const token = useAppSelector((state) => state.authentication.token);
  // Nothing to validate without a persisted session, so start unblocked.
  const [isChecking, setIsChecking] = useState(isLogin && Boolean(token));

  useEffect(() => {
    if (!isLogin || !token) return;

    let cancelled = false;

    (async () => {
      try {
        const user = await authService.getMe(token);
        if (!cancelled) dispatch(onSetUserDetail(user));
      } catch (error) {
        // A 401 is already handled by http-client's response interceptor
        // (auto-logout). A 403 means the account was moved back to
        // "pending" directly via the API since the last visit — treat that
        // as an expired session too. Anything else (e.g. a network error)
        // is left alone so a flaky connection doesn't force a spurious
        // logout of an otherwise-valid session.
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (!cancelled && status === 403) {
          dispatch(onSessionExpired());
          resetAccountData(dispatch);
        }
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only ever needs to run once, right after the persisted session rehydrates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isChecking };
}
