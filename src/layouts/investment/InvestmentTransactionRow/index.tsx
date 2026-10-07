import { useTranslation } from "react-i18next";
import { LuArrowDownLeft, LuArrowLeftRight, LuArrowUpRight, LuTrendingUpDown } from "react-icons/lu";
import { TxRowBase, type TxAmountTone } from "@/components/molecules/TxRowBase";
import { formatRelativeDay } from "@/layouts/investment/investment-ui";
import { useInvestmentLabels } from "@/layouts/investment/use-investment-labels";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { formatTxTime } from "@/utils/tx-time";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InvestmentTransactionRowProps {
  transaction: InvestmentTransaction;
  instruments: Instrument[];
  /** Flat lists (no day headers) prefix the meta with "Hari ini" / "28 Sep". */
  showDate?: boolean;
  onClick: () => void;
}

/** One ledger entry (top up, tarik, transfer, update nilai) on the shared TxRowBase look. */
export function InvestmentTransactionRow({
  transaction,
  instruments,
  showDate = false,
  onClick,
}: InvestmentTransactionRowProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatNumber } = useMoneyFormat();
  const resolveLabels = useInvestmentLabels(instruments);

  const source = resolveLabels(transaction.idInstrument, transaction.idInvestmentAccount);
  const destination = transaction.idInstrumentTo
    ? resolveLabels(transaction.idInstrumentTo, transaction.idInvestmentAccountTo)
    : null;
  const isLoss = transaction.type === "pl" && transaction.amount < 0;
  const magnitude = formatNumber(Math.abs(transaction.amount));

  let icon = <LuArrowDownLeft />;
  let tone: "income" | "expense" | "primary" | "investment" = "income";
  let title = "";
  let detail: string | null = transaction.note ?? null;
  let amount = magnitude;
  let amountTone: TxAmountTone = "neutral";

  switch (transaction.type) {
    case "in":
      title = source.accountName
        ? t("investment.row.topUp", { account: source.accountName })
        : t("investment.typeFilter.in");
      amount = `+${magnitude}`;
      amountTone = "income";
      break;
    case "out":
      icon = <LuArrowUpRight />;
      tone = "expense";
      title = source.accountName
        ? t("investment.row.withdraw", { account: source.accountName })
        : t("investment.withdrawalTitle");
      amount = `−${magnitude}`;
      amountTone = "expense";
      break;
    case "transfer":
      icon = <LuArrowLeftRight />;
      tone = "primary";
      title = destination?.accountName
        ? t("investment.row.transferTo", { account: destination.accountName })
        : t("investment.typeFilter.transfer");
      detail = source.accountName
        ? t("investment.row.from", { account: source.accountName })
        : null;
      break;
    case "pl":
      icon = <LuTrendingUpDown />;
      tone = "investment";
      title = source.accountName
        ? t("investment.row.update", { account: source.accountName })
        : t("investment.profitLossTitle");
      detail = isLoss ? t("investment.row.loss") : t("investment.row.profit");
      amount = `${isLoss ? "−" : "+"}${magnitude}`;
      amountTone = isLoss ? "expense" : "income";
      break;
  }

  const date = new Date(transaction.date);
  const meta = [
    showDate
      ? formatRelativeDay(date, language, {
          today: t("transaction.today"),
          yesterday: t("transaction.yesterday"),
        })
      : source.instrumentName,
    detail,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <TxRowBase
      icon={icon}
      tone={tone}
      title={title}
      meta={meta}
      amount={amount}
      amountTone={amountTone}
      caption={formatTxTime(transaction.date, language)}
      onClick={onClick}
    />
  );
}
