'use client';

/**
 * useWalletBalance
 *
 * Fetches spendable balances from Horizon for the connected wallet address.
 * Exposes a `refetch` method so callers can trigger an immediate refresh
 * (e.g. after a confirmed swap) without waiting for the next poll cycle.
 *
 * A debounce guard prevents duplicate Horizon calls when `refetch` is called
 * in rapid succession (e.g. multiple confirmation events in the same tick).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet } from '@/components/providers/wallet-provider';

export interface AssetBalance {
  asset: string;      // "native" | "CODE:ISSUER"
  balance: string;    // decimal string, e.g. "42.5000000"
  spendable: string;  // balance minus base reserves
}

export interface UseWalletBalanceResult {
  balances: AssetBalance[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Minimum time between two Horizon calls (debounce window)
const REFETCH_DEBOUNCE_MS = 1_500;

// Base reserve per Stellar account + per entry (in XLM)
const BASE_RESERVE = 1; // simplified: 0.5 base + 0.5 per subentry

/**
 * Derive a human-readable asset identifier from a Horizon balance entry.
 */
function toAssetId(entry: {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}): string {
  if (entry.asset_type === 'native') return 'native';
  return `${entry.asset_code ?? ''}:${entry.asset_issuer ?? ''}`;
}

/**
 * Calculate spendable XLM (total minus reserves for open trust-lines).
 * For non-native assets the full balance is always spendable.
 */
function toSpendable(
  balance: string,
  assetType: string,
  numSubentries: number,
): string {
  if (assetType !== 'native') return balance;
  const total = parseFloat(balance) || 0;
  const reserved = BASE_RESERVE + 0.5 * numSubentries;
  const spendable = Math.max(0, total - reserved);
  // Round to 7 decimal places (Stellar precision)
  return (Math.floor(spendable * 1e7) / 1e7).toFixed(7);
}

/**
 * Fetch account data from the configured Horizon server.
 * Falls back to the public testnet if no env var is set.
 */
async function fetchHorizonBalances(
  address: string,
  signal?: AbortSignal,
): Promise<AssetBalance[]> {
  const horizonUrl =
    process.env.NEXT_PUBLIC_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

  const res = await fetch(`${horizonUrl}/accounts/${address}`, { signal });

  if (!res.ok) {
    throw new Error(`Horizon returned ${res.status} for account ${address}`);
  }

  const data = (await res.json()) as {
    balances: Array<{
      asset_type: string;
      asset_code?: string;
      asset_issuer?: string;
      balance: string;
    }>;
    subentry_count: number;
  };

  const numSubentries = data.subentry_count ?? 0;

  return data.balances.map((entry) => ({
    asset: toAssetId(entry),
    balance: entry.balance,
    spendable: toSpendable(entry.balance, entry.asset_type, numSubentries),
  }));
}

export function useWalletBalance(): UseWalletBalanceResult {
  const { address, isConnected } = useWallet();

  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the last time we kicked off a fetch so we can debounce rapid calls
  const lastFetchAt = useRef<number>(0);
  // Manual refetch trigger — incrementing this schedules a fresh fetch
  const [fetchTick, setFetchTick] = useState(0);

  const refetch = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchAt.current < REFETCH_DEBOUNCE_MS) return;
    setFetchTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      setBalances([]);
      setError(null);
import { useEffect, useMemo, useState } from 'react';
import type { WalletNetwork } from '@/lib/wallet/types';
import { XLM_FEE_RESERVE } from '@/lib/stellar-reserves';

interface HorizonBalanceLine {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface HorizonAccountResponse {
  balances?: HorizonBalanceLine[];
}

interface WalletBalanceState {
  balance: string | null;
  spendableBalance: string | null;
  loading: boolean;
  error: Error | null;
}

const HORIZON_URLS: Record<string, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

function normalizeNetwork(network: WalletNetwork | null): string {
  const defaultNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
  return String(network ?? defaultNetwork).toLowerCase();
}

function findAssetBalance(
  balances: HorizonBalanceLine[],
  asset: string,
): string {
  if (asset === 'native') {
    return balances.find((line) => line.asset_type === 'native')?.balance ?? '0';
  }

  const [code, issuer] = asset.split(':');
  if (!code || !issuer) return '0';

  return (
    balances.find(
      (line) => line.asset_code === code && line.asset_issuer === issuer,
    )?.balance ?? '0'
  );
}

function formatSpendableNativeBalance(balance: string): string {
  const value = Number.parseFloat(balance);
  if (!Number.isFinite(value)) return '0';
  return Math.max(0, value - XLM_FEE_RESERVE).toFixed(7);
}

export function useWalletBalance({
  address,
  asset,
  isConnected,
  network,
}: {
  address: string | null;
  asset: string;
  isConnected: boolean;
  network: WalletNetwork | null;
}): WalletBalanceState {
  const [state, setState] = useState<WalletBalanceState>({
    balance: null,
    spendableBalance: null,
    loading: false,
    error: null,
  });

  const networkKey = normalizeNetwork(network);

  useEffect(() => {
    if (!isConnected || !address) {
      setState({
        balance: null,
        spendableBalance: null,
        loading: false,
        error: null,
      });
      return;
    }

    const defaultNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
    const horizonUrl = networkKey === defaultNetwork.toLowerCase() && process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL
      ? process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL
      : HORIZON_URLS[networkKey];
    if (!horizonUrl) {
      setState({
        balance: null,
        spendableBalance: null,
        loading: false,
        error: new Error(`Unsupported network: ${network}`),
      });
      return;
    }

    const controller = new AbortController();
    lastFetchAt.current = Date.now();
    setLoading(true);
    setError(null);

    fetchHorizonBalances(address, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setBalances(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [address, isConnected, fetchTick]);

  return { balances, loading, error, refetch };
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetch(`${horizonUrl}/accounts/${encodeURIComponent(address)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load wallet balance.');
        }
        return (await response.json()) as HorizonAccountResponse;
      })
      .then((account) => {
        if (controller.signal.aborted) return;
        const balance = findAssetBalance(account.balances ?? [], asset);
        setState({
          balance,
          spendableBalance:
            asset === 'native' ? formatSpendableNativeBalance(balance) : balance,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          balance: null,
          spendableBalance: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => controller.abort();
  }, [address, asset, isConnected, network, networkKey]);

  return useMemo(() => state, [state]);
}
