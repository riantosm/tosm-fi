import type { TFunction } from "i18next";
import { httpClient, getApiErrorMessage } from "@/services/http-client";
import type {
  AssistantDraft,
  AssistantQuickReply,
  AssistantReply,
  AssistantRequest,
} from "@/types/assistant.types";
import type { Category } from "@/types/category.types";
import type { WalletAccount } from "@/types/wallet.types";

/**
 * Catat Cepat (AI) service seam.
 *
 * The real backend (`POST /assistant/chat`, Gemini Flash behind tosm-fi-be) is
 * not built yet. Until then `USE_MOCK_ASSISTANT` keeps a small rule-based
 * parser in the browser so the whole chat UI is usable end to end. Flip the
 * flag (or set VITE_ASSISTANT_MOCK=false) once the endpoint exists — the UI and
 * hook only depend on the `AssistantReply` contract below.
 */
const USE_MOCK_ASSISTANT = import.meta.env.VITE_ASSISTANT_MOCK !== "false";

export interface AssistantContext {
  wallets: WalletAccount[];
  categories: Category[];
  t: TFunction;
}

export class AssistantError extends Error {
  kind: "quota" | "network";

  constructor(kind: "quota" | "network", message: string) {
    super(message);
    this.kind = kind;
  }
}

async function chatRemote(request: AssistantRequest): Promise<AssistantReply> {
  try {
    const response = await httpClient.post("/assistant/chat", request);
    return response.data.data as AssistantReply;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 429) throw new AssistantError("quota", getApiErrorMessage(error, "quota"));
    throw new AssistantError("network", getApiErrorMessage(error, "network"));
  }
}

export const assistantService = {
  chat(request: AssistantRequest, context: AssistantContext): Promise<AssistantReply> {
    return USE_MOCK_ASSISTANT ? mockChat(request, context) : chatRemote(request);
  },
};

// ---------------------------------------------------------------------------
// Local mock — Indonesian slang-aware, wallet/category matching against the
// user's own data. Deliberately small: wallet kinds only (expense, income,
// transfer, correction). Investment kinds come with the real backend.
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SLANG: Record<string, number> = {
  seceng: 1_000,
  noceng: 2_000,
  goceng: 5_000,
  ceban: 10_000,
  noban: 20_000,
  goban: 50_000,
  cepek: 100_000,
  gopek: 500_000,
  sejuta: 1_000_000,
};

const CONFIRM_RE =
  /^(ok(e|ay)?|catat(in)?|simpan|simpen|gas(s+)?|sip|siap|lanjut|save|yes|ya catat|ok,? catat)\b/i;
const CANCEL_RE = /\b(batal(in)?|gak jadi|ga jadi|nggak jadi|ngga jadi|engga jadi|cancel)\b/i;
const YES_TODAY_RE = /^(iya|ya|yap|yup|betul|bener|benar|hari ini|ya,? hari ini|yes|today)\b/i;
const YESTERDAY_RE = /\b(kemarin|kemaren|yesterday)\b/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T/;
const TODAY_RE = /\b(hari ini|tadi|barusan|today)\b/i;
const INCOME_RE =
  /\b(gaji|gajian|bonus|thr|terima|dapat|dapet|masuk|cashback|refund|jual|salary)\b/i;
const TRANSFER_RE = /^(transfer|tf|pindah(in)?|kirim)\b/i;
const CORRECTION_RE = /\bsaldo\b/i;
const INVESTMENT_RE =
  /\b(reksa ?dana|reksadana|saham|emas|crypto|kripto|bibit|bareksa|pluang|ajaib|topup|top up|cairin)\b/i;
const FILLER_RE =
  /\b(beli|bayar|buat|untuk|utk|di|ke|dari|pakai|pake|via|hari ini|tadi|barusan|kemarin|kemaren|sekarang|aja|deh|dong|ya|yg|yang)\b/gi;

