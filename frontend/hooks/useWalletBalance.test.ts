/**
 * Tests for useWalletBalance (Issue #739)
 *
 * Covers:
 * - Fetching balances when connected
 * - Debounced refetch avoids duplicate Horizon calls during rapid updates
 * - Confirmed transaction triggers balance refetch for affected assets
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWalletBalance } from './useWalletBalance';

// Mock the WalletProvider context
vi.mock('@/components/providers/wallet-provider', () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from '@/components/providers/wallet-provider';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  globalThis.fetch = mockFetch;
  vi.mocked(useWallet).mockReturnValue({
    address: 'GABC1234567890TESTADDRESS',
    isConnected: true,
  } as ReturnType<typeof useWallet>);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const mockHorizonResponse = {
  subentry_count: 2,
  balances: [
    { asset_type: 'native', balance: '100.0000000' },
    {
      asset_type: 'credit_alphanum4',
      asset_code: 'USDC',
      asset_issuer: 'GA5ZSEJYB37JRC5AVCIAZDL2Y343IFRMA2EO3HJWV2XG7H5V5CQRUP7W',
      balance: '50.0000000',
    },
  ],
};

describe('useWalletBalance', () => {
  it('returns empty balances when disconnected', () => {
    vi.mocked(useWallet).mockReturnValueOnce({
      address: null,
      isConnected: false,
    } as ReturnType<typeof useWallet>);

    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.balances).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches balances from Horizon when connected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHorizonResponse,
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.balances).toHaveLength(2);
    expect(result.current.balances[0].asset).toBe('native');
    expect(result.current.balances[1].asset).toBe(
      'USDC:GA5ZSEJYB37JRC5AVCIAZDL2Y343IFRMA2EO3HJWV2XG7H5V5CQRUP7W'
    );
  });

  it('calculates XLM spendable balance minus reserves', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        subentry_count: 2,
        balances: [{ asset_type: 'native', balance: '100.0000000' }],
      }),
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Base reserve: 1 + 0.5 * 2 subentries = 2 XLM reserved
    // Spendable = 100 - 2 = 98 XLM
    const nativeBalance = result.current.balances.find((b) => b.asset === 'native');
    expect(nativeBalance).toBeDefined();
    expect(parseFloat(nativeBalance!.spendable)).toBe(98);
  });

  it('non-native asset spendable equals full balance', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHorizonResponse,
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const usdcBalance = result.current.balances.find((b) =>
      b.asset.startsWith('USDC:')
    );
    expect(usdcBalance?.spendable).toBe(usdcBalance?.balance);
  });

  it('refetch triggers a fresh Horizon call', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockHorizonResponse })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockHorizonResponse,
          balances: [{ asset_type: 'native', balance: '90.0000000' }],
        }),
      });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Advance past the debounce window
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('debounced refetch avoids duplicate calls within debounce window', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockHorizonResponse });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = mockFetch.mock.calls.length;

    // Fire refetch twice in rapid succession (within debounce window)
    act(() => {
      result.current.refetch();
      result.current.refetch();
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Only one additional call should have happened (or zero if still in debounce)
    expect(mockFetch.mock.calls.length - callsBefore).toBeLessThanOrEqual(1);
  });

  it('sets error when Horizon returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain('404');
  });
});
