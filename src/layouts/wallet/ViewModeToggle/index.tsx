import { useTranslation } from "react-i18next";
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { ViewModeToggle as BaseViewModeToggle } from "@/components/molecules/ViewModeToggle";
import type { WalletViewMode } from "@/hooks/use-wallet-view-mode";

interface ViewModeToggleProps {
  value: WalletViewMode;
  onChange: (mode: WalletViewMode) => void;
  /** pill = grid/list pair (desktop); icon = single button showing the other mode (phone app bar). */
  variant?: "pill" | "icon";
}

export function ViewModeToggle({ value, onChange, variant = "pill" }: ViewModeToggleProps) {
  const { t } = useTranslation();
  return (
    <BaseViewModeToggle
      options={[
        { value: "grid", icon: LuLayoutGrid, label: t("wallet.viewGrid") },
        { value: "list", icon: LuList, label: t("wallet.viewList") },
      ]}
      value={value}
      onChange={onChange}
      ariaLabel={t("wallet.toggleViewMode")}
      variant={variant}
    />
  );
}
