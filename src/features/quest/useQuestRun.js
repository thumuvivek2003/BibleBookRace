import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useSound } from '@/hooks/useSound.js';
import { useStopwatch } from '@/hooks/useStopwatch.js';
import { createQuestion } from '@/domain/questions/questionFactory.js';
import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';
import { buildQuestBooks, getQuest, scoreQuest } from '@/domain/quest/questModel.js';
import {
  advance,
  createRoundSession,
  currentQuestion,
  isFinished,
  progressOf,
  submitAnswer,
  summariseRound,
} from '@/domain/session/roundSession.js';

const QUEST_LEVEL_ID = 'quest';

/**
 * Controller for a quest run: a fixed list of books to find in a real Bible.
 *
 * Deliberately built on the same pure pieces as training (question factory,
 * round session, progress reducers) - a quest is a different *selection* of
 * books, not a different engine.
 */
export function useQuestRun(questId) {
  const quest = getQuest(questId);
  const { progress, recordAttempt, completeQuest } = useProgress();
  const playSound = useSound();
  const stopwatch = useStopwatch();

  const statsAtStart = useRef(progress.bookStats);
  const [runKey, setRunKey] = useState(0);
  const [session, setSession] = useState(() => buildSession(quest, statsAtStart.current));
  const [recorded, setRecorded] = useState(false);

  const question = currentQuestion(session);
  const finished = isFinished(session);

  const beginQuestion = useCallback(() => stopwatch.reset(false), [stopwatch]);

  // Side effects stay outside the state updater (see useTrainingRound).
  const answer = useCallback(
    (value) => {
      const timeMs = stopwatch.stop();
      const nextSession = submitAnswer(session, { ...value, timeMs });
      if (nextSession === session) return;

      const record = nextSession.lastAnswer;
      playSound(record.correct ? 'correct' : 'wrong');
      recordAttempt({
        bookId: record.bookId,
        levelId: QUEST_LEVEL_ID,
        correct: record.correct,
        timeMs: record.timeMs,
        at: record.at,
      });
      setSession(nextSession);
    },
    [playSound, recordAttempt, session, stopwatch],
  );

  const next = useCallback(() => {
    const nextSession = advance(session);
    if (isFinished(nextSession) && !isFinished(session)) playSound('finish');
    setSession(nextSession);
  }, [playSound, session]);

  const restart = useCallback(() => {
    statsAtStart.current = progress.bookStats;
    setSession(buildSession(quest, statsAtStart.current));
    setRecorded(false);
    setRunKey((key) => key + 1);
  }, [quest, progress.bookStats]);

  const summary = useMemo(() => summariseRound(session), [session]);
  const score = useMemo(() => scoreQuest(session.answers), [session.answers]);

  useEffect(() => {
    if (!finished || recorded || summary.total === 0) return;
    setRecorded(true);
    completeQuest({ questId, accuracy: score.accuracy, totalTimeMs: score.totalTimeMs });
  }, [finished, recorded, summary.total, score.accuracy, score.totalTimeMs, completeQuest, questId]);

  return {
    quest,
    session,
    question,
    finished,
    summary,
    score,
    runKey,
    counters: progressOf(session),
    lastAnswer: session.lastAnswer,
    stopwatch,
    beginQuestion,
    answer,
    next,
    restart,
  };
}

function buildSession(quest, bookStats) {
  if (!quest) return createRoundSession([]);
  const books = buildQuestBooks(quest, { progress: { bookStats } });
  const questions = books
    .map((book) =>
      createQuestion({
        type: QUESTION_TYPE.FIND_IN_BIBLE,
        book,
        levelId: QUEST_LEVEL_ID,
        stageId: quest.id,
      }),
    )
    .filter(Boolean);
  return createRoundSession(questions, { questId: quest.id });
}
