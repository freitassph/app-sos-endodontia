import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ClipboardCheck, Stethoscope, X } from 'lucide-react';
import { DIAGNOSIS_STEPS, PROTOCOLS } from '../data';
import { useApp } from '../context/AppContext';

interface AnswerRecord {
  stepId: string;
  question: string;
  answer: 'Sim' | 'Não';
}

export const DiagnosisWizard: React.FC = () => {
  const { navigate } = useApp();
  const [currentStepId, setCurrentStepId] = useState('start');
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<{ title: string; protocolId?: string; signs: string[]; alert?: string } | null>(null);
  const step = DIAGNOSIS_STEPS[currentStepId];
  const progress = Math.min(100, Math.round(((history.length + 1) / 7) * 100));
  const answerSummary = useMemo(() => answers.slice(-7), [answers]);

  const complete = (answer: 'yes' | 'no') => {
    let protocolId = step.resultId;
    let title = PROTOCOLS.find((protocol) => protocol.id === protocolId)?.title ?? 'Hipótese a confirmar';
    let signs = step.clinicalSigns;
    let alert = step.alert;
    if (currentStepId === 'uncertain' && answer === 'no') {
      protocolId = 'p6';
      title = 'Quadro inconclusivo — abordagem conservadora';
      signs = ['Nenhum quadro clássico foi confirmado.', 'Considere etiologias não endodônticas.', 'Documente e reavalie a evolução clínica.'];
      alert = 'Confirme os achados, considere exames complementares e encaminhe quando houver dúvida diagnóstica.';
    }
    setResult({ title, protocolId, signs, alert });
  };

  const answer = (choice: 'yes' | 'no') => {
    setAnswers((previous) => [...previous, { stepId: currentStepId, question: step.question, answer: choice === 'yes' ? 'Sim' : 'Não' }]);
    const next = choice === 'yes' ? step.yesNext : step.noNext;
    if (!next || next === 'result') complete(choice);
    else {
      setHistory((previous) => [...previous, currentStepId]);
      setCurrentStepId(next);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const goBack = () => {
    if (result) { setResult(null); setAnswers((previous) => previous.slice(0, -1)); return; }
    const previous = history.at(-1);
    if (!previous) { navigate('home'); return; }
    setHistory((items) => items.slice(0, -1));
    setAnswers((items) => items.slice(0, -1));
    setCurrentStepId(previous);
  };

  if (result) {
    return (
      <div className="min-h-dvh bg-clinical-ivory px-4 py-6 dark:bg-clinical-midnight sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <button type="button" onClick={goBack} className="secondary-action" aria-label="Revisar última resposta"><ArrowLeft className="h-4 w-4" />Revisar</button>
          <div className="mt-8 rounded-3xl border border-mineral-200 bg-white p-6 shadow-elevated dark:border-mineral-400/20 dark:bg-clinical-ink sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mineral-50 text-mineral-700 dark:bg-mineral-400/10 dark:text-mineral-200"><ClipboardCheck className="h-7 w-7" /></div>
            <p className="eyebrow mt-7">Resultado assistivo</p>
            <h1 className="page-title mt-2">Hipótese clínica sugerida</h1>
            <p className="mt-3 text-xl font-bold text-clinical-ink dark:text-white">{result.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Revise as respostas e confirme profissionalmente os achados antes de seguir qualquer conduta.</p>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl bg-clinical-mist p-5 dark:bg-white/5" aria-labelledby="answers-heading"><h2 id="answers-heading" className="font-extrabold">Caminho revisado</h2><ol className="mt-4 space-y-3">{answerSummary.map((item, index) => <li key={`${item.stepId}-${index}`} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-slate-600 dark:bg-white/10 dark:text-white">{index + 1}</span><span><span className="block text-slate-600 dark:text-slate-300">{item.question}</span><span className="font-extrabold">{item.answer}</span></span></li>)}</ol></section>
              <section className="rounded-2xl border border-slate-200 p-5 dark:border-white/10" aria-labelledby="signs-heading"><h2 id="signs-heading" className="font-extrabold">Achados a confirmar</h2><ul className="mt-4 space-y-3">{result.signs.slice(0, 4).map((sign) => <li key={sign} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-mineral-600" />{sign}</li>)}</ul></section>
            </div>
            {result.alert && <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0" />{result.alert}</div>}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={goBack} className="secondary-action">Revisar respostas</button>{result.protocolId && <button type="button" onClick={() => navigate('protocol-detail', result.protocolId)} className="primary-action">Abrir protocolo relacionado <ArrowRight className="h-4 w-4" /></button>}</div>
          </div>
        </div>
      </div>
    );
  }

  const isFinalQuestion = currentStepId === 'uncertain';
  return (
    <div className="min-h-dvh bg-clinical-ivory dark:bg-clinical-midnight">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-clinical-ivory/95 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-clinical-midnight/95 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4"><button type="button" onClick={goBack} className="icon-button" aria-label="Voltar"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="eyebrow">Triagem clínica assistida</span><span className="text-xs font-bold text-slate-600 dark:text-slate-300">Etapa {history.length + 1}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-mineral-500 transition-[width]" style={{ width: `${progress}%` }} /></div></div></div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-36 pt-7 sm:px-6 sm:pb-10 sm:pt-12">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
          <div><p className="eyebrow">Pergunta de decisão</p><h1 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">{step.question}</h1><p className="font-serif-text mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>{step.alert && <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100"><AlertTriangle className="h-5 w-5 shrink-0" />{step.alert}</div>}</div>
          <details className="surface p-5 sm:p-6" open><summary className="flex cursor-pointer list-none items-center gap-2 font-extrabold"><Stethoscope className="h-5 w-5 text-mineral-600" />Sinais para confirmar</summary><ul className="mt-5 space-y-3">{step.clinicalSigns.map((sign) => <li key={sign} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mineral-500" />{sign}</li>)}</ul>{step.radiography?.length ? <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/10"><p className="eyebrow">Imagem e testes</p><ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">{step.radiography.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}</details>
        </div>
        <div className="mt-8 hidden grid-cols-2 gap-3 sm:grid"><button type="button" onClick={() => answer('yes')} className="primary-action min-h-16"><Check className="h-5 w-5" />{step.yesLabel ?? 'Sim, corresponde'}</button><button type="button" onClick={() => answer('no')} className="secondary-action min-h-16"><X className="h-5 w-5" />{isFinalQuestion ? 'Finalizar triagem' : 'Não, próximo'}</button></div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-white/10 dark:bg-clinical-ink/95 sm:hidden"><button type="button" onClick={() => answer('yes')} className="primary-action px-3"><Check className="h-5 w-5" /><span className="line-clamp-1">{step.yesLabel ?? 'Sim'}</span></button><button type="button" onClick={() => answer('no')} className="secondary-action px-3" aria-label={isFinalQuestion ? 'Responder não e concluir triagem' : 'Responder não e avançar'}><X className="h-5 w-5" /><span className="line-clamp-1">{isFinalQuestion ? 'Finalizar triagem' : 'Não'}</span></button></div>
    </div>
  );
};
