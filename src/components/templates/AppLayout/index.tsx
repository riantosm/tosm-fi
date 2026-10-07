import { Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { Footer } from "@/components/molecules/Footer";
import { LoadingScreen } from "@/components/molecules/LoadingScreen";
import { BottomNav } from "@/components/organisms/BottomNav";
import { ChatFab } from "@/components/organisms/ChatFab";
import { MoreMenuSheet } from "@/components/organisms/MoreMenuSheet";
import { Rail } from "@/components/organisms/Rail";
import { QuickAddProvider, useQuickAdd } from "@/hooks/use-quick-add";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { CatatCepat } from "@/layouts/assistant/CatatCepat";

const EASE = [0.22, 1, 0.36, 1] as const;

function PageFallback() {
  return <LoadingScreen variant="inline" />;
}

function Shell() {
  const location = useLocation();
  const outlet = useOutlet();
  const { isManualOpen, closeManualEntry } = useQuickAdd();

  return (
    <div className="min-h-svh">
      <Rail />

      <div className="lg:pl-[108px] lg:pr-5">
        <main className="mx-auto flex min-h-svh w-full max-w-[1320px] flex-col px-4 pb-[120px] sm:px-6 lg:px-0 lg:pt-7 lg:pb-5">
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => window.scrollTo({ top: 0 })}
          >
            <m.div
              key={location.pathname}
              className="flex flex-1 flex-col"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Suspense fallback={<PageFallback />}>{outlet}</Suspense>
            </m.div>
          </AnimatePresence>
          <Footer className="mt-10 hidden lg:flex" />
        </main>
      </div>

      <BottomNav />
      <ChatFab />
      <MoreMenuSheet />
      <CatatCepat />
      <AddTransactionModal isOpen={isManualOpen} onClose={closeManualEntry} />
    </div>
  );
}

/** Logged-in app shell — mounted once as a layout route; pages render into its <Outlet/>. */
export function AppLayout() {
  return (
    <QuickAddProvider>
      <Shell />
    </QuickAddProvider>
  );
}
