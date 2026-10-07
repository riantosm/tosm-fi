import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "motion/react";
import axios from "axios";
import { LuCircleAlert, LuHourglass, LuLogIn, LuLogOut, LuUser } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { AuthNotice, type AuthNoticeTone } from "@/layouts/auth/AuthNotice";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { onDismissSessionExpired, useAppDispatch, useAppSelector } from "@/redux";
import { cn } from "@/utils/cn";

interface LoginError {
  tone: AuthNoticeTone;
  title: string;
  description: string;
}

const NOTICE_ICON: Record<AuthNoticeTone, typeof LuCircleAlert> = {
  error: LuCircleAlert,
  warning: LuHourglass,
  info: LuLogOut,
};

/** `/user/me` answers 403 while the account still waits for admin approval. */
function isPendingApproval(error: unknown): boolean {
  const cause = error instanceof Error ? error.cause : undefined;
  return axios.isAxiosError(cause) && cause.response?.status === 403;
}

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const sessionExpired = useAppSelector((state) => state.authentication.sessionExpired);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show the "session expired" banner once (adjusting state during render,
  // not in an effect), then clear the flag so it doesn't reappear later.
  const [hasShownExpired, setHasShownExpired] = useState(false);
  if (sessionExpired && !hasShownExpired) {
    setHasShownExpired(true);
    setError({
      tone: "info",
      title: t("auth.sessionExpiredTitle"),
      description: t("auth.sessionExpired"),
    });
  }
  useEffect(() => {
    if (sessionExpired) dispatch(onDismissSessionExpired());
  }, [sessionExpired, dispatch]);

  const NoticeIcon = NOTICE_ICON[error?.tone ?? "error"];

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ username, password, remember });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(
        isPendingApproval(err)
          ? {
              tone: "warning",
              title: t("auth.pendingTitle"),
              description: t("auth.pendingDescription"),
            }
          : {
              tone: "error",
              title: t("auth.loginErrorTitle"),
              description: err instanceof Error ? err.message : t("auth.genericError"),
            },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {error && (
          <AuthNotice
            key={error.tone}
            tone={error.tone}
            icon={<NoticeIcon />}
            title={error.title}
            description={error.description}
          />
        )}
      </AnimatePresence>

      <FormField label={t("auth.usernameLabel")} htmlFor="username">
        <Input
          id="username"
          type="text"
          placeholder={t("auth.usernamePlaceholder")}
          autoComplete="username"
          startIcon={<LuUser />}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          boxClassName="bg-surface border-border"
          required
        />
      </FormField>

      <FormField label={t("auth.passwordLabel")} htmlFor="password">
        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          boxClassName={cn("bg-surface", error?.tone !== "error" && "border-border")}
          hasError={error?.tone === "error"}
          required
        />
      </FormField>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-text-2">
          <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          {t("auth.rememberMe")}
        </label>
        <a
          href="#"
          className="text-[13.5px] font-semibold text-primary-text transition-colors hover:text-primary"
        >
          {t("auth.forgotPassword")}
        </a>
      </div>

      <Button
        type="submit"
        size="lg"
        leftIcon={<LuLogIn />}
        isLoading={isLoading}
        fullWidth
        className="mt-1"
      >
        {t("auth.submit")}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-[13.5px] text-text-2">
        {t("auth.noAccount")}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-primary-text transition-colors hover:text-primary"
        >
          {t("auth.registerLink")}
        </Link>
      </p>
    </form>
  );
}
