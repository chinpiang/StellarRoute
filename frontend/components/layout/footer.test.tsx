import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from './footer';
import { describe, it, expect, vi, afterEach } from 'vitest';

const setNetwork = vi.fn();

vi.mock('@/components/providers/wallet-provider', () => ({
  useWallet: () => ({
    network: 'testnet',
    setNetwork,
  }),
}));

vi.mock('@/lib/network-policy', () => ({
  getAllowedNetworks: vi.fn(() => ['testnet']),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Footer', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders all footer links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Docs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Stellar\.org/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Community/i })).toBeInTheDocument();
  });

  it('displays read-only network badge when only one network is allowed', () => {
    render(<Footer />);

    expect(screen.getAllByText('Testnet')[0]).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /stellar network/i })).not.toBeInTheDocument();
  });

  it('renders network switch when multiple networks are allowed', async () => {
    const { getAllowedNetworks } = await import('@/lib/network-policy');
    vi.mocked(getAllowedNetworks).mockReturnValue(['testnet', 'mainnet']);

    const user = userEvent.setup();
    render(<Footer />);

    const networkSelect = screen.getByRole('combobox', { name: /stellar network/i });
    expect(networkSelect).toBeInTheDocument();

    await user.selectOptions(networkSelect, 'mainnet');
    expect(setNetwork).toHaveBeenCalledWith('mainnet');
  });

  it('displays "Built for Stellar" text', () => {
    render(<Footer />);

    expect(screen.getAllByText(/Built for/i)[0]).toBeInTheDocument();
  });

  it('has proper navigation landmark', () => {
    render(<Footer />);

    const navs = screen.getAllByRole('navigation', { name: /Footer navigation/i });
    expect(navs[0]).toBeInTheDocument();
  });
});
