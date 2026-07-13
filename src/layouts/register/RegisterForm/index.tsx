import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { IconUser } from "@/components/atoms/Icons";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { LanguageMenuButton } from "@/components/molecules/LanguageMenuButton";
import { Words } from "@/components/atoms/Words";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [nameUser, setNameUser] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register({ nameUser, username, password });
      showToast(t("auth.registerSuccess"), "success");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label={t("auth.nameLabel")} htmlFor="nameUser">
        <Input
          id="nameUser"
          type="text"
          placeholder={t("auth.namePlaceholder")}
          autoComplete="name"
          startIcon={<IconUser className="h-4 w-4" />}
          value={nameUser}
          onChange={(event) => setNameUser(event.target.value)}
          required
        />
      </FormField>

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
          autoComplete="new-password"
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

      <Button type="submit" isLoading={isLoading} className="w-full">
        <Words type="sm/bold" as="span">
          {t("auth.registerSubmit")}
        </Words>
      </Button>

      <div className="flex items-center justify-center gap-1.5">
        <Words type="sm/regular" as="span" className="text-ink-500 dark:text-ink-400">
          {t("auth.alreadyHaveAccount")}
        </Words>
        <Link
          to={ROUTES.LOGIN}
          className="text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Words type="sm/bold" as="span">
            {t("auth.loginLink")}
          </Words>
        </Link>
      </div>

      <div className="flex justify-center">
        <LanguageMenuButton />
      </div>
    </form>
  );
}
