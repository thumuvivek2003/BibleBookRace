import { Button, Card, StatTile } from '@/components/ui/index.js';
import { BookRow, StarRating } from '@/components/game/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { getSectionOfBook } from '@/domain/books/bookRepository.js';
import { formatPercent, formatSeconds, formatStopwatch } from '@/utils/format.js';
import { cn } from '@/utils/cn.js';

/**
 * End-of-round summary. Shows what to practise next rather than a bare score -
 * the point of the app is the next round, not the last one.
 *
 * `splits` turns it into a race result: total time on the clock and a
 * per-book breakdown, which is the only way a speed run tells you anything.
 */
export function RoundResult({
  summary,
  title,
  missedBookIds = [],
  splits,
  onPlayAgain,
  onExit,
  exitLabel,
  stars,
}) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();

  const mood =
    summary.accuracy === 1 ? t('result.perfect') : summary.accuracy >= 0.7 ? t('result.great') : t('result.keepGoing');

  const uniqueMissed = [...new Set(missedBookIds)];

  return (
    <div className="animate-slide-up space-y-4">
      <Card className="space-y-4 p-6 text-center sm:p-8">
        <p className="text-6xl sm:text-7xl" aria-hidden="true">
          {summary.accuracy >= 0.7 ? '🏆' : '💪'}
        </p>
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{mood}</p>
        </div>

        {typeof stars === 'number' && <StarRating value={stars} label={t('quest.stars', { count: stars })} />}

        <p className="font-display text-lg font-bold">
          {t('result.correctCount', { correct: summary.correct, total: summary.total })}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {splits ? (
            <StatTile
              icon="⏱"
              tone="primary"
              value={formatStopwatch(summary.totalTimeMs)}
              label={t('result.totalTime')}
            />
          ) : (
            <StatTile
              icon="🎯"
              tone="success"
              value={formatPercent(summary.accuracy, locale)}
              label={t('result.accuracy')}
            />
          )}
          <StatTile
            icon="⚡"
            tone="info"
            value={formatSeconds(summary.averageTimeMs, locale)}
            label={t('result.avgTime')}
          />
          <StatTile icon="🔥" tone="warning" value={summary.bestStreak} label={t('result.bestStreak')} />
        </div>
      </Card>

      {splits?.length > 0 && <Splits splits={splits} />}

      {uniqueMissed.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-ink-muted">
            {t('result.practiseNext')}
          </h3>
          <ul>
            {uniqueMissed.map((bookId, index) => (
              <li key={bookId}>
                <BookRow
                  index={index + 1}
                  tone="bg-danger-soft text-danger-strong"
                  name={gameText.bookName(bookId)}
                  caption={gameText.sectionName(getSectionOfBook(bookId)?.id)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-2">
        <Button tone="success" fullWidth onClick={onPlayAgain}>
          {t('result.playAgain')}
        </Button>
        <Button variant="soft" tone="neutral" fullWidth onClick={onExit}>
          {exitLabel}
        </Button>
      </div>
    </div>
  );
}

/** Per-book times, fastest highlighted - a race result, not a score card. */
function Splits({ splits }) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();

  const times = splits.filter((split) => split.correct).map((split) => split.timeMs);
  const fastest = times.length ? Math.min(...times) : null;

  return (
    <Card className="p-4">
      <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-ink-muted">
        {t('result.splits')}
      </h3>
      <ul>
        {splits.map((split, index) => (
          <li key={`${split.bookId}-${index}`}>
            <BookRow
              index={index + 1}
              tone={split.correct ? 'bg-success-soft text-success-strong' : 'bg-danger-soft text-danger-strong'}
              name={gameText.bookName(split.bookId)}
              right={
                <span
                  className={cn(
                    'shrink-0 text-sm font-extrabold tabular-nums',
                    split.correct && split.timeMs === fastest ? 'text-success-strong' : 'text-ink-muted',
                  )}
                >
                  {split.correct && split.timeMs === fastest && (
                    <span className="mr-1" aria-label={t('result.fastest')}>
                      ⚡
                    </span>
                  )}
                  {formatSeconds(split.timeMs, locale)}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
