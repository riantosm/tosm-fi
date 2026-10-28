import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuCircleCheck, LuFlaskConical, LuLock } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { PLAN_LIMITS, PRO_LIFETIME_LIST_PRICE, PRO_LIFETIME_PRICE } from "@/constants/plans";
import { usePlan } from "@/hooks/use-plan";
import { useToast } from "@/hooks/use-toast";
import { planService } from "@/services/plan.service";
import type { PaymentStatus, PlanFeature, PlanLimits } from "@/types/plan.types";
import { formatRupiah } from "@/utils/format-rupiah";
import { paySnap } from "@/utils/midtrans-snap";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** What the user just tried to do, shown as the reason for the dialog. */
  feature?: PlanFeature | null;
}

const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 2000;
const IS_SANDBOX = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION !== "true";

// The Free limit quoted in the "why am I seeing this" line, per feature.
const REASON_LIMIT: Partial<Record<PlanFeature, keyof PlanLimits>> = {
  wallets: "wallets",
  categories: "categories",
  budgets: "budgets",
  schedules: "schedules",
  instruments: "instruments",
  aiMessages: "aiMessagesPerMonth",
};

function reasonCount(feature: PlanFeature, limits: PlanLimits): number {
  const key = REASON_LIMIT[feature];
  const value = key ? limits[key] : null;
  return typeof value === "number" ? value : 0;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isPro, limits, info, refreshPlan } = usePlan();
  const [isPaying, setIsPaying] = useState(false);
  const price = info?.proLifetimePrice ?? PRO_LIFETIME_PRICE;

  const benefits = [
    t("landing.pricing.pro.wallets"),
    t("landing.pricing.pro.budgets"),
    t("landing.pricing.pro.investment"),
    t("landing.pricing.pro.reports"),
    t("landing.pricing.pro.export"),
    t("landing.pricing.pro.ai", { count: PLAN_LIMITS.pro.aiMessagesPerMonth ?? 0 }),
  ];

  // Snap closes before Midtrans has always settled the payment, so the order
  // is polled for a few seconds; the backend pulls the status from Midtrans.
  async function waitForPayment(orderId: string, attempts: number): Promise<PaymentStatus> {
    let status: PaymentStatus = "pending";
    for (let i = 0; i < attempts; i++) {
      status = (await planService.getOrderStatus(orderId)).status;
      if (status !== "pending") return status;
      if (i < attempts - 1) await wait(POLL_INTERVAL_MS);
    }
    return status;
  }

  async function handlePay() {
    setIsPaying(true);
    try {
      const checkout = await planService.checkoutPro();
      const outcome = await paySnap(checkout.snapToken, checkout.clientKey, checkout.isProduction);
      if (outcome === "error") {
        showToast(t("plan.paymentFailed"), "error");
        return;
      }

      const status = await waitForPayment(
        checkout.orderId,
        outcome === "closed" ? 1 : POLL_ATTEMPTS,
      );
      if (status === "paid") {
        await refreshPlan();
        showToast(t("plan.paymentSuccess"), "success");
        onClose();
      } else if (status === "pending") {
        if (outcome !== "closed") showToast(t("plan.paymentPending"), "info");
      } else {
        showToast(t("plan.paymentFailed"), "error");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("plan.checkoutError"), "error");
    } finally {
      setIsPaying(false);
    }
  }

  if (isPro) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        placement="center"
        title={t("plan.alreadyProTitle")}
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-income-soft text-income-text">
            <LuCircleCheck className="size-7" />
          </span>
          <p className="text-[14px] text-text-2">{t("plan.alreadyProBody")}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPaying ? () => {} : onClose}
      size="md"
      title={t("plan.upgradeTitle")}
      subtitle={t("plan.upgradeSubtitle")}
      footer={
        <ModalActions>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPaying}>
            {t("plan.later")}
          </Button>
          <Button type="button" onClick={() => void handlePay()} isLoading={isPaying}>
            {t("plan.payButton", { price: formatRupiah(price) })}
          </Button>
        </ModalActions>
      }
    >
      <div className="flex flex-col gap-5">
        {feature && (
          <p className="flex items-start gap-2.5 rounded-control bg-investment-soft px-3.5 py-3 text-[13.5px] text-investment-text">
            <LuLock className="mt-0.5 size-4 shrink-0" />
            {t(`plan.reason.${feature}`, { count: reasonCount(feature, limits) })}
          </p>
        )}

        <div className="flex flex-col gap-1 rounded-card bg-gradient-to-br from-hero-bg to-hero-bg-2 p-5">
          <span className="text-[12px] font-semibold tracking-[0.08em] text-hero-fg-2 uppercase">
            {t("plan.proLifetime")}
          </span>
          <div className="flex flex-wrap items-end gap-2">
            <span className="font-num text-[36px] leading-none font-semibold tracking-[-0.025em] text-hero-fg tabular">
              {formatRupiah(price)}
            </span>
            <span className="text-[14px] text-hero-fg-2">{t("landing.pricing.pro.per")}</span>
          </div>
          <span className="flex items-center gap-2 text-[13px]">
            <span className="text-hero-fg-2 line-through">
              {formatRupiah(PRO_LIFETIME_LIST_PRICE)}
            </span>
            <span className="font-medium text-income-text">{t("landing.pricing.pro.note")}</span>
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {benefits.map((item) => (
            <li key={item} className="flex gap-3 text-[14px] text-text">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text">
                <LuCheck className="size-[13px]" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        {IS_SANDBOX && (
          <p className="flex items-start gap-2.5 rounded-control bg-surface-2 px-3.5 py-3 text-[12.5px] text-text-2">
            <LuFlaskConical className="mt-0.5 size-4 shrink-0 text-primary-text" />
            {t("plan.sandboxNotice")}
          </p>
        )}
      </div>
    </Modal>
  );
}
