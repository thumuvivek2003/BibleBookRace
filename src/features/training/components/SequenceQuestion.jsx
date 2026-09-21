import { useMemo, useState } from 'react';
import { SequenceBuilder } from '@/components/game/index.js';
import { Button, Card } from '@/components/ui/index.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';

/** "Put these books in order" - the hardest stage of Level 2. */
export function SequenceQuestion({ question, onAnswer }) {
  const { t } = useTranslation();
  const gameText = useGameText();
  const [picked, setPicked] = useState([]);

  const pool = useMemo(
    () => question.sequence.shuffled.map((id) => ({ id, label: gameText.bookName(id) })),
    [question, gameText],
  );

  const complete = picked.length === question.sequence.correct.length;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-center font-display text-xl font-extrabold leading-snug sm:text-2xl">
          {gameText.phrase(question.prompt)}
        </h2>

        <div className="mt-4">
          <SequenceBuilder
            pool={pool}
            picked={picked}
            onPick={(id) => setPicked((current) => [...current, id])}
            onClear={() => setPicked([])}
            labels={{
              hint: t('sequence.hint'),
              yourOrder: t('sequence.yourOrder'),
              clear: t('sequence.clear'),
            }}
          />
        </div>
      </Card>

      <Button tone="success" fullWidth disabled={!complete} onClick={() => onAnswer({ sequence: picked })}>
        {t('sequence.check')}
      </Button>
    </div>
  );
}
