import { describe, expect, it } from 'vitest';
import { NAV_TABS } from './navigation.js';
import { ROUTES } from './routes.js';

describe('navigation', () => {
  it('puts the Bible Map right after Home, ahead of the drills', () => {
    // The map is the content Training and Quest exercise, so a learner should
    // meet it first. This order is load-bearing, not cosmetic.
    expect(NAV_TABS.map((tab) => tab.to)).toEqual([
      ROUTES.home,
      ROUTES.map,
      ROUTES.training,
      ROUTES.quest,
      ROUTES.progress,
    ]);
  });

  it('gives the long map label a short form for the bottom bar', () => {
    const map = NAV_TABS.find((tab) => tab.to === ROUTES.map);
    expect(map.shortLabelKey).toBe('nav.mapShort');
  });
});
