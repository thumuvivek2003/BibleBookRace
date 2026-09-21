import heroUrl from './generated/hero.webp';
import markUrl from './generated/mark.webp';

/**
 * Every image the app renders, in one place.
 *
 * Components import `IMGS` rather than writing paths, so an asset can be
 * renamed, resized or swapped without touching a screen - and a typo becomes a
 * build error instead of a broken image at runtime.
 *
 * These are ES imports, so Vite fingerprints each file (`hero-a1b2c3.webp`),
 * serves it with a far-future cache header, and rewrites the URL for whatever
 * base path the build targets - including the `/BibleBookRace/` sub-path on
 * GitHub Pages. Never hard-code `/hero.webp`; it breaks the moment the site
 * moves.
 *
 * The files come from `scripts/make-images.py`, which trims the white surround
 * off the source art in `src/assets/` so the illustration sits correctly on
 * every theme, dark ones included.
 *
 * Icons and the link-preview card are NOT here: browsers and social crawlers
 * ask for those by a fixed name, so they live in `public/` and are referenced
 * from `index.html`.
 */
export const IMGS = Object.freeze({
  /** Key art for the welcome screen - the app's front door. */
  main_screen: heroUrl,
  /** Square app mark, used wherever the product needs a logo. */
  icon: markUrl,
});

export default IMGS;
