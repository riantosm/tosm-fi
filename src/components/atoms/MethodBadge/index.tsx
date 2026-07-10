import { Words } from "@/components/atoms/Words";
import type { HttpMethod } from "@/constants/api-docs";
import { cn } from "@/utils/cn";

interface MethodBadgeProps {
  method: HttpMethod;
}

const METHOD_CLASS: Record<HttpMethod, string> = {
  GET: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  POST: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  PUT: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  PATCH: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  DELETE: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 rounded-md px-2 py-0.5 font-mono",
        METHOD_CLASS[method],
      )}
    >
      <Words type="xs/bold" as="span">
        {method}
      </Words>
    </span>
  );
}
