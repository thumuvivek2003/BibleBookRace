import { cn } from '@/utils/cn.js';
import { clamp } from '@/utils/array.js';
import { toneStyles } from '@/theme/tones.js';

/**
 * @param {{ value: number, tone?: string, label?: string, size?: 'sm'|'md' }} props
 * `value` is a ratio between 0 and 1.
 */
export function ProgressBar({ value, tone = 'primary', label, size = 'md', className }) {
  const ratio = clamp(value || 0, 0, 1);
  const styles = toneStyles(tone);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-pill bg-surface-sunken',
        size === 'sm' ? 'h-2' : 'h-3',
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-pill transition-[width] duration-500 ease-out', styles.dot)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

/** The dotted "3 / 10" indicator from the question screens. */
export function StepDots({ total, completed, tone = 'success', className }) {
  const styles = toneStyles(tone);
  return (
    <div className={cn('flex items-center gap-1.5', className)} aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-2.5 rounded-pill transition-all duration-300',
            index < completed ? cn('w-5', styles.dot) : 'w-2.5 bg-surface-sunken',
          )}
        />
      ))}
    </div>
  );
}
