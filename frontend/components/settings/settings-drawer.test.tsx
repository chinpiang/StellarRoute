import { vi } from 'vitest';

// Mock ExpertSettings completely to isolate the undefined component error
vi.mock('./ExpertSettings', () => ({
  ExpertSettings: () => (
    <div data-testid="mock-expert-settings">Mock Expert Settings</div>
  ),
}));

import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, afterEach } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from '@/components/providers/settings-provider';

function renderWithProviders(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe('SettingsPanel Drawer', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders trigger button successfully', () => {
    renderWithProviders(<SettingsPanel />);
    const trigger = screen.getByRole('button', { name: /settings/i });
    expect(trigger).toBeInTheDocument();
  });

  it('opens drawer when settings trigger is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPanel />);

    const trigger = screen.getByRole('button', { name: /settings/i });
    await user.click(trigger);

    // Verify title and content rendered
    expect(
      screen.getByRole('heading', { name: 'Settings' })
    ).toBeInTheDocument();
    expect(screen.getByText('Slippage Tolerance')).toBeInTheDocument();
    expect(screen.getByText('Transaction Deadline')).toBeInTheDocument();
  });

  it('resets settings to defaults when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPanel />);

    const trigger = screen.getByRole('button', { name: /settings/i });
    await user.click(trigger);

    // Select the "Aggressive" preset (which sets slippage to 1.0%)
    const aggressiveBtn = screen.getByRole('button', { name: /aggressive/i });
    await user.click(aggressiveBtn);

    // Verify slippage updated in the UI
    expect(screen.getByText('1%')).toBeInTheDocument();

    // Click the Reset button
    const resetBtn = screen.getByRole('button', { name: /reset/i });
    await user.click(resetBtn);

    // Verify slippage reset to default (0.5%)
    expect(screen.getByText('0.5%')).toBeInTheDocument();
  });
});
