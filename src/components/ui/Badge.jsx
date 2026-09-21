import { cn } from '@/utils/cn.js';
import { toneStyles } from '@/theme/tones.js';

export function Badge({ children, tone = 'neutral', className, leading }) {
  const styles = toneStyles(tone);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-bold',
        styles.soft,
        className,
      )}
    >
      {leading}
      {children}
    </span>
  );
}
