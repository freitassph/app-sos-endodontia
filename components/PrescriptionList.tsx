import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clipboard, Clock3, Pill, ShieldCheck } from 'lucide-react';
import { PRESCRIPTIONS } from '../data';
import { useToast } from '../hooks/useToast';
import { copyText } from '../src/lib/clipboard';
import { useApp } from '../context/AppContext';

const formatPrescription = (prescription: typeof PRESCRIPTIONS[number]) => {
  const medications = prescription.medications.map((medication, index) => [
    `${index + 1}) ${medication.name} ${medication.dose}`,
    `   Usar ${medication.frequency} por ${medication.duration}`,
    medication.observation ? `   Observação: ${medication.observation}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
  const instructions = prescription.instructions.length ? `\n\nORIENTAÇÕES:\n${prescription.instructions.map((item) => `- ${item}`).join('\n')}` : '';
  const warning = prescription.warning ? `\n\nALERTA DE REVISÃO:\n${prescription.warning}` : '';
  return `MODELO DE APOIO À PRESCRIÇÃO — ${prescription.title.toUpperCase()}\n\n${medications}${instructions}${warning}\n\nRevisão individual e assinatura profissional obrigatórias.`;
};

export const PrescriptionList: React.FC = () => {
  const { addToast } = useToast();
  const { selectedItemId } = useApp();
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [fallback, setFallback] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    if (selectedItemId) requestAnimationFrame(() => document.getElementById(selectedItemId)?.scrollIntoView({ block: 'center' }));
  }, [selectedItemId]);

  const copy = async (prescription: typeof PRESCRIPTIONS[number]) => {
    const text = formatPrescription(prescription);
    const result = await copyText(text, (value) => navigator.clipboard.writeText(value));
    if (result.ok) {
      addToast('Modelo copiado. Faça a revisão individual antes de usar.', 'success');
      setFallback(null);
    } else {
      addToast(result.error, 'error');
      setFallback({ id: prescription.id, text });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="eyebrow">Apoio à prescrição</p>
      <h1 className="page-title mt-2">Modelos para revisão profissional</h1>
      <p className="page-subtitle">Use como estrutura de apoio. Confirme indicação, alergias, contraindicações, interações, dose e condições individuais antes de copiar ou assinar.</p>
      <div role="note" className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"><ShieldCheck className="h-5 w-5 shrink-0" /><p><strong>Barreira de segurança:</strong> nenhum modelo substitui avaliação, prontuário, julgamento clínico ou assinatura do profissional responsável.</p></div>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {PRESCRIPTIONS.map((prescription) => (
          <article key={prescription.id} id={prescription.id} className={`surface overflow-hidden ${selectedItemId === prescription.id ? 'ring-2 ring-mineral-400 ring-offset-4 ring-offset-clinical-ivory dark:ring-offset-clinical-midnight' : ''}`}>
            <header className="border-b border-slate-100 p-5 sm:p-6 dark:border-white/10"><div className="flex items-start gap-3"><span className="rounded-xl bg-clinical-midnight p-2.5 text-white dark:bg-mineral-300 dark:text-clinical-midnight"><Pill className="h-5 w-5" /></span><div className="min-w-0"><p className="eyebrow">{prescription.condition}</p><h2 className="mt-1 text-xl font-extrabold tracking-tight">{prescription.title}</h2></div></div></header>
            <div className="p-5 sm:p-6"><ol className="space-y-5">{prescription.medications.map((medication, index) => <li key={`${medication.name}-${index}`} className="border-l-2 border-mineral-200 pl-4 dark:border-mineral-400/25"><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-extrabold">{index + 1}. {medication.name}{medication.isAntibiotic && <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-rose-800 dark:bg-rose-400/15 dark:text-rose-200">Antibiótico</span>}</p><span className="font-mono font-extrabold text-slate-600 dark:text-slate-200">{medication.dose}</span></div><div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="status-pill"><Clock3 className="h-3.5 w-3.5" />{medication.frequency}</span><span className="status-pill">por {medication.duration}</span></div>{medication.observation && <p className="mt-2 flex gap-2 text-xs font-bold text-amber-800 dark:text-amber-200"><AlertTriangle className="h-4 w-4 shrink-0" />{medication.observation}</p>}</li>)}</ol>
              {prescription.warning && <div className="mt-5 flex gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-400/10 dark:text-rose-100"><AlertTriangle className="h-5 w-5 shrink-0" />{prescription.warning}</div>}
              <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-white/10"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={!!reviewed[prescription.id]} onChange={(event) => setReviewed((previous) => ({ ...previous, [prescription.id]: event.target.checked }))} className="mt-0.5 h-5 w-5 shrink-0 accent-[#08A97A]" /><span className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">Revisei alergias, contraindicações, interações, dose e condições individuais do paciente.</span></label><button type="button" disabled={!reviewed[prescription.id]} onClick={() => copy(prescription)} className="primary-action mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Copiar modelo de prescrição ${prescription.title}`}><Clipboard className="h-4 w-4" />Copiar modelo revisado</button></div>
              {fallback?.id === prescription.id && <div className="mt-4"><label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">Selecione e copie manualmente<textarea readOnly value={fallback.text} className="field mt-2 min-h-44 font-mono text-xs" onFocus={(event) => event.currentTarget.select()} /></label></div>}
              {prescription.instructions.length > 0 && <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">{prescription.instructions.map((instruction) => <li key={instruction} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-mineral-600" />{instruction}</li>)}</ul>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
