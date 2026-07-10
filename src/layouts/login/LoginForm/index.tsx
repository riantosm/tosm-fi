import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { IconMail } from "@/components/atoms/Icons";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { LanguageMenuButton } from "@/components/molecules/LanguageMenuButton";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password, remember });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label={t("auth.emailLabel")} htmlFor="email">
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          autoComplete="email"
          startIcon={<IconMail className="h-4 w-4" />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
          <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          {t("auth.rememberMe")}
        </label>
        <a
          href="#"
          className="text-sm font-medium text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
        >
          {t("auth.forgotPassword")}
        </a>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        {t("auth.submit")}
      </Button>

      <div className="flex justify-center">
        <LanguageMenuButton />
      </div>
    </form>
  );
}
