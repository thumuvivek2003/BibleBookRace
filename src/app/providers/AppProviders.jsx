import { I18nProvider } from '@/i18n/I18nProvider.jsx';
import { ThemeProvider } from '@/theme/ThemeProvider.jsx';
import { ProgressProvider } from './ProgressProvider.jsx';
import { SettingsProvider, useSettings } from './SettingsProvider.jsx';
import { StorageProvider } from './StorageProvider.jsx';

/**
 * Single place where cross-cutting concerns are composed, so `App` stays tiny.
 *
 * Order matters: storage -> settings (the owner of locale/theme) -> language and
 * theme -> progress.
 */
export function AppProviders({ storage, children }) {
  return (
    <StorageProvider storage={storage}>
      <SettingsProvider>
        <PreferenceBridge>
          <ProgressProvider>{children}</ProgressProvider>
        </PreferenceBridge>
      </SettingsProvider>
    </StorageProvider>
  );
}

/** Feeds persisted preferences into the (controlled) i18n and theme providers. */
function PreferenceBridge({ children }) {
  const { settings, updateSettings } = useSettings();

  return (
    <I18nProvider
      locale={settings.locale}
      onLocaleChange={(locale) => updateSettings({ locale })}
    >
      <ThemeProvider
        themeId={settings.themeId}
        onThemeChange={(themeId) => updateSettings({ themeId })}
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
