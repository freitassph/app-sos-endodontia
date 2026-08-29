import React, { useEffect, useRef, useState } from 'react';
import { Activity, BookOpen, FileText, Home, Menu, MessageSquare, Moon, Pill, Search, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import type { ViewState } from '../types';
import { BrandMark } from './BrandMark';

interface LayoutProps {
  children: React.ReactNode;
  focusMode?: boolean;
}

const primaryItems = [
  { id: 'home', label: 'Painel', icon: Home },
  { id: 'diagnosis', label: 'Triagem', icon: Activity },
  { id: 'protocols', label: 'Protocolos', icon: FileText },
  { id: 'prescriptions', label: 'Prescrições', icon: Pill },
  { id: 'scripts', label: 'Comunicação', icon: MessageSquare },
  { id: 'references', label: 'Referências', icon: BookOpen },
] as const;

export const Layout: React.FC<LayoutProps> = ({ children, focusMode = false }) => {
  const { currentView, navigate, isDark, toggleTheme, toggleSearch, clinicalSession, startNewSession } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setIsMobileMenuOpen(false), [currentView]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    focusables?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
      if (event.key === 'Tab' && focusables?.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  const isActive = (id: ViewState) => currentView === id || (id === 'protocols' && currentView === 'protocol-detail');

  const NavButton = ({ item, compact = false }: { item: typeof primaryItems[number]; compact?: boolean }) => (
    <button
      type="button"
      onClick={() => navigate(item.id as ViewState)}
      aria-current={isActive(item.id as ViewState) ? 'page' : undefined}
      className={`nav-item ${isActive(item.id as ViewState) ? 'nav-item-active' : ''} ${compact ? 'justify-center desktop:justify-start' : ''}`}
    >
      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={compact ? 'sr-only desktop:not-sr-only' : ''}>{item.label}</span>
    </button>
  );

  if (focusMode) return <main className="min-h-dvh bg-clinical-ivory dark:bg-clinical-midnight">{children}</main>;

  return (
    <div className="min-h-dvh bg-clinical-ivory text-clinical-midnight dark:bg-clinical-midnight dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col border-r border-slate-200 bg-white/95 md:flex desktop:w-[264px] dark:border-white/10 dark:bg-clinical-ink/95" aria-label="Navegação principal">
        <button type="button" onClick={() => navigate('home')} className="flex h-20 items-center justify-center gap-3 border-b border-slate-100 px-4 desktop:justify-start desktop:px-6 dark:border-white/10" aria-label="Ir para o painel">
          <BrandMark className="h-10 w-10" />
          <span className="hidden text-lg font-extrabold tracking-[-0.03em] desktop:inline">SOS Endo</span>
        </button>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 desktop:px-4">
          {primaryItems.map((item) => <NavButton key={item.id} item={item} compact />)}
        </nav>
        <div className="space-y-3 border-t border-slate-100 p-3 desktop:p-4 dark:border-white/10">
          <div className="hidden rounded-2xl bg-clinical-mist p-3 text-xs desktop:block dark:bg-white/5">
            <p className="font-bold text-clinical-ink dark:text-white">Sessão clínica local</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{Object.values(clinicalSession.checks).filter(Boolean).length} itens concluídos</p>
            <button type="button" className="mt-2 font-bold text-mineral-700 underline-offset-4 hover:underline dark:text-mineral-300" onClick={() => window.confirm('Iniciar uma nova sessão e limpar os itens marcados?') && startNewSession()}>Nova sessão</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleTheme} className="icon-button" aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button type="button" onClick={() => toggleSearch(true)} className="hidden flex-1 items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 desktop:flex dark:border-white/10 dark:text-slate-200" aria-label="Abrir busca clínica com Command K">
              Buscar <kbd className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] dark:border-white/20">⌘K</kbd>
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-[64px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 pt-safe md:hidden dark:border-white/10 dark:bg-clinical-midnight/95">
        <button type="button" onClick={() => navigate('home')} className="flex items-center gap-2" aria-label="Ir para o painel">
          <BrandMark className="h-9 w-9" />
          <span className="font-extrabold tracking-[-0.03em]">SOS Endo</span>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => toggleSearch(true)} className="icon-button" aria-label="Buscar"><Search className="h-5 w-5" /></button>
          <button ref={menuButtonRef} type="button" onClick={() => setIsMobileMenuOpen(true)} className="icon-button" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button type="button" aria-label="Fechar menu" className="fixed inset-0 z-50 bg-clinical-midnight/60 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menu do SOS Endo" className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-[340px] flex-col bg-white shadow-2xl md:hidden dark:bg-clinical-ink" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 330, damping: 34 }}>
              <div className="flex items-center justify-between border-b border-slate-100 p-5 pt-safe dark:border-white/10">
                <div className="flex items-center gap-3"><BrandMark /><span className="font-extrabold">SOS Endo</span></div>
                <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="icon-button" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Menu móvel">
                {primaryItems.map((item) => <NavButton key={item.id} item={item} />)}
                <button type="button" onClick={() => navigate('manifesto')} className="nav-item"><BookOpen className="h-5 w-5" />Método SOS</button>
              </nav>
              <div className="space-y-3 border-t border-slate-100 p-5 pb-safe dark:border-white/10">
                <div className="rounded-2xl bg-clinical-mist p-4 dark:bg-white/5"><p className="font-bold">Sessão local</p><p className="text-sm text-slate-600 dark:text-slate-300">{Object.values(clinicalSession.checks).filter(Boolean).length} itens concluídos</p></div>
                <button type="button" onClick={toggleTheme} className="nav-item" aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />} {isDark ? 'Tema claro' : 'Tema escuro'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 pb-[calc(76px+env(safe-area-inset-bottom))] pt-[64px] md:ml-[88px] md:pb-0 md:pt-0 desktop:ml-[264px]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[68px] grid-cols-4 border-t border-slate-200 bg-white/95 pb-safe md:hidden dark:border-white/10 dark:bg-clinical-ink/95" aria-label="Navegação inferior">
        {primaryItems.filter((item) => ['home', 'diagnosis', 'protocols', 'references'].includes(item.id)).map((item) => (
          <button key={item.id} type="button" onClick={() => navigate(item.id as ViewState)} aria-current={isActive(item.id as ViewState) ? 'page' : undefined} className={`bottom-nav-item ${isActive(item.id as ViewState) ? 'bottom-nav-item-active' : ''}`}>
            <item.icon className="h-5 w-5" aria-hidden="true" /><span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
