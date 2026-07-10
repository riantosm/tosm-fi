import type { IconType } from "react-icons";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import type { ToastVariant } from "@/types/toast.types";
import { cn } from "@/utils/cn";

interface ToastProps {
  variant: ToastVariant;
  message: string;
}

const VARIANT_ICON: Record<ToastVariant, IconType> = {
  success: HiOutlineCheckCircle,
  error: HiOutlineExclamationTriangle,
  info: HiOutlineInformationCircle,
};

const VARIANT_ICON_CLASS: Record<ToastVariant, string> = {
  success: "text-primary-600 dark:text-primary-400",
  error: "text-red-500 dark:text-red-400",
  info: "text-ink-500 dark:text-ink-400",
};

export function Toast({ variant, message }: ToastProps) {
  const Icon = VARIANT_ICON[variant];

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 shadow-lg dark:border-ink-800 dark:bg-ink-900"
    >
      <Icon className={cn("h-5 w-5 shrink-0", VARIANT_ICON_CLASS[variant])} />
      <Words type="sm/bold" as="span" className="text-ink-800 dark:text-ink-200">
        {message}
      </Words>
    </div>
  );
}
