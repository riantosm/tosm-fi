import { useTranslation } from "react-i18next";
import type { Instrument } from "@/types/instrument.types";

/**
 * Resolves "Instrument" + "Account" names, keeping soft-deleted accounts
 * labelled. `accountName` is null when the account can't be found at all.
 */
export function useInvestmentLabels(instruments: Instrument[]) {
  const { t } = useTranslation();
  return (idInstrument: string, idInvestmentAccount: string | null) => {
    const instrument = instruments.find((item) => item.idInstrument === idInstrument);
    const account = instrument?.investmentAccounts.find(
      (item) => item.idInvestmentAccount === idInvestmentAccount,
    );
    const accountName = account
      ? account.isDeleted
        ? `${account.nameInvestmentAccount} ${t("investment.deletedAccountSuffix")}`
        : account.nameInvestmentAccount
      : null;
    return { instrumentName: instrument?.nameInstrument ?? "-", accountName };
  };
}
