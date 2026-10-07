import { createElement, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { Input } from "@/components/atoms/Input";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Modal } from "@/components/molecules/Modal";
import {
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICONS,
  resolveCategoryIcon,
} from "@/constants/category-icons";
import { cn } from "@/utils/cn";

interface CategoryIconPickerProps {
  value: string;
  onChange: (name: string) => void;
  color: string;
}

/** Round icon trigger (tinted with the category color) + the "Pilih ikon" dialog. */
export function CategoryIconPicker({ value, onChange, color }: CategoryIconPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return CATEGORY_ICON_GROUPS;

    return CATEGORY_ICON_GROUPS.map((group) => ({
      ...group,
      icons: group.icons.filter((option) =>
        t(`category.iconNames.${option.labelKey}`).toLowerCase().includes(normalizedQuery),
      ),
    })).filter((group) => group.icons.length > 0);
  }, [query, t]);

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("category.chooseIcon")}
        title={t("category.chooseIcon")}
        className="pressable flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-[transform,background-color,border-color] duration-300 hover:scale-105"
        style={{ backgroundColor: `${color}26`, borderColor: color, color }}
      >
        {createElement(resolveCategoryIcon(value), { className: "size-[22px]" })}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        onBack={close}
        size="lg"
        title={t("category.chooseIcon")}
        subtitle={t("category.iconCount", { count: CATEGORY_ICONS.length })}
      >
        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("category.searchIconPlaceholder")}
            startIcon={<LuSearch />}
          />

          {filteredGroups.length === 0 ? (
            <EmptyState icon={<LuSearchX />} title={t("category.noIconResults")} />
          ) : (
            filteredGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2.5">
                <span className="text-[11.5px] font-semibold tracking-[0.08em] text-text-3 uppercase">
                  {t(group.titleKey)}
                </span>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {group.icons.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.name === value;
                    const label = t(`category.iconNames.${option.labelKey}`);
                    return (
                      <button
                        key={option.name}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={isActive}
                        onClick={() => {
                          onChange(option.name);
                          close();
                        }}
                        className={cn(
                          "pressable flex aspect-square items-center justify-center rounded-control border-[1.5px] transition-colors duration-200",
                          !isActive &&
                            "border-transparent bg-surface-2 text-text-2 hover:bg-surface-3 hover:text-text",
                        )}
                        style={
                          isActive
                            ? { backgroundColor: `${color}26`, borderColor: color, color }
                            : undefined
                        }
                      >
                        <Icon className="size-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
