import { useTranslation } from "react-i18next";
import { LuX } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export function ModalCloseButton({ onClose, className }: ModalCloseButtonProps) {
  const { t } = useTranslation();

  return (
    <IconButton
      label={t("common.close")}
      icon={<LuX />}
      onClick={onClose}
      variant="soft"
      size="sm"
      tooltip={false}
      className={className}
    />
  );
}
