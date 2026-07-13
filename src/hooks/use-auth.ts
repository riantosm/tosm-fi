import { useCallback } from "react";
import { authService } from "@/services/auth.service";
import type { LoginCredentials, RegisterInput } from "@/types/auth.types";
import { onLogin, onLogout, useAppDispatch, useAppSelector } from "@/redux";

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
    }
  }, [dispatch]);

  return {
    user: userDetail,
    isAuthenticated: isLogin,
    register,
    login,
    logout,
  };
}
