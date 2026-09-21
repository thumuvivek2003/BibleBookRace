import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * The Bible Map is the content the other screens drill, so Home leads with it
 * rather than listing it as a fourth equal tile.
 *
 * A learner who has never answered a question gets an extra ring around it -
 * the one unmistakable "begin here" on the screen.
 */
export function MapFeatureCard({ isNewLearner }) {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.map}
      className={cn(
        'flex items-center gap-3 rounded-card border border-info/40 bg-info-soft p-4 transition sm:gap-4 sm:p-5',
        'hover:brightness-[0.98] active:scale-[0.99]',
        isNewLearner && 'ring-2 ring-info ring-offset-2 ring-offset-canvas',
      )}
    >
      <span className="text-4xl sm:text-5xl" aria-hidden="true">
        📖
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone="info">✨ {t('home.mapFeatureBadge')}</Badge>
          <Badge tone="success">{t('home.learn')}</Badge>
        </span>

        <span className="mt-1.5 block font-display text-xl font-extrabold leading-tight text-ink sm:text-2xl">
          {t('home.tiles.mapTitle')}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-muted sm:text-sm">
          {t('home.mapFeatureBody')}
        </span>
      </span>

      <span className="text-2xl text-ink-subtle" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
