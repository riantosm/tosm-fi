import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { IconUser } from "@/components/atoms/Icons";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { LanguageMenuButton } from "@/components/molecules/LanguageMenuButton";
import { Words } from "@/components/atoms/Words";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { onDismissSessionExpired, useAppDispatch, useAppSelector } from "@/redux";

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const sessionExpired = useAppSelector((state) => state.authentication.sessionExpired);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      setError(t("auth.sessionExpired"));
      dispatch(onDismissSessionExpired());
    }
  }, [sessionExpired, dispatch, t]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ username, password, remember });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label={t("auth.usernameLabel")} htmlFor="username">
        <Input
          id="username"
          type="text"
          placeholder={t("auth.usernamePlaceholder")}
          autoComplete="username"
          startIcon={<IconUser className="h-4 w-4" />}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
          required
        />
      </FormField>

      {error && (
        <Words
          type="sm/regular"
          className="rounded-lg bg-red-50 px-3 py-2 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </Words>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-ink-600 dark:text-ink-400">
          <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          <Words type="sm/regular" as="span">
            {t("auth.rememberMe")}
          </Words>
        </label>
        <a
          href="#"
          className="text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Words type="sm/bold" as="span">
            {t("auth.forgotPassword")}
          </Words>
        </a>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        <Words type="sm/bold" as="span">
          {t("auth.submit")}
        </Words>
      </Button>

      <div className="flex justify-center">
        <LanguageMenuButton />
      </div>
    </form>
  );
}
