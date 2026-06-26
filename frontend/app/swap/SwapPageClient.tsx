"use client";

import { SplitView } from "@/components/swap/SplitView";
import { useSplitView } from "@/hooks/useSplitView";
import dynamic from "next/dynamic";

const SwapCard = dynamic(
  () => import("@/components/swap/SwapCard").then((m) => m.SwapCard),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[480px] h-[580px] bg-card/40 backdrop-blur-md rounded-[32px] border border-border/20 flex items-center justify-center shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-mono animate-pulse">Initializing swap interface...</span>
        </div>
      </div>
    )
  }
);

const RouteDisplay = dynamic(
  () => import("@/components/swap/RouteDisplay").then((m) => m.RouteDisplay),
  { ssr: false }
);

export function SwapPageClient() {
  const { isSplit, toggleSplit } = useSplitView();

  return (
    <SplitView
      isSplit={isSplit}
      onToggle={toggleSplit}
      primary={<SwapCard />}
      secondary={
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Route Details</h2>
          <RouteDisplay amountOut="0" />
        </div>
      }
      className="w-full max-w-[960px] mx-auto"
    />
  );
}
