import { useState } from 'react';
import { BookPrompt, TimerDisplay } from '@/components/game/index.js';
import { Button, Card, Modal } from '@/components/ui/index.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { getBookById, getSectionOfBook } from '@/domain/books/bookRepository.js';
import { formatSeconds } from '@/utils/format.js';

/**
 * Hand Geography and quests: the app names a book, the learner searches a real Bible.
 *
 * The clock only runs between "Start" and "Found it", and the learner confirms
 * whether the book was actually the right one - honesty is part of the drill.
 */
export function PhysicalFindQuestion({ question, stopwatch, onAnswer, onSkip }) {
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const [confirming, setConfirming] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [finalTimeMs, setFinalTimeMs] = useState(0);

  const book = getBookById(question.bookId);
  const section = getSectionOfBook(question.bookId);

  const handleFound = () => {
    setFinalTimeMs(stopwatch.read());
    stopwatch.stop();
    setConfirming(true);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-center font-display text-lg font-extrabold leading-snug sm:text-xl">
          {t('question.findInBible')}
        </h2>

        <BookPrompt name={gameText.bookName(question.bookId)} />

        {stopwatch.running || stopwatch.elapsedMs > 0 ? (
          <TimerDisplay elapsedMs={stopwatch.elapsedMs} running={stopwatch.running} />
        ) : (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-ink-muted">
            <span aria-hidden="true">🕐</span>
            {t('hand.tapStart')}
          </p>
        )}
      </Card>

      {!stopwatch.running && stopwatch.elapsedMs === 0 ? (
        <Button tone="primary" fullWidth onClick={() => stopwatch.reset(true)}>
          {t('hand.startTimer')}
        </Button>
      ) : (
        <Button tone="danger" fullWidth onClick={handleFound}>
          {t('hand.foundIt')}
        </Button>
      )}

      <div className="flex justify-center gap-4 text-sm font-semibold text-ink-muted">
        <button type="button" className="underline-offset-2 hover:underline" onClick={() => setHintOpen(true)}>
          {t('hand.hint')}
        </button>
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() => {
            stopwatch.stop();
            (onSkip ?? onAnswer)({ found: false });
          }}
        >
          {t('hand.giveUp')}
        </button>
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

      <Modal open={confirming} onClose={() => setConfirming(false)} title={t('hand.confirmTitle')}>
        <p className="mb-4 text-sm text-ink-muted">
          {t('hand.tookYou', { time: formatSeconds(finalTimeMs, locale) })}
        </p>
        <div className="space-y-2">
          <Button tone="success" fullWidth onClick={() => onAnswer({ found: true, timeMs: finalTimeMs })}>
            {t('hand.confirmYes')}
          </Button>
          <Button tone="neutral" variant="soft" fullWidth onClick={() => onAnswer({ found: false, timeMs: finalTimeMs })}>
            {t('hand.confirmNo')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
