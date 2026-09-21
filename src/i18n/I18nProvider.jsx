import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import en from './translations/en.js';
import te from './translations/te.js';
import { DEFAULT_LOCALE, getLocale, isSupportedLocale, locales } from './locales.js';
import { createTranslator } from './translate.js';

/**
 * React binding for the translator.
 *
 * The provider does not own the *persisted* locale - it receives it and reports
 * changes upward, so language, theme and progress all persist through one
 * settings owner instead of three competing writers.
 */

const dictionaries = { en, te };

const I18nContext = createContext(null);

export function I18nProvider({ locale = DEFAULT_LOCALE, onLocaleChange, children }) {
  const activeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  const t = useMemo(
    () =>
      createTranslator({
        dictionary: dictionaries[activeLocale],
        fallback: dictionaries[DEFAULT_LOCALE],
      }),
    [activeLocale],
  );

  const setLocale = useCallback(
    (next) => {
      if (isSupportedLocale(next)) onLocaleChange?.(next);
    },
    [onLocaleChange],
  );

  // Keeps screen readers, font selection and `:lang()` rules honest.
  useEffect(() => {
    const element = document.documentElement;
    element.lang = activeLocale;
    element.dir = getLocale(activeLocale).dir;
  }, [activeLocale]);

  const value = useMemo(
    () => ({ locale: activeLocale, t, setLocale, locales }),
    [activeLocale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used inside <I18nProvider>');
  return context;
}
