import type { Story } from '@ladle/react';
import { useState } from 'react';
import { TransactionConfirmationModal } from './TransactionConfirmationModal';
import type { TransactionConfirmationModalProps } from './TransactionConfirmationModal';
import type { TradeParams } from '@/hooks/useTransactionLifecycle';

const nativeAsset = {
  asset_type: 'native' as const,
  asset_code: undefined,
  asset_issuer: undefined,
};

const usdcAsset = {
  asset_type: 'credit_alphanum4' as const,
  asset_code: 'USDC',
  asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
};

const mockRoutePath: TradeParams['routePath'] = [
  {
    from_asset: nativeAsset,
    to_asset: usdcAsset,
    price: '0.1049',
    source: 'sdex',
  },
];

function makeTradeParams(
  overrides: Partial<TradeParams> = {},
): TradeParams {
  return {
    fromAsset: 'XLM',
    toAsset: 'USDC',
    fromAmount: '500.00',
    toAmount: '52.47',
    exchangeRate: '0.1049',
    priceImpact: '0.12%',
    minReceived: '52.21 USDC',
    networkFee: '0.00001 XLM',
    routePath: mockRoutePath,
    walletAddress: 'GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ...overrides,
  };
}

// ── Shared mock quote ────────────────────────────────────────────────────────

const baseTradeParams = makeTradeParams();

const splitRouteTradeParams = makeTradeParams({
  toAsset: 'BTC',
  fromAmount: '10000.00',
  toAmount: '0.01662',
  minReceived: '0.01645 BTC',
  routePath: [
    {
      from_asset: nativeAsset,
      to_asset: usdcAsset,
      price: '0.1049',
      source: 'sdex',
    },
    {
      from_asset: usdcAsset,
      to_asset: {
        asset_type: 'credit_alphanum4',
        asset_code: 'BTC',
        asset_issuer: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ2345678901234567890',
      },
      price: '0.0000166',
      source: 'amm:GPOOL123',
    },
  ],
});

const highSlippageTradeParams = makeTradeParams({
  toAsset: 'AQUA',
  fromAmount: '50000.00',
  toAmount: '1750000.00',
  minReceived: '1662500.00 AQUA',
  priceImpact: '4.8%',
});

// ── Shared no-op handlers ────────────────────────────────────────────────────

const noop = () => {};
const noopAsync = async () => {};

function baseProps(
  overrides: Partial<TransactionConfirmationModalProps> = {},
): TransactionConfirmationModalProps {
  return {
    isOpen: true,
    status: 'review',
    tradeParams: baseTradeParams,
    onConfirm: noop,
    onCancel: noop,
    onTryAgain: noop,
    onResubmit: noop,
    onDismiss: noop,
    onDone: noop,
    ...overrides,
  };
}

// ── Stories ──────────────────────────────────────────────────────────────────

/** Review state — default XLM → USDC swap */
export const Default: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <TransactionConfirmationModal
      {...baseProps({ isOpen: open, onCancel: () => setOpen(false), onConfirm: () => setOpen(false) })}
    />
  );
};
Default.storyName = 'Default — Review';

/** Pending state — waiting for wallet signature */
export const Pending: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({ status: 'pending', tradeParams: undefined })}
  />
);
Pending.storyName = 'Pending — Wallet Signature';

/** Submitted state — awaiting network confirmation */
export const Submitted: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({ status: 'submitted', tradeParams: undefined })}
  />
);
Submitted.storyName = 'Submitted — Awaiting Network';

/** Confirmed state with tx hash */
export const Confirmed: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({
      status: 'confirmed',
      txHash: 'abc123def456abc123def456abc123def456abc123def456abc123def456ab12',
    })}
  />
);
Confirmed.storyName = 'Confirmed — Success';

/** Failed state with error message */
export const Failed: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({
      status: 'failed',
      tradeParams: undefined,
      errorMessage: 'Insufficient liquidity for this trade size. Try reducing the amount.',
    })}
  />
);
Failed.storyName = 'Failed — With Error';

/** Dropped / timed-out state */
export const Dropped: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({ status: 'dropped', tradeParams: undefined })}
  />
);
Dropped.storyName = 'Dropped — Timed Out';

/** High slippage warning — large AQUA trade with wide minReceived gap */
export const HighSlippageWarning: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({ tradeParams: highSlippageTradeParams })}
  />
);
HighSlippageWarning.storyName = 'High Slippage Warning';

/** Split route — multi-hop XLM → BTC */
export const SplitRoute: Story = () => (
  <TransactionConfirmationModal
    {...baseProps({ tradeParams: splitRouteTradeParams })}
  />
);
SplitRoute.storyName = 'Split Route — Multi-hop';

/** Mobile viewport at 390 px — wraps modal in a constrained container */
export const MobileViewport: Story = () => (
  <div style={{ width: 390, margin: '0 auto' }}>
    <TransactionConfirmationModal
      {...baseProps({ tradeParams: splitRouteTradeParams })}
    />
  </div>
);
MobileViewport.storyName = 'Mobile — 390px Viewport';
