import { Metadata } from "next";
import { QuoteInspectorPageClient } from "./QuoteInspectorPageClient";

export const metadata: Metadata = {
  title: "Quote Inspector | StellarRoute",
  description: "Reconcile and compare quotes from multiple Stellar liquidity venues.",
  openGraph: {
    title: "Quote Inspector | StellarRoute",
    description: "Analyze and reconcile quotes across SDEX and Soroban AMM pools.",
    type: "website",
  },
};

export default function QuoteInspectorPage() {
  return <QuoteInspectorPageClient />;
}
