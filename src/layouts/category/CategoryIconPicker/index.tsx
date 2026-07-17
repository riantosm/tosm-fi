import { createElement, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Input } from "@/components/atoms/Input";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { CATEGORY_ICON_GROUPS, resolveCategoryIcon } from "@/constants/category-icons";
import { cn } from "@/utils/cn";

interface CategoryIconPickerProps {
  value: string;
  onChange: (name: string) => void;
  color: string;
}

export function CategoryIconPicker({ value, onChange, color }: CategoryIconPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedIcon = resolveCategoryIcon(value);

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
      <Tooltip content={t("category.chooseIcon")}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t("category.chooseIcon")}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-transparent transition-colors hover:border-primary-400"
          style={{ backgroundColor: `${color}33` }}
        >
          {createElement(selectedIcon, { className: "h-7 w-7", style: { color } })}
        </button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={close}>
        <div className="flex max-h-[75vh] flex-col gap-4">
          <Words as="h2" type="lg/bold" className="shrink-0 text-ink-900 dark:text-ink-50">
            {t("category.chooseIcon")}
          </Words>

          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("category.searchIconPlaceholder")}
            startIcon={<HiOutlineMagnifyingGlass className="h-4 w-4" />}
          />

          <div className="-mx-2 flex min-h-0 flex-col gap-4 overflow-y-auto px-2">
            {filteredGroups.length === 0 ? (
              <Words type="sm/regular" className="py-6 text-center text-ink-400 dark:text-ink-500">
                {t("category.noIconResults")}
              </Words>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.key} className="flex flex-col gap-2">
                  <Words
                    type="xs/bold"
                    className="uppercase tracking-wide text-ink-400 dark:text-ink-500"
                  >
                    {t(group.titleKey)}
                  </Words>
                  <div className="grid grid-cols-6 gap-2">
                    {group.icons.map((option) => {
                      const Icon = option.icon;
                      const isActive = option.name === value;

                      return (
                        <Tooltip
                          key={option.name}
                          content={t(`category.iconNames.${option.labelKey}`)}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onChange(option.name);
                              close();
                            }}
                            aria-label={t(`category.iconNames.${option.labelKey}`)}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                              isActive
                                ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                                : "text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
