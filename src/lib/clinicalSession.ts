export interface ClinicalSession {
  version: 1;
  id: string;
  createdAt: string;
  checks: Record<string, boolean>;
}

interface RecoveryOptions {
  now: string;
  sessionId: string;
}

export const createClinicalSession = (createdAt: string = new Date().toISOString(), id: string = crypto.randomUUID()): ClinicalSession => ({
  version: 1,
  id,
  createdAt,
  checks: {},
});

const isBooleanRecord = (value: unknown): value is Record<string, boolean> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
  && Object.values(value).every((item) => typeof item === 'boolean')
);

const isClinicalSession = (value: unknown): value is ClinicalSession => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ClinicalSession>;
  return candidate.version === 1
    && typeof candidate.id === 'string'
    && typeof candidate.createdAt === 'string'
    && isBooleanRecord(candidate.checks);
};

export const parseStoredClinicalSession = (raw: string | null, options: RecoveryOptions) => {
  if (!raw) return { session: createClinicalSession(options.now, options.sessionId), recovered: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isClinicalSession(parsed)) return { session: parsed, recovered: false };
  } catch {
    // Recovery below is intentionally fail-closed.
  }
  return { session: createClinicalSession(options.now, options.sessionId), recovered: true };
};
