import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AssistantError, assistantService } from "@/services/assistant.service";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import type {
  AssistantDraft,
  AssistantMessage,
  AssistantReply,
  AssistantRequest,
} from "@/types/assistant.types";
import type { TransactionInput } from "@/types/transaction.types";

type PreviewMessage = Extract<AssistantMessage, { kind: "preview" }>;

let messageSeq = 0;
const newMessageId = () => `m${Date.now().toString(36)}${(messageSeq++).toString(36)}`;

/** Maps a wallet-kind draft to the exact payload AddTransactionModal / BalanceCorrectionModal send. */
function toTransactionInput(draft: AssistantDraft): TransactionInput | null {
  const base = {
    title: draft.title,
    notes: draft.notes,
    date: draft.date,
    idCategory: null,
    idSubCategory: null,
    idWallet: null,
    idWalletFrom: null,
    idWalletTo: null,
  };
  switch (draft.kind) {
    case "income":
    case "expense":
      return {
        ...base,
        type: draft.kind,
        idWallet: draft.idWallet,
        idCategory: draft.idCategory,
        idSubCategory: draft.idSubCategory,
        amount: draft.amount,
      };
    case "transfer":
      return {
        ...base,
        type: "transfer",
        idWalletFrom: draft.idWalletFrom,
        idWalletTo: draft.idWalletTo,
        amount: draft.amount,
      };
    case "correction":
      return {
        ...base,
        type: "correction",
        idWallet: draft.idWallet,
        // Corrections store the signed delta, like BalanceCorrectionModal.
        amount: (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0),
      };
    default:
      // Investment kinds are saved by the real /assistant backend later.
      return null;
  }
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
 * Catat Cepat conversation state. Talks to `assistantService.chat` (mocked
 * locally until the backend exists) and saves confirmed drafts through the
 * regular `useTransactions().createTransaction`, so wallets/categories resync
 * exactly like a manual entry.
 */
export function useAssistantChat() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { wallets, status: walletStatus, loadWallets } = useWallets();
  const { categories, status: categoryStatus, loadCategories } = useCategories();
  const { createTransaction } = useTransactions();

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

  /** Matching needs the user's wallets/categories even if no page has loaded them yet. */
  const ensureData = useCallback(() => {
    if (walletStatus === "idle") void loadWallets();
    if (categoryStatus === "idle") void loadCategories();
  }, [walletStatus, categoryStatus, loadWallets, loadCategories]);

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

    const saved: string[] = [];
    try {
      for (const draft of preview.drafts) {
        const input = toTransactionInput(draft);
        if (!input) throw new Error(t("assistant.notSupported", { what: t("nav.investment") }));
        await createTransaction(input);
        saved.push(draft.idDraft);
      }
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
      // Keep only what still needs saving so a retry never duplicates rows.
      const remaining = preview.drafts.filter((d) => !saved.includes(d.idDraft));
      setPreviewStatus(preview.id, "pending", { drafts: remaining });
      setDrafts(remaining);
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    }
  }, [pendingPreview, setPreviewStatus, createTransaction, showToast, t]);

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
              revised: Boolean(previous),
            },
          ]);
          setDrafts(reply.drafts);
          return;
        }
        default:
          setMessages((list) => [
            ...list,
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
    },
    [save, cancel, pendingPreview],
  );

  const request = useCallback(
    async (history: AssistantMessage[], userMessageId: string) => {
      const session = sessionRef.current;
      setIsThinking(true);
      try {
        const reply = await assistantService.chat(
          {
            history: toHistory(history),
            drafts: draftsRef.current,
            tzOffsetMinutes: -new Date().getTimezoneOffset(),
          },
          { wallets, categories, t },
        );
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
    [wallets, categories, t, applyReply],
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
    (date: Date, label: string) => send(label, date.toISOString()),
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
    ensureData,
    send,
    retry,
    pickDate,
    save,
    cancel,
    reset,
  };
}
