import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/atoms/Input";
import { IconEye, IconEyeOff, IconLock } from "@/components/atoms/Icons";
import { Tooltip } from "@/components/atoms/Tooltip";
import type { InputHTMLAttributes } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput(props: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      startIcon={<IconLock className="h-4 w-4" />}
      endSlot={
        <Tooltip content={visible ? t("auth.hidePassword") : t("auth.showPassword")}>
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="text-ink-400 hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300"
            aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </button>
        </Tooltip>
      }
    />
  );
}
