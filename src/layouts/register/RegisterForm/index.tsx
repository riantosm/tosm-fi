import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "motion/react";
import { LuAtSign, LuCircleAlert, LuIdCard, LuShieldCheck, LuUserPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { AuthNotice } from "@/layouts/auth/AuthNotice";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <FormField label={t("auth.nameLabel")} htmlFor="nameUser">
        <Input
          id="nameUser"
          type="text"
          placeholder={t("auth.namePlaceholder")}
          autoComplete="name"
          startIcon={<LuIdCard />}
          value={nameUser}
          onChange={(event) => setNameUser(event.target.value)}
          boxClassName="bg-surface border-border"
          required
        />
      </FormField>

      <FormField label={t("auth.usernameLabel")} htmlFor="username">
        <Input
          id="username"
          type="text"
          placeholder={t("auth.usernamePlaceholder")}
          autoComplete="username"
          startIcon={<LuAtSign />}
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          boxClassName="bg-surface border-border"
          required
        />
      </FormField>

      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <AuthNotice
            key="error"
            tone="error"
            icon={<LuCircleAlert />}
            title={t("auth.registerErrorTitle")}
            description={error}
          />
        ) : (
          <AuthNotice
            key="info"
            tone="info"
            icon={<LuShieldCheck />}
            title={t("auth.approvalInfoTitle")}
            description={t("auth.approvalInfoDescription")}
          />
        )}
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        leftIcon={<LuUserPlus />}
        isLoading={isLoading}
        fullWidth
        className="mt-1"
      >
        {t("auth.registerSubmit")}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-[13.5px] text-text-2">
        {t("auth.alreadyHaveAccount")}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-primary-text transition-colors hover:text-primary"
        >
          {t("auth.loginLink")}
        </Link>
      </p>
    </form>
  );
}
