import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { Card, Toggle } from '@/components/ui/index.js';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useTheme } from '@/theme/ThemeProvider.jsx';
import { ROUTES } from '@/app/routes.js';
import { OptionGrid } from './components/OptionGrid.jsx';

const GOAL_CHOICES = [5, 10, 15, 20];

/** Language, theme, goal, and the books training draws from. */
export function SettingsPage() {
  const { t, locale, setLocale, locales } = useTranslation();
  const { themeId, setTheme, themes } = useTheme();
  const { settings, updateSettings } = useSettings();

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('settings.title')} backTo={ROUTES.home} />

      <ScreenBody className="grid items-start gap-4 sm:gap-5 md:grid-cols-2">
        <Section title={t('settings.language')}>
          <OptionGrid
            name={t('a11y.languageSwitcher')}
            value={locale}
            onChange={setLocale}
            options={locales.map((item) => ({
              id: item.code,
              label: item.nativeLabel,
              hint: item.label,
              preview: (
                <span className="mb-1 block text-xl" aria-hidden="true">
                  {item.flag}
                </span>
              ),
            }))}
          />
        </Section>

        <Section title={t('settings.theme')}>
          <OptionGrid
            columns={3}
            name={t('a11y.themeSwitcher')}
            value={themeId}
            onChange={setTheme}
            options={themes.map((theme) => ({
              id: theme.id,
              label: t(theme.labelKey),
              preview: (
                <span className="mb-1.5 flex gap-1" aria-hidden="true">
                  {theme.swatch.map((colour) => (
                    <span
                      key={colour}
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: colour }}
                    />
                  ))}
                </span>
              ),
            }))}
          />
        </Section>

        <Section title={t('settings.dailyGoal')}>
          <OptionGrid
            columns={4}
            name={t('settings.dailyGoal')}
            value={settings.dailyGoalMinutes}
            onChange={(minutes) => updateSettings({ dailyGoalMinutes: minutes })}
            options={GOAL_CHOICES.map((minutes) => ({
              id: minutes,
              label: t('settings.minutes', { count: minutes }),
            }))}
          />
        </Section>

        <Section title={t('settings.bookPool')}>
          <OptionGrid
            name={t('settings.bookPool')}
            value={settings.bookPool}
            onChange={(bookPool) => updateSettings({ bookPool })}
            options={[
              { id: 'tier1', label: t('settings.poolTier1'), hint: t('settings.poolTier1Hint') },
              { id: 'all', label: t('settings.poolAll'), hint: t('settings.poolAllHint') },
            ]}
          />
        </Section>

        <Section title={t('settings.learnerName')}>
          <input
            type="text"
            value={settings.learnerName}
            maxLength={24}
            onChange={(event) => updateSettings({ learnerName: event.target.value })}
            placeholder={t('settings.namePlaceholder')}
            className="w-full rounded-2xl bg-surface-sunken px-4 py-3 text-base outline-none placeholder:text-ink-subtle"
          />
        </Section>

        <Card className="flex items-center gap-3 p-4">
          <span className="text-2xl" aria-hidden="true">
            🔊
          </span>
          <span className="flex-1 font-display font-bold">{t('settings.sound')}</span>
          <Toggle
            checked={settings.soundEnabled}
            label={t('settings.sound')}
            onChange={(soundEnabled) => updateSettings({ soundEnabled })}
          />
        </Card>

        <Card className="space-y-1 p-4">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink-muted">
            {t('settings.about')}
          </h2>
          <p className="text-sm leading-relaxed text-ink-muted">{t('settings.aboutBody')}</p>
          <p className="pt-2 text-xs text-ink-subtle">🔒 {t('settings.dataNote')}</p>
        </Card>
      </ScreenBody>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 font-display text-sm font-extrabold uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
