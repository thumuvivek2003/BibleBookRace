import { useState } from 'react';
import { BookPrompt, TimerDisplay } from '@/components/game/index.js';
import { Button, Card, Modal } from '@/components/ui/index.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { getBookById, getSectionOfBook } from '@/domain/books/bookRepository.js';
import { formatSeconds } from '@/utils/format.js';

/**
 * Hand Geography and quests: the app names a book, the learner searches a real
 * Bible.
 *
 * The clock starts once, at the first book, and then runs. Tapping "Found it"
 * takes a lap and shows the next book immediately - no confirmation, no
 * restart. Anything else would measure the app's dialogs rather than how fast
 * someone can actually turn to Habakkuk.
 *
 * "Not this one" is there for an honest miss; it costs the book, not the run.
 */
export function PhysicalFindQuestion({
  question,
  stopwatch,
  onAnswer,
  onStart,
  started = false,
  position,
  lastSplitMs,
}) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const [hintOpen, setHintOpen] = useState(false);

  const book = getBookById(question.bookId);
  const section = getSectionOfBook(question.bookId);

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-extrabold leading-snug sm:text-lg">
            {t('question.findInBible')}
          </h2>
          {position && <span className="shrink-0 text-xs font-bold text-ink-muted">{position}</span>}
        </div>

        <BookPrompt name={gameText.bookName(question.bookId)} />

        {started ? (
          <>
            <TimerDisplay elapsedMs={stopwatch.elapsedMs} running={stopwatch.running} />
            {lastSplitMs != null && (
              <p className="text-center text-xs font-semibold text-success-strong">
                ⏱ {t('hand.lastSplit', { time: formatSeconds(lastSplitMs, locale) })}
              </p>
            )}
          </>
        ) : (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-ink-muted">
            <span aria-hidden="true">🕐</span>
            {t('hand.tapStart')}
          </p>
        )}
      </Card>

      {started ? (
        <Button tone="success" size="lg" fullWidth onClick={() => onAnswer({ found: true })}>
          {t('hand.foundIt')}
        </Button>
      ) : (
        <Button tone="primary" size="lg" fullWidth onClick={onStart}>
          {t('hand.startTimer')}
        </Button>
      )}

      <div className="flex justify-center gap-4 text-sm font-semibold text-ink-muted">
        <button type="button" className="underline-offset-2 hover:underline" onClick={() => setHintOpen(true)}>
          {t('hand.hint')}
        </button>
        {started && (
          <button
            type="button"
            className="underline-offset-2 hover:underline"
            onClick={() => onAnswer({ found: false })}
          >
            {t('hand.missed')}
          </button>
        )}
      </div>

      <Modal open={hintOpen} onClose={() => setHintOpen(false)} title={t('hand.hint')}>
        <p className="text-base leading-relaxed">
          {t('hand.hintBody', {
            book: gameText.bookName(question.bookId),
            section: gameText.sectionName(section?.id),
            testament: gameText.testamentName(book?.testament),
          })}
        </p>
        <Button className="mt-4" fullWidth variant="soft" onClick={() => setHintOpen(false)}>
          {t('common.close')}
        </Button>
      </Modal>
    </div>
  );
}
