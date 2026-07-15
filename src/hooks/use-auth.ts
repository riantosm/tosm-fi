import { useCallback } from "react";
import { authService } from "@/services/auth.service";
import type {
  ChangePasswordInput,
  LoginCredentials,
  RegisterInput,
  UpdateProfileInput,
} from "@/types/auth.types";
import {
  onLogin,
  onLogout,
  onSetUserDetail,
  resetAccountData,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.authentication.isLogin);
  const userDetail = useAppSelector((state) => state.authentication.userDetail);

  const register = useCallback(async (input: RegisterInput) => {
    // Register never logs the caller in (no token is issued) — the first
    // account bootstraps as an active admin, everyone after starts pending,
    // either way they still go through the normal login flow afterward.
    return authService.register(input);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { token } = await authService.login(credentials);
      // Login can succeed for a pending user — getMe is what actually
      // blocks them (403 "Menunggu validasi"), so onLogin only fires once
      // both steps succeed.
      const fullUser = await authService.getMe(token);
      dispatch(onLogin({ userDetail: fullUser, token }));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort — an already-invalid/expired token or a network error
      // shouldn't block the user from clearing their local session.
    } finally {
      dispatch(onLogout());
      // Wallet/category/transaction are per-account — without this, a
      // different account logging in on the same browser would see this
      // account's cached data until the next full reload rehydrates fresh.
      resetAccountData(dispatch);
    }
  }, [dispatch]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const updated = await authService.updateProfile(input);
      dispatch(onSetUserDetail(updated));
      return updated;
    },
    [dispatch],
  );

  // The backend stamps tokenValidAfter on a successful password change,
  // invalidating every token already issued (including the one used for
  // this very request) — same as logout(). No need to call the logout
  // endpoint too; it's already invalidated server-side, so this just
  // mirrors logout()'s local cleanup.
  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      await authService.changePassword(input);
      dispatch(onLogout());
      resetAccountData(dispatch);
    },
    [dispatch],
  );

  return {
    user: userDetail,
    isAuthenticated: isLogin,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  };
}
