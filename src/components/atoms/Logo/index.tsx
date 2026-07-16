import { logo } from "@/assets/images";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-bl from-primary-400 to-primary-900 p-3 shadow-sm">
        <img src={logo.LogoMain} alt="TosmFi" className="h-full w-full object-contain" />
      </div>
      <Words type="sm/bold" as="span" className="text-ink-900 dark:text-ink-50">
        Tosm Finance
      </Words>
    </div>
  );
}
