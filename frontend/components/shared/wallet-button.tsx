'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/providers/wallet-provider';
import { useWalletOnboarding } from '@/hooks/useWalletOnboarding';
import { WalletConnectionOnboarding } from '@/components/modals/WalletConnectionOnboarding';
import type { SupportedWallet, WalletNetwork } from '@/lib/wallet/types';
import { Button } from '@/components/ui/button';

function formatShortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const {
    address,
    isConnected,
    network,
    walletNetwork,
    availableWallets,
    isLoading,
    error,
    connect,
    disconnect,
    setNetwork,
  } = useWallet();

  const {
    showOnboarding,
    isFirstConnection,
    markOnboardingAsCompleted,
    markOnboardingAsSeenAndOpened,
  } = useWalletOnboarding({
    isConnected,
  });

  useEffect(() => {
    if (showOnboarding && isFirstConnection && !showOnboardingModal) {
      setShowOnboardingModal(true);
      markOnboardingAsSeenAndOpened();
    }
  }, [
    showOnboarding,
    isFirstConnection,
    showOnboardingModal,
    markOnboardingAsSeenAndOpened,
  ]);

  const handleOnboardingConnect = async (walletId: SupportedWallet) => {
    await connect(walletId);
    markOnboardingAsCompleted();
  };

  const handleNetworkSelection = (nextNetwork: WalletNetwork) => {
    setNetwork(nextNetwork);
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowOnboardingModal(true)}
          className="min-h-[44px]"
        >
          Connect Wallet
        </Button>

        <WalletConnectionOnboarding
          open={showOnboardingModal}
          onOpenChange={setShowOnboardingModal}
          availableWallets={availableWallets}
          isLoading={isLoading}
          error={error?.message ?? null}
          onConnect={handleOnboardingConnect}
          appNetwork={network}
          walletNetwork={walletNetwork}
          onNetworkSelection={handleNetworkSelection}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="rounded-md border px-3 py-2 text-sm font-mono bg-muted/20"
        title={address ?? undefined}
      >
        {address ? formatShortAddress(address) : 'Connected'}
      </span>
      <Button variant="outline" size="sm" onClick={disconnect} className="min-h-[44px]">
        Disconnect
      </Button>
    </div>
  );
}
