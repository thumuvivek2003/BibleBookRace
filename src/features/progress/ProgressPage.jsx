import { useState } from 'react';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { ScreenHeader } from '@/components/layout/ScreenHeader.jsx';
import { Button, Card, EmptyState, SegmentedControl, StatTile } from '@/components/ui/index.js';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { TOTAL_BOOKS } from '@/domain/books/bookRepository.js';
import {
  getAverageAnswerTime,
  getBooksPractisedCount,
  getMasteryBreakdown,
  getOverallAccuracy,
  getOverallMasteryRatio,
  getWeakestSection,
} from '@/domain/progress/progressSelectors.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { formatPercent, formatSeconds } from '@/utils/format.js';
import { cn } from '@/utils/cn.js';
import { ROUTES } from '@/app/routes.js';
import { MasteryBreakdown } from './components/MasteryBreakdown.jsx';
import { BookMasteryList } from './components/BookMasteryList.jsx';

/**
 * Progress.
 *
 * Phones and tablets switch between Overview and Books with the tabs; from `lg`
 * the two sit side by side and the tabs disappear, because a wide screen has no
 * reason to hide half the answer.
 */
export function ProgressPage() {
  const { t, locale } = useTranslation();
  const gameText = useGameText();
  const { progress, reset } = useProgress();
  const [tab, setTab] = useState('overview');

  const hasData = progress.totals.attempts > 0;
  const weakest = getWeakestSection(progress);

  return (
    <AppShell withNav width="wide">
      <ScreenHeader title={t('progress.title')} backTo={ROUTES.home} />

      {hasData && (
        <SegmentedControl
          className="mb-4 lg:hidden"
          value={tab}
          onChange={setTab}
          options={[
            { id: 'overview', label: t('progress.overview') },
            { id: 'books', label: t('progress.books') },
          ]}
        />
      )}

      <ScreenBody>
        {!hasData ? (
          <EmptyState emoji="🌱" title={t('progress.title')} body={t('progress.noData')} />
        ) : (
          <div className="items-start gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <section className={cn('space-y-4', tab !== 'overview' && 'hidden lg:block')}>
              <Card className="flex items-center gap-3 p-4 sm:p-5">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-2xl"
                  aria-hidden="true"
                >
                  📊
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {t('progress.booksPractised')}
                  </p>
                  <p className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                    {getBooksPractisedCount(progress)} / {TOTAL_BOOKS}
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatTile
                  icon="✅"
                  tone="success"
                  value={formatPercent(getOverallAccuracy(progress), locale)}
                  label={t('progress.accuracy')}
                />
                <StatTile
                  icon="⚡"
                  tone="info"
                  value={formatSeconds(getAverageAnswerTime(progress), locale)}
                  label={t('progress.avgTime')}
                />
                <StatTile
                  icon="🔥"
                  tone="warning"
                  value={t('progress.days', { count: progress.streak.current })}
                  label={t('progress.currentStreak')}
                />
              </div>

              <MasteryBreakdown
                counts={getMasteryBreakdown(progress)}
                overallRatio={getOverallMasteryRatio(progress)}
              />

              {weakest && (
                <Card className="flex items-center gap-3 p-4 sm:p-5">
                  <span className="text-2xl" aria-hidden="true">
                    🎯
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {t('progress.weakest')}
                    </p>
                    <p className="font-display text-base font-extrabold sm:text-lg">
                      {gameText.sectionName(weakest.sectionId)}
                    </p>
                  </div>
                </Card>
              )}

              <Button
                variant="ghost"
                tone="danger"
                size="sm"
                fullWidth
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  if (globalThis.confirm(t('progress.resetConfirm'))) reset();
                }}
              >
                {t('progress.reset')}
              </Button>
            </section>

            <section className={cn('mt-4 lg:mt-0', tab !== 'books' && 'hidden lg:block')}>
              <h2 className="mb-2 hidden px-1 font-display text-sm font-extrabold uppercase tracking-wide text-ink-muted lg:block">
                {t('progress.books')}
              </h2>
              <BookMasteryList progress={progress} />
            </section>
          </div>
        )}
      </ScreenBody>
    </AppShell>
  );
}
