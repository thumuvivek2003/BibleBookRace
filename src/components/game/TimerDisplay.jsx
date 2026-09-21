import { formatStopwatch } from '@/utils/format.js';
import { cn } from '@/utils/cn.js';

/** Big monospaced stopwatch used by Hand Geography and quests. */
export function TimerDisplay({ elapsedMs, running = false, className }) {
  return (
    <div
      className={cn(
        'rounded-card bg-surface-sunken py-4 text-center font-display text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl',
        running && 'text-primary',
        className,
      )}
      aria-live="off"
    >
      {formatStopwatch(elapsedMs)}
    </div>
  );
}
