import { LuCalendar } from "react-icons/lu";
import type { AssistantQuickReply } from "@/types/assistant.types";

interface QuickReplyButtonProps {
  reply: AssistantQuickReply;
  onSelect: (reply: AssistantQuickReply) => void;
  disabled?: boolean;
}

/** Outlined primary pill the assistant offers as a one-tap answer (V2/QuickReply). */
export function QuickReplyButton({ reply, onSelect, disabled }: QuickReplyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(reply)}
      className="pressable flex h-11 max-w-full items-center gap-2 rounded-full border border-primary bg-surface px-4 text-[13.5px] font-semibold text-primary-text hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-50"
    >
      {reply.dot && (
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: reply.dot }} />
      )}
      {reply.icon === "calendar" && <LuCalendar className="size-[15px] shrink-0" />}
      <span className="truncate">{reply.label}</span>
    </button>
  );
}
