import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('SOS Endo application integration', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/home';
  });

  it('recovers corrupt clinical session storage and renders the dashboard', () => {
    localStorage.setItem('clinical-session', '{invalid-json');

    render(<App />);

    expect(screen.getByRole('heading', { name: /painel clínico/i })).toBeInTheDocument();
    expect(screen.getByText(/sessão anterior não pôde ser lida/i)).toBeInTheDocument();
  });

  it('opens an FAQ search result in the exact FAQ tab', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.type(screen.getByRole('searchbox'), 'Quanto tempo a dor leva');
    await user.click(await screen.findByRole('button', { name: 'FAQ: Quanto tempo a dor leva para passar?' }));

    await waitFor(() => expect(screen.getByRole('tab', { name: 'FAQ' })).toHaveAttribute('aria-selected', 'true'));
    expect(window.location.hash).toContain('tab=faq');
  });

  it('exposes dashboard shortcuts as named keyboard-operable controls', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /abrir protocolos clínicos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar triagem clínica/i })).toBeInTheDocument();
  });

  it('moves reference tabs with arrow keys', async () => {
    window.location.hash = '#/references?tab=decision';
    const user = userEvent.setup();
    render(<App />);

    const decisionTab = screen.getByRole('tab', { name: 'Decisão clínica' });
    decisionTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Operação e custos' })).toHaveAttribute('aria-selected', 'true');
  });
});