const CATEGORY_HINTS: { words: RegExp; names: string[] }[] = [
  {
    words:
      /\b(makan|warteg|kopi|nasi|sarapan|lunch|dinner|bakso|mie|mi|ayam|snack|jajan|minum|resto|cafe|kafe|boba|teh)\b/i,
    names: ["makan", "minum", "food", "kuliner", "jajan"],
  },
  {
    words: /\b(grab|gojek|ojol|ojek|bensin|parkir|tol|kereta|krl|mrt|bus|taxi|taksi|transport)\b/i,
    names: ["transport"],
  },
  {
    words: /\b(listrik|pln|air|pdam|internet|wifi|pulsa|token|tagihan|bpjs)\b/i,
    names: ["tagihan", "bill", "utilitas"],
  },
  {
    words:
      /\b(belanja|baju|sepatu|shopee|tokped|tokopedia|groceries|indomaret|alfamart|supermarket)\b/i,
    names: ["belanja", "shopping"],
  },
  {
    words: /\b(nonton|bioskop|netflix|spotify|game|konser|hiburan)\b/i,
    names: ["hiburan", "entertain"],
  },
  { words: /\b(obat|dokter|apotek|klinik|rumah sakit)\b/i, names: ["kesehatan", "health"] },
  { words: /\b(gaji|gajian|salary|thr)\b/i, names: ["gaji", "salary"] },
  { words: /\b(bonus)\b/i, names: ["bonus"] },
];

function parseAmount(raw: string): { value: number; match: string } | null {
  const lower = raw.toLowerCase();
  for (const [word, value] of Object.entries(SLANG)) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(lower)) return { value, match: word };
  }
  const re = /(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m)?\b/i;
  const m = lower.match(re);
  if (!m) return null;
  const [match, num, unit] = m;
  let value: number;
  if (/^\d{1,3}(\.\d{3})+$/.test(num)) value = Number(num.replace(/\./g, ""));
  else value = Number(num.replace(",", "."));
  if (unit === "rb" || unit === "ribu" || unit === "k") value *= 1_000;
  else if (unit === "jt" || unit === "juta" || unit === "m") value *= 1_000_000;
  else if (value < 1_000) value *= 1_000;
  return Number.isFinite(value) && value > 0 ? { value: Math.round(value), match } : null;
}

