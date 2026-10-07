import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuAtSign,
  LuCheck,
  LuInfo,
  LuKeyRound,
  LuShieldCheck,
  LuUser,
  LuUserCheck,
} from "react-icons/lu";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { FormField } from "@/components/molecules/FormField";
import { PageHeader } from "@/components/molecules/PageHeader";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { SettingsPanel } from "@/layouts/settings/SettingsPanel";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";

export function EditProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("profile.editProfileTitle")}
        subtitle={t("profile.subtitle")}
        backTo={ROUTES.DASHBOARD}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-5">
        <Reveal immediate>
          <IdentityCard />
        </Reveal>
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <Reveal delay={0.04}>
            <AccountInfoForm />
          </Reveal>
          <Reveal delay={0.08}>
            <ChangePasswordForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function RoleBadge() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12.5px] font-semibold text-primary-text shadow-card">
      <LuShieldCheck className="size-3.5" />
      {user.role === "admin" ? t("profile.roleAdmin") : t("profile.roleUser")}
    </span>
  );
}

/** Gradient identity block: avatar, name, @username and role. */
function IdentityCard() {
  const { user } = useAuth();

  return (
    <Card tone="hero" padding="none" className="rounded-[24px] p-4 lg:rounded-[28px] lg:p-7">
      {/* Phone: one row */}
      <div className="flex items-center gap-3.5 lg:hidden">
        <Avatar name={user.nameUser} size="lg" className="bg-surface ring-2 ring-primary" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-display text-[17px] font-semibold text-hero-fg">
            {user.nameUser}
          </span>
          <span className="truncate text-[13px] text-hero-fg-2">@{user.username}</span>
        </span>
        <RoleBadge />
      </div>
      {/* Desktop: centered stack */}
      <div className="hidden flex-col items-center gap-2 text-center lg:flex">
        <Avatar name={user.nameUser} size="xl" className="bg-surface ring-[3px] ring-primary" />
        <span className="mt-2 max-w-full truncate font-display text-[22px] font-semibold text-hero-fg">
          {user.nameUser}
        </span>
        <span className="-mt-1 text-[14px] text-hero-fg-2">@{user.username}</span>
        <span className="mt-1">
          <RoleBadge />
        </span>
      </div>
    </Card>
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
  const isUnchanged =
    name.trim() === (user.nameUser ?? "") && username.trim() === (user.username ?? "");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const confirmed = await confirm({
      title: t("profile.updateConfirmTitle"),
      description: t("profile.updateConfirmDescription"),
      confirmLabel: t("profile.updateConfirmAction"),
      cancelLabel: t("common.cancel"),
      icon: LuUserCheck,
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
    <SettingsPanel icon={<LuUser />} title={t("profile.accountInfoTitle")}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4 lg:gap-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label={t("profile.nameLabel")} htmlFor="profile-name">
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("profile.namePlaceholder")}
              startIcon={<LuUser />}
              autoComplete="name"
              required
            />
          </FormField>
          <FormField label={t("profile.usernameLabel")} htmlFor="profile-username">
            <Input
              id="profile-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t("profile.usernamePlaceholder")}
              startIcon={<LuAtSign />}
              autoComplete="username"
              required
            />
          </FormField>
        </div>
        <Button
          type="submit"
          leftIcon={<LuCheck />}
          isLoading={isSubmitting}
          disabled={isSubmitting || isUnchanged || !name.trim() || !username.trim()}
          className="w-full lg:w-auto lg:self-end"
        >
          {t("profile.updateConfirmAction")}
        </Button>
      </form>
    </SettingsPanel>
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
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

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
    <SettingsPanel icon={<LuKeyRound />} title={t("profile.changePasswordTitle")}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4 lg:gap-5">
        <FormField label={t("profile.currentPasswordLabel")} htmlFor="profile-current-password">
          <PasswordInput
            id="profile-current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label={t("profile.newPasswordLabel")} htmlFor="profile-new-password">
            <PasswordInput
              id="profile-new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </FormField>
          <FormField
            label={t("profile.confirmPasswordLabel")}
            htmlFor="profile-confirm-password"
            error={isMismatch ? t("profile.passwordMismatchError") : undefined}
          >
            <PasswordInput
              id="profile-confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              hasError={isMismatch}
              required
            />
          </FormField>
        </div>

        <div className="flex items-start gap-3 rounded-control bg-primary-soft px-3.5 py-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-primary-text">
            <LuInfo className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold text-primary-text">
              {t("profile.changePasswordHintTitle")}
            </span>
            <span className="text-[12.5px] leading-relaxed text-text-2">
              {t("profile.changePasswordHint")}
            </span>
          </span>
        </div>

        <Button
          type="submit"
          leftIcon={<LuKeyRound />}
          isLoading={isSubmitting}
          disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          className="w-full lg:w-auto lg:self-end"
        >
          {t("profile.changePasswordAction")}
        </Button>
      </form>
    </SettingsPanel>
  );
}
