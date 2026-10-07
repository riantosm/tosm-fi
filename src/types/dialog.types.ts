import type { IconType } from "react-icons";

export type DialogVariant = "confirm" | "success" | "error" | "info";

export interface ConfirmOptions {
  /** Overrides the circle icon (e.g. a calendar for schedule dialogs). */
  icon?: IconType;
  variant?: DialogVariant;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}
