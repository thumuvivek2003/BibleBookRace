import { useEffect, useRef } from 'react';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';

/**
 * Counts the wall-clock time spent on a practice screen towards today's goal.
 * Records once on unmount so we never spam storage mid-round.
 */
export function usePracticeClock(active = true) {
  const { recordPracticeTime } = useProgress();
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!active) return undefined;
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    return () => recordPracticeTime(Date.now() - startedAt);
  }, [active, recordPracticeTime]);
}
