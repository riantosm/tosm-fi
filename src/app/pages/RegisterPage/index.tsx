import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { RegisterForm } from "@/layouts/register/RegisterForm";

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <RegisterForm />
    </AuthLayout>
  );
}
