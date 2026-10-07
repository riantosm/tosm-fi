import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: ReactNode;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, helper, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text-2">
        {label}
      </label>
      {children}
      {error ? (
        <p className="animate-fade-in text-[12px] font-medium text-expense-text">{error}</p>
      ) : (
        helper && <p className="text-[12px] text-text-3">{helper}</p>
      )}
    </div>
  );
}
