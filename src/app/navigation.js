import { ROUTES } from './routes.js';

/**
 * The primary destinations, declared once.
 *
 * Both navigations render from this list - the bottom bar on phones and the
 * side rail on desktop - so the two can never drift apart.
 */
export const NAV_TABS = Object.freeze([
  { to: ROUTES.home, labelKey: 'nav.home', icon: '🏠' },
  { to: ROUTES.training, labelKey: 'nav.training', icon: '🎓' },
  { to: ROUTES.quest, labelKey: 'nav.quest', icon: '🚩' },
  { to: ROUTES.progress, labelKey: 'nav.progress', icon: '📊' },
  { to: ROUTES.map, labelKey: 'home.tiles.mapTitle', icon: '📖', railOnly: true },
]);
