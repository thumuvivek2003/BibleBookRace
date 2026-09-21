import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { detectLocale } from '@/i18n/locales.js';
import { detectTheme } from '@/theme/themes.js';
import { DEFAULT_SETTINGS } from '@/services/storage/settingsRepository.js';
import { useStorage } from './StorageProvider.jsx';

/**
 * The single owner of user preferences (language, theme, goal, name, pool).
 *
 * One writer means one source of truth: `I18nProvider` and `ThemeProvider` are
 * controlled components that read from here and report changes back.
 */
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const storage = useStorage();

  const [settings, setSettings] = useState(() => {
    const stored = storage.settings.load();
    return {
      ...stored,
      // First run: follow the device instead of forcing English + light mode.
      locale: stored.locale ?? detectLocale(),
      themeId: stored.hasOnboarded ? stored.themeId : detectTheme(),
    };
  });

  const updateSettings = useCallback(
    (patch) => {
      setSettings((previous) => {
        const next = { ...previous, ...patch };
        storage.settings.save(next);
        return next;
      });
    },
    [storage],
  );

  const resetSettings = useCallback(() => {
    storage.settings.clear();
    setSettings({ ...DEFAULT_SETTINGS, locale: detectLocale(), themeId: detectTheme() });
  }, [storage]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>');
  return context;
}
