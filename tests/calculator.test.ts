import { describe, expect, it } from 'vitest';
import { calculateProcedureEstimate } from '../src/lib/calculator';

describe('procedure estimate calculator', () => {
  it('includes the visible provisional cost and time-adjusted overhead', () => {
    expect(calculateProcedureEstimate({
      materials: 20,
      medication: 10,
      provisional: 5,
      operationalHourly: 120,
      procedureMinutes: 60,
      price: 400,
    })).toEqual({
      ok: true,
      totalCost: 155,
      profit: 245,
      margin: 61,
    });
  });

  it('rejects a zero price instead of rendering Infinity', () => {
    expect(calculateProcedureEstimate({
      materials: 20,
      medication: 10,
      provisional: 5,
      operationalHourly: 120,
      procedureMinutes: 60,
      price: 0,
    })).toEqual({ ok: false, error: 'Informe um preço maior que zero.' });
  });

  it('rejects negative values', () => {
    expect(calculateProcedureEstimate({
      materials: -1,
      medication: 10,
      provisional: 5,
      operationalHourly: 120,
      procedureMinutes: 60,
      price: 400,
    })).toEqual({ ok: false, error: 'Use apenas valores iguais ou maiores que zero.' });
  });
});
