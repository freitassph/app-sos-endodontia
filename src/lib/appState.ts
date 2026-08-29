import type { ViewState } from '../../types';

export type ReferenceTab = 'decision' | 'operational' | 'checklist' | 'faq';

export interface AppLocation {
  view: ViewState;
  protocolId?: string;
  referenceTab?: ReferenceTab;
  itemId?: string;
}

const views = new Set<ViewState>([
  'home', 'manifesto', 'diagnosis', 'protocols', 'protocol-detail',
  'prescriptions', 'scripts', 'faq', 'references',
]);

const referenceTabs = new Set<ReferenceTab>(['decision', 'operational', 'checklist', 'faq']);

export const serializeAppLocation = (location: AppLocation) => {
  const params = new URLSearchParams();
  if (location.protocolId) params.set('protocol', location.protocolId);
  if (location.referenceTab) params.set('tab', location.referenceTab);
  if (location.itemId) params.set('item', location.itemId);
  const query = params.toString();
  return `#/${location.view}${query ? `?${query}` : ''}`;
};

export const parseAppHash = (hash: string): AppLocation => {
  const normalized = hash.replace(/^#\/?/, '');
  const [rawView, rawQuery = ''] = normalized.split('?');
  const view = views.has(rawView as ViewState) ? rawView as ViewState : 'home';
  const params = new URLSearchParams(rawQuery);
  const protocolId = params.get('protocol') || undefined;
  const rawTab = params.get('tab');
  const referenceTab = rawTab && referenceTabs.has(rawTab as ReferenceTab) ? rawTab as ReferenceTab : undefined;
  const itemId = params.get('item') || undefined;
  return {
    view,
    ...(protocolId ? { protocolId } : {}),
    ...(referenceTab ? { referenceTab } : {}),
    ...(itemId ? { itemId } : {}),
  };
};
