import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 100;

/**
 * A stopwatch that reports elapsed milliseconds.
 *
 * Elapsed time is computed from timestamps rather than accumulated per tick, so
 * a backgrounded tab or a throttled interval cannot drift the score.
 *
 * @param {{ autoStart?: boolean }} [options]
 */
export function useStopwatch({ autoStart = false } = {}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const startedAtRef = useRef(autoStart ? Date.now() : null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setElapsedMs(accumulatedRef.current + (Date.now() - (startedAtRef.current ?? Date.now())));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    setRunning((wasRunning) => {
      if (wasRunning) return true;
      startedAtRef.current = Date.now();
      return true;
    });
  }, []);

  /** Stops and returns the final reading, so callers need no extra render. */
  const stop = useCallback(() => {
    let total = accumulatedRef.current;
    if (startedAtRef.current !== null) {
      total += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    accumulatedRef.current = total;
    setElapsedMs(total);
    setRunning(false);
    return total;
  }, []);

  const reset = useCallback((shouldRun = false) => {
    accumulatedRef.current = 0;
    startedAtRef.current = shouldRun ? Date.now() : null;
    setElapsedMs(0);
    setRunning(shouldRun);
  }, []);

  /** Current reading without waiting for the next tick. */
  const read = useCallback(
    () =>
      accumulatedRef.current +
      (startedAtRef.current !== null ? Date.now() - startedAtRef.current : 0),
    [],
  );

  return { elapsedMs, running, start, stop, reset, read };
}
