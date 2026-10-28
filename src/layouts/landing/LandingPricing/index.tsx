import { useTranslation } from "react-i18next";
import { LuArrowRight, LuBadgeCheck, LuCheck, LuMinus, LuSparkles } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Reveal } from "@/components/atoms/Reveal";
import { PLAN_LIMITS, PRO_LIFETIME_LIST_PRICE, PRO_LIFETIME_PRICE } from "@/constants/plans";
import { LandingSectionHead } from "@/layouts/landing/LandingSectionHead";
import { cn } from "@/utils/cn";
import { formatRupiah } from "@/utils/format-rupiah";

interface LandingPricingProps {
  onStart: () => void;
  onBuyPro: () => void;
}

const FREE = PLAN_LIMITS.free;
const PRO = PLAN_LIMITS.pro;

type Cell = string | boolean;

export function LandingPricing({ onStart, onBuyPro }: LandingPricingProps) {
  const { t } = useTranslation();
  const unlimited = t("landing.pricing.unlimited");

  const freeItems = [
    t("landing.pricing.free.transactions"),
    t("landing.pricing.free.wallets", { count: FREE.wallets ?? 0 }),
    t("landing.pricing.free.categories", { count: FREE.categories ?? 0 }),
    t("landing.pricing.free.budgets", { count: FREE.budgets ?? 0 }),
    t("landing.pricing.free.schedules", { count: FREE.schedules ?? 0 }),
    t("landing.pricing.free.instruments", { count: FREE.instruments ?? 0 }),
    t("landing.pricing.free.reports"),
    t("landing.pricing.free.export"),
    t("landing.pricing.free.ai", { count: FREE.aiMessagesPerMonth ?? 0 }),
  ];
  const proItems = [
    t("landing.pricing.pro.wallets"),
    t("landing.pricing.pro.budgets"),
    t("landing.pricing.pro.schedules"),
    t("landing.pricing.pro.investment"),
    t("landing.pricing.pro.reports"),
    t("landing.pricing.pro.export"),
    t("landing.pricing.pro.ai", { count: PRO.aiMessagesPerMonth ?? 0 }),
    t("landing.pricing.pro.updates"),
  ];

  const groups: { title: string; rows: [string, Cell, Cell][] }[] = [
    {
      title: t("landing.compare.groupRecording"),
      rows: [
        [
          t("landing.compare.price"),
          formatRupiah(0),
          t("landing.compare.priceOnce", { price: formatRupiah(PRO_LIFETIME_PRICE) }),
        ],
        [t("landing.compare.transactions"), unlimited, unlimited],
        [t("landing.compare.wallets"), String(FREE.wallets), unlimited],
        [t("landing.compare.categories"), String(FREE.categories), unlimited],
        [t("landing.compare.subCategories"), FREE.subCategories, PRO.subCategories],
        [t("landing.compare.schedules"), String(FREE.schedules), unlimited],
      ],
    },
    {
      title: t("landing.compare.groupAnalysis"),
      rows: [
        [t("landing.compare.budgets"), String(FREE.budgets), unlimited],
        [t("landing.compare.instruments"), String(FREE.instruments), unlimited],
        [
          t("landing.compare.reportPeriod"),
          t("landing.compare.reportFree"),
          t("landing.compare.reportPro"),
        ],
        [t("landing.compare.export"), "CSV", "CSV, PDF & Excel"],
      ],
    },
    {
      title: t("landing.compare.groupAi"),
      rows: [
        [
          t("landing.compare.aiMessages"),
          String(FREE.aiMessagesPerMonth),
          String(PRO.aiMessagesPerMonth),
        ],
        [t("landing.compare.receiptScan"), FREE.receiptScan, PRO.receiptScan],
      ],
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-12">
      <LandingSectionHead
        eyebrow={t("landing.pricing.eyebrow")}
        title={t("landing.pricing.title")}
        subtitle={t("landing.pricing.subtitle")}
      />

      <span className="-mt-2 flex items-center gap-2 rounded-full border border-border bg-surface py-2 pr-4 pl-2">
        <span className="shrink-0 rounded-full bg-income-soft px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-income-text">
          {t("landing.pricing.launchTag")}
        </span>
        <span className="text-[14px] font-medium text-text-2">
          {t("landing.pricing.launchSaving", {
            amount: formatRupiah(PRO_LIFETIME_LIST_PRICE - PRO_LIFETIME_PRICE),
          })}
        </span>
      </span>

      <div className="grid w-full max-w-[1000px] gap-6 md:grid-cols-2">
        <Reveal className="flex flex-col gap-7 rounded-[28px] border border-border bg-surface p-7 shadow-card sm:p-9">
          <PlanTop
            name={t("landing.pricing.free.name")}
            tagline={t("landing.pricing.free.tagline")}
          />
          <div className="flex flex-col gap-1.5">
            <PriceRow amount={formatRupiah(0)} per={t("landing.pricing.free.per")} />
            <span className="text-[14px] text-text-3">{t("landing.pricing.free.note")}</span>
          </div>
          <Button variant="outline" size="lg" fullWidth onClick={onStart}>
            {t("landing.pricing.free.cta")}
          </Button>
          <FeatureList title={t("landing.pricing.free.listTitle")} items={freeItems} />
        </Reveal>

        {/* Pro is the one dark card: a local `.dark` swaps the Mist tokens. */}
        <Reveal
          delay={0.08}
          className="dark flex flex-col gap-7 rounded-[28px] bg-gradient-to-br from-hero-bg to-bg p-7 shadow-pop sm:p-9"
        >
          <PlanTop
            name={t("landing.pricing.pro.name")}
            tagline={t("landing.pricing.pro.tagline")}
            badge={t("landing.pricing.pro.badge")}
          />
          <div className="flex flex-col gap-1.5">
            <PriceRow
              amount={formatRupiah(PRO_LIFETIME_PRICE)}
              per={t("landing.pricing.pro.per")}
            />
            <span className="flex items-center gap-2.5 text-[14px]">
              <span className="text-text-3 line-through">
                {formatRupiah(PRO_LIFETIME_LIST_PRICE)}
              </span>
              <span className="text-income-text">{t("landing.pricing.pro.note")}</span>
            </span>
          </div>
          <Button size="lg" fullWidth rightIcon={<LuArrowRight />} onClick={onBuyPro}>
            {t("landing.pricing.pro.cta")}
          </Button>
          <FeatureList title={t("landing.pricing.pro.listTitle")} items={proItems} highlight />
        </Reveal>
      </div>

      <p className="flex max-w-[1000px] items-center gap-2.5 text-center text-[14px] text-text-3">
        <LuBadgeCheck className="size-[18px] shrink-0" />
        {t("landing.pricing.trust")}
      </p>

      <div className="w-full max-w-[1000px] overflow-x-auto rounded-[24px] border border-border bg-surface">
        <table className="w-full min-w-[560px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left font-semibold text-hero-fg sm:px-8">
                {t("landing.compare.title")}
              </th>
              <th className="w-[160px] px-4 py-4 font-semibold text-hero-fg sm:w-[200px]">
                {t("landing.pricing.free.name")}
              </th>
              <th className="w-[160px] px-4 py-4 font-semibold text-primary-text sm:w-[200px]">
                {t("landing.compare.proLifetime")}
              </th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  colSpan={3}
                  className="px-6 pt-6 pb-2.5 text-left text-[12px] font-semibold tracking-[0.08em] text-text-3 uppercase sm:px-8"
                >
                  {group.title}
                </th>
              </tr>
              {group.rows.map(([label, free, pro]) => (
                <tr key={label} className="border-b border-border last:border-b-0">
                  <td className="px-6 py-3.5 text-text sm:px-8">{label}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-text-2">
                    <CellValue value={free} />
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-primary-text">
                    <CellValue value={pro} isPro />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

function PlanTop({ name, tagline, badge }: { name: string; tagline: string; badge?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[24px] font-semibold text-hero-fg">{name}</h3>
        {badge && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[12px] font-semibold text-primary-text">
            <LuSparkles className="size-3.5" />
            {badge}
          </span>
        )}
      </div>
      <p className="text-[15px] leading-[1.5] text-text-2">{tagline}</p>
    </div>
  );
}

function PriceRow({ amount, per }: { amount: string; per: string }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <span className="font-num text-[44px] leading-none font-semibold tracking-[-0.03em] text-hero-fg tabular sm:text-[52px]">
        {amount}
      </span>
      <span className="text-[16px] text-text-2">{per}</span>
    </div>
  );
}

function FeatureList({
  title,
  items,
  highlight,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3.5 border-t border-border pt-7">
      <span className="text-[13px] font-semibold tracking-[0.05em] text-text-3 uppercase">
        {title}
      </span>
      <ul className="flex flex-col gap-3.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-[1.45] text-text">
            <span
              className={cn(
                "mt-px flex size-[22px] shrink-0 items-center justify-center rounded-full",
                highlight ? "bg-primary-soft text-primary-text" : "bg-income-soft text-income-text",
              )}
            >
              <LuCheck className="size-[13px]" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CellValue({ value, isPro }: { value: Cell; isPro?: boolean }) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full",
        !value
          ? "bg-surface-2 text-text-3"
          : isPro
            ? "bg-primary-soft text-primary-text"
            : "bg-income-soft text-income-text",
      )}
    >
      {value ? <LuCheck className="size-3.5" /> : <LuMinus className="size-3.5" />}
    </span>
  );
}
