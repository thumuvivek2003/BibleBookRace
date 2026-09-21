import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { StepDots } from '@/components/ui/index.js';
import { PhysicalFindQuestion } from '@/features/training/components/PhysicalFindQuestion.jsx';
import { RoundResult } from '@/features/training/components/RoundResult.jsx';
import { usePracticeClock } from '@/hooks/usePracticeClock.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { formatStopwatch } from '@/utils/format.js';
import { ROUTES } from '@/app/routes.js';
import { useQuestRun } from './useQuestRun.js';

/**
 * A quest run: find each book in a real Bible, one clock, no interruptions.
 * The splits on the results screen are the whole point.
 */
export function QuestRunPage() {
  const { questId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const run = useQuestRun(questId);

  usePracticeClock();

  if (!run.quest) {
    return (
      <AppShell width="narrow">
        <ScreenHeader title={t('errors.notFound')} backTo={ROUTES.quest} />
      </AppShell>
    );
  }

  const { question, session } = run;

  return (
    <AppShell width="narrow">
      <ScreenHeader
        title={t(`quests.${run.quest.id}.title`)}
        subtitle={
          run.finished
            ? `${t('quest.totalTime')}: ${formatStopwatch(run.score.totalTimeMs)}`
            : t('quest.bookNumber', run.counters)
        }
        backTo={ROUTES.quest}
      />

      {!run.finished && (
        <StepDots
          className="mb-4 justify-center"
          total={run.counters.total}
          completed={session.answers.length}
          tone={run.quest.tone}
        />
      )}

      <ScreenBody>
        {run.finished ? (
          <RoundResult
            summary={run.summary}
            stars={run.score.stars}
            title={t('result.questTitle')}
            missedBookIds={run.summary.missedBookIds}
            splits={session.answers}
            onPlayAgain={run.restart}
            onExit={() => navigate(ROUTES.quest)}
            exitLabel={t('result.backToQuests')}
          />
        ) : (
          question && (
            <PhysicalFindQuestion
              key={question.id}
              question={question}
              stopwatch={run.stopwatch}
              onAnswer={run.answer}
              onStart={run.startRun}
              started={run.started}
              position={t('question.counter', run.counters)}
              lastSplitMs={run.lastAnswer?.timeMs}
            />
          )
        )}
      </ScreenBody>
    </AppShell>
  );
}
