import { useCallback } from "react";
import { authService } from "@/services/auth.service";
import type { LoginCredentials } from "@/types/auth.types";
import { onLogin, onLogout, useAppDispatch, useAppSelector } from "@/redux";

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.authentication.isLogin);
  const userDetail = useAppSelector((state) => state.authentication.userDetail);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const authenticatedUser = await authService.login(credentials);
      dispatch(onLogin({ userDetail: authenticatedUser }));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(onLogout());
  }, [dispatch]);

  return {
    user: userDetail,
    isAuthenticated: isLogin,
    login,
    logout,
  };
}
