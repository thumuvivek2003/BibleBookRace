import { Card, ProgressBar } from '@/components/ui/index.js';
import { masteryLevels } from '@/domain/mastery/masteryModel.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { toneStyles } from '@/theme/tones.js';
import { cn } from '@/utils/cn.js';

/** How the 66 books are distributed across the five mastery levels. */
export function MasteryBreakdown({ counts, overallRatio }) {
  const { t } = useTranslation();
  const ordered = [...masteryLevels].reverse();

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-extrabold">{t('progress.masteryLevel')}</h2>
        <span className="text-xs font-bold text-ink-muted">
          {Math.round(overallRatio * 100)}%
        </span>
      </div>

      <ProgressBar value={overallRatio} tone="accent" label={t('progress.overallMastery')} />

      <ul className="space-y-1.5">
        {ordered.map((level) => {
          const styles = toneStyles(level.tone);
          return (
            <li key={level.id} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold',
                  styles.soft,
                )}
              >
                {level.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {t(`mastery.${level.id}`)}
              </span>
              <span className="shrink-0 text-sm font-extrabold tabular-nums text-ink-muted">
                {counts[level.id]}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
