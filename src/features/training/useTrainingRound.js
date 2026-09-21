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
 *
 * Two clock modes:
 *  - per question (the default): the clock restarts with each question.
 *  - continuous (`game.continuousTimer`): one clock runs for the whole round
 *    and each answer takes a lap, the way a stopwatch works at a race.
 *
 * @param {string} gameId
 * @param {object} [settings] learner-chosen options, e.g. `{ length: 5 }`
 */
export function useTrainingRound(gameId, settings) {
  const game = getGame(gameId);
  const pool = useBookPool();
  const { progress, recordAttempt, completeRound } = useProgress();
  const playSound = useSound();
  const stopwatch = useStopwatch();

  // The round is built once: a re-render after an answer must not reshuffle it.
  const statsAtStart = useRef(progress.bookStats);
  const [roundKey, setRoundKey] = useState(0);
  const [session, setSession] = useState(() =>
    buildSession(game, pool, statsAtStart.current, settings),
  );
  const [recorded, setRecorded] = useState(false);

  const question = currentQuestion(session);
  const continuous = Boolean(game?.continuousTimer);
  const manualTimer = Boolean(game?.needsPhysicalBible);

  // Where the current book's lap began, on the continuous clock.
  const lapStartedAt = useRef(0);

  /** Called by the screen when a new question is displayed. */
  const beginQuestion = useCallback(() => {
    // A continuous round keeps one clock running across every book.
    if (continuous) return;
    stopwatch.reset(!manualTimer);
  }, [continuous, manualTimer, stopwatch]);

  /** Starts the single clock of a continuous round. */
  const startRun = useCallback(() => {
    lapStartedAt.current = 0;
    stopwatch.reset(true);
  }, [stopwatch]);

  const answer = useCallback(
    (value) => {
      const timeMs = continuous ? takeLap(stopwatch, lapStartedAt) : stopwatch.stop();
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

      if (isFinished(nextSession)) {
        stopwatch.stop();
        playSound('finish');
      }
      setSession(nextSession);
    },
    [continuous, gameId, playSound, recordAttempt, session, stopwatch],
  );

  const next = useCallback(() => {
    const nextSession = advance(session);
    if (isFinished(nextSession) && !isFinished(session)) playSound('finish');
    setSession(nextSession);
  }, [playSound, session]);

  const restart = useCallback(() => {
    statsAtStart.current = progress.bookStats;
    setSession(buildSession(game, pool, statsAtStart.current, settings));
    setRecorded(false);
    setRoundKey((key) => key + 1);
    lapStartedAt.current = 0;
    stopwatch.reset(false);
  }, [game, pool, progress.bookStats, settings, stopwatch]);

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
    continuous,
    manualTimer,
    started: stopwatch.running || stopwatch.elapsedMs > 0,
    beginQuestion,
    startRun,
    answer,
    next,
    restart,
  };
}

/** Time since the previous book, and move the lap marker forward. */
function takeLap(stopwatch, lapStartedAt) {
  const now = stopwatch.read();
  const lap = Math.max(0, now - lapStartedAt.current);
  lapStartedAt.current = now;
  return lap;
}

function buildSession(game, pool, bookStats, settings) {
  if (!game) return createRoundSession([]);
  const questions = createRound({
    gameId: game.id,
    selectBook: createAdaptiveSelector(pool, bookStats),
    settings,
  });
  return createRoundSession(questions, { gameId: game.id }, { autoAdvance: Boolean(game.autoAdvance) });
}
