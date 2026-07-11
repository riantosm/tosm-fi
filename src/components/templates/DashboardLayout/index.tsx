import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Topbar } from "@/components/organisms/Topbar";
import { Footer } from "@/components/molecules/Footer";
import { cn } from "@/utils/cn";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const [lastPathname, setLastPathname] = useState(location.pathname);

  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setIsNavOpen(false);
  }

  useEffect(() => {
    if (!isNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsNavOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNavOpen]);

  return (
    <div className="flex h-svh overflow-hidden bg-ink-50 dark:bg-ink-950">
      <Sidebar />

      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !isNavOpen && "pointer-events-none")}
        aria-hidden={!isNavOpen}
        inert={!isNavOpen ? true : undefined}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-950/60 transition-opacity duration-300",
            isNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsNavOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl transition-transform duration-300 ease-in-out",
            isNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar variant="drawer" onClose={() => setIsNavOpen(false)} />
        </div>
      </div>

      <div className="flex h-svh min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setIsNavOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col px-4 py-6 sm:px-6">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
