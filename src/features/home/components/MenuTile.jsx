import { Link } from 'react-router-dom';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';

/**
 * Square shortcut on the home screen. Grows with the viewport.
 *
 * `compact` packs three across a phone: the subtitle waits for a wider screen
 * rather than squeezing the title onto three lines.
 */
export function MenuTile({ to, emoji, title, subtitle, tone = 'primary', compact = false }) {
  const styles = toneStyles(tone);
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col justify-between rounded-card border transition',
        'hover:brightness-[0.98] active:scale-[0.98]',
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5',
        styles.soft,
        styles.border,
      )}
    >
      <span className={cn('leading-none', compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl')} aria-hidden="true">
        {emoji}
      </span>
      <span className={cn('block', compact ? 'mt-3 sm:mt-4' : 'mt-4 sm:mt-6')}>
        <span
          className={cn(
            'block font-display font-extrabold leading-tight text-ink',
            compact ? 'text-sm sm:text-base' : 'text-lg',
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            'block text-ink-muted',
            compact ? 'hidden text-xs sm:block' : 'text-xs sm:text-sm',
          )}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
