import { Link } from 'react-router-dom';
import { AppShell, ScreenBody } from '@/components/layout/AppShell.jsx';
import { Badge, Card } from '@/components/ui/index.js';
import { BookRow, MasteryBadge } from '@/components/game/index.js';
import { useProgress } from '@/app/providers/ProgressProvider.jsx';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { getBookMastery, getWeakBooks } from '@/domain/progress/progressSelectors.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { useGameText } from '@/i18n/useGameText.js';
import { ROUTES } from '@/app/routes.js';
import { GoalCard } from './components/GoalCard.jsx';
import { MapFeatureCard } from './components/MapFeatureCard.jsx';
import { MenuTile } from './components/MenuTile.jsx';

/** Landing screen: today's goal, the four places to go, and what to work on. */
export function HomePage() {
  const { t } = useTranslation();
  const gameText = useGameText();
  const { settings } = useSettings();
  const { progress } = useProgress();

  // Three books on a phone, five when there is room to show them.
  const weakBooks = getWeakBooks(progress, 5);
  const hasHistory = progress.totals.attempts > 0;

  return (
    <AppShell withNav width="wide">
      <header className="flex items-center gap-3 py-4 lg:py-6">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-2xl lg:h-14 lg:w-14 lg:text-3xl"
          aria-hidden="true"
        >
          🧒
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-extrabold leading-tight lg:text-2xl">
            {settings.learnerName
              ? t('home.greetingNamed', { name: settings.learnerName })
              : t('home.greeting')}
          </p>
          <p className="text-xs text-ink-muted lg:text-sm">{t('home.keepGoing')}</p>
        </div>

        <Badge tone="danger" className="text-sm lg:hidden">
          🔥 {progress.streak.current}
        </Badge>

        <Link
          to={ROUTES.settings}
          aria-label={t('a11y.openSettings')}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-lg shadow-card transition hover:brightness-95 active:scale-95 lg:hidden"
        >
          <span aria-hidden="true">⚙️</span>
        </Link>
      </header>

      <ScreenBody className="space-y-4 lg:space-y-6">
        <GoalCard goalMinutes={settings.dailyGoalMinutes} practisedMs={progress.daily.practiceMs} />

        {/* The map comes first: it is the content the other three screens drill. */}
        <MapFeatureCard isNewLearner={!hasHistory} />

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <MenuTile
            compact
            to={ROUTES.training}
            tone="success"
            emoji="🎓"
            title={t('home.tiles.trainingTitle')}
            subtitle={t('home.tiles.trainingSubtitle')}
          />
          <MenuTile
            compact
            to={ROUTES.quest}
            tone="danger"
            emoji="🚩"
            title={t('home.tiles.questTitle')}
            subtitle={t('home.tiles.questSubtitle')}
          />
          <MenuTile
            compact
            to={ROUTES.progress}
            tone="accent"
            emoji="📊"
            title={t('home.tiles.progressTitle')}
            subtitle={t('home.tiles.progressSubtitle')}
          />
        </div>

        {hasHistory && weakBooks.length > 0 && (
          <Card className="p-4 sm:p-5">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-display text-base font-extrabold lg:text-lg">
                {t('home.focusTitle')}
              </h2>
              <Link to={ROUTES.progress} className="text-xs font-bold text-primary lg:text-sm">
                {t('home.practiseThese')}
              </Link>
            </div>
            <p className="mb-2 text-xs text-ink-muted lg:text-sm">{t('home.focusBody')}</p>

            <ul className="sm:grid sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3">
              {weakBooks.map((book, index) => {
                const masteryId = getBookMastery(progress, book.id);
                return (
                  <li
                    key={book.id}
                    // Keep phones to three; wider screens have room for all five.
                    className={index >= 3 ? 'hidden sm:block' : undefined}
                  >
                    <BookRow
                      name={gameText.bookName(book.id)}
                      caption={gameText.sectionName(book.sectionId)}
                      right={<MasteryBadge compact masteryId={masteryId} label={t(`mastery.${masteryId}`)} />}
                    />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </ScreenBody>
    </AppShell>
  );
}
