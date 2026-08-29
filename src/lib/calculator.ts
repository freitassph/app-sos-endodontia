export interface ProcedureEstimateInput {
  materials: number;
  medication: number;
  provisional: number;
  operationalHourly: number;
  procedureMinutes: number;
  price: number;
}

export type ProcedureEstimate =
  | { ok: true; totalCost: number; profit: number; margin: number }
  | { ok: false; error: string };

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateProcedureEstimate = (input: ProcedureEstimateInput): ProcedureEstimate => {
  const values = Object.values(input);
  if (values.some((value) => !Number.isFinite(value))) return { ok: false, error: 'Preencha todos os valores com números válidos.' };
  if (values.some((value) => value < 0)) return { ok: false, error: 'Use apenas valores iguais ou maiores que zero.' };
  if (input.price <= 0) return { ok: false, error: 'Informe um preço maior que zero.' };
  const operational = input.operationalHourly * (input.procedureMinutes / 60);
  const totalCost = roundCurrency(input.materials + input.medication + input.provisional + operational);
  const profit = roundCurrency(input.price - totalCost);
  return {
    ok: true,
    totalCost,
    profit,
    margin: Math.round((profit / input.price) * 100),
  };
};
