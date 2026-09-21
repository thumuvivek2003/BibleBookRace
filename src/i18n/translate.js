/**
 * A tiny, dependency-free translator.
 *
 * Pure functions only - the React binding lives in `I18nProvider.jsx`, so these
 * can be unit tested and reused anywhere.
 */

/** Reads "a.b.c" out of a nested dictionary. */
export function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

/** Replaces `{name}` placeholders. Missing values are left visible, not blank. */
export function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

/**
 * @param {object} params
 * @param {object} params.dictionary active language
 * @param {object} [params.fallback] used when a key is missing (English)
 * @returns {(key: string, values?: Record<string, unknown>) => string}
 */
export function createTranslator({ dictionary, fallback }) {
  return (key, values) => {
    const template = lookup(dictionary, key) ?? lookup(fallback ?? {}, key);
    if (typeof template !== 'string') {
      // Surfacing the key beats rendering an empty box in front of a classroom.
      if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    return interpolate(template, values);
  };
}
