import axios from "axios";
import { store } from "@/redux/store";
import { onSessionExpired } from "@/redux/slices/authenticationSlice";
import { resetAccountData } from "@/redux/reset-account-data";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = store.getState().authentication.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = the token itself is missing/invalid/expired (requireAuth /
    // requireActiveUser on the backend). Only auto-logout if we *were*
    // logged in — a 401 from the login request itself (wrong password) is
    // not a session expiry, and is handled by the caller's own try/catch.
    const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401;
    if (isUnauthorized && store.getState().authentication.isLogin) {
      store.dispatch(onSessionExpired());
      resetAccountData(store.dispatch);
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
