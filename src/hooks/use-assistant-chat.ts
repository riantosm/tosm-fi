import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AssistantCommitError,
  AssistantError,
  assistantService,
} from "@/services/assistant.service";
import { useCategories } from "@/hooks/use-categories";
import { useInstruments } from "@/hooks/use-instruments";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/use-wallets";
import { addInvestmentTransaction, addTransaction, useAppDispatch } from "@/redux";
import type {
  AssistantDraft,
  AssistantMessage,
  AssistantReply,
  AssistantRequest,
} from "@/types/assistant.types";

type PreviewMessage = Extract<AssistantMessage, { kind: "preview" }>;

let messageSeq = 0;
const newMessageId = () => `m${Date.now().toString(36)}${(messageSeq++).toString(36)}`;

/** The date picker's answer, as the local wall-clock time the assistant reasons in. */
function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toHistory(messages: AssistantMessage[]): AssistantRequest["history"] {
  const history: AssistantRequest["history"] = [];
  for (const message of messages) {
    if (message.role === "user") {
      if (!message.failed) history.push({ role: "user", text: message.payload ?? message.text });
    } else if ((message.kind === "text" || message.kind === "preview") && message.text) {
      history.push({ role: "assistant", text: message.text });
    }
  }
  return history;
}

/**
 * Catat Cepat conversation state. `assistantService.chat` turns the
 * conversation into drafts; a confirmed preview is saved in one go by
 * `assistantService.commit` (one database transaction for the whole batch,
 * investment ledger rows included), then the same mutation signals and
 * resyncs as a manual entry follow.
 */
