import { cn } from '@/utils/cn.js';

/**
 * The oversized book name a learner has to find.
 * Long Telugu names are given room to wrap instead of being clipped.
 */
export function BookPrompt({ name, caption, tone = 'warning', className }) {
  return (
    <div
      className={cn(
        'rounded-card bg-warning-soft px-4 py-6 text-center sm:py-8',
        tone === 'primary' && 'bg-primary-soft',
        className,
      )}
    >
      <p className="break-words font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
        {name}
      </p>
      {caption && <p className="mt-1 text-xs font-semibold text-ink-muted">{caption}</p>}
    </div>
  );
}
