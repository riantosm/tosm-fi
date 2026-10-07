import { createElement, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuEllipsisVertical, LuPencil, LuTrash2 } from "react-icons/lu";
import { Badge } from "@/components/atoms/Badge";
import { IconButton } from "@/components/atoms/IconButton";
import { Card } from "@/components/molecules/Card";
import { Popover } from "@/components/molecules/Popover";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { SubCategoryPills } from "@/layouts/category/SubCategoryPills";
import type { Category, SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryCardProps {
  category: Category;
  isDeleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onAddSubCategory: () => void;
}

export function CategoryCard({
  category,
  isDeleting,
  onEdit,
  onDelete,
  onEditSubCategory,
  onAddSubCategory,
}: CategoryCardProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isIncome = category.type === "income";
  const typeBadge = (
    <Badge tone={isIncome ? "income" : "expense"}>
      {isIncome ? t("category.income") : t("category.expense")}
    </Badge>
  );

  return (
    <Card className="flex h-full flex-col gap-3.5 lg:gap-4">
      <div className="flex items-center gap-3 lg:gap-3.5">
        <button
          type="button"
          onClick={onEdit}
          className="group flex min-w-0 flex-1 items-center gap-3 text-left lg:gap-3.5"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 lg:size-12"
            style={{ backgroundColor: `${category.color}26`, color: category.color }}
          >
            {createElement(resolveCategoryIcon(category.icon), {
              className: "size-5 lg:size-[22px]",
            })}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-text lg:text-[17px]">
                {category.nameCategory}
              </span>
              <span className="hidden shrink-0 lg:inline-flex">{typeBadge}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-text-3">
              <span className="shrink-0 lg:hidden">{typeBadge}</span>
              <span className="truncate lg:hidden">
                {t("category.trxShort", { count: category.transactionCount })}
              </span>
              <span className="hidden truncate lg:inline">
                {t("wallet.transactionCount", { n: category.transactionCount })} ·{" "}
                {t("category.subCount", { count: category.subCategories.length })}
              </span>
            </span>
          </span>
        </button>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <IconButton
            label={t("category.editTitle")}
            icon={<LuPencil />}
            size="sm"
            onClick={onEdit}
          />
          <IconButton
            label={t("wallet.deleteButton")}
            icon={<LuTrash2 />}
            size="sm"
            variant="danger"
            onClick={onDelete}
            disabled={isDeleting}
          />
        </div>

        {/* Phone / tablet: overflow menu */}
        <Popover
          className="lg:hidden"
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          align="end"
          panelClassName="w-48"
          trigger={
            <IconButton
              label={t("common.more")}
              icon={<LuEllipsisVertical />}
              variant="ghost"
              size="sm"
              tooltip={false}
              className="lg:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
            />
          }
        >
          <div className="flex flex-col gap-0.5">
            <MenuItem
              icon={<LuPencil />}
              label={t("category.editTitle")}
              onClick={() => {
                setIsMenuOpen(false);
                onEdit();
              }}
            />
            <MenuItem
              icon={<LuTrash2 />}
              label={t("wallet.deleteButton")}
              danger
              disabled={isDeleting}
              onClick={() => {
                setIsMenuOpen(false);
                onDelete();
              }}
            />
          </div>
        </Popover>
      </div>

      <span className="hidden h-px bg-border lg:block" aria-hidden="true" />

      <SubCategoryPills
        category={category}
        onEditSubCategory={onEditSubCategory}
        onAddSubCategory={onAddSubCategory}
        onShowAll={onEdit}
      />
    </Card>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-[14px] transition-colors disabled:opacity-50 [&_svg]:size-[18px]",
        danger ? "text-expense-text hover:bg-expense-soft" : "text-text hover:bg-surface-2",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