export function useAssistantChat() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { wallets, status: walletStatus, loadWallets } = useWallets();
  const { categories, status: categoryStatus, loadCategories } = useCategories();
  const { instruments, status: instrumentStatus, loadInstruments } = useInstruments();

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [drafts, setDrafts] = useState<AssistantDraft[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // The latest values for async callbacks (a reply can land after a reset).
  const messagesRef = useRef(messages);
  const draftsRef = useRef(drafts);
  const sessionRef = useRef(0);
  useEffect(() => {
    messagesRef.current = messages;
    draftsRef.current = drafts;
  }, [messages, drafts]);

  /** The preview resolves names from these, even if no page has loaded them yet. */
  const ensureData = useCallback(() => {
    if (walletStatus === "idle") void loadWallets();
    if (categoryStatus === "idle") void loadCategories();
    if (instrumentStatus === "idle") void loadInstruments();
  }, [
    walletStatus,
    categoryStatus,
    instrumentStatus,
    loadWallets,
    loadCategories,
    loadInstruments,
  ]);

  const pendingPreview = useCallback(
    (list: AssistantMessage[]) =>
      [...list]
        .reverse()
        .find(
          (m): m is PreviewMessage =>
            m.role === "assistant" && m.kind === "preview" && m.status === "pending",
        ),
    [],
  );

  const setPreviewStatus = useCallback(
    (id: string, status: PreviewMessage["status"], extra?: Partial<PreviewMessage>) => {
      setMessages((list) =>
        list.map((m) =>
          m.id === id && m.role === "assistant" && m.kind === "preview"
            ? { ...m, status, ...extra }
            : m,
        ),
      );
    },
    [],
  );

  const save = useCallback(async () => {
    const preview = pendingPreview(messagesRef.current);
    if (!preview || preview.drafts.some((d) => d.error)) return;
    const session = sessionRef.current;
    setPreviewStatus(preview.id, "saving");

    try {
      const result = await assistantService.commit(preview.drafts, language);
      result.transactions.forEach((transaction) => dispatch(addTransaction(transaction)));
      result.investmentTransactions.forEach((entry) => dispatch(addInvestmentTransaction(entry)));
      // Balances, counts and account values moved server-side: resync them.
      void Promise.all([
        loadWallets(),
        loadCategories(),
        result.investmentTransactions.length > 0 ? loadInstruments() : null,
      ]).catch(() => {});

      if (session !== sessionRef.current) return;
      const count = preview.drafts.length;
      setPreviewStatus(preview.id, "saved", { savedAt: new Date().toISOString() });
      setMessages((list) => [
        ...list,
        { id: newMessageId(), role: "assistant", kind: "success", count },
      ]);
      setDrafts([]);
      showToast(t("assistant.savedToast", { count }), "success");
    } catch (error) {
      if (session !== sessionRef.current) return;
      // The batch is one database transaction, so nothing was saved: keep the
      // preview and mark the row the backend rejected (if it named one).
      const message = error instanceof Error ? error.message : t("transaction.genericError");
      const idDraft = error instanceof AssistantCommitError ? error.idDraft : null;
      const drafts = preview.drafts.map((d) =>
        d.idDraft === idDraft ? { ...d, error: message } : d,
      );
      setPreviewStatus(preview.id, "pending", { drafts });
      setDrafts(drafts);
      showToast(message, "error");
    }
  }, [
    pendingPreview,
    setPreviewStatus,
    language,
    dispatch,
    loadWallets,
    loadCategories,
    loadInstruments,
    showToast,
    t,
  ]);

  const cancel = useCallback(() => {
    const preview = pendingPreview(messagesRef.current);
    if (preview) setPreviewStatus(preview.id, "cancelled");
    setDrafts([]);
    setMessages((list) => [
      ...list,
      { id: newMessageId(), role: "assistant", kind: "text", text: t("assistant.cancelledReply") },
    ]);
  }, [pendingPreview, setPreviewStatus, t]);

  const applyReply = useCallback(
    (reply: AssistantReply) => {
      switch (reply.intent) {
        case "save":
          void save();
          return;
        case "cancel":
          cancel();
          return;
        case "preview": {
          const previous = pendingPreview(messagesRef.current);
          setMessages((list) => [
            ...list.map((m) =>
              previous && m.id === previous.id ? { ...previous, status: "replaced" as const } : m,
            ),
            {
              id: newMessageId(),
              role: "assistant",
              kind: "preview",
              text: reply.reply,
              drafts: reply.drafts,
              status: "pending",
              revised: reply.drafts.some((d) => d.changed?.length),
            },
          ]);
          setDrafts(reply.drafts);
          return;
        }
        default: {
          // A question about the drafts means the preview on screen is about to
          // change: retire its Simpan so an outdated batch can't be saved.
          const stale = reply.intent === "ask" ? pendingPreview(messagesRef.current) : undefined;
          setMessages((list) => [
            ...list.map((m) =>
              stale && m.id === stale.id ? { ...stale, status: "replaced" as const } : m,
            ),
            {
              id: newMessageId(),
              role: "assistant",
              kind: "text",
              text: reply.reply,
              quickReplies: reply.quickReplies,
            },
          ]);
          setDrafts(reply.drafts);
        }
      }
    },
    [save, cancel, pendingPreview],
  );

  const request = useCallback(
    async (history: AssistantMessage[], userMessageId: string) => {
      const session = sessionRef.current;
      setIsThinking(true);
      try {
        const reply = await assistantService.chat({
          history: toHistory(history),
          drafts: draftsRef.current,
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          language,
          hasPreview: Boolean(pendingPreview(history)),
        });
        if (session !== sessionRef.current) return;
        applyReply(reply);
      } catch (error) {
        if (session !== sessionRef.current) return;
        const kind = error instanceof AssistantError ? error.kind : "network";
        const userMessage = history.find((m) => m.id === userMessageId);
        const retryText =
          userMessage?.role === "user" ? (userMessage.payload ?? userMessage.text) : "";
        setMessages((list) => [
          ...list.map((m) =>
            kind === "network" && m.id === userMessageId ? { ...m, failed: true } : m,
          ),
          { id: newMessageId(), role: "assistant", kind: "error", error: kind, retryText },
        ]);
      } finally {
        if (session === sessionRef.current) setIsThinking(false);
      }
    },
    [language, pendingPreview, applyReply],
  );

  const send = useCallback(
    (text: string, payload?: string) => {
      const clean = text.trim();
      if (!clean || isThinking) return;
      const userMessage: AssistantMessage = {
        id: newMessageId(),
        role: "user",
        text: clean,
        payload,
      };
      // Error banners are transient: a new message supersedes them.
      const next = [
        ...messagesRef.current.filter((m) => !(m.role === "assistant" && m.kind === "error")),
        userMessage,
      ];
      setMessages(next);
      void request(next, userMessage.id);
    },
    [isThinking, request],
  );

  /** Re-sends the message behind an error banner. */
  const retry = useCallback(
    (errorId: string) => {
      if (isThinking) return;
      const list = messagesRef.current;
      const errorIndex = list.findIndex((m) => m.id === errorId);
      if (errorIndex === -1) return;
      const before = list
        .slice(0, errorIndex)
        .map((m) => (m.role === "user" && m.failed ? { ...m, failed: false } : m));
      const lastUser = [...before].reverse().find((m) => m.role === "user");
      setMessages(before);
      if (lastUser) void request(before, lastUser.id);
    },
    [isThinking, request],
  );

  /** Answer to "Apakah transaksi ini hari ini?" with a date from the picker. */
  const pickDate = useCallback(
    (date: Date, label: string) => send(label, toLocalDateTime(date)),
    [send],
  );

  const reset = useCallback(() => {
    sessionRef.current += 1;
    setMessages([]);
    setDrafts([]);
    setIsThinking(false);
  }, []);

  return {
    messages,
    drafts,
    isThinking,
    wallets,
    categories,
    instruments,
    ensureData,
    send,
    retry,
    pickDate,
    save,
    cancel,
    reset,
  };
}
