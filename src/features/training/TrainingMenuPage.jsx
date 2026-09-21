import { Link } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { Badge } from '@/components/ui/index.js';
import { getLevels } from '@/domain/levels/levelCatalog.js';
import { getLevelStat } from '@/domain/progress/progressSelectors.js';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { formatPercent } from '@/utils/format.js';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * The three training levels.
 * A stacked list on phones; three cards side by side once there is room.
 */
export function TrainingMenuPage() {
  const { t, locale } = useTranslation();
  const { progress } = useProgress();

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('training.title')} subtitle={t('training.subtitle')} backTo={ROUTES.home} />

      <ScreenBody className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {getLevels().map((level) => {
            const stat = getLevelStat(progress, level.id);
            const styles = toneStyles(level.tone);

            return (
              <Link
                key={level.id}
                to={ROUTES.trainingLevel(level.id)}
                className={cn(
                  'flex items-center gap-3 rounded-card border p-4 transition sm:p-5',
                  'md:flex-col md:items-start md:gap-2',
                  'hover:brightness-[0.98] active:scale-[0.99]',
                  styles.soft,
                  styles.border,
                )}
              >
                <span className="text-3xl md:text-5xl" aria-hidden="true">
                  {level.emoji}
                </span>

                <span className="min-w-0 flex-1 md:w-full md:flex-none">
                  <span className={cn('block text-xs font-extrabold uppercase tracking-wide', styles.text)}>
                    {t('training.levelLabel', { number: level.number })}
                  </span>
                  <span className="block font-display text-lg font-extrabold leading-tight text-ink">
                    {t(`levels.${level.id}.title`)}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-muted sm:text-sm">
                    {t(`levels.${level.id}.description`)}
                  </span>

                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {stat.rounds > 0 ? (
                      <>
                        <Badge tone="neutral">{t('training.roundsPlayed', { count: stat.rounds })}</Badge>
                        <Badge tone="success">
                          {t('training.bestAccuracy', { value: formatPercent(stat.bestAccuracy, locale) })}
                        </Badge>
                      </>
                    ) : (
                      <Badge tone="neutral">{t('training.notPlayedYet')}</Badge>
                    )}
                    {level.needsPhysicalBible && <Badge tone="warning">📖 {t('training.needsBible')}</Badge>}
                  </span>
                </span>

                <span className="text-2xl text-ink-subtle md:hidden" aria-hidden="true">
                  ›
                </span>
              </Link>
            );
          })}
        </div>

        <p className="flex items-center gap-2 rounded-card bg-surface p-4 text-xs font-semibold text-ink-muted shadow-card sm:text-sm">
          <span className="text-lg" aria-hidden="true">
            👑
          </span>
          {t('training.unlockNote')}
        </p>
      </ScreenBody>
    </AppShell>
  );
}
