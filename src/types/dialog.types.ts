export type DialogVariant = "confirm" | "success" | "error" | "info";

export interface ConfirmOptions {
  variant?: DialogVariant;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}
