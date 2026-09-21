/**
 * Theme registry.
 *
 * `id` must match a `[data-theme="..."]` block in `themes.css`; `label` is a key
 * into `themes.*` in the dictionaries. `swatch` values are only used to paint
 * the little preview dots in Settings.
 */
export const themes = Object.freeze([
  { id: 'candy', labelKey: 'themes.candy', scheme: 'light', swatch: ['#3b82f6', '#22c55e', '#fbbf24'] },
  { id: 'night', labelKey: 'themes.night', scheme: 'dark', swatch: ['#60a5fa', '#4ade80', '#c084fc'] },
  { id: 'sunrise', labelKey: 'themes.sunrise', scheme: 'light', swatch: ['#f97316', '#db2777', '#16a34a'] },
  { id: 'forest', labelKey: 'themes.forest', scheme: 'light', swatch: ['#10b981', '#0284c7', '#ca8a04'] },
  { id: 'contrast', labelKey: 'themes.contrast', scheme: 'dark', swatch: ['#facc15', '#f472b6', '#7dd3fc'] },
]);

export const DEFAULT_THEME_ID = 'candy';

export const themeIds = themes.map((theme) => theme.id);

export function isSupportedTheme(id) {
  return themeIds.includes(id);
}

export function getTheme(id) {
  return themes.find((theme) => theme.id === id) ?? themes[0];
}

/** Used on first run so a device in dark mode does not get a bright white app. */
export function detectTheme() {
  const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'night' : DEFAULT_THEME_ID;
}
