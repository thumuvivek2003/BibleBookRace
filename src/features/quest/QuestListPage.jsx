import { useMemo } from 'react';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { getQuestAvailability, getQuests, previewQuestBooks } from '@/domain/quest/questModel.js';
import { getQuestStat } from '@/domain/progress/progressSelectors.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { createSeededRng } from '@/utils/random.js';
import { ROUTES } from '@/app/routes.js';
import { QuestCard } from './components/QuestCard.jsx';

/**
 * Quest list - one column on phones, two or three on wider screens.
 *
 * Generated quests are previewed with a seeded generator so the cards do not
 * reshuffle on every render; the real run is freshly rolled.
 */
export function QuestListPage() {
  const { t } = useTranslation();
  const { progress } = useProgress();

  const cards = useMemo(() => {
    const rng = createSeededRng(progress.totals.questsCompleted + 1);
    return getQuests().map((quest) => ({
      quest,
      books: previewQuestBooks(quest, { progress, rng }),
      availability: getQuestAvailability(quest, progress),
      stat: getQuestStat(progress, quest.id),
    }));
  }, [progress]);

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('quest.title')} subtitle={t('quest.subtitle')} backTo={ROUTES.home} />

      <ScreenBody className="grid items-start gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <QuestCard key={card.quest.id} {...card} />
        ))}
      </ScreenBody>
    </AppShell>
  );
}
