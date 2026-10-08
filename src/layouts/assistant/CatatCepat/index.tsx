import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuInfo,
  LuRotateCcw,
  LuSquarePen,
  LuX,
} from "react-icons/lu";
import { AiMark } from "@/components/atoms/AiMark";
import { IconButton } from "@/components/atoms/IconButton";
import { ROUTES } from "@/constants/routes";
import { useAssistantChat } from "@/hooks/use-assistant-chat";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { AssistantErrorBanner } from "@/layouts/assistant/AssistantErrorBanner";
import { AssistantPreviewCard } from "@/layouts/assistant/AssistantPreviewCard";
import {
  AiBubble,
  AiRow,
  ChatEntry,
  TypingBubble,
  UserBubble,
} from "@/layouts/assistant/ChatBubble";
import { ChatComposer, type ChatComposerHandle } from "@/layouts/assistant/ChatComposer";
import { QuickReplyButton } from "@/layouts/assistant/QuickReplyButton";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import type {
  AssistantDraft,
  AssistantMessage,
  AssistantQuickReply,
} from "@/types/assistant.types";
import { toIntlLocale } from "@/utils/locale";

const EASE = [0.22, 1, 0.36, 1] as const;
const EXAMPLE_KEYS = ["example1", "example2", "example3", "example4", "example5"] as const;

/**
 * Catat Cepat (AI): desktop = floating right side panel over a scrim,
 * phone/tablet = full screen. Mounted once by the app shell, so the
 * conversation survives closing and reopening until "Mulai baru".
 */
