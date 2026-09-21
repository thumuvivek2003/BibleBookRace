import { cn } from '@/utils/cn.js';
import { toneStyles } from '@/theme/tones.js';

/** Small metric card: icon, value, caption. Used across Progress and results. */
export function StatTile({ icon, value, label, tone = 'primary', className }) {
  const styles = toneStyles(tone);
  return (
    <div className={cn('rounded-card p-3 text-center', styles.soft, className)}>
      <div className="text-xl leading-none" aria-hidden="true">
        {icon}
      </div>
      <p className="mt-1.5 font-display text-lg font-extrabold leading-tight">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}
