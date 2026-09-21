/**
 * Supported languages. Adding a third one means adding an entry here, a
 * dictionary in `translations/`, and a `name.<code>` on each book - no
 * component changes.
 */
export const locales = Object.freeze([
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳', dir: 'ltr' },
]);

export const DEFAULT_LOCALE = 'en';

export const localeCodes = locales.map((locale) => locale.code);

export function isSupportedLocale(code) {
  return localeCodes.includes(code);
}

export function getLocale(code) {
  return locales.find((locale) => locale.code === code) ?? locales[0];
}

/** Best match for the browser's preferred languages, falling back to English. */
export function detectLocale(preferred = globalThis.navigator?.languages ?? []) {
  const match = [...preferred]
    .map((tag) => String(tag).toLowerCase().split('-')[0])
    .find((code) => isSupportedLocale(code));
  return match ?? DEFAULT_LOCALE;
}
