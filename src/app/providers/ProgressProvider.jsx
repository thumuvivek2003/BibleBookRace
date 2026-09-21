import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  completeQuest as completeQuestReducer,
  completeRound as completeRoundReducer,
  recordAttempt as recordAttemptReducer,
  recordPracticeTime as recordPracticeTimeReducer,
  registerActiveDay,
  resetProgress,
  startDay,
} from '@/domain/progress/progressModel.js';
import { toDayKey } from '@/utils/format.js';
import { useStorage } from './StorageProvider.jsx';

/**
 * Holds the progress document and persists every change.
 *
 * All the rules live in `domain/progress/progressModel.js` as pure reducers;
 * this provider only wires them to React state and storage - which keeps the
 * interesting logic testable without a DOM.
 */
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const storage = useStorage();
  const [progress, setProgress] = useState(() => startDay(storage.progress.load(), toDayKey()));

  /** Applies a pure reducer and writes the result through. */
  const apply = useCallback(
    (reducer) => {
      setProgress((previous) => {
        const next = reducer(previous);
        storage.progress.save(next);
        return next;
      });
    },
    [storage],
  );

  const actions = useMemo(
    () => ({
      recordAttempt: (attempt) => apply((current) => recordAttemptReducer(current, attempt)),
      recordPracticeTime: (ms) => apply((current) => recordPracticeTimeReducer(current, ms)),
      completeRound: (result) => apply((current) => completeRoundReducer(current, result)),
      completeQuest: (result) => apply((current) => completeQuestReducer(current, result)),
      markActiveToday: () => apply((current) => registerActiveDay(current, toDayKey())),
      reset: () => {
        const fresh = resetProgress();
        storage.progress.save(fresh);
        setProgress(fresh);
      },
    }),
    [apply, storage],
  );

  const value = useMemo(() => ({ progress, ...actions }), [progress, actions]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside <ProgressProvider>');
  return context;
}
