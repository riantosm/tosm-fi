import type { ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "@/utils/cn";

export type AuthNoticeTone = "error" | "warning" | "info";

interface AuthNoticeProps {
  icon: ReactNode;
  title: string;
  description?: string;
  tone: AuthNoticeTone;
}

const TONE_CLASS: Record<AuthNoticeTone, { box: string; text: string }> = {
  error: { box: "bg-expense-soft", text: "text-expense-text" },
  warning: { box: "bg-investment-soft", text: "text-investment-text" },
  info: { box: "bg-primary-soft", text: "text-primary-text" },
};

/** Login / register banner — red for failures, amber for a pending account, primary for notes. */
export function AuthNotice({ icon, title, description, tone }: AuthNoticeProps) {
  const toneClass = TONE_CLASS[tone];

  return (
    <m.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      role={tone === "info" ? undefined : "alert"}
      className={cn("flex items-start gap-3 rounded-control px-3.5 py-3", toneClass.box)}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-surface [&_svg]:size-4",
          toneClass.text,
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-[13.5px] font-semibold", toneClass.text)}>{title}</span>
        {description && (
          <span className="text-[12.5px] leading-relaxed text-text-2">{description}</span>
        )}
      </span>
    </m.div>
  );
}
