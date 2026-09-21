import { ROUTES } from './routes.js';

/**
 * The primary destinations, declared once.
 *
 * Order matters and mirrors the learning path: you read the map before you
 * drill it, so Bible Map sits immediately after Home - ahead of Training and
 * Quest. Both navigations render from this list (the bottom bar on phones, the
 * side rail on desktop), so the two can never drift apart.
 *
 * `shortLabelKey` is what the cramped bottom bar uses when the full name is too
 * long for a fifth of a phone screen.
 */
export const NAV_TABS = Object.freeze([
  { to: ROUTES.home, labelKey: 'nav.home', icon: '🏠' },
  { to: ROUTES.map, labelKey: 'nav.map', shortLabelKey: 'nav.mapShort', icon: '📖' },
  { to: ROUTES.training, labelKey: 'nav.training', icon: '🎓' },
  { to: ROUTES.quest, labelKey: 'nav.quest', icon: '🚩' },
  { to: ROUTES.progress, labelKey: 'nav.progress', icon: '📊' },
]);
