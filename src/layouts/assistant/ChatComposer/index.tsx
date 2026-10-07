import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowUp, LuSparkles } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  showDisclaimer?: boolean;
}

export interface ChatComposerHandle {
  focus: () => void;
}

const MAX_HEIGHT = 132;

/** Pill input + round send button (V2/ChatInput). Enter sends, Shift+Enter adds a line. */
export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(function ChatComposer(
  { onSend, disabled, showDisclaimer },
  ref,
) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), []);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    // Only show a scrollbar once the text is taller than the cap.
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  function submit() {
    if (!canSend) return;
    onSend(value);
    setValue("");
  }

  return (
    <form
      className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:px-4 lg:pt-3 lg:pb-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2">
        <label className="flex min-h-12 flex-1 items-center gap-2.5 rounded-[24px] bg-surface-2 py-1.5 pr-4 pl-4 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/35">
          <LuSparkles className="size-[18px] shrink-0 self-center text-primary-text" />
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={t("assistant.placeholder")}
            aria-label={t("assistant.placeholder")}
            className="max-h-[132px] flex-1 resize-none overflow-y-hidden bg-transparent py-1.5 text-[14px] leading-[1.45] text-text outline-none placeholder:text-text-3 focus-visible:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t("assistant.send")}
          className={cn(
            "pressable flex size-12 shrink-0 items-center justify-center rounded-full transition-colors duration-200 [&_svg]:size-5",
            canSend
              ? "bg-primary text-primary-fg shadow-[0_6px_16px_color-mix(in_oklab,var(--primary)_32%,transparent)] hover:brightness-[1.06]"
              : "bg-surface-2 text-text-3",
          )}
        >
          <LuArrowUp />
        </button>
      </div>
      {showDisclaimer && (
        <p className="text-center text-[11.5px] text-text-3">{t("assistant.disclaimer")}</p>
      )}
    </form>
  );
});
