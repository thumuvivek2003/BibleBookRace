import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { StepDots } from '@/components/ui/index.js';
import { FeedbackPanel } from '@/components/game/index.js';
import { ANSWER_MODE } from '@/domain/questions/questionTypes.js';
import { ROUND_STATUS } from '@/domain/session/roundSession.js';
import { useGameText } from '@/i18n/useGameText.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { usePracticeClock } from '@/hooks/usePracticeClock.js';
import { ROUTES } from '@/app/routes.js';
import { useTrainingRound } from './useTrainingRound.js';
import { ChoiceQuestion } from './components/ChoiceQuestion.jsx';
import { OrderQuestion } from './components/OrderQuestion.jsx';
import { PhysicalFindQuestion } from './components/PhysicalFindQuestion.jsx';
import { RoundResult } from './components/RoundResult.jsx';

/**
 * One screen for every game.
 *
 * It picks a view per `answerMode` instead of branching on the game, so a new
 * question type only needs an entry in this map (Open/Closed).
 */
const QUESTION_VIEWS = {
  [ANSWER_MODE.CHOICE]: ChoiceQuestion,
  [ANSWER_MODE.SEQUENCE]: OrderQuestion,
  [ANSWER_MODE.PHYSICAL]: PhysicalFindQuestion,
};

export function TrainingRoundPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const gameText = useGameText();
  const round = useTrainingRound(gameId);

  usePracticeClock();

  const { question, session, beginQuestion, roundKey } = round;

  // Restart the clock whenever a new question appears.
  useEffect(() => {
    if (question && session.status === ROUND_STATUS.ASKING) beginQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, session.status, roundKey]);

  if (!round.game) {
    return (
      <AppShell width="narrow">
        <ScreenHeader title={t('errors.notFound')} backTo={ROUTES.training} />
      </AppShell>
    );
  }

  const title = t(`games.${round.game.id}.title`);
  const QuestionView = question ? QUESTION_VIEWS[question.answerMode] : null;
  const reviewing = session.status === ROUND_STATUS.REVIEWING;

  return (
    <AppShell width="narrow">
      <ScreenHeader
        title={title}
        subtitle={t('training.gameLabel', { number: round.game.number })}
        backTo={ROUTES.training}
        right={
          !round.finished && (
            <span className="text-xs font-bold text-ink-muted">
              {t('question.counter', round.counters)}
            </span>
          )
        }
      />

      {!round.finished && (
        <StepDots
          className="mb-4 justify-center"
          total={round.counters.total}
          completed={session.answers.length}
        />
      )}

      <ScreenBody>
        {round.finished ? (
          <RoundResult
            summary={round.summary}
            title={t('result.title')}
            missedBookIds={round.summary.missedBookIds}
            onPlayAgain={round.restart}
            onExit={() => navigate(ROUTES.training)}
            exitLabel={t('result.backToTraining')}
          />
        ) : reviewing ? (
          <FeedbackPanel
            correct={round.lastAnswer?.correct}
            title={round.lastAnswer?.correct ? t('feedback.correct') : t('feedback.wrong')}
            explanation={gameText.phrase(question?.explanation)}
            detail={
              question?.answerMode === ANSWER_MODE.SEQUENCE
                ? gameText.runLabel(question.sequence.correct)
                : undefined
            }
            actionLabel={
              session.answers.length === round.counters.total
                ? t('feedback.seeResults')
                : t('feedback.nextQuestion')
            }
            onContinue={round.next}
          />
        ) : (
          QuestionView && (
            <QuestionView
              key={question.id}
              question={question}
              stopwatch={round.stopwatch}
              onAnswer={round.answer}
            />
          )
        )}
      </ScreenBody>
    </AppShell>
  );
}