export function CatatCepat() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isAssistantOpen, closeAssistant, openManualEntry } = useQuickAdd();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const chat = useAssistantChat();
  const { ensureData } = chat;

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ChatComposerHandle>(null);

  useEffect(() => {
    if (isAssistantOpen) ensureData();
  }, [isAssistantOpen, ensureData]);

  // Escape closes the panel unless a dialog (date picker) sits on top of it.
  useEffect(() => {
    if (!isAssistantOpen || isDatePickerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAssistant();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isAssistantOpen, isDatePickerOpen, closeAssistant]);

  // The phone screen covers the page: stop it from scrolling underneath.
  useEffect(() => {
    if (!isAssistantOpen || isDesktop) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isAssistantOpen, isDesktop]);

  // Chat-style scrolling: follow new content while the reader is at the
  // bottom; stop following once they scroll up to read older messages.
  const contentRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const lastTopRef = useRef(0);
  const lastMessage = chat.messages[chat.messages.length - 1];

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!isAssistantOpen || !el || !content) return;
    stickRef.current = true;
    el.scrollTop = el.scrollHeight;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [isAssistantOpen, isDesktop]);

  useEffect(() => {
    if (lastMessage?.role === "user") stickRef.current = true;
  }, [lastMessage]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (el.scrollTop < lastTopRef.current - 4 && distance > 96) stickRef.current = false;
    else if (distance < 96) stickRef.current = true;
    lastTopRef.current = el.scrollTop;
  }

  function handleManualEntry() {
    closeAssistant();
    openManualEntry();
  }

  function handleQuickReply(reply: AssistantQuickReply) {
    if (reply.icon === "calendar") {
      setDatePickerOpen(true);
      return;
    }
    chat.send(reply.label, reply.value);
  }

  const firstName = user?.nameUser?.split(" ")[0] ?? "";
  const hasConversation = chat.messages.length > 0;

  const header = isDesktop ? (
    <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-border pr-4 pl-5">
      <AiMark size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="truncate font-display text-[17px] font-semibold text-text">
          {t("assistant.title")}
        </h2>
        <p className="truncate text-[12px] text-text-3">{t("assistant.subtitle")}</p>
      </div>
      <button
        type="button"
        onClick={chat.reset}
        disabled={!hasConversation}
        className="pressable flex h-9 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-[12.5px] font-semibold text-text-2 hover:bg-surface-3 hover:text-text disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5"
      >
        <LuRotateCcw />
        {t("assistant.newChat")}
      </button>
      <IconButton label={t("assistant.close")} icon={<LuX />} size="sm" onClick={closeAssistant} />
    </div>
  ) : (
    <div className="flex h-[calc(64px+env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b border-border pt-[env(safe-area-inset-top)] pr-2.5 pl-2.5">
      <IconButton
        label={t("common.back")}
        icon={<LuArrowLeft />}
        size="lg"
        onClick={closeAssistant}
        tooltip={false}
      />
      <AiMark size="sm" />
      <div className="ml-0.5 flex min-w-0 flex-1 flex-col">
        <h2 className="truncate font-display text-[17px] font-semibold text-text">
          {t("assistant.title")}
        </h2>
        <p className="truncate text-[12px] text-text-3">{t("assistant.subtitle")}</p>
      </div>
      <IconButton
        label={t("assistant.manualEntry")}
        icon={<LuSquarePen />}
        size="lg"
        onClick={handleManualEntry}
        tooltip={false}
      />
      <IconButton
        label={t("assistant.newChat")}
        icon={<LuRotateCcw />}
        size="lg"
        onClick={chat.reset}
        disabled={!hasConversation}
        tooltip={false}
      />
    </div>
  );

  function renderMessage(message: AssistantMessage, index: number) {
    if (message.role === "user") {
      return (
        <ChatEntry key={message.id}>
          <UserBubble text={message.text} failed={message.failed} />
        </ChatEntry>
      );
    }

    switch (message.kind) {
      case "text": {
        const showReplies =
          message === lastMessage && !chat.isThinking && (message.quickReplies?.length ?? 0) > 0;
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <AiBubble>{message.text}</AiBubble>
              {showReplies && (
                <div className="flex flex-wrap gap-2">
                  {message.quickReplies?.map((reply, i) => (
                    <m.div
                      key={reply.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: EASE, delay: 0.08 + i * 0.05 }}
                      className="max-w-full"
                    >
                      <QuickReplyButton reply={reply} onSelect={handleQuickReply} />
                    </m.div>
                  ))}
                </div>
              )}
            </AiRow>
          </ChatEntry>
        );
      }
      case "preview": {
        let previousDrafts: AssistantDraft[] | undefined;
        if (message.revised) {
          for (let i = index - 1; i >= 0; i--) {
            const candidate = chat.messages[i];
            if (candidate.role === "assistant" && candidate.kind === "preview") {
              previousDrafts = candidate.drafts;
              break;
            }
          }
        }
        return (
          <ChatEntry key={message.id} className="flex flex-col gap-3">
            {message.text && (
              <AiRow>
                <AiBubble>{message.text}</AiBubble>
              </AiRow>
            )}
            <AssistantPreviewCard
              message={message}
              previousDrafts={previousDrafts}
              wallets={chat.wallets}
              categories={chat.categories}
              instruments={chat.instruments}
              onSave={() => void chat.save()}
              onCancel={chat.cancel}
            />
          </ChatEntry>
        );
      }
      case "success":
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <div className="flex flex-col gap-2 rounded-[6px_18px_18px_18px] bg-surface-2 px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-income-text">
                  <LuCircleCheck className="size-[17px] shrink-0" />
                  {t("assistant.savedReply", { count: message.count })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    closeAssistant();
                    navigate(ROUTES.TRANSACTIONS);
                  }}
                  className="group flex items-center gap-1 self-start text-[13px] font-semibold text-primary-text"
                >
                  {t("assistant.viewInTransactions")}
                  <LuArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </AiRow>
          </ChatEntry>
        );
      case "error":
        return (
          <ChatEntry key={message.id}>
            <AiRow>
              <AssistantErrorBanner
                error={message.error}
                onRetry={() => chat.retry(message.id)}
                onManualEntry={handleManualEntry}
                isBusy={chat.isThinking}
              />
            </AiRow>
          </ChatEntry>
        );
    }
  }

  const body = (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div ref={contentRef} className="flex min-h-full flex-col gap-3 px-4 py-4 sm:px-5 lg:py-5">
        <AiRow>
          <AiBubble>{t("assistant.greeting", { name: firstName })}</AiBubble>
        </AiRow>

        <AnimatePresence initial={false}>
          {!hasConversation && (
            <m.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div className="flex flex-col items-start gap-2 pt-1 pl-9">
                <span className="text-[12px] text-text-3">{t("assistant.examplesLabel")}</span>
                {EXAMPLE_KEYS.map((key, i) => (
                  <m.div
                    key={key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.1 + i * 0.05 }}
                    className="max-w-full"
                  >
                    <QuickReplyButton
                      reply={{ label: t(`assistant.${key}`) }}
                      onSelect={(reply) => chat.send(reply.label)}
                    />
                  </m.div>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-control bg-surface-2 px-3.5 py-3">
                <LuInfo className="mt-0.5 size-[15px] shrink-0 text-text-3" />
                <p className="text-[12.5px] leading-[1.45] text-text-2">
                  {t("assistant.capabilities")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleManualEntry}
                className="group flex items-center gap-2.5 rounded-control border border-border px-3.5 py-3 text-left transition-colors duration-200 hover:border-border-strong hover:bg-surface-2"
              >
                <LuSquarePen className="size-4 shrink-0 text-text-2" />
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="truncate text-[13px] font-semibold text-text">
                    {t("assistant.manualTitle")}
                  </span>
                  <span className="truncate text-[12px] text-text-3">
                    {t("assistant.manualSubtitle")}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-text">
                  {t("assistant.manualEntry")}
                  <LuArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            </m.div>
          )}
        </AnimatePresence>

        {/* Conversation sits at the bottom, chat-style. */}
        {hasConversation && <div className="flex-1" aria-hidden="true" />}

        <AnimatePresence initial={false}>
          {chat.messages.map(renderMessage)}
          {chat.isThinking && (
            <ChatEntry key="typing">
              <TypingBubble />
            </ChatEntry>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const composer = (
    <ChatComposer
      ref={composerRef}
      onSend={(text) => chat.send(text)}
      disabled={chat.isThinking}
      showDisclaimer={isDesktop}
    />
  );

  return createPortal(
    <>
      <AnimatePresence>
        {isAssistantOpen && isDesktop && (
          <m.div
            key="scrim"
            className="fixed inset-0 z-[45] bg-scrim backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={closeAssistant}
            aria-hidden="true"
          />
        )}
        {isAssistantOpen && (
          <m.aside
            key={isDesktop ? "panel" : "screen"}
            role="dialog"
            aria-modal="true"
            aria-label={t("assistant.title")}
            initial={isDesktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 32 }}
            animate={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={isDesktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.9 }}
            onAnimationComplete={() => {
              if (isDesktop && isAssistantOpen) composerRef.current?.focus();
            }}
            className={
              isDesktop
                ? "fixed top-3 right-3 bottom-3 z-[46] flex w-[440px] flex-col overflow-hidden rounded-sheet bg-surface shadow-pop"
                : "fixed inset-0 z-[46] flex flex-col bg-surface"
            }
          >
            {header}
            {body}
            {composer}
          </m.aside>
        )}
      </AnimatePresence>

      <DateTimePickerModal
        isOpen={isDatePickerOpen}
        value={new Date()}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          chat.pickDate(
            date,
            date.toLocaleDateString(toIntlLocale(language), {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          );
        }}
      />
    </>,
    document.body,
  );
}
