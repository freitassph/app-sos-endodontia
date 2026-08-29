import React, { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, ArrowLeft, Briefcase, Check, ChevronDown, Clock3, FileText, Info, Lightbulb, Pause, Play, RotateCcw, TrendingUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Protocol, ProtocolStep } from '../types';
import { useApp } from '../context/AppContext';
import { durationMinutesOptions } from '../src/lib/timer';

interface ActiveTimer { seconds: number; initialSeconds: number; stepTitle: string; running: boolean }

const toneFor = (step: ProtocolStep) => {
  if (step.type === 'alert') return 'border-rose-300 bg-rose-50 dark:border-rose-400/25 dark:bg-rose-400/10';
  if (step.type === 'critical') return 'border-amber-300 bg-amber-50 dark:border-amber-400/25 dark:bg-amber-400/10';
  if (step.type === 'prescription') return 'border-blue-200 bg-blue-50 dark:border-blue-400/20 dark:bg-blue-400/10';
  if (step.type === 'tip') return 'border-violet-200 bg-violet-50 dark:border-violet-400/20 dark:bg-violet-400/10';
  return 'border-slate-200 bg-white dark:border-white/10 dark:bg-clinical-ink';
};

const TimerDock: React.FC<{ timer: ActiveTimer; onChange: React.Dispatch<React.SetStateAction<ActiveTimer | null>> }> = ({ timer, onChange }) => {
  useEffect(() => {
    if (!timer.running || timer.seconds <= 0) return;
    const id = window.setInterval(() => onChange((current) => current ? { ...current, seconds: Math.max(0, current.seconds - 1), running: current.seconds > 1 } : null), 1000);
    return () => window.clearInterval(id);
  }, [onChange, timer.running, timer.seconds]);
  const minutes = Math.floor(timer.seconds / 60);
  const seconds = String(timer.seconds % 60).padStart(2, '0');
  const progress = ((timer.initialSeconds - timer.seconds) / timer.initialSeconds) * 100;
  return (
    <motion.aside initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-[84px] left-4 right-4 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:w-[360px] dark:border-white/10 dark:bg-clinical-ink" aria-label="Cronômetro clínico">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100 dark:bg-white/10"><div className="h-full bg-mineral-500" style={{ width: `${progress}%` }} /></div>
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Cronômetro {timer.running ? 'em andamento' : timer.seconds === 0 ? 'concluído' : 'pausado'}</p><p className="mt-2 font-mono text-3xl font-extrabold tabular-nums" aria-live="polite">{minutes}:{seconds}</p><p className="mt-1 max-w-[220px] truncate text-xs text-slate-600 dark:text-slate-300">{timer.stepTitle}</p></div><button type="button" onClick={() => onChange(null)} className="icon-button" aria-label="Fechar cronômetro"><X className="h-4 w-4" /></button></div>
      <div className="mt-3 flex gap-2"><button type="button" onClick={() => onChange((current) => current ? { ...current, seconds: current.initialSeconds, running: false } : null)} className="secondary-action" aria-label="Reiniciar cronômetro"><RotateCcw className="h-4 w-4" />Reiniciar</button><button type="button" onClick={() => onChange((current) => current ? { ...current, running: !current.running } : null)} className="primary-action" aria-label={timer.running ? 'Pausar cronômetro' : 'Continuar cronômetro'}>{timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{timer.running ? 'Pausar' : 'Continuar'}</button></div>
    </motion.aside>
  );
};

export const ProtocolView: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
  const { navigate, checkedItems, toggleCheck, clinicalSession } = useApp();
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [timer, setTimer] = useState<ActiveTimer | null>(null);
  const checklistIds = useMemo(() => protocol.steps.flatMap((step, stepIndex) => step.type === 'checklist' ? step.content.map((_, itemIndex) => `protocol:${protocol.id}:${stepIndex}:${itemIndex}`) : []), [protocol]);
  const completed = checklistIds.filter((id) => checkedItems[id]).length;
  const completion = checklistIds.length ? Math.round((completed / checklistIds.length) * 100) : 0;

  const startTimer = (minutes: number, stepTitle: string) => setTimer({ seconds: minutes * 60, initialSeconds: minutes * 60, stepTitle, running: true });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-clinical-ivory/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-clinical-midnight/95 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('protocols')} className="icon-button" aria-label="Voltar aos protocolos"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">{protocol.shortTitle}</p><span className="text-xs font-bold text-mineral-700 dark:text-mineral-300">{completed}/{checklistIds.length} checkpoints</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full bg-mineral-500 transition-[width]" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>
      </header>

      <main className="pt-8">
        <div className="flex flex-wrap gap-2"><span className="status-pill">Protocolo clínico</span><span className="status-pill"><Clock3 className="h-4 w-4" />Sessão {clinicalSession.id.slice(0, 8)}</span></div>
        <h1 className="page-title mt-5 max-w-3xl">{protocol.title}</h1>
        <p className="font-serif-text mt-5 border-l-4 border-mineral-400 pl-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">{protocol.description}</p>

        {protocol.materials?.length ? <section className="surface mt-7 overflow-hidden" aria-labelledby="materials-heading"><button type="button" onClick={() => setMaterialsOpen((open) => !open)} className="flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left sm:px-5" aria-expanded={materialsOpen} aria-controls="materials-panel"><span className="flex items-center gap-3 font-extrabold"><Briefcase className="h-5 w-5 text-mineral-600" /><span id="materials-heading">Materiais necessários</span></span><ChevronDown className={`h-5 w-5 transition ${materialsOpen ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{materialsOpen && <motion.ul id="materials-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-2 overflow-hidden border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-5 dark:border-white/10">{protocol.materials.map((material) => <li key={material} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="h-4 w-4 shrink-0 text-mineral-600" />{material}</li>)}</motion.ul>}</AnimatePresence></section> : null}

        <section className="mt-10 space-y-8" aria-label="Etapas do protocolo">
          {protocol.steps.map((step, stepIndex) => {
            const options = step.duration ? durationMinutesOptions(step.duration) : [];
            return (
              <article key={`${step.title}-${stepIndex}`} className="relative pl-10 sm:pl-14">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-mineral-300 bg-clinical-ivory text-xs font-extrabold text-mineral-800 dark:bg-clinical-midnight dark:text-mineral-200 sm:h-10 sm:w-10">{stepIndex + 1}</div>
                {stepIndex < protocol.steps.length - 1 && <div className="absolute bottom-[-2rem] left-[15px] top-9 w-px bg-slate-200 dark:bg-white/10 sm:left-[19px] sm:top-11" />}
                <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{step.title}</h2>{step.duration && <span className="status-pill"><Clock3 className="h-4 w-4" />{step.duration}</span>}</div>
                <div className={`mt-4 rounded-2xl border p-5 sm:p-6 ${toneFor(step)}`}>
                  {step.type === 'checklist' ? <ul className="space-y-3">{step.content.map((item, itemIndex) => { const id = `protocol:${protocol.id}:${stepIndex}:${itemIndex}`; return <li key={item}><label className="flex cursor-pointer items-start gap-3 rounded-xl p-1 transition hover:bg-black/5 dark:hover:bg-white/5"><input type="checkbox" checked={!!checkedItems[id]} onChange={() => toggleCheck(id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#08A97A]" /><span className={`leading-relaxed ${checkedItems[id] ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{item}</span></label></li>; })}</ul> : <div className="flex gap-3">{step.type === 'alert' || step.type === 'critical' ? <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" /> : step.type === 'tip' ? <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-violet-700 dark:text-violet-300" /> : step.type === 'prescription' ? <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" /> : <Info className="mt-0.5 h-5 w-5 shrink-0 text-mineral-700 dark:text-mineral-300" />}<div className="space-y-3">{step.content.map((item) => <p key={item} className="leading-relaxed text-slate-700 dark:text-slate-200">{item}</p>)}</div></div>}
                  {step.type === 'prescription' && <button type="button" onClick={() => navigate('prescriptions')} className="secondary-action mt-5">Abrir modelos de apoio <ArrowLeft className="h-4 w-4 rotate-180" /></button>}
                  {options.length > 0 && <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">Cronômetro sugerido</p><div className="mt-3 flex flex-wrap gap-2">{options.map((minutes) => <button key={minutes} type="button" onClick={() => startTimer(minutes, step.title)} className="secondary-action"><Play className="h-4 w-4" />Iniciar {minutes} min</button>)}</div></div>}
                </div>
              </article>
            );
          })}
        </section>

        {protocol.outcome?.length ? <section className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10" aria-labelledby="outcome-heading"><h2 id="outcome-heading" className="flex items-center gap-2 text-xl font-extrabold"><TrendingUp className="h-5 w-5 text-mineral-600" />Resultados esperados</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{protocol.outcome.map((item) => <div key={item.label} className="surface p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">{item.label}</p><p className="mt-2 text-xl font-extrabold">{item.value}</p></div>)}</div></section> : null}
      </main>
      <AnimatePresence>{timer && <TimerDock timer={timer} onChange={setTimer} />}</AnimatePresence>
    </div>
  );
};
