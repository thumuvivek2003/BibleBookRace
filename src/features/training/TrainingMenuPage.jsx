import { Link } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { Badge } from '@/components/ui/index.js';
import { getGamesByGroup } from '@/domain/games/gameCatalog.js';
import { getGameStat } from '@/domain/progress/progressSelectors.js';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { formatPercent } from '@/utils/format.js';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * The games, grouped by the skill they build.
 *
 * Each game asks one kind of question, so a learner can pick the thing they
 * are bad at and repeat only that. Grouping keeps the learning order visible
 * without numbering six cards 1 to 6 and hoping people infer why.
 */
export function TrainingMenuPage() {
  const { t } = useTranslation();
  const { progress } = useProgress();

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('training.title')} subtitle={t('training.subtitle')} backTo={ROUTES.home} />

      <ScreenBody className="space-y-6">
        {getGamesByGroup().map((group) => (
          <section key={group.id} className="space-y-3">
            <header className="flex items-baseline gap-2 px-1">
              <span className="text-lg" aria-hidden="true">
                {group.emoji}
              </span>
              <h2 className="font-display text-base font-extrabold lg:text-lg">
                {t(`groups.${group.id}.title`)}
              </h2>
              <p className="truncate text-xs text-ink-muted">{t(`groups.${group.id}.subtitle`)}</p>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.games.map((game) => (
                <GameCard key={game.id} game={game} stat={getGameStat(progress, game.id)} />
              ))}
            </div>
          </section>
        ))}

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

function GameCard({ game, stat }) {
  const { t, locale } = useTranslation();
  const styles = toneStyles(game.tone);

  return (
    <Link
      to={ROUTES.trainingGame(game.id)}
      className={cn(
        'flex items-center gap-3 rounded-card border p-4 transition',
        'hover:brightness-[0.98] active:scale-[0.99]',
        styles.soft,
        styles.border,
      )}
    >
      <span className="text-3xl" aria-hidden="true">
        {game.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span className={cn('block text-[11px] font-extrabold uppercase tracking-wide', styles.text)}>
          {t('training.gameLabel', { number: game.number })}
        </span>
        <span className="block font-display text-lg font-extrabold leading-tight text-ink">
          {t(`games.${game.id}.title`)}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
          {t(`games.${game.id}.description`)}
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
          {game.needsPhysicalBible && <Badge tone="warning">📖 {t('training.needsBible')}</Badge>}
        </span>
      </span>

      <span className="text-2xl text-ink-subtle" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
