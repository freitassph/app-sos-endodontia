import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Calculator, ClipboardCheck, HelpCircle, Search, Table2 } from 'lucide-react';
import { FAQS, PRE_PROCEDURE_CHECKLIST, REFERENCE_TABLES } from '../data';
import { useApp } from '../context/AppContext';
import { calculateProcedureEstimate } from '../src/lib/calculator';
import type { ReferenceTab } from '../src/lib/appState';
import { Card } from './ui/Card';

const tabs: { id: ReferenceTab; label: string; icon: React.ElementType }[] = [
  { id: 'decision', label: 'Decisão clínica', icon: Table2 },
  { id: 'operational', label: 'Operação e custos', icon: Calculator },
  { id: 'checklist', label: 'Checklists', icon: ClipboardCheck },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const ReferenceTableBlock: React.FC<{ table: typeof REFERENCE_TABLES[number] }> = ({ table }) => (
  <Card noPadding className="overflow-hidden">
    <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-6"><h2 className="text-xl font-extrabold tracking-tight">{table.title}</h2>{table.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{table.description}</p>}</div>
    <div className="overflow-x-auto" tabIndex={0} aria-label={`Tabela rolável: ${table.title}`}>
      <table className="min-w-[620px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">{table.title}{table.description ? `. ${table.description}` : ''}</caption>
        <thead><tr className="bg-clinical-mist text-xs uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-300">{table.headers.map((header) => <th key={header} scope="col" className="px-5 py-3 font-extrabold">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-5 py-4 align-top leading-relaxed ${cellIndex === 0 ? 'font-bold text-clinical-ink dark:text-white' : 'text-slate-600 dark:text-slate-300'} ${/HOSPITAL|REFERIR/.test(cell) ? 'font-extrabold text-danger-700 dark:text-rose-300' : ''}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </Card>
);

export const ReferenceView: React.FC = () => {
  const { referenceTab, selectedItemId, setReferenceTab, checkedItems, toggleCheck, resetChecks } = useApp();
  const [faqSearch, setFaqSearch] = useState('');
  const [inputs, setInputs] = useState({ materials: 20, medication: 10, provisional: 5, operationalHourly: 120, procedureMinutes: 60, price: 400 });
  const estimate = calculateProcedureEstimate(inputs);

  const filteredFaqs = useMemo(() => {
    const query = faqSearch.trim().toLocaleLowerCase('pt-BR');
    return FAQS.map((item, index) => ({ ...item, id: `faq-${index}` })).filter((item) => !query || [item.question, item.answer, item.category ?? ''].some((value) => value.toLocaleLowerCase('pt-BR').includes(query)));
  }, [faqSearch]);

  useEffect(() => {
    if (referenceTab !== 'faq' || !selectedItemId) return;
    requestAnimationFrame(() => document.getElementById(selectedItemId)?.scrollIntoView({ block: 'center' }));
  }, [referenceTab, selectedItemId]);

  const updateNumber = (key: keyof typeof inputs) => (event: React.ChangeEvent<HTMLInputElement>) => setInputs((previous) => ({ ...previous, [key]: event.target.value === '' ? Number.NaN : Number(event.target.value) }));

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
    setReferenceTab(tabs[nextIndex].id);
    requestAnimationFrame(() => document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus());
  };

  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="eyebrow">Biblioteca operacional</p>
      <h1 className="page-title mt-2">Referências clínicas</h1>
      <p className="page-subtitle">Consulte critérios de decisão, estime custos, execute checklists da sessão e localize respostas rápidas.</p>

      <div role="tablist" aria-label="Seções de referências" className="no-scrollbar mt-7 flex max-w-full gap-2 overflow-x-auto pb-2">
        {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" aria-selected={referenceTab === tab.id} aria-controls={`panel-${tab.id}`} id={`tab-${tab.id}`} tabIndex={referenceTab === tab.id ? 0 : -1} onClick={() => setReferenceTab(tab.id)} onKeyDown={(event) => handleTabKeyDown(event, index)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${referenceTab === tab.id ? 'border-clinical-midnight bg-clinical-midnight text-white dark:border-mineral-300 dark:bg-mineral-300 dark:text-clinical-midnight' : 'border-slate-200 bg-white text-slate-600 hover:border-mineral-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'}`}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
      </div>

      <section role="tabpanel" id={`panel-${referenceTab}`} aria-labelledby={`tab-${referenceTab}`} className="mt-6 min-w-0">
        {referenceTab === 'decision' && <div className="space-y-5">{REFERENCE_TABLES.filter((table) => ['t1', 't2', 't5'].includes(table.id)).map((table) => <ReferenceTableBlock key={table.id} table={table} />)}</div>}

        {referenceTab === 'operational' && (
          <div className="space-y-5">
            <Card>
              <div className="flex items-start gap-3"><span className="rounded-xl bg-mineral-50 p-3 text-mineral-700 dark:bg-mineral-400/10 dark:text-mineral-200"><Calculator className="h-5 w-5" /></span><div><h2 className="text-xl font-extrabold">Estimativa de procedimento</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Todos os componentes entram na fórmula. O resultado é uma estimativa operacional, não lucro contábil.</p></div></div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
                <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="sr-only">Custos e preço do procedimento</legend>
                  {[
                    ['materials', 'Materiais (R$)'], ['medication', 'Medicação (R$)'], ['provisional', 'Provisório e selamento (R$)'], ['operationalHourly', 'Custo operacional por hora (R$)'], ['procedureMinutes', 'Duração estimada (min)'], ['price', 'Preço estimado (R$)'],
                  ].map(([key, label]) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</span><input className="field" type="number" min="0" step="1" value={Number.isNaN(inputs[key as keyof typeof inputs]) ? '' : inputs[key as keyof typeof inputs]} onChange={updateNumber(key as keyof typeof inputs)} /></label>)}
                </fieldset>
                <div className={`rounded-2xl border p-5 ${estimate.ok ? 'border-mineral-200 bg-mineral-50 dark:border-mineral-400/20 dark:bg-mineral-400/10' : 'border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10'}`} aria-live="polite">
                  {estimate.ok ? <><p className="eyebrow">Resumo estimado</p><dl className="mt-4 space-y-4"><div className="flex justify-between gap-3"><dt>Custo total</dt><dd className="font-extrabold">R$ {estimate.totalCost.toFixed(2)}</dd></div><div className="flex justify-between gap-3"><dt>Resultado estimado</dt><dd className={`font-extrabold ${estimate.profit >= 0 ? 'text-mineral-700 dark:text-mineral-200' : 'text-danger-700 dark:text-rose-300'}`}>R$ {estimate.profit.toFixed(2)}</dd></div><div className="border-t border-mineral-200 pt-4 dark:border-white/10"><dt className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Margem estimada</dt><dd className="mt-1 text-4xl font-extrabold tracking-tight">{estimate.margin}%</dd></div></dl></> : <div role="alert"><p className="font-extrabold">Revise os valores</p><p className="mt-2 text-sm">{estimate.error}</p></div>}
                </div>
              </div>
            </Card>
            {REFERENCE_TABLES.filter((table) => ['t3', 't4'].includes(table.id)).map((table) => <ReferenceTableBlock key={table.id} table={table} />)}
          </div>
        )}

        {referenceTab === 'checklist' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600 dark:text-slate-300">As marcações pertencem apenas à sessão clínica local atual.</p><button type="button" className="secondary-action" onClick={() => window.confirm('Limpar todos os itens desta sessão?') && resetChecks()}>Limpar sessão</button></div>
            <div className="grid gap-4 lg:grid-cols-3">{PRE_PROCEDURE_CHECKLIST.map((section, sectionIndex) => {
              const completed = section.items.filter((_, itemIndex) => checkedItems[`pre:${sectionIndex}:${itemIndex}`]).length;
              return <Card key={section.title}><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">{section.title}</h2><span className="status-pill">{completed}/{section.items.length}</span></div><ul className="mt-5 space-y-3">{section.items.map((item, itemIndex) => { const id = `pre:${sectionIndex}:${itemIndex}`; return <li key={item}><label className="flex cursor-pointer items-start gap-3 rounded-xl p-1 transition hover:bg-mineral-50 dark:hover:bg-white/5"><input type="checkbox" checked={!!checkedItems[id]} onChange={() => toggleCheck(id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#08A97A]" /><span className={checkedItems[id] ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}>{item}</span></label></li>; })}</ul></Card>;
            })}</div>
          </div>
        )}

        {referenceTab === 'faq' && (
          <div>
            <label className="relative block"><span className="sr-only">Pesquisar perguntas frequentes</span><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input type="search" className="field pl-12" placeholder="Pesquisar perguntas frequentes..." value={faqSearch} onChange={(event) => setFaqSearch(event.target.value)} /></label>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">{filteredFaqs.map((faq) => <article key={faq.id} id={faq.id} className={`surface p-5 transition sm:p-6 ${selectedItemId === faq.id ? 'ring-2 ring-mineral-400 ring-offset-4 ring-offset-clinical-ivory dark:ring-offset-clinical-midnight' : ''}`}><span className="inline-flex rounded-full bg-clinical-mist px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-300">{faq.category ?? 'Geral'}</span><h2 className="mt-4 text-lg font-extrabold">{faq.question}</h2><p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{faq.answer}</p></article>)}</div>
            {filteredFaqs.length === 0 && <div role="status" className="py-16 text-center"><BookOpen className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 font-bold">Nenhuma resposta encontrada</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tente uma palavra-chave mais curta.</p></div>}
          </div>
        )}
      </section>
    </div>
  );
};
