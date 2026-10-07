import type { HttpMethod } from "@/constants/api-docs";
import { cn } from "@/utils/cn";

interface MethodBadgeProps {
  method: HttpMethod;
}

const METHOD_CLASS: Record<HttpMethod, string> = {
  GET: "bg-income-soft text-income-text",
  POST: "bg-primary-soft text-primary-text",
  PUT: "bg-investment-soft text-investment-text",
  PATCH: "bg-investment-soft text-investment-text",
  DELETE: "bg-expense-soft text-expense-text",
};

export function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-[62px] shrink-0 justify-center rounded-[8px] py-1 font-mono text-[11.5px] font-bold",
        METHOD_CLASS[method],
      )}
    >
      {method}
    </span>
  );
}
