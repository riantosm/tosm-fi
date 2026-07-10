import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { LoginForm } from "@/layouts/login/LoginForm";

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("auth.welcomeTitle")} subtitle={t("auth.welcomeSubtitle")}>
      <LoginForm />
    </AuthLayout>
  );
}
