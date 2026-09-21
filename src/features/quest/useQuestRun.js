import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useSound } from '@/hooks/useSound.js';
import { useStopwatch } from '@/hooks/useStopwatch.js';
import { createQuestion } from '@/domain/questions/questionFactory.js';
import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';
import { buildQuestBooks, getQuest, scoreQuest } from '@/domain/quest/questModel.js';
import {
  createRoundSession,
  currentQuestion,
  isFinished,
  progressOf,
  submitAnswer,
  summariseRound,
} from '@/domain/session/roundSession.js';

const QUEST_GAME_ID = 'quest';

/**
 * Controller for a quest run: a fixed list of books to find in a real Bible.
 *
 * Deliberately built on the same pure pieces as training (question factory,
 * round session, progress reducers) - a quest is a different *selection* of
 * books, not a different engine.
 *
 * Like Hand Geography, a quest runs on one continuous clock and moves straight
 * to the next book: it is a race, and a dialog between books would only
 * measure the app.
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

  // Where the current book's lap began, on the one clock of the run.
  const lapStartedAt = useRef(0);

  const startRun = useCallback(() => {
    lapStartedAt.current = 0;
    stopwatch.reset(true);
  }, [stopwatch]);

  // Side effects stay outside the state updater (see useTrainingRound).
  const answer = useCallback(
    (value) => {
      const now = stopwatch.read();
      const timeMs = Math.max(0, now - lapStartedAt.current);
      lapStartedAt.current = now;

      const nextSession = submitAnswer(session, { ...value, timeMs });
      if (nextSession === session) return;

      const record = nextSession.lastAnswer;
      playSound(record.correct ? 'correct' : 'wrong');
      recordAttempt({
        bookId: record.bookId,
        gameId: QUEST_GAME_ID,
        correct: record.correct,
        timeMs: record.timeMs,
        at: record.at,
      });

      if (isFinished(nextSession)) {
        stopwatch.stop();
        playSound('finish');
      }
      setSession(nextSession);
    },
    [playSound, recordAttempt, session, stopwatch],
  );

  const restart = useCallback(() => {
    statsAtStart.current = progress.bookStats;
    setSession(buildSession(quest, statsAtStart.current));
    setRecorded(false);
    setRunKey((key) => key + 1);
    lapStartedAt.current = 0;
    stopwatch.reset(false);
  }, [quest, progress.bookStats, stopwatch]);

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
    started: stopwatch.running || stopwatch.elapsedMs > 0,
    startRun,
    answer,
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
        gameId: QUEST_GAME_ID,
        stageId: quest.id,
      }),
    )
    .filter(Boolean);
  return createRoundSession(questions, { questId: quest.id }, { autoAdvance: true });
}
