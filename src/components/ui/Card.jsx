import { cn } from '@/utils/cn.js';
import { toneStyles } from '@/theme/tones.js';

/** Rounded surface used for every panel in the app. */
export function Card({ as: Tag = 'div', children, className, padded = true, ...rest }) {
  return (
    <Tag
      className={cn(
        'rounded-card bg-surface shadow-card',
        padded && 'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Tinted card used for the big tappable tiles on Home and Training. */
export function ToneCard({ tone = 'primary', children, className, ...rest }) {
  const styles = toneStyles(tone);
  return (
    <div
      className={cn('rounded-card border p-4', styles.soft, styles.border, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
