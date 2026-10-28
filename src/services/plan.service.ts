import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { PaymentOrderStatus, PlanInfo, ProCheckout } from "@/types/plan.types";

export const planService = {
  async getPlanInfo(): Promise<PlanInfo> {
    try {
      const { data } = await httpClient.get("/user/me/plan");
      return data.data as PlanInfo;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("plan.genericError")), { cause: error });
    }
  },

  async checkoutPro(): Promise<ProCheckout> {
    try {
      const { data } = await httpClient.post("/payments/pro/checkout");
      return data.data as ProCheckout;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("plan.checkoutError")), { cause: error });
    }
  },

  async getOrderStatus(orderId: string): Promise<PaymentOrderStatus> {
    try {
      const { data } = await httpClient.get(`/payments/orders/${encodeURIComponent(orderId)}`);
      return data.data as PaymentOrderStatus;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("plan.genericError")), { cause: error });
    }
  },
};
