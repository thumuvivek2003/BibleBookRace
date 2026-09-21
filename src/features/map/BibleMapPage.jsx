import { useMemo, useState } from 'react';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { Card, EmptyState, Modal } from '@/components/ui/index.js';
import { BookRow, MasteryBadge } from '@/components/game/index.js';
import {
  getAllSections,
  getAllTestaments,
  getBookById,
  getNextBook,
  getPreviousBook,
  searchBooks,
} from '@/domain/books/bookRepository.js';
import { getBookMastery } from '@/domain/progress/progressSelectors.js';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { groupBy } from '@/utils/array.js';
import { ROUTES } from '@/app/routes.js';

/**
 * Reference screen: all 66 books by neighbourhood, plus a book detail sheet
 * showing its neighbours - the "book -> neighbour -> neighbourhood" model the
 * training games drill.
 */
export function BibleMapPage() {
  const { t } = useTranslation();
  const gameText = useGameText();
  const { progress } = useProgress();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const bySection = useMemo(() => groupBy(searchBooks(query), (book) => book.sectionId), [query]);
  const empty = Object.keys(bySection).length === 0;

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('map.title')} subtitle={t('map.subtitle')} backTo={ROUTES.home} />

      <label className="mb-4 block sm:max-w-md">
        <span className="sr-only">{t('map.search')}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('map.search')}
          className="w-full rounded-pill bg-surface px-4 py-3 text-base shadow-card outline-none placeholder:text-ink-subtle"
        />
      </label>

      <ScreenBody className="space-y-5">
        {empty && <EmptyState emoji="🔍" body={t('map.noResults')} />}

        {getAllTestaments().map((testament) => {
          const sections = getAllSections().filter(
            (section) => section.testament === testament.id && bySection[section.id]?.length,
          );
          if (!sections.length) return null;

          return (
            <section key={testament.id} className="space-y-3">
              <h2 className="flex items-center gap-2 px-1 font-display text-lg font-extrabold lg:text-xl">
                <span aria-hidden="true">{testament.emoji}</span>
                {gameText.testamentName(testament.id)}
              </h2>

              <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sections.map((section) => (
                  <Card key={section.id} padded={false} className="p-2">
                    <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-muted">
                      <span aria-hidden="true">{section.emoji}</span>
                      {gameText.sectionName(section.id)}
                      <span className="ml-auto font-bold normal-case tracking-normal">
                        {t('map.bookCount', { count: bySection[section.id].length })}
                      </span>
                    </h3>

                    <ul>
                      {bySection[section.id].map((book) => {
                        const masteryId = getBookMastery(progress, book.id);
                        return (
                          <li key={book.id}>
                            <BookRow
                              index={book.order}
                              tone="bg-surface-sunken text-ink-muted"
                              name={gameText.bookName(book.id)}
                              onClick={() => setSelectedId(book.id)}
                              right={
                                <MasteryBadge compact masteryId={masteryId} label={t(`mastery.${masteryId}`)} />
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </ScreenBody>

      <BookDetail bookId={selectedId} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}

/** Bottom sheet: where this book lives and who its neighbours are. */
function BookDetail({ bookId, onClose }) {
  const { t } = useTranslation();
  const gameText = useGameText();
  if (!bookId) return null;

  const book = getBookById(bookId);
  const previous = getPreviousBook(bookId);
  const next = getNextBook(bookId);

  return (
    <Modal open onClose={onClose} title={gameText.bookName(bookId)}>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-ink-subtle">
          {t('map.position', { order: book?.order })}
        </p>

        <p className="text-sm text-ink-muted">
          {gameText.phrase({
            key: 'feedback.bookLivesIn',
            params: {
              book: bookId,
              section: book?.sectionId,
              testament: book?.testament,
            },
          })}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <NeighbourBox label={t('map.before')} value={previous ? gameText.bookName(previous.id) : t('map.firstBook')} />
          <NeighbourBox label={t('map.after')} value={next ? gameText.bookName(next.id) : t('map.lastBook')} />
        </div>
      </div>
    </Modal>
  );
}

function NeighbourBox({ label, value }) {
  return (
    <div className="rounded-card bg-surface-sunken p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="break-words font-display text-sm font-extrabold">{value}</p>
    </div>
  );
}
