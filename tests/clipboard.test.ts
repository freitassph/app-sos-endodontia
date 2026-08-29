import { describe, expect, it, vi } from 'vitest';
import { copyText } from '../src/lib/clipboard';

describe('clipboard result handling', () => {
  it('reports success only after the writer resolves', async () => {
    const writer = vi.fn().mockResolvedValue(undefined);

    await expect(copyText('conteúdo', writer)).resolves.toEqual({ ok: true });
    expect(writer).toHaveBeenCalledWith('conteúdo');
  });

  it('returns an actionable failure when clipboard permission is denied', async () => {
    const writer = vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError'));

    await expect(copyText('conteúdo', writer)).resolves.toEqual({
      ok: false,
      error: 'Não foi possível copiar. Selecione o texto manualmente.',
    });
  });
});
