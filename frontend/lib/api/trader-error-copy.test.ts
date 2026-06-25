import { describe, expect, it } from 'vitest';

import { StellarRouteApiError } from '@/lib/api/client';
import {
  getTraderErrorCopy,
  toTraderErrorLine,
} from '@/lib/api/trader-error-copy';

describe('getTraderErrorCopy', () => {
  it('maps known API error codes to trader-facing copy', () => {
    const error = new StellarRouteApiError(422, 'no_route', 'No route available');

    const copy = getTraderErrorCopy(error);

    expect(copy.headline).toBe('No executable route found');
    expect(copy.recoveryAction).toContain('smaller amount');
  });

  it('falls back to safe default for unknown API errors', () => {
    const error = new StellarRouteApiError(
      520,
      'unknown_error',
      'Unexpected upstream error',
    );

    const copy = getTraderErrorCopy(error);

    expect(copy.headline).toBe('We could not refresh this quote');
  });

  it('infers wallet copy from generic wallet rejection errors', () => {
    const copy = getTraderErrorCopy(new Error('Freighter rejected signature request'));

    expect(copy.headline).toBe('Wallet action was not completed');
    expect(copy.ctaLabel).toBe('Open wallet and retry');
  });

  it('infers network copy from transport failures', () => {
    const copy = getTraderErrorCopy(new Error('Failed to fetch'));

    expect(copy.headline).toBe('Network connection interrupted');
  });

  it('formats copy into a single display line', () => {
    const copy = getTraderErrorCopy(
      new StellarRouteApiError(400, 'validation_error', 'Invalid request'),
    );

    expect(toTraderErrorLine(copy)).toContain('Check your trade details.');
  });
});
