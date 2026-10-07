import type { ReactNode } from "react";
import { m } from "motion/react";
import { useTranslation } from "react-i18next";
import { LuCircleAlert } from "react-icons/lu";
import { AiMark } from "@/components/atoms/AiMark";
import { cn } from "@/utils/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Every chat entry mounts with the same soft rise. */
export function ChatEntry({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.32, ease: EASE }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/** AI avatar column + content (bubble, card or banner). */
export function AiRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <AiMark size="xs" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">{children}</div>
    </div>
  );
}

export function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-[6px_18px_18px_18px] bg-surface-2 px-3.5 py-2.5 text-[14px] leading-[1.45] whitespace-pre-line text-text">
      {children}
    </div>
  );
}

export function UserBubble({ text, failed }: { text: string; failed?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-end gap-1.5 pl-10">
      <div
        className={cn(
          "max-w-full rounded-[18px_6px_18px_18px] bg-primary px-3.5 py-2.5 text-[14px] leading-[1.45] break-words whitespace-pre-line text-primary-fg",
          failed && "opacity-70",
        )}
      >
        {text}
      </div>
      {failed && (
        <span className="flex items-center gap-1 text-[12px] font-medium text-expense-text">
          <LuCircleAlert className="size-3.5" />
          {t("assistant.sendFailed")}
        </span>
      )}
    </div>
  );
}

export function TypingBubble() {
  return (
    <AiRow>
      <div className="flex items-center gap-[5px] rounded-[6px_18px_18px_18px] bg-surface-2 px-4 py-[15px]">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className="size-[7px] animate-typing rounded-full bg-text-3"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </AiRow>
  );
}
