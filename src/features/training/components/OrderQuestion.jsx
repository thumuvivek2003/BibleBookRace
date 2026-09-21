import { useMemo, useState } from 'react';
import { OrderingBoard } from '@/components/game/index.js';
import { Button, Card } from '@/components/ui/index.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';

/**
 * "Put In Order" - drag the shuffled books into numbered boxes.
 *
 * The board handles the interaction; this component owns the answer: which
 * card sits in which box, and when the round may be submitted.
 */
export function OrderQuestion({ question, onAnswer }) {
  const { t } = useTranslation();
  const gameText = useGameText();

  const cards = useMemo(
    () => question.sequence.shuffled.map((id) => ({ id, label: gameText.bookName(id) })),
    [question, gameText],
  );

  const [placements, setPlacements] = useState(() => cards.map(() => null));

  /** Placing a card removes it from wherever it was - a card exists once. */
  const place = (slot, cardId) =>
    setPlacements((current) =>
      current.map((existing, index) => {
        if (index === slot) return cardId;
        return existing === cardId ? null : existing;
      }),
    );

  const remaining = placements.filter((slot) => !slot).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <h2 className="text-center font-display text-xl font-extrabold leading-snug sm:text-2xl">
          {gameText.phrase(question.prompt)}
        </h2>

        <div className="mt-4">
          <OrderingBoard
            cards={cards}
            placements={placements}
            onPlace={place}
            labels={{
              hint: t('order.hint'),
              tapHint: t('order.tapHint'),
              slot: t('order.slot'),
              empty: t('order.empty'),
              pool: t('order.pool'),
              dragInstructions: t('order.dragInstructions'),
            }}
          />
        </div>
      </Card>

      <div className="space-y-2">
        <Button
          tone="success"
          fullWidth
          disabled={remaining > 0}
          onClick={() => onAnswer({ sequence: placements })}
        >
          {remaining > 0 ? t('order.remaining', { count: remaining }) : t('order.check')}
        </Button>

        {remaining < placements.length && (
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => setPlacements(cards.map(() => null))}
          >
            {t('order.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
