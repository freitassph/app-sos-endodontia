import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, MessageSquare, Search } from 'lucide-react';
import { SCRIPTS } from '../data';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { copyText } from '../src/lib/clipboard';

export const ScriptList: React.FC = () => {
  const { selectedItemId } = useApp();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const scripts = useMemo(() => SCRIPTS.filter((script) => !query.trim() || [script.title, script.scenario, script.content].some((value) => value.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))), [query]);

  useEffect(() => { if (selectedItemId) requestAnimationFrame(() => document.getElementById(selectedItemId)?.scrollIntoView({ block: 'center' })); }, [selectedItemId]);

  const copy = async (content: string) => {
    const result = await copyText(content, (value) => navigator.clipboard.writeText(value));
    addToast(result.ok ? 'Script copiado para adaptação clínica.' : result.error, result.ok ? 'success' : 'error');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="eyebrow">Comunicação sob pressão</p><h1 className="page-title mt-2">Scripts de comunicação clínica</h1><p className="page-subtitle">Estruturas para orientar e tranquilizar. Adapte sempre à pessoa, ao contexto e ao consentimento.</p>
      <label className="relative mt-6 block"><span className="sr-only">Pesquisar scripts de comunicação</span><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input type="search" className="field pl-12" placeholder="Pesquisar cenário ou intenção..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <div className="mt-7 space-y-5">{scripts.map((script) => <article key={script.id} id={script.id} className={`surface overflow-hidden ${selectedItemId === script.id ? 'ring-2 ring-mineral-400 ring-offset-4 ring-offset-clinical-ivory dark:ring-offset-clinical-midnight' : ''}`}><div className="grid lg:grid-cols-[.38fr_.62fr]"><header className="border-b border-slate-100 bg-clinical-mist p-5 lg:border-b-0 lg:border-r sm:p-6 dark:border-white/10 dark:bg-white/5"><span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-200">{script.scenario}</span><h2 className="mt-4 text-xl font-extrabold">{script.title}</h2><div className="mt-5 flex flex-wrap gap-2">{script.whyItWorks.map((reason) => <span key={reason} className="status-pill"><Check className="h-3.5 w-3.5 text-mineral-600" />{reason}</span>)}</div></header><div className="p-5 sm:p-6"><MessageSquare className="h-6 w-6 text-mineral-600" /><blockquote className="font-serif-text mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200 sm:text-xl">“{script.content}”</blockquote><button type="button" onClick={() => copy(script.content)} className="secondary-action mt-6" aria-label={`Copiar script ${script.title}`}><Clipboard className="h-4 w-4" />Copiar para adaptar</button></div></div></article>)}</div>
      {scripts.length === 0 && <div role="status" className="py-16 text-center"><p className="font-extrabold">Nenhum script encontrado</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tente outra palavra ou intenção.</p></div>}
    </div>
  );
};
