import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/atoms/Logo";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-svh grid-cols-1 bg-white dark:bg-ink-950 lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">{title}</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="text-xs text-ink-400 dark:text-ink-500">
          {t("auth.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-bl from-primary-400 via-primary-700 to-primary-900 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.35),_transparent_55%)]" />
        <div className="relative z-10 flex h-full flex-col justify-end p-16">
          <blockquote className="text-2xl font-medium leading-snug text-white">
            {t("auth.quote")}
          </blockquote>
          <p className="mt-4 text-sm text-primary-200/80">{t("auth.quoteAuthor")}</p>
        </div>
      </div>
    </div>
  );
}
