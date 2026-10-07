import type { TransactionType } from "@/types/transaction.types";

/**
 * One previewed transaction the assistant proposes. Investment kinds are part
 * of the contract with the planned `/assistant/chat` backend; the local mock
 * only produces the wallet kinds.
 */
export type AssistantDraftKind =
  TransactionType | "investmentIn" | "investmentOut" | "investmentTransfer" | "investmentPl";

export interface AssistantDraft {
  idDraft: string;
  kind: AssistantDraftKind;
  title: string;
  /** Always positive; sign comes from `kind` (or from `delta` for corrections). */
  amount: number;
  /** ISO datetime. */
  date: string;
  notes: string;
  idWallet: string | null;
  idCategory: string | null;
  idSubCategory: string | null;
  idWalletFrom: string | null;
  idWalletTo: string | null;
  /** Correction only: balance before → after. */
  balanceBefore?: number;
  balanceAfter?: number;
  /** Fields changed by the latest revision (drives the subtle highlight). */
  changed?: string[];
  /** Server-side validation message (row is marked red, Save is disabled). */
  error?: string;
}

export type AssistantIntent = "ask" | "preview" | "save" | "cancel" | "unknown";

export interface AssistantQuickReply {
  label: string;
  /** Text sent when tapped (defaults to label). */
  value?: string;
  dot?: string;
  icon?: "calendar";
}

export interface AssistantReply {
  intent: AssistantIntent;
  reply: string;
  drafts: AssistantDraft[];
  quickReplies?: AssistantQuickReply[];
}

export type AssistantErrorKind = "quota" | "network";

export type AssistantMessage =
  | {
      id: string;
      role: "user";
      /** What the bubble shows. */
      text: string;
      /** What is sent to the assistant when it differs from `text` (e.g. a picked date as ISO). */
      payload?: string;
      failed?: boolean;
    }
  | {
      id: string;
      role: "assistant";
      kind: "text";
      text: string;
      quickReplies?: AssistantQuickReply[];
      examples?: boolean;
    }
  | {
      id: string;
      role: "assistant";
      kind: "preview";
      text: string;
      drafts: AssistantDraft[];
      status: "pending" | "saving" | "saved" | "cancelled" | "replaced";
      revised?: boolean;
      savedAt?: string;
    }
  | { id: string; role: "assistant"; kind: "success"; count: number }
  | { id: string; role: "assistant"; kind: "error"; error: AssistantErrorKind; retryText: string };

export interface AssistantRequest {
  history: { role: "user" | "assistant"; text: string }[];
  drafts: AssistantDraft[];
  tzOffsetMinutes: number;
}
