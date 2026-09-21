import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { NAV_TABS } from '@/app/navigation.js';
import { ROUTES } from '@/app/routes.js';
import { cn } from '@/utils/cn.js';

/**
 * Desktop navigation (`lg` and up).
 *
 * Same destinations as the bottom bar, plus the extras a wider screen has room
 * for: the app name, the streak, and a way into Settings.
 */
export function NavRail() {
  const { t } = useTranslation();
  const { progress } = useProgress();

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col gap-6 border-r border-line bg-surface/70 px-4 py-6 backdrop-blur lg:flex xl:w-64">
      <Link to={ROUTES.home} className="flex items-center gap-2.5 px-2">
        <span className="text-3xl" aria-hidden="true">
          📖
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-extrabold leading-tight">
            {t('common.appName')}
          </span>
          <span className="block truncate text-[11px] text-ink-muted">{t('common.tagline')}</span>
        </span>
      </Link>

      <nav className="flex-1">
        <ul className="space-y-1">
          {NAV_TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.to === ROUTES.home}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-display text-sm font-bold transition',
                    isActive
                      ? 'bg-primary-soft text-primary-strong'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                  )
                }
              >
                <span className="text-xl" aria-hidden="true">
                  {tab.icon}
                </span>
                <span className="truncate">{t(tab.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-2">
        <p className="flex items-center gap-2 rounded-2xl bg-danger-soft px-3 py-2.5 text-sm font-bold text-danger-strong">
          <span aria-hidden="true">🔥</span>
          {t('home.streak', { days: progress.streak.current })}
        </p>

        <NavLink
          to={ROUTES.settings}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-display text-sm font-bold transition',
              isActive
                ? 'bg-primary-soft text-primary-strong'
                : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
            )
          }
        >
          <span className="text-xl" aria-hidden="true">
            ⚙️
          </span>
          {t('nav.settings')}
        </NavLink>
      </div>
    </aside>
  );
}
