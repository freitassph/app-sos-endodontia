import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ViewState } from '../types';
import { createClinicalSession, parseStoredClinicalSession, type ClinicalSession } from '../src/lib/clinicalSession';
import { parseAppHash, serializeAppLocation, type AppLocation, type ReferenceTab } from '../src/lib/appState';

const SESSION_STORAGE_KEY = 'clinical-session';

interface AppContextType {
  currentView: ViewState;
  selectedProtocolId: string | null;
  referenceTab: ReferenceTab;
  selectedItemId: string | null;
  isDark: boolean;
  checkedItems: Record<string, boolean>;
  clinicalSession: ClinicalSession;
  recoveredSession: boolean;
  isSearchOpen: boolean;
  navigate: (view: ViewState, protocolId?: string, tab?: ReferenceTab, itemId?: string) => void;
  navigateTo: (location: AppLocation) => void;
  setReferenceTab: (tab: ReferenceTab, itemId?: string) => void;
  toggleTheme: () => void;
  toggleCheck: (id: string) => void;
  resetChecks: () => void;
  startNewSession: () => void;
  toggleSearch: (isOpen?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const newSessionId = () => (
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}`
);

const readInitialSession = () => {
  if (typeof window === 'undefined') {
    return { session: createClinicalSession(new Date().toISOString(), 'server-session'), recovered: false };
  }
  const raw = localStorage.getItem(SESSION_STORAGE_KEY) ?? localStorage.getItem('checkedItems');
  return parseStoredClinicalSession(raw, { now: new Date().toISOString(), sessionId: newSessionId() });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocation = useMemo(() => parseAppHash(typeof window === 'undefined' ? '' : window.location.hash), []);
  const initialSession = useMemo(readInitialSession, []);
  const [location, setLocation] = useState<AppLocation>(initialLocation);
  const [clinicalSession, setClinicalSession] = useState(initialSession.session);
  const [recoveredSession, setRecoveredSession] = useState(initialSession.recovered);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const applyLocation = useCallback((next: AppLocation, updateHash = true) => {
    setLocation(next);
    setIsSearchOpen(false);
    if (updateHash && typeof window !== 'undefined') {
      const nextHash = serializeAppLocation(next);
      if (window.location.hash !== nextHash) window.location.hash = nextHash;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => applyLocation(parseAppHash(window.location.hash), false);
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.location.hash = serializeAppLocation(initialLocation);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [applyLocation, initialLocation]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(clinicalSession));
    localStorage.removeItem('checkedItems');
  }, [clinicalSession]);

  const navigate = useCallback((view: ViewState, protocolId?: string, tab?: ReferenceTab, itemId?: string) => {
    applyLocation({
      view: view === 'faq' ? 'references' : view,
      ...(protocolId ? { protocolId } : {}),
      ...(view === 'faq' ? { referenceTab: 'faq' as const } : tab ? { referenceTab: tab } : {}),
      ...(itemId ? { itemId } : {}),
    });
  }, [applyLocation]);

  const setReferenceTab = useCallback((tab: ReferenceTab, itemId?: string) => {
    applyLocation({ view: 'references', referenceTab: tab, ...(itemId ? { itemId } : {}) });
  }, [applyLocation]);

  const toggleCheck = useCallback((id: string) => {
    setClinicalSession((previous) => ({
      ...previous,
      checks: { ...previous.checks, [id]: !previous.checks[id] },
    }));
  }, []);

  const startNewSession = useCallback(() => {
    setClinicalSession(createClinicalSession(new Date().toISOString(), newSessionId()));
    setRecoveredSession(false);
  }, []);

  const value = useMemo<AppContextType>(() => ({
    currentView: location.view,
    selectedProtocolId: location.protocolId ?? null,
    referenceTab: location.referenceTab ?? 'decision',
    selectedItemId: location.itemId ?? null,
    isDark,
    checkedItems: clinicalSession.checks,
    clinicalSession,
    recoveredSession,
    isSearchOpen,
    navigate,
    navigateTo: applyLocation,
    setReferenceTab,
    toggleTheme: () => setIsDark((previous) => !previous),
    toggleCheck,
    resetChecks: () => setClinicalSession((previous) => ({ ...previous, checks: {} })),
    startNewSession,
    toggleSearch: (isOpen) => setIsSearchOpen((previous) => isOpen ?? !previous),
  }), [applyLocation, clinicalSession, isDark, isSearchOpen, location, navigate, recoveredSession, setReferenceTab, startNewSession, toggleCheck]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
