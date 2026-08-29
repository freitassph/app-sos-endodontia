import { describe, expect, it } from 'vitest';
import { createClinicalSession, parseStoredClinicalSession } from '../src/lib/clinicalSession';

describe('clinical session persistence', () => {
  it('recovers corrupt JSON without crashing or trusting checks', () => {
    const result = parseStoredClinicalSession('{invalid-json', {
      now: '2026-08-29T12:00:00.000Z',
      sessionId: 'session-safe',
    });

    expect(result.recovered).toBe(true);
    expect(result.session).toEqual({
      version: 1,
      id: 'session-safe',
      createdAt: '2026-08-29T12:00:00.000Z',
      checks: {},
    });
  });

  it('does not trust the old unscoped checklist shape', () => {
    const result = parseStoredClinicalSession(JSON.stringify({ 'protocol-p1-step-0-item-0': true }), {
      now: '2026-08-29T12:00:00.000Z',
      sessionId: 'session-migrated',
    });

    expect(result.recovered).toBe(true);
    expect(result.session.checks).toEqual({});
  });

  it('preserves a valid versioned session', () => {
    const session = createClinicalSession('2026-08-29T11:00:00.000Z', 'session-valid');
    session.checks['p1:0:0'] = true;

    const result = parseStoredClinicalSession(JSON.stringify(session), {
      now: '2026-08-29T12:00:00.000Z',
      sessionId: 'unused',
    });

    expect(result).toEqual({ session, recovered: false });
  });
});
