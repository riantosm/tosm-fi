import { useTranslation } from "react-i18next";
import { LuArrowUp, LuCoffee, LuUtensils } from "react-icons/lu";
import { AiMark } from "@/components/atoms/AiMark";
import { Reveal } from "@/components/atoms/Reveal";

const STEPS = ["1", "2", "3"] as const;

const PREVIEW_ROWS = [
  { key: "lunch", icon: LuUtensils, tone: "bg-expense-soft text-expense-text", amount: "−45.000" },
  {
    key: "coffee",
    icon: LuCoffee,
    tone: "bg-investment-soft text-investment-text",
    amount: "−25.000",
  },
] as const;

// Rendered inside a `.dark` wrapper by LandingPage, so every token here is the dark palette.
export function LandingCatatCepat() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto grid w-full max-w-[1280px] items-center gap-14 lg:grid-cols-[500px_1fr] lg:gap-20">
      <Reveal className="flex flex-col gap-6">
        <span className="flex items-center gap-2">
          <AiMark size="xs" />
          <span className="text-[12px] font-semibold tracking-[0.1em] text-primary-text uppercase">
            {t("landing.ai.eyebrow")}
          </span>
        </span>
        <h2 className="font-display text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] text-hero-fg sm:text-[46px]">
          {t("landing.ai.title")}
        </h2>
        <p className="text-[17px] leading-[1.6] text-text-2">{t("landing.ai.subtitle")}</p>
        <ol className="flex flex-col gap-[18px] pt-2">
          {STEPS.map((step) => (
            <li key={step} className="flex items-center gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong font-display text-[15px] font-semibold text-primary-text">
                {step}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[16px] font-semibold text-text">
                  {t(`landing.ai.step${step}Title`)}
                </span>
                <span className="text-[14px] text-text-3">{t(`landing.ai.step${step}Body`)}</span>
              </span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal
        delay={0.1}
        className="flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-5 shadow-pop sm:p-7"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <AiMark size="sm" />
          <div className="flex flex-col">
            <span className="font-display text-[17px] font-semibold text-text">
              {t("landing.ai.chatName")}
            </span>
            <span className="text-[13px] text-income-text">{t("landing.ai.chatStatus")}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-[18px] py-3.5 text-[15px] font-medium text-primary-fg">
            {t("landing.ai.userMessage")}
          </p>
        </div>

        <div className="flex max-w-[440px] flex-col gap-3.5 rounded-[20px] rounded-bl-md bg-surface-2 p-[18px]">
          <p className="text-[15px] text-text">{t("landing.ai.botMessage")}</p>
          {PREVIEW_ROWS.map(({ key, icon: Icon, tone, amount }) => (
            <div key={key} className="flex items-center gap-3 rounded-[14px] bg-surface p-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold text-text">
                  {t(`landing.ai.${key}Title`)}
                </span>
                <span className="truncate text-[13px] text-text-3">
                  {t(`landing.ai.${key}Meta`)}
                </span>
              </span>
              <span className="font-num text-[16px] font-semibold text-expense-text tabular">
                {amount}
              </span>
            </div>
          ))}
          <div className="flex gap-2">
            <span className="rounded-full bg-primary px-[18px] py-2.5 text-[14px] font-semibold text-primary-fg">
              {t("landing.ai.saveAll")}
            </span>
            <span className="rounded-full border border-border-strong px-[18px] py-2.5 text-[14px] font-semibold text-text">
              {t("landing.ai.edit")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-surface-2 py-2 pr-2 pl-[18px]">
          <span className="flex-1 truncate text-[15px] text-text-3">
            {t("landing.ai.composer")}
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-fg">
            <LuArrowUp className="size-[18px]" />
          </span>
        </div>
      </Reveal>
    </div>
  );
}
