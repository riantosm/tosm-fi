import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { LuCircleAlert, LuCircleCheck, LuCircleHelp, LuInfo, LuTrash2 } from "react-icons/lu";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/utils/cn";
import type { DialogVariant } from "@/types/dialog.types";

const VARIANT_ICON: Record<DialogVariant, IconType> = {
  confirm: LuCircleHelp,
  success: LuCircleCheck,
  error: LuCircleAlert,
  info: LuInfo,
};

const VARIANT_ICON_CLASS: Record<DialogVariant, string> = {
  confirm: "bg-primary-soft text-primary-text",
  success: "bg-income-soft text-income-text",
  error: "bg-expense-soft text-expense-text",
  info: "bg-surface-2 text-text-2",
};

interface AlertDialogProps {
  isOpen: boolean;
  variant?: DialogVariant;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Overrides the variant/destructive icon. */
  icon?: IconType;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function AlertDialog({
  isOpen,
  variant = "confirm",
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const { t } = useTranslation();
  const Icon = icon ?? (destructive ? LuTrash2 : VARIANT_ICON[variant]);
  const iconClass = destructive ? VARIANT_ICON_CLASS.error : VARIANT_ICON_CLASS[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel ?? onConfirm} size="sm" placement="center">
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div className={cn("flex size-16 items-center justify-center rounded-full", iconClass)}>
          <Icon className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[21px] font-semibold text-text">{title}</h2>
          {description && <p className="text-[14px] leading-relaxed text-text-2">{description}</p>}
        </div>
      </div>

      <ModalActions className="mt-6">
        {cancelLabel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          variant={destructive ? "danger" : "primary"}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel ?? t("common.confirm")}
        </Button>
      </ModalActions>
    </Modal>
  );
}
