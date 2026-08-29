import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, HelpCircle, MessageSquare, Pill, Search, X } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { DiagnosisWizard } from './components/DiagnosisWizard';
import { ProtocolView } from './components/ProtocolView';
import { PrescriptionList } from './components/PrescriptionList';
import { ScriptList } from './components/ScriptList';
import { ReferenceView } from './components/ReferenceView';
import { ManifestoView } from './components/ManifestoView';
import { PROTOCOLS, PRESCRIPTIONS, FAQS, SCRIPTS } from './data';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './hooks/useToast';

type SearchResult = {
  type: 'Protocolo' | 'Prescrição' | 'Comunicação' | 'FAQ';
  label: string;
  description: string;
  id: string;
};

const resultIcon = {
  Protocolo: Activity,
  Prescrição: Pill,
  Comunicação: MessageSquare,
  FAQ: HelpCircle,
};

const SearchOverlay: React.FC = () => {
  const { isSearchOpen, toggleSearch, navigate } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const results = useMemo<SearchResult[]>(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (normalized.length < 2) return [];
    const includes = (...values: string[]) => values.some((value) => value.toLocaleLowerCase('pt-BR').includes(normalized));
    return [
      ...PROTOCOLS.filter((item) => includes(item.title, item.description, ...item.steps.flatMap((step) => step.content))).map((item) => ({ type: 'Protocolo' as const, label: item.title, description: item.description, id: item.id })),
      ...PRESCRIPTIONS.filter((item) => includes(item.title, item.condition, ...item.medications.map((medication) => medication.name))).map((item) => ({ type: 'Prescrição' as const, label: item.title, description: item.condition, id: item.id })),
      ...SCRIPTS.filter((item) => includes(item.title, item.scenario, item.content)).map((item) => ({ type: 'Comunicação' as const, label: item.title, description: item.scenario, id: item.id })),
      ...FAQS.map((item, index) => ({ item, index })).filter(({ item }) => includes(item.question, item.answer, item.category ?? '')).map(({ item, index }) => ({ type: 'FAQ' as const, label: item.question, description: item.category ?? 'Geral', id: `faq-${index}` })),
    ].slice(0, 10);
  }, [query]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSearch();
      }
    };
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, [toggleSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;
    openerRef.current = document.activeElement as HTMLElement;
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') toggleSearch(false);
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button,input,[href],[tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openerRef.current?.focus();
    };
  }, [isSearchOpen, toggleSearch]);

  if (!isSearchOpen) return null;

  const select = (result: SearchResult) => {
    if (result.type === 'Protocolo') navigate('protocol-detail', result.id);
    if (result.type === 'Prescrição') navigate('prescriptions', undefined, undefined, result.id);
    if (result.type === 'Comunicação') navigate('scripts', undefined, undefined, result.id);
    if (result.type === 'FAQ') navigate('references', undefined, 'faq', result.id);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-clinical-midnight/75 px-3 pt-[8vh] backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && toggleSearch(false)}>
      <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="search-title" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-clinical-ink text-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:p-5">
          <Search className="h-5 w-5 shrink-0 text-mineral-300" />
          <div className="min-w-0 flex-1"><h2 id="search-title" className="sr-only">Buscar no SOS Endo</h2><input ref={inputRef} type="search" role="searchbox" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sintoma, protocolo, medicação ou dúvida..." className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-400 sm:text-lg" /></div>
          <button type="button" onClick={() => toggleSearch(false)} className="icon-button text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Fechar busca"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-3 sm:p-4">
          {query.trim().length < 2 && <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="font-bold">Busca clínica unificada</p><p className="mt-1 text-sm text-slate-300">Pesquise protocolos, prescrições, comunicação e perguntas frequentes.</p></div>}
          {query.trim().length >= 2 && results.length === 0 && <div role="status" className="p-8 text-center text-slate-300"><p className="font-bold text-white">Nenhum resultado</p><p className="mt-1 text-sm">Tente outro sintoma, material ou termo clínico.</p></div>}
          <div className="space-y-1">
            {results.map((result) => {
              const Icon = resultIcon[result.type];
              return (
                <button key={`${result.type}-${result.id}`} type="button" onClick={() => select(result)} aria-label={`${result.type}: ${result.label}`} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/8 focus-visible:bg-white/8">
                  <span className="rounded-xl bg-white/8 p-2.5 text-mineral-300"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold">{result.label}</span><span className="block truncate text-xs text-slate-400">{result.type} · {result.description}</span></span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProtocolList: React.FC = () => {
  const { navigate } = useApp();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="eyebrow">Condutas organizadas</p>
      <h1 className="page-title mt-2">Protocolos clínicos</h1>
      <p className="page-subtitle">Escolha um quadro para revisar indicação, materiais, checkpoints e alertas de encaminhamento.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {PROTOCOLS.map((protocol, index) => (
          <button key={protocol.id} type="button" onClick={() => navigate('protocol-detail', protocol.id)} className="surface surface-interactive group flex min-w-0 items-start gap-4 p-5 text-left sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinical-midnight text-sm font-extrabold text-white dark:bg-mineral-300 dark:text-clinical-midnight">{String(index + 1).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1"><span className="block text-lg font-extrabold tracking-tight sm:text-xl">{protocol.title}</span><span className="mt-2 block text-sm leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-300">{protocol.description}</span><span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-mineral-700 dark:text-mineral-300">Abrir protocolo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span></span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { currentView, selectedProtocolId, navigate } = useApp();
  const content = (() => {
    if (currentView === 'home') return <Hero />;
    if (currentView === 'manifesto') return <ManifestoView />;
    if (currentView === 'diagnosis') return <DiagnosisWizard />;
    if (currentView === 'protocols') return <ProtocolList />;
    if (currentView === 'protocol-detail') {
      const protocol = PROTOCOLS.find((item) => item.id === selectedProtocolId);
      return protocol ? <ProtocolView protocol={protocol} /> : <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="page-title">Protocolo não encontrado</h1><p className="page-subtitle">O link pode estar incompleto ou desatualizado.</p><button type="button" onClick={() => navigate('protocols')} className="primary-action mt-6">Voltar aos protocolos</button></div>;
    }
    if (currentView === 'prescriptions') return <PrescriptionList />;
    if (currentView === 'scripts') return <ScriptList />;
    if (currentView === 'references' || currentView === 'faq') return <ReferenceView />;
    return <Hero />;
  })();

  return (
    <Layout focusMode={currentView === 'diagnosis'}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${currentView}-${selectedProtocolId ?? ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }} className="w-full min-w-0">{content}</motion.div>
      </AnimatePresence>
      <AnimatePresence><SearchOverlay /></AnimatePresence>
    </Layout>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider><ToastProvider><MainAppContent /></ToastProvider></AppProvider>
    </MotionConfig>
  );
}
