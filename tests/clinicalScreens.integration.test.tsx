import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('clinical screen safety contracts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('presents triage output as a reviewed hypothesis rather than a definitive diagnosis', async () => {
    window.location.hash = '#/diagnosis';
    const user = userEvent.setup();
    render(<App />);

    for (let step = 0; step < 6; step += 1) {
      await user.click(screen.getByRole('button', { name: /não, próximo/i }));
    }
    await user.click(screen.getByRole('button', { name: /finalizar triagem/i }));

    expect(screen.getByRole('heading', { name: /hipótese clínica sugerida/i })).toBeInTheDocument();
    expect(screen.getByText(/revise as respostas e confirme profissionalmente/i)).toBeInTheDocument();
  });

  it('renders only explicitly checkable protocol content as real checkboxes', () => {
    window.location.hash = '#/protocol-detail?protocol=p1';
    render(<App />);

    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByText(/a polpa inflamada resiste à lidocaína/i)).toBeInTheDocument();
  });

  it('requires a professional review acknowledgement before copying a prescription model', () => {
    window.location.hash = '#/prescriptions';
    render(<App />);

    const copyButton = screen.getAllByRole('button', { name: /copiar modelo de prescrição/i })[0];
    expect(copyButton).toBeDisabled();
    expect(screen.getAllByRole('checkbox', { name: /revisei alergias, contraindicações/i })[0]).not.toBeChecked();
  });
});
