import type { IconType } from "react-icons";
import { LuCircleAlert, LuCircleCheck, LuInfo } from "react-icons/lu";
import type { ToastVariant } from "@/types/toast.types";
import { cn } from "@/utils/cn";

interface ToastProps {
  variant: ToastVariant;
  message: string;
}

const VARIANT_ICON: Record<ToastVariant, IconType> = {
  success: LuCircleCheck,
  error: LuCircleAlert,
  info: LuInfo,
};

const VARIANT_ICON_CLASS: Record<ToastVariant, string> = {
  success: "bg-income-soft text-income-text",
  error: "bg-expense-soft text-expense-text",
  info: "bg-primary-soft text-primary-text",
};

export function Toast({ variant, message }: ToastProps) {
  const Icon = VARIANT_ICON[variant];

  return (
    <div
      role="status"
      className="flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full bg-surface py-2.5 pr-4 pl-2.5 shadow-float"
    >
      <span
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-full",
          VARIANT_ICON_CLASS[variant],
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="truncate text-[13.5px] font-medium text-text">{message}</span>
    </div>
  );
}
