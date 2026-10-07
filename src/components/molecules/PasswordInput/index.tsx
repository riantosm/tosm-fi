import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { Input } from "@/components/atoms/Input";
import type { InputHTMLAttributes } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  /** Classes for the outer field box (e.g. the white bordered auth variant). */
  boxClassName?: string;
};

export function PasswordInput({ hasError, boxClassName, ...props }: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = visible ? t("auth.hidePassword") : t("auth.showPassword");

  return (
    <Input
      {...props}
      hasError={hasError}
      boxClassName={boxClassName}
      type={visible ? "text" : "password"}
      startIcon={<LuLock />}
      endSlot={
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="pressable -mr-1 flex size-8 items-center justify-center rounded-full text-text-3 hover:bg-surface-3 hover:text-text"
          aria-label={label}
          title={label}
        >
          {visible ? <LuEyeOff className="size-[17px]" /> : <LuEye className="size-[17px]" />}
        </button>
      }
    />
  );
}
