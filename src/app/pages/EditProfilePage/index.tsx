import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Words } from "@/components/atoms/Words";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";

export function EditProfilePage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex w-fit items-center gap-1.5 text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            <Words type="sm/bold" as="span">
              {t("common.back")}
            </Words>
          </Link>
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("profile.editProfileTitle")}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("profile.subtitle")}
          </Words>
        </div>

        <AccountInfoForm />
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
}

function AccountInfoForm() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();
  const [name, setName] = useState(user.nameUser ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const confirmed = await confirm({
      title: t("profile.updateConfirmTitle"),
      description: t("profile.updateConfirmDescription"),
      confirmLabel: t("profile.updateConfirmAction"),
      cancelLabel: t("common.cancel"),
    });
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await updateProfile({ nameUser: name.trim(), username: username.trim() });
      showToast(t("profile.updateSuccess"), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("profile.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
    >
      <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
        {t("profile.accountInfoTitle")}
      </Words>

      <FormField label={t("profile.nameLabel")} htmlFor="profile-name">
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("profile.namePlaceholder")}
          required
        />
      </FormField>

      <FormField label={t("profile.usernameLabel")} htmlFor="profile-username">
        <Input
          id="profile-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={t("profile.usernamePlaceholder")}
          required
        />
      </FormField>

      <div>
        <Button type="submit" isLoading={isSubmitting}>
          <Words type="sm/bold" as="span">
            {t("common.confirm")}
          </Words>
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword.length < 6) {
      showToast(t("profile.passwordTooShortError"), "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t("profile.passwordMismatchError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      showToast(t("profile.changePasswordSuccess"), "success");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("profile.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="flex flex-col gap-1">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {t("profile.changePasswordTitle")}
        </Words>
        <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
          {t("profile.changePasswordHint")}
        </Words>
      </div>

      <FormField label={t("profile.currentPasswordLabel")} htmlFor="profile-current-password">
        <PasswordInput
          id="profile-current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </FormField>

      <FormField label={t("profile.newPasswordLabel")} htmlFor="profile-new-password">
        <PasswordInput
          id="profile-new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </FormField>

      <FormField label={t("profile.confirmPasswordLabel")} htmlFor="profile-confirm-password">
        <PasswordInput
          id="profile-confirm-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </FormField>

      <div>
        <Button type="submit" variant="danger" isLoading={isSubmitting}>
          <Words type="sm/bold" as="span">
            {t("profile.changePasswordAction")}
          </Words>
        </Button>
      </div>
    </form>
  );
}