function findWallet(
  text: string,
  wallets: WalletAccount[],
  after?: RegExp,
): WalletAccount | undefined {
  const lower = text.toLowerCase();
  const candidates = [...wallets].sort((a, b) => b.nameWallet.length - a.nameWallet.length);
  if (after) {
    const m = lower.match(after);
    if (m?.[1]) return candidates.find((w) => m[1].startsWith(w.nameWallet.toLowerCase()));
    return undefined;
  }
  return candidates.find((w) =>
    new RegExp(`\\b${escapeRe(w.nameWallet.toLowerCase())}\\b`).test(lower),
  );
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findCategory(text: string, type: "income" | "expense", categories: Category[]) {
  const pool = categories.filter((c) => c.type === type);
  const lower = text.toLowerCase();
  for (const cat of pool) {
    const sub = cat.subCategories.find((s) => lower.includes(s.nameSubCategory.toLowerCase()));
    if (sub) return { category: cat, subCategory: sub };
  }
  const direct = pool.find((c) => lower.includes(c.nameCategory.toLowerCase()));
  if (direct) return { category: direct, subCategory: undefined };
  for (const hint of CATEGORY_HINTS) {
    if (!hint.words.test(lower)) continue;
    const cat = pool.find((c) => hint.names.some((n) => c.nameCategory.toLowerCase().includes(n)));
    if (cat) return { category: cat, subCategory: undefined };
  }
  return { category: pool[0], subCategory: undefined };
}

function titleCase(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
}

function isoFor(day: "today" | "yesterday" | null): string {
  const d = new Date();
  if (day === "yesterday") d.setDate(d.getDate() - 1);
  return d.toISOString();
}

let draftSeq = 0;
const newId = () => `d${Date.now().toString(36)}${(draftSeq++).toString(36)}`;

function parseDrafts(
  text: string,
  ctx: AssistantContext,
): { drafts: AssistantDraft[]; unsupported?: string; dateKnown: boolean } {
  const { wallets, categories, t } = ctx;
  const primary = wallets.find((w) => w.isPrimary) ?? wallets[0];
  const day: "today" | "yesterday" | null = YESTERDAY_RE.test(text)
    ? "yesterday"
    : TODAY_RE.test(text)
      ? "today"
      : null;
  const date = isoFor(day ?? "today");

  if (INVESTMENT_RE.test(text)) return { drafts: [], unsupported: "investasi", dateKnown: true };

  const parts = text
    .split(/,|\n|;|\bdan\b|\bsama\b|\bterus\b|\blalu\b|\+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  const drafts: AssistantDraft[] = [];

  for (const part of parts) {
    const amount = parseAmount(part);
    if (!amount) {
      const last = drafts[drafts.length - 1];
      if (last) last.notes = last.notes ? `${last.notes}, ${part}` : part;
      continue;
    }

    if (TRANSFER_RE.test(part)) {
      const to = findWallet(part, wallets, /\bke\s+([a-z0-9 ]+)/i);
      const from = findWallet(part, wallets, /\bdari\s+([a-z0-9 ]+)/i) ?? null;
      drafts.push({
        idDraft: newId(),
        kind: "transfer",
        title: to ? t("assistant.transferTo", { wallet: to.nameWallet }) : "Transfer",
        amount: amount.value,
        date,
        notes: "",
        idWallet: null,
        idCategory: null,
        idSubCategory: null,
        idWalletFrom: from?.idWallet ?? null,
        idWalletTo: to?.idWallet ?? null,
      });
      continue;
    }

    if (CORRECTION_RE.test(part)) {
      const wallet = findWallet(part, wallets) ?? primary;
      if (wallet) {
        drafts.push({
          idDraft: newId(),
          kind: "correction",
          title: t("assistant.correction", { wallet: wallet.nameWallet }),
          amount: Math.abs(amount.value - wallet.balance),
          date,
          notes: "",
          idWallet: wallet.idWallet,
          idCategory: null,
          idSubCategory: null,
          idWalletFrom: null,
          idWalletTo: null,
          balanceBefore: wallet.balance,
          balanceAfter: amount.value,
        });
        continue;
      }
    }

    const type = INCOME_RE.test(part) ? "income" : "expense";
    const wallet = findWallet(part, wallets) ?? primary;
    const { category, subCategory } = findCategory(part, type, categories);
    let title = part.replace(amount.match, " ");
    if (wallet) title = title.replace(new RegExp(`\\b${escapeRe(wallet.nameWallet)}\\b`, "i"), " ");
    title = titleCase(title.replace(FILLER_RE, " "));
    drafts.push({
      idDraft: newId(),
      kind: type,
      title: title || subCategory?.nameSubCategory || category?.nameCategory || "-",
      amount: amount.value,
      date,
      notes: "",
      idWallet: wallet?.idWallet ?? null,
      idCategory: category?.idCategory ?? null,
      idSubCategory: subCategory?.idSubCategory ?? null,
      idWalletFrom: null,
      idWalletTo: null,
    });
  }

  return { drafts, dateKnown: day !== null };
}

function applyRevision(
  text: string,
  drafts: AssistantDraft[],
  ctx: AssistantContext,
): AssistantDraft[] | null {
  const amount = parseAmount(text);
  const wallet = findWallet(text.replace(/^.*?\b(pakai|pake|via|dari)\b/i, ""), ctx.wallets);
  const lower = text.toLowerCase();
  if (!amount && !wallet) return null;
  const target = drafts.find((d) => {
    const head = d.title.toLowerCase().split(" ")[0];
    return head.length > 2 && lower.includes(head);
  });
  return drafts.map((d) => {
    const applies = target ? d.idDraft === target.idDraft : drafts.length === 1;
    const changed: string[] = [];
    const next = { ...d, changed: [] as string[] };
    if (amount && (applies || (!target && drafts.length === 1))) {
      if (d.amount !== amount.value) changed.push("amount");
      next.amount = amount.value;
    }
    if (wallet && (applies || !target) && d.kind !== "transfer") {
      if (d.idWallet !== wallet.idWallet) changed.push("wallet");
      next.idWallet = wallet.idWallet;
    }
    next.changed = changed;
    return next;
  });
}

const DATE_QUICK_REPLIES = (t: TFunction): AssistantQuickReply[] => [
  { label: t("assistant.dateToday") },
  { label: t("assistant.dateYesterday") },
  { label: t("assistant.datePick"), icon: "calendar" },
];

async function mockChat(request: AssistantRequest, ctx: AssistantContext): Promise<AssistantReply> {
  await delay(650 + Math.random() * 500);
  const { t } = ctx;
  const last = request.history[request.history.length - 1]?.text.trim() ?? "";
  const previousAssistant = [...request.history]
    .reverse()
    .find((m) => m.role === "assistant")?.text;
  const pending = request.drafts;

  if (pending.length > 0 && previousAssistant === t("assistant.askWalletFrom")) {
    const resolved = resolveTransferSource(last, pending, ctx.wallets);
    if (resolved) {
      return {
        intent: "preview",
        reply:
          resolved.length > 1
            ? t("assistant.previewIntroMany", { count: resolved.length })
            : t("assistant.previewIntro"),
        drafts: resolved,
      };
    }
  }

  if (pending.length > 0 && previousAssistant === t("assistant.askDate")) {
    const picked = ISO_DATE_RE.test(last) ? new Date(last).toISOString() : null;
    const day = YESTERDAY_RE.test(last) ? "yesterday" : YES_TODAY_RE.test(last) ? "today" : null;
    if (picked || day) {
      const drafts = pending.map((d) => ({ ...d, date: picked ?? isoFor(day) }));
      return {
        intent: "preview",
        reply:
          drafts.length > 1
            ? t("assistant.previewIntroMany", { count: drafts.length })
            : t("assistant.previewIntro"),
        drafts,
      };
    }
  }

  if (pending.length > 0) {
    if (CANCEL_RE.test(last))
      return { intent: "cancel", reply: t("assistant.cancelledReply"), drafts: [] };
    if (CONFIRM_RE.test(last)) return { intent: "save", reply: "", drafts: pending };
    const revised = applyRevision(last, pending, ctx);
    if (revised) return { intent: "preview", reply: t("assistant.revisedIntro"), drafts: revised };
  }

  const { drafts, unsupported, dateKnown } = parseDrafts(last, ctx);
  if (unsupported) {
    return {
      intent: "unknown",
      reply: t("assistant.notSupported", { what: unsupported }),
      drafts: pending,
    };
  }
  if (drafts.length === 0) {
    return {
      intent: "unknown",
      reply: t("assistant.notUnderstood"),
      drafts: pending,
      quickReplies: [
        { label: t("assistant.example1") },
        { label: t("assistant.example2") },
        { label: t("assistant.example3") },
      ],
    };
  }

  const missingFrom = drafts.find((d) => d.kind === "transfer" && !d.idWalletFrom);
  if (missingFrom) {
    return {
      intent: "ask",
      reply: t("assistant.askWalletFrom"),
      drafts,
      quickReplies: ctx.wallets
        .filter((w) => w.idWallet !== missingFrom.idWalletTo)
        .slice(0, 4)
        .map((w) => ({ label: w.nameWallet, value: `dari ${w.nameWallet}`, dot: w.color })),
    };
  }

  if (!dateKnown) {
    return {
      intent: "ask",
      reply: t("assistant.askDate"),
      drafts,
      quickReplies: DATE_QUICK_REPLIES(t),
    };
  }

  return {
    intent: "preview",
    reply:
      drafts.length > 1
        ? t("assistant.previewIntroMany", { count: drafts.length })
        : t("assistant.previewIntro"),
    drafts,
  };
}

/** Mock follow-up for "dari <wallet>" answers to the transfer question. */
function resolveTransferSource(text: string, drafts: AssistantDraft[], wallets: WalletAccount[]) {
  const wallet = findWallet(text, wallets);
  if (!wallet) return null;
  return drafts.map((d) =>
    d.kind === "transfer" && !d.idWalletFrom ? { ...d, idWalletFrom: wallet.idWallet } : d,
  );
}
