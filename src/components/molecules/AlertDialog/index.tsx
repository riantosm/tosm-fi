import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/utils/cn";
import type { DialogVariant } from "@/types/dialog.types";

const VARIANT_ICON: Record<DialogVariant, IconType> = {
  confirm: HiOutlineQuestionMarkCircle,
  success: HiOutlineCheckCircle,
  error: HiOutlineExclamationTriangle,
  info: HiOutlineInformationCircle,
};

const VARIANT_ICON_CLASS: Record<DialogVariant, string> = {
  confirm: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
  success: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
  error: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
  info: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

interface AlertDialogProps {
  isOpen: boolean;
  variant?: DialogVariant;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
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
  isLoading = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const { t } = useTranslation();
  const Icon = VARIANT_ICON[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel ?? onConfirm}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            VARIANT_ICON_CLASS[variant],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h2>
          {description && <p className="text-sm text-ink-500 dark:text-ink-400">{description}</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {cancelLabel && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          variant={destructive ? "danger" : "primary"}
          className="flex-1"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel ?? t("common.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
