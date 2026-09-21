import { useMemo, useState } from 'react';
import { Card, SegmentedControl } from '@/components/ui/index.js';
import { BookRow, MasteryBadge } from '@/components/game/index.js';
import { getAllBooks, getAllSections } from '@/domain/books/bookRepository.js';
import { evaluateMastery, getMasteryLevel, averageTimeOf } from '@/domain/mastery/masteryModel.js';
import { getBookStat } from '@/domain/progress/progressSelectors.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { formatSeconds } from '@/utils/format.js';

/** Every book with its current mastery - the detailed half of Progress. */
export function BookMasteryList({ progress }) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const [sort, setSort] = useState('order');

  const rows = useMemo(() => {
    const built = getAllBooks().map((book) => {
      const stat = getBookStat(progress, book.id);
      const masteryId = evaluateMastery(stat);
      return { book, stat, masteryId, rank: getMasteryLevel(masteryId).rank };
    });

    return sort === 'mastery'
      ? built.sort((a, b) => a.rank - b.rank || a.book.order - b.book.order)
      : built;
  }, [progress, sort]);

  const sectionName = useMemo(
    () => Object.fromEntries(getAllSections().map((section) => [section.id, gameText.sectionName(section.id)])),
    [gameText],
  );

  return (
    <div className="space-y-3">
      <SegmentedControl
        value={sort}
        onChange={setSort}
        options={[
          { id: 'order', label: t('progress.sortByOrder') },
          { id: 'mastery', label: t('progress.sortByMastery') },
        ]}
      />

      <Card padded={false} className="divide-y divide-line p-1">
        {rows.map(({ book, stat, masteryId }) => (
          <BookRow
            key={book.id}
            index={book.order}
            tone="bg-surface-sunken text-ink-muted"
            name={gameText.bookName(book.id)}
            caption={
              stat.attempts
                ? `${sectionName[book.sectionId]} · ${t('progress.attempts', { count: stat.attempts })}`
                : sectionName[book.sectionId]
            }
            right={
              <span className="flex shrink-0 items-center gap-2">
                {stat.correct > 0 && (
                  <span className="text-xs font-bold tabular-nums text-ink-muted">
                    {formatSeconds(averageTimeOf(stat), locale)}
                  </span>
                )}
                <MasteryBadge compact masteryId={masteryId} label={t(`mastery.${masteryId}`)} />
              </span>
            }
          />
        ))}
      </Card>
    </div>
  );
}
