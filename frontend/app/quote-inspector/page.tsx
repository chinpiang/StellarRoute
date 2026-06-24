"use client";

import { QuoteInspector, VenueQuote } from "@/components/shared/QuoteInspector";
import { toast } from "sonner";
import { Header } from "@/components/Header";

const MOCK_TIMESTAMP = 1713895200; // Fixed timestamp to satisfy purity rule

const mockQuotes: VenueQuote[] = [
  {
    base_asset: { asset_type: "native" },
    quote_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
    amount: "1000",
    price: "0.1052",
    total: "105.20",
    quote_type: "sell",
    timestamp: MOCK_TIMESTAMP,
    venueName: "Stellar SDEX",
    path: [
      {
        from_asset: { asset_type: "native" },
        to_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
        price: "0.1052",
        source: "sdex"
      }
    ]
  },
  {
    base_asset: { asset_type: "native" },
    quote_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
    amount: "1000",
    price: "0.1061",
    total: "106.10",
    quote_type: "sell",
    timestamp: MOCK_TIMESTAMP,
    venueName: "Soroban AMM (Phoenix)",
    isAggregated: true,
    path: [
      {
        from_asset: { asset_type: "native" },
        to_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
        price: "0.1061",
        source: "amm:phoenix_pool_address"
      }
    ]
  },
  {
    base_asset: { asset_type: "native" },
    quote_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
    amount: "1000",
    price: "0.1045",
    total: "104.50",
    quote_type: "sell",
    timestamp: MOCK_TIMESTAMP,
    venueName: "Stellar-AMM (XLM/USDC)",
    path: [
      {
        from_asset: { asset_type: "native" },
        to_asset: { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GA5Z..." },
        price: "0.1045",
        source: "amm:stellar_native_pool"
      }
    ]
  }
];

export default function QuoteInspectorPage() {
  return <QuoteInspectorPageClient />;
}
