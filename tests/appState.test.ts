import { describe, expect, it } from 'vitest';
import { parseAppHash, serializeAppLocation } from '../src/lib/appState';

describe('app URL state', () => {
  it('round-trips an exact FAQ destination', () => {
    const hash = serializeAppLocation({
      view: 'references',
      referenceTab: 'faq',
      itemId: 'faq-3',
    });

    expect(hash).toBe('#/references?tab=faq&item=faq-3');
    expect(parseAppHash(hash)).toEqual({
      view: 'references',
      referenceTab: 'faq',
      itemId: 'faq-3',
    });
  });

  it('recovers an unknown view to the dashboard', () => {
    expect(parseAppHash('#/not-a-real-view')).toEqual({ view: 'home' });
  });

  it('keeps the selected protocol in a deep link', () => {
    expect(parseAppHash('#/protocol-detail?protocol=p3')).toEqual({
      view: 'protocol-detail',
      protocolId: 'p3',
    });
  });
});
