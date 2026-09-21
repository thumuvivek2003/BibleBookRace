import { Link } from 'react-router-dom';
import { Badge, Card } from '@/components/ui/index.js';
import { BookRow } from '@/components/game/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { formatSeconds } from '@/utils/format.js';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';

/**
 * One quest, with its book list previewed.
 * Locked quests stay visible - seeing the next goal is part of the motivation.
 */
export function QuestCard({ quest, books, availability, stat }) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const styles = toneStyles(quest.tone);
  const locked = !availability.unlocked;

  const lockLabel =
    availability.requirement?.kind === 'questsCompleted'
      ? t('quest.lockedQuests', { count: availability.requirement.need })
      : t('quest.locked', { count: availability.requirement?.need ?? 0 });

  const content = (
    <Card className={cn('space-y-3 p-4', locked && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl', styles.soft)} aria-hidden="true">
          {locked ? '🔒' : quest.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-extrabold leading-tight">
            {t(`quests.${quest.id}.title`)}
          </h3>
          <p className="text-xs leading-snug text-ink-muted">{t(`quests.${quest.id}.description`)}</p>
        </div>
      </div>

      {locked ? (
        <p className="rounded-xl bg-surface-sunken px-3 py-2 text-center text-xs font-bold text-ink-muted">
          {lockLabel}
        </p>
      ) : (
        <ul className="rounded-xl bg-surface-sunken p-1">
          {books.map((book, index) => (
            <li key={book.id}>
              <BookRow
                index={index + 1}
                tone={cn(styles.soft)}
                name={gameText.bookName(book.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {stat.completions > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="success">{t('quest.completions', { count: stat.completions })}</Badge>
          {stat.bestTimeMs != null && Number.isFinite(stat.bestTimeMs) && (
            <Badge tone="info">{t('quest.best', { value: formatSeconds(stat.bestTimeMs, locale) })}</Badge>
          )}
        </div>
      )}
    </Card>
  );

  if (locked) return <div aria-disabled="true">{content}</div>;

  return (
    <Link to={ROUTES.questRun(quest.id)} className="block transition active:scale-[0.99]">
      {content}
    </Link>
  );
}
