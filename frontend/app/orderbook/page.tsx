"use client";

import { MarketDepthChart } from "./MarketDepthChart";
import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewState } from "@/components/shared/ViewState";
import { useOrderbook, usePairs } from "@/hooks/useApi";
import { useOptionalTradingPair } from "@/contexts/TradingPairContext";
import { useVirtualWindow } from "@/hooks/useVirtualWindow";
import type { OrderbookEntry, TradingPair } from "@/types";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 36;
const OVERSCAN = 5;
const MAX_VISIBLE_ROWS = 100;

function pairKey(pair: TradingPair): string {
  return `${pair.base_asset}__${pair.counter_asset}`;
}

function VirtualizedOrderSide({
  entries,
  side,
  highlighted,
}: {
  entries: OrderbookEntry[];
  side: "bid" | "ask";
  highlighted: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBid = side === "bid";

  const virtualWindow = useVirtualWindow({
    containerRef: scrollRef,
    itemCount: entries.length,
    itemHeight: ROW_HEIGHT,
    overscan: OVERSCAN,
    defaultViewportHeight: ROW_HEIGHT * 15,
  });

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        No {side}s available
      </p>
    );
  }

  const visibleEntries = virtualWindow.isVirtualized
    ? entries.slice(virtualWindow.startIndex, virtualWindow.endIndex)
    : entries;

  return (
    <div className="space-y-1 text-sm">
      <div className="sticky top-0 z-10 bg-card grid grid-cols-3 text-xs text-muted-foreground font-medium pb-2 border-b">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      <div
        ref={scrollRef}
        className="overflow-auto"
        style={{ height: `${Math.min(entries.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT}px` }}
        data-testid={`${side}-virtual-list`}
      >
        <div
          style={{
            height: `${virtualWindow.totalHeight}px`,
            position: "relative",
          }}
        >
          {virtualWindow.topSpacerHeight > 0 && (
            <div style={{ height: `${virtualWindow.topSpacerHeight}px` }} />
          )}
          {visibleEntries.map((entry, index) => {
            const absoluteIndex = virtualWindow.isVirtualized
              ? virtualWindow.startIndex + index
              : index;
            return (
              <div
                key={`${entry.price}-${absoluteIndex}`}
                data-testid={
                  highlighted
                    ? `highlighted-${side}-row`
                    : `${side}-row`
                }
                className={cn(
                  "grid grid-cols-3 py-1.5 px-2 rounded",
                  isBid
                    ? "hover:bg-emerald-500/10 cursor-pointer"
                    : "hover:bg-red-500/10 cursor-pointer",
                  highlighted && (isBid ? "bg-emerald-500/5" : "bg-red-500/5")
                )}
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <span
                  className={cn(
                    "font-medium",
                    isBid ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {entry.price}
                </span>
                <span className="text-muted-foreground truncate">
                  {entry.amount}
                </span>
                <span className="text-muted-foreground truncate">
                  {entry.total}
                </span>
              </div>
            );
          })}
          {virtualWindow.bottomSpacerHeight > 0 && (
            <div style={{ height: `${virtualWindow.bottomSpacerHeight}px` }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderbookPage() {
  return <OrderbookPageClient />;
}