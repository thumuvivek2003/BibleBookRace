import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/index.js';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { IMGS } from '@/assets/imgs.js';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * The front door: key art, a language choice, a name, and one button.
 *
 * The artwork already carries the wordmark and the "Explore · Learn · Grow"
 * line, so the heading is there for screen readers and search engines rather
 * than repeated on screen. One stacked column on a phone; art beside the form
 * from `lg`, so nothing scrolls on a laptop.
 */
export function WelcomePage() {
  const navigate = useNavigate();
  const { t, locale, setLocale, locales } = useTranslation();
  const { settings, updateSettings } = useSettings();

  const start = () => {
    updateSettings({ hasOnboarded: true });
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-info-soft via-canvas to-canvas px-6 py-6 safe-top safe-bottom lg:px-10 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col lg:max-w-5xl">
        <h1 className="sr-only">{t('common.appName')}</h1>

        <div className="flex justify-center gap-2 lg:justify-end">
          {locales.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              aria-pressed={item.code === locale}
              className={cn(
                'rounded-pill px-3 py-1.5 text-sm font-bold transition',
                item.code === locale
                  ? 'bg-primary text-on-primary shadow-pop'
                  : 'bg-surface text-ink-muted hover:brightness-95',
              )}
            >
              <span aria-hidden="true">{item.flag}</span> {item.nativeLabel}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 lg:flex-row lg:gap-14 lg:py-0">
          <img
            src={IMGS.main_screen}
            alt={t('a11y.keyArt')}
            width={900}
            height={900}
            // The front door is the one image worth loading eagerly.
            fetchPriority="high"
            decoding="async"
            className="w-full max-w-[17rem] animate-pop-in drop-shadow-xl sm:max-w-xs lg:max-w-md"
          />

          <div className="flex w-full flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
            <p className="font-display text-lg font-extrabold text-ink sm:text-xl lg:text-2xl">
              {t('common.tagline')}
            </p>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted sm:text-base">
              {t('welcome.blurb')}
            </p>

            <div className="mt-6 w-full max-w-sm space-y-3">
              <label className="block">
                <span className="mb-1 block px-1 text-left text-xs font-bold uppercase tracking-wide text-ink-muted">
                  {t('welcome.namePrompt')}
                </span>
                <input
                  type="text"
                  value={settings.learnerName}
                  maxLength={24}
                  onChange={(event) => updateSettings({ learnerName: event.target.value })}
                  placeholder={t('welcome.namePlaceholder')}
                  className="w-full rounded-2xl bg-surface px-4 py-3 text-base shadow-card outline-none placeholder:text-ink-subtle"
                />
              </label>

              <Button tone="warning" size="lg" fullWidth onClick={start}>
                {t('welcome.cta')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
