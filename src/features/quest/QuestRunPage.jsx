import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { StepDots } from '@/components/ui/index.js';
import { FeedbackPanel } from '@/components/game/index.js';
import { ROUND_STATUS } from '@/domain/session/roundSession.js';
import { PhysicalFindQuestion } from '@/features/training/components/PhysicalFindQuestion.jsx';
import { RoundResult } from '@/features/training/components/RoundResult.jsx';
import { usePracticeClock } from '@/hooks/usePracticeClock.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { formatSeconds } from '@/utils/format.js';
import { ROUTES } from '@/app/routes.js';
import { useQuestRun } from './useQuestRun.js';

/** A quest run: find each book in a real Bible, against the clock. */
export function QuestRunPage() {
  const { questId } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const run = useQuestRun(questId);

  usePracticeClock();

  const { question, session, beginQuestion, runKey } = run;

  useEffect(() => {
    if (question && session.status === ROUND_STATUS.ASKING) beginQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, session.status, runKey]);

  if (!run.quest) {
    return (
      <AppShell width="narrow">
        <ScreenHeader title={t('errors.notFound')} backTo={ROUTES.quest} />
      </AppShell>
    );
  }

  const reviewing = session.status === ROUND_STATUS.REVIEWING;

  return (
    <AppShell width="narrow">
      <ScreenHeader
        title={t(`quests.${run.quest.id}.title`)}
        subtitle={
          run.finished
            ? t('quest.totalTime') + ': ' + formatSeconds(run.score.totalTimeMs, locale)
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
            onPlayAgain={run.restart}
            onExit={() => navigate(ROUTES.quest)}
            exitLabel={t('result.backToQuests')}
          />
        ) : reviewing ? (
          <FeedbackPanel
            correct={run.lastAnswer?.correct}
            title={run.lastAnswer?.correct ? t('feedback.correct') : t('feedback.wrong')}
            explanation={gameText.phrase(question?.explanation)}
            detail={
              run.lastAnswer?.correct
                ? t('hand.tookYou', { time: formatSeconds(run.lastAnswer.timeMs, locale) })
                : undefined
            }
            actionLabel={
              session.answers.length === run.counters.total
                ? t('feedback.seeResults')
                : t('feedback.nextQuestion')
            }
            onContinue={run.next}
          />
        ) : (
          question && (
            <PhysicalFindQuestion
              key={question.id}
              question={question}
              stopwatch={run.stopwatch}
              onAnswer={run.answer}
            />
          )
        )}
      </ScreenBody>
    </AppShell>
  );
}
