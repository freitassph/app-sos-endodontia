import React from 'react';
import { ArrowRight, Check, Compass, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const principles = [
  { title: 'Decidir com método', body: 'Organizar sinais, riscos e próximos passos reduz improviso sem substituir julgamento profissional.' },
  { title: 'Executar com clareza', body: 'Materiais, etapas e checkpoints precisam estar visíveis no momento certo, com baixa carga cognitiva.' },
  { title: 'Revisar com responsabilidade', body: 'Toda hipótese, prescrição e conduta permanece sujeita a confirmação, documentação e encaminhamento.' },
];

export const ManifestoView: React.FC = () => {
  const { navigate } = useApp();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-clinical-midnight p-6 text-white sm:p-10"><span className="inline-flex rounded-full border border-mineral-300/20 bg-mineral-400/10 px-3 py-1.5 text-xs font-extrabold text-mineral-200"><Compass className="mr-2 h-4 w-4" />Método SOS</span><h1 className="mt-8 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">Clareza clínica quando cada decisão importa.</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">O SOS Endo estrutura informação e execução para apoiar profissionais em urgências. Não automatiza diagnóstico, não substitui avaliação e não elimina a necessidade de encaminhamento.</p><button type="button" onClick={() => navigate('diagnosis')} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mineral-300 px-5 py-3 font-extrabold text-clinical-midnight">Iniciar triagem assistida <ArrowRight className="h-4 w-4" /></button></div>
      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-labelledby="principles-heading"><h2 id="principles-heading" className="sr-only">Princípios do método</h2>{principles.map((principle, index) => <article key={principle.title} className="surface p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mineral-50 font-extrabold text-mineral-700 dark:bg-mineral-400/10 dark:text-mineral-200">0{index + 1}</span><h3 className="mt-5 text-xl font-extrabold">{principle.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{principle.body}</p></article>)}</section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5 sm:p-8"><div className="grid gap-7 md:grid-cols-2"><div><p className="eyebrow">Contrato de segurança</p><h2 className="mt-2 text-2xl font-extrabold">O que o sistema faz — e o que não faz</h2></div><ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">{['Apoia a organização de hipóteses e condutas.', 'Mantém o profissional como autoridade final.', 'Destaca sinais de alarme e critérios de encaminhamento.', 'Exige revisão antes de copiar modelos de prescrição.'].map((item) => <li key={item} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-mineral-600" />{item}</li>)}</ul></div><div className="mt-7 flex gap-3 rounded-2xl bg-clinical-mist p-4 text-sm dark:bg-white/5"><ShieldCheck className="h-5 w-5 shrink-0 text-mineral-600" /><p>Conteúdo clínico deve passar por validação independente e governança profissional antes de uso assistencial real.</p></div></section>
    </div>
  );
};
