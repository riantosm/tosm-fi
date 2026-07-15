import { clsx } from "clsx";
import type { ElementType, HTMLAttributes, PropsWithChildren } from "react";

export type WordSize = "xxs" | "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type WordWeight = "light" | "regular" | "bold";
export type WordStylePath = `${WordSize}/${WordWeight}`;

interface WordsProps extends HTMLAttributes<HTMLElement> {
  /**
   * @xxs: 10px
   * @xs: 12px
   * @sm: 14px
   * @base: 16px <- default
   * @lg: 18px
   * @xl: 20px
   * @2xl: 24px
   * @3xl: 30px
   * @4xl: 36px
   */
  type?: WordStylePath;
  as?: ElementType;
}

const SIZE_CLASS: Record<WordSize, string> = {
  xxs: "text-[10px]",
  xs: "text-[12px]",
  sm: "text-[14px]",
  base: "text-[16px]",
  lg: "text-[18px]",
  xl: "text-[20px]",
  "2xl": "text-[24px]",
  "3xl": "text-[30px]",
  "4xl": "text-[36px]",
};

const WEIGHT_CLASS: Record<WordWeight, string> = {
  light: "font-light",
  regular: "font-normal",
  bold: "font-bold",
};

export function Words({
  type = "base/regular",
  as: Tag = "p",
  className,
  children,
  ...rest
}: PropsWithChildren<WordsProps>) {
  const [size, weight] = type.split("/") as [WordSize, WordWeight];

  return (
    <Tag className={clsx(SIZE_CLASS[size], WEIGHT_CLASS[weight], className)} {...rest}>
      {children}
    </Tag>
  );
}
