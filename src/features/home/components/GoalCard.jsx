import { Card, ProgressBar } from '@/components/ui/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';

/** "Today's Goal" card with the minutes bar. */
export function GoalCard({ goalMinutes, practisedMs }) {
  const { t } = useTranslation();
  const doneMinutes = Math.floor(practisedMs / 60000);
  const ratio = goalMinutes ? Math.min(1, practisedMs / (goalMinutes * 60000)) : 0;
  const complete = ratio >= 1;

  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-2xl" aria-hidden="true">
        🎯
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-extrabold leading-tight">{t('home.todaysGoal')}</p>
        <p className="text-xs text-ink-muted">
          {complete ? t('home.goalDone') : t('home.goalSubtitle', { minutes: goalMinutes })}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <ProgressBar
            className="flex-1"
            size="sm"
            value={ratio}
            tone={complete ? 'success' : 'primary'}
            label={t('home.todaysGoal')}
          />
          <span className="shrink-0 text-[11px] font-bold text-ink-muted">
            {t('home.goalCount', { done: doneMinutes, total: goalMinutes })}
          </span>
        </div>
      </div>
    </Card>
  );
}
