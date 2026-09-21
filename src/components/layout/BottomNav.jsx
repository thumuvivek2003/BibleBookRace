import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { NAV_TABS } from '@/app/navigation.js';
import { ROUTES } from '@/app/routes.js';
import { cn } from '@/utils/cn.js';

/**
 * Phone and tablet navigation. Fixed to the bottom so it survives long pages,
 * and replaced by <NavRail> from `lg` upwards.
 */
export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_TABS.map((tab) => (
          <li key={tab.to} className="min-w-0 flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  // Five tabs on a 320px screen: keep the label tight and let
                  // it truncate rather than wrap the row onto two lines.
                  'flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-bold transition sm:text-[11px]',
                  isActive ? 'text-primary' : 'text-ink-subtle hover:text-ink-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn('text-xl transition-transform', isActive && 'scale-110')}
                    aria-hidden="true"
                  >
                    {tab.icon}
                  </span>
                  <span className="w-full truncate text-center">
                    {t(tab.shortLabelKey ?? tab.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
