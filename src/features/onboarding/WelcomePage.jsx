import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/index.js';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * First-run splash: pick a language, say hello, start.
 *
 * One stacked screen on a phone; from `lg` the artwork and the form sit side by
 * side so nothing has to scroll on a laptop.
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
    <div className="min-h-[100dvh] bg-gradient-to-b from-info-soft via-canvas to-canvas px-6 py-8 safe-top safe-bottom lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col lg:max-w-5xl">
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

        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center lg:flex-row lg:gap-16 lg:text-left">
          <div className="flex flex-col items-center lg:flex-1 lg:items-start">
            <h1 className="animate-pop-in font-display text-5xl font-extrabold leading-none tracking-tight text-primary-strong drop-shadow-sm sm:text-6xl lg:text-7xl">
              {t('common.appName')}
            </h1>
            <p className="mt-2 font-display text-base font-bold text-ink-muted sm:text-lg">
              {t('common.tagline')}
            </p>

            <div className="relative my-8 lg:hidden">
              <BookArt />
            </div>

            <p className="max-w-xs text-sm font-semibold leading-relaxed text-ink-muted sm:max-w-sm sm:text-base lg:max-w-md">
              {t('welcome.blurb')}
            </p>
          </div>

          <div className="hidden lg:block lg:shrink-0">
            <BookArt />
          </div>
        </div>

        <div className="space-y-3 lg:mx-auto lg:w-full lg:max-w-sm">
          <label className="block">
            <span className="mb-1 block px-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
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
  );
}

function BookArt() {
  return (
    <div className="relative">
      <span className="block animate-cheer-pulse text-[7rem] leading-none lg:text-[11rem]" aria-hidden="true">
        📖
      </span>
      <span className="absolute -right-2 top-2 text-3xl lg:text-5xl" aria-hidden="true">
        ✨
      </span>
      <span className="absolute -left-4 bottom-4 text-2xl lg:text-4xl" aria-hidden="true">
        ✨
      </span>
    </div>
  );
}
