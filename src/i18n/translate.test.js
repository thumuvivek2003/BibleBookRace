import { describe, expect, it } from 'vitest';
import { createTranslator, interpolate } from './translate.js';
import en from './translations/en.js';
import te from './translations/te.js';

/** Every visible string must exist in every language, or the screen breaks. */
function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe('i18n', () => {
  it('keeps Telugu in step with English', () => {
    const english = flatten(en);
    const telugu = new Set(flatten(te));
    expect(english.filter((key) => !telugu.has(key))).toEqual([]);
  });

  it('interpolates named values', () => {
    expect(interpolate('Find {book} now', { book: 'Amos' })).toBe('Find Amos now');
    expect(interpolate('Missing {what}', {})).toBe('Missing {what}');
  });

  it('falls back to English for a missing key', () => {
    const t = createTranslator({ dictionary: { common: {} }, fallback: en });
    expect(t('common.next')).toBe('Next');
  });

  it('returns the key rather than an empty string when nothing matches', () => {
    const t = createTranslator({ dictionary: {}, fallback: {} });
    expect(t('nope.nothing')).toBe('nope.nothing');
  });
});
