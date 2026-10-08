import axios from "axios";
import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  AssistantCommitResult,
  AssistantDraft,
  AssistantErrorKind,
  AssistantReply,
  AssistantRequest,
} from "@/types/assistant.types";

/**
 * Catat Cepat (AI). `POST /assistant/chat` (tosm-fi-be, Gemini behind it)
 * turns the conversation into drafts; `POST /assistant/commit` saves a
 * previewed batch in one database transaction.
 */
export class AssistantError extends Error {
  kind: AssistantErrorKind;

  constructor(kind: AssistantErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.kind = kind;
  }
}

/** A commit the backend rejected; `idDraft` is the preview row that caused it. */
export class AssistantCommitError extends Error {
  idDraft: string | null;

  constructor(message: string, idDraft: string | null, options?: ErrorOptions) {
    super(message, options);
    this.idDraft = idDraft;
  }
}

export const assistantService = {
  async chat(request: AssistantRequest): Promise<AssistantReply> {
    try {
      const { data } = await httpClient.post("/assistant/chat", request);
      return data.data as AssistantReply;
    } catch (error) {
      // 429 = the free AI quota is full or the model is overloaded ("AI lagi sibuk").
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const kind: AssistantErrorKind = status === 429 ? "quota" : "network";
      throw new AssistantError(kind, getApiErrorMessage(error, i18n.t("assistant.networkBody")), {
        cause: error,
      });
    }
  },

  async commit(drafts: AssistantDraft[], language: string): Promise<AssistantCommitResult> {
    try {
      const { data } = await httpClient.post("/assistant/commit", {
        drafts,
        language,
        tzOffsetMinutes: new Date().getTimezoneOffset(),
      });
      return data.data as AssistantCommitResult;
    } catch (error) {
      const idDraft = axios.isAxiosError(error)
        ? (error.response?.data?.data?.idDraft ?? null)
        : null;
      throw new AssistantCommitError(
        getApiErrorMessage(error, i18n.t("transaction.genericError")),
        idDraft,
        {
          cause: error,
        },
      );
    }
  },
};
