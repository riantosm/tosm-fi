import type { InvestmentTransaction } from "@/types/investment-transaction.types";
import type { Transaction, TransactionType } from "@/types/transaction.types";

/**
 * One previewed transaction the assistant proposes — every input the app has:
 * the four wallet transaction types plus the four investment ledger
 * operations. Same contract as tosm-fi-be's `IAssistantDraft`.
 */
export type AssistantDraftKind =
  TransactionType | "investmentIn" | "investmentOut" | "investmentTransfer" | "investmentPl";

export interface AssistantDraft {
  idDraft: string;
  kind: AssistantDraftKind;
  title: string;
  /** Always positive; the sign comes from `kind` (or balanceBefore → balanceAfter). */
  amount: number;
  /** ISO datetime. */
  date: string;
  notes: string;
  idWallet: string | null;
  idCategory: string | null;
  idSubCategory: string | null;
  idWalletFrom: string | null;
  idWalletTo: string | null;
  /** Investment kinds: the account money leaves / lands in (top up), or is valued (P/L). */
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  /** investmentTransfer only: destination account. */
  idInstrumentTo: string | null;
  idInvestmentAccountTo: string | null;
  /** correction: wallet balance before → after. investmentPl: account value before → after. */
  balanceBefore?: number;
  balanceAfter?: number;
  /** Fields changed by the latest revision (drives the subtle highlight). */
  changed?: string[];
  /** Server-side validation message (row is marked red, Save is disabled). */
  error?: string;
  /** Fields the user hasn't given yet (e.g. "date"); sent back so the assistant keeps asking. */
  missing?: string[];
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
  /** Drafts currently pending (asked about or previewed), as last returned. */
  drafts: AssistantDraft[];
  /** `Date.prototype.getTimezoneOffset()`, same convention as every date-scoped GET. */
  tzOffsetMinutes: number;
  /** App language code ("id" | "en" | "jp"); the assistant replies in it. */
  language: string;
  /** True while those drafts are on screen as a preview awaiting Simpan/Batal. */
  hasPreview: boolean;
}

/** What `POST /assistant/commit` created, for the app-wide mutation signals. */
export interface AssistantCommitResult {
  transactions: Transaction[];
  investmentTransactions: InvestmentTransaction[];
}
