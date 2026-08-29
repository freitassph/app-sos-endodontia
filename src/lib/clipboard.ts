export type ClipboardWriter = (text: string) => Promise<void>;

export const copyText = async (text: string, writer: ClipboardWriter) => {
  try {
    await writer(text);
    return { ok: true } as const;
  } catch {
    return {
      ok: false,
      error: 'Não foi possível copiar. Selecione o texto manualmente.',
    } as const;
  }
};
