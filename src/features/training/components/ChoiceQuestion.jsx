import { Fragment, useState } from 'react';
import { AnswerOption } from '@/components/game/index.js';
import { Button, Card } from '@/components/ui/index.js';
import { OPTION_KIND } from '@/domain/questions/questionTypes.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { cn } from '@/utils/cn.js';

/**
 * Multiple choice, used by every "which / what comes" question.
 * Selecting is separate from confirming so a mis-tap never costs a point.
 */
export function ChoiceQuestion({ question, onAnswer }) {
  const { t } = useTranslation();
  const gameText = useGameText();
  const [selectedId, setSelectedId] = useState(null);

  const isRun = question.options[0]?.kind === OPTION_KIND.RUN;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-center font-display text-xl font-extrabold leading-snug sm:text-2xl">
          {gameText.phrase(question.prompt)}
        </h2>

        <div
          className={cn(
            'mt-5 grid gap-2.5',
            // Short answers pair up on wider screens; book runs stay full width
            // so a sequence never wraps mid-chain.
            !isRun && question.options.length > 2 && 'sm:grid-cols-2',
          )}
        >
          {question.options.map((option) => (
            <AnswerOption
              key={option.id}
              state={selectedId === option.id ? 'selected' : 'idle'}
              onClick={() => setSelectedId(option.id)}
              aria-label={isRun ? gameText.optionLabel(option) : undefined}
              className={isRun ? 'py-3' : undefined}
            >
              {isRun ? (
                <RunLabel ids={option.value} bookName={gameText.bookName} />
              ) : (
                gameText.optionLabel(option)
              )}
            </AnswerOption>
          ))}
        </div>
      </Card>

      <Button
        tone="success"
        fullWidth
        disabled={!selectedId}
        onClick={() => onAnswer({ optionId: selectedId })}
      >
        {t('common.next')}
      </Button>
    </div>
  );
}

/**
 * A run of neighbouring books, as chips rather than one long arrowed line -
 * five book names joined by arrows wrapped into an unreadable paragraph on a
 * phone.
 *
 * `null` is the book being asked about, blanked out so the answer cannot be
 * found by scanning for its name.
 */
function RunLabel({ ids, bookName }) {
  return (
    <span className="flex flex-wrap items-center justify-center gap-1" aria-hidden="true">
      {ids.map((id, index) => (
        <Fragment key={id ?? `gap-${index}`}>
          {index > 0 && <span className="opacity-40">→</span>}
          {id ? (
            <span className="rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ring-current/25">
              {bookName(id)}
            </span>
          ) : (
            <span className="rounded-md border border-dashed border-current/60 px-2.5 py-0.5 text-xs font-extrabold">
              ?
            </span>
          )}
        </Fragment>
      ))}
    </span>
  );
}
