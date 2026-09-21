import { Link } from 'react-router-dom';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';

/** Big square shortcut on the home screen. Grows with the viewport. */
export function MenuTile({ to, emoji, title, subtitle, tone = 'primary' }) {
  const styles = toneStyles(tone);
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col justify-between rounded-card border p-4 transition sm:p-5',
        'hover:brightness-[0.98] active:scale-[0.98]',
        styles.soft,
        styles.border,
      )}
    >
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="mt-4 block sm:mt-6">
        <span className="block font-display text-lg font-extrabold leading-tight text-ink">
          {title}
        </span>
        <span className="block text-xs text-ink-muted sm:text-sm">{subtitle}</span>
      </span>
    </Link>
  );
}
