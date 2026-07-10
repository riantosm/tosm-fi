import type { ReactNode } from "react";
import { Words } from "@/components/atoms/Words";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor}>
        <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
          {label}
        </Words>
      </label>
      {children}
      {error && (
        <Words type="xs/regular" className="text-red-500">
          {error}
        </Words>
      )}
    </div>
  );
}
