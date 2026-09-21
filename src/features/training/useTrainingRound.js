import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useBookPool } from '@/hooks/useBookPool.js';
import { useSound } from '@/hooks/useSound.js';
import { useStopwatch } from '@/hooks/useStopwatch.js';
import { createAdaptiveSelector } from '@/domain/mastery/weakBookSelector.js';
import { getGame } from '@/domain/games/gameCatalog.js';
import { createRound } from '@/domain/questions/questionFactory.js';
import {
  advance,
  createRoundSession,
  currentQuestion,
  isFinished,
  progressOf,
  submitAnswer,
  summariseRound,
} from '@/domain/session/roundSession.js';

/**
 * Controller for one round of one game.
 *
 * It owns only React concerns - which question is on screen, the stopwatch, and
 * when to write to storage. Every rule (what to ask, was it right, how did the
 * round go) comes from the pure domain modules, which is what keeps this hook
 * short and the game logic testable.
 */
export function useTrainingRound(gameId) {
  const game = getGame(gameId);
  const pool = useBookPool();
  const { progress, recordAttempt, completeRound } = useProgress();
  const playSound = useSound();
  const stopwatch = useStopwatch();

  // The round is built once: a re-render after an answer must not reshuffle it.
  const statsAtStart = useRef(progress.bookStats);
  const [roundKey, setRoundKey] = useState(0);
  const [session, setSession] = useState(() => buildSession(game, pool, statsAtStart.current));
  const [recorded, setRecorded] = useState(false);

  const question = currentQuestion(session);
  const manualTimer = Boolean(game?.needsPhysicalBible);

  /** Called by the screen when a new question is displayed. */
  const beginQuestion = useCallback(() => {
    stopwatch.reset(!manualTimer);
  }, [stopwatch, manualTimer]);

  // Side effects stay outside the state updater: a React updater must be pure,
  // and scoring a book is very much not.
  const answer = useCallback(
    (value) => {
      const timeMs = stopwatch.stop();
      const nextSession = submitAnswer(session, { ...value, timeMs });
      if (nextSession === session) return;

      const record = nextSession.lastAnswer;
      playSound(record.correct ? 'correct' : 'wrong');
      recordAttempt({
        bookId: record.bookId,
        gameId,
        correct: record.correct,
        timeMs: record.timeMs,
        at: record.at,
      });
      setSession(nextSession);
    },
    [gameId, playSound, recordAttempt, session, stopwatch],
  );

  const next = useCallback(() => {
    const nextSession = advance(session);
    if (isFinished(nextSession) && !isFinished(session)) playSound('finish');
    setSession(nextSession);
  }, [playSound, session]);

  const restart = useCallback(() => {
    statsAtStart.current = progress.bookStats;
    setSession(buildSession(game, pool, statsAtStart.current));
    setRecorded(false);
    setRoundKey((key) => key + 1);
  }, [game, pool, progress.bookStats]);

  const summary = useMemo(() => summariseRound(session), [session]);
  const finished = isFinished(session);

  // Persist the round result exactly once, when it ends.
  useEffect(() => {
    if (!finished || recorded || summary.total === 0) return;
    setRecorded(true);
    completeRound({ gameId, accuracy: summary.accuracy });
  }, [finished, recorded, summary.total, summary.accuracy, completeRound, gameId]);

  return {
    game,
    session,
    question,
    finished,
    summary,
    roundKey,
    counters: progressOf(session),
    lastAnswer: session.lastAnswer,
    stopwatch,
    manualTimer,
    beginQuestion,
    answer,
    next,
    restart,
  };
}

function buildSession(game, pool, bookStats) {
  if (!game) return createRoundSession([]);
  const questions = createRound({
    gameId: game.id,
    selectBook: createAdaptiveSelector(pool, bookStats),
  });
  return createRoundSession(questions, { gameId: game.id });
}
