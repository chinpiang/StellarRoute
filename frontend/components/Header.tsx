/**
 * Legacy Header.tsx — re-exports the canonical layout header.
 *
 * Issue #740: components/Header.tsx and components/layout/header.tsx
 * diverged. The canonical implementation lives in layout/header.tsx.
 * This file is kept as a thin re-export so any existing imports continue
 * to resolve without needing a broad refactor, while ensuring a single
 * source of truth for the header markup and behaviour.
 *
 * @deprecated Import from '@/components/layout/header' directly.
 */
export { Header } from '@/components/layout/header';
"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "@/components/shared/wallet-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/swap" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              StellarRoute
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* future nav/search area */}
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              History
            </Link>

            <WalletButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
