export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}
