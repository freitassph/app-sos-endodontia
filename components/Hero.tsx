import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, MessageSquare, Search, ShieldCheck, Stethoscope } from 'lucide-react';
import { PROTOCOLS } from '../data';
import { useApp } from '../context/AppContext';
import { Card } from './ui/Card';

export const Hero: React.FC = () => {
  const { navigate, toggleSearch, clinicalSession, recoveredSession } = useApp();
  const completed = Object.values(clinicalSession.checks).filter(Boolean).length;

  return (
    <div className="home-dashboard mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="home-header mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Central clínica de apoio</p>
          <h1 className="page-title mt-2">Painel clínico</h1>
          <p className="home-subtitle page-subtitle">Decisão assistida, execução organizada e referências rápidas para urgências endodônticas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="home-session-pill status-pill"><span className="h-2 w-2 rounded-full bg-mineral-500" />Sessão local ativa</span>
          <span className="home-completed-pill status-pill"><CheckCircle2 className="h-4 w-4 text-mineral-600" />{completed} itens concluídos</span>
        </div>
      </header>

      {recoveredSession && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-bold">Sessão recuperada com segurança</p><p className="text-sm">A sessão anterior não pôde ser lida. Os itens foram reiniciados para evitar marcações incorretas.</p></div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 desktop:grid-cols-12">
        <section className="home-hero relative overflow-hidden rounded-3xl bg-clinical-midnight p-6 text-white shadow-elevated sm:p-8 md:col-span-2 desktop:col-span-7" aria-labelledby="triage-heading">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 border-l border-white/10 bg-[radial-gradient(circle_at_center,rgba(8,169,122,.24),transparent_68%)] sm:block" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-mineral-300/25 bg-mineral-400/10 px-3 py-1.5 text-xs font-extrabold text-mineral-200"><Stethoscope className="h-4 w-4" />Próxima ação segura</span>
            <h2 id="triage-heading" className="home-hero-heading mt-8 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">Paciente em urgência?</h2>
            <p className="home-hero-copy mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Revise sinais, percorra a triagem e confirme profissionalmente a hipótese antes da conduta.</p>
            <button type="button" onClick={() => navigate('diagnosis')} className="home-hero-cta mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-mineral-300 px-5 py-3 font-extrabold text-clinical-midnight transition hover:bg-mineral-200 active:scale-[.985]" aria-label="Iniciar triagem clínica">
              Iniciar triagem <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <Card className="md:col-span-1 desktop:col-span-5" onClick={() => navigate('protocols')} ariaLabel="Abrir protocolos clínicos">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between"><div className="rounded-xl bg-mineral-50 p-2.5 text-mineral-700 dark:bg-mineral-400/10 dark:text-mineral-200"><BookOpen className="h-5 w-5" /></div><ArrowRight className="h-5 w-5 text-slate-400" /></div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight">Protocolos clínicos</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Acesse o passo a passo, materiais, checkpoints e alertas críticos.</p>
            <ul className="mt-6 divide-y divide-slate-100 border-y border-slate-100 dark:divide-white/10 dark:border-white/10">
              {PROTOCOLS.slice(0, 3).map((protocol) => <li key={protocol.id} className="flex items-center justify-between py-3 text-sm font-bold"><span className="line-clamp-1">{protocol.title}</span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" /></li>)}
            </ul>
          </div>
        </Card>

        <Card className="desktop:col-span-4" onClick={() => toggleSearch(true)} ariaLabel="Pesquisar conteúdo clínico">
          <div className="flex items-center gap-4"><div className="rounded-xl bg-clinical-mist p-3 text-clinical-ink dark:bg-white/5 dark:text-white"><Search className="h-5 w-5" /></div><div><p className="font-extrabold">Busca clínica</p><p className="text-sm text-slate-600 dark:text-slate-300">Encontre uma resposta sem percorrer menus.</p></div></div>
        </Card>
        <Card className="desktop:col-span-4" onClick={() => navigate('prescriptions')} ariaLabel="Abrir modelos de apoio à prescrição">
          <div className="flex items-center gap-4"><div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200"><FileText className="h-5 w-5" /></div><div><p className="font-extrabold">Modelos de prescrição</p><p className="text-sm text-slate-600 dark:text-slate-300">Revise segurança antes de copiar.</p></div></div>
        </Card>
        <Card className="desktop:col-span-4" onClick={() => navigate('scripts')} ariaLabel="Abrir scripts de comunicação clínica">
          <div className="flex items-center gap-4"><div className="rounded-xl bg-violet-50 p-3 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200"><MessageSquare className="h-5 w-5" /></div><div><p className="font-extrabold">Comunicação clínica</p><p className="text-sm text-slate-600 dark:text-slate-300">Oriente com clareza e segurança.</p></div></div>
        </Card>
      </div>

      <section className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5" aria-labelledby="method-heading">
        <div><p className="eyebrow">Método SOS</p><h2 id="method-heading" className="mt-2 text-xl font-extrabold">Clareza sob pressão</h2></div>
        <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Clock3 className="h-5 w-5 shrink-0 text-mineral-600" /><p>Fluxos curtos para decidir, executar e revisar.</p></div>
        <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><ShieldCheck className="h-5 w-5 shrink-0 text-mineral-600" /><p>Apoio clínico assistivo; confirmação profissional permanece obrigatória.</p></div>
      </section>
    </div>
  );
};
