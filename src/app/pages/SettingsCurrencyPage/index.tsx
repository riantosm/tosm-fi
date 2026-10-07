import { useTranslation } from "react-i18next";
import { LuCoins, LuHash } from "react-icons/lu";
import { Reveal } from "@/components/atoms/Reveal";
import { PageHeader } from "@/components/molecules/PageHeader";
import { CurrencyOptionList } from "@/layouts/settings/CurrencyOptionList";
import { DecimalOptionList } from "@/layouts/settings/DecimalOptionList";
import { SettingsPanel } from "@/layouts/settings/SettingsPanel";
import { ROUTES } from "@/constants/routes";

export function SettingsCurrencyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("settingsCurrency.title")}
        subtitle={t("settingsCurrency.subtitle")}
        backTo={ROUTES.SETTINGS}
      />

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <Reveal immediate>
          <SettingsPanel
            icon={<LuCoins />}
            iconClassName="bg-investment-soft text-investment-text"
            title={t("settingsCurrency.title")}
            subtitle={t("settingsCurrency.currencySubtitle")}
          >
            <CurrencyOptionList />
          </SettingsPanel>
        </Reveal>
        <Reveal delay={0.05}>
          <SettingsPanel
            icon={<LuHash />}
            iconClassName="bg-investment-soft text-investment-text"
            title={t("settingsCurrency.decimalTitle")}
            subtitle={t("settingsCurrency.decimalSubtitle")}
          >
            <DecimalOptionList />
          </SettingsPanel>
        </Reveal>
      </div>
    </div>
  );
}
