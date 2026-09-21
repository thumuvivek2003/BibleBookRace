import { getMasteryLevel } from '@/domain/mastery/masteryModel.js';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';

/** Coloured chip showing a book's mastery level. */
export function MasteryBadge({ masteryId, label, compact = false, className }) {
  const level = getMasteryLevel(masteryId);
  const styles = toneStyles(level.tone);

  if (compact) {
    return (
      <span
        aria-label={label}
        title={label}
        className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', styles.dot, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-bold',
        styles.soft,
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', styles.dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
