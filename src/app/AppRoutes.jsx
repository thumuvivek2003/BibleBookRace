import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { HomePage } from '@/features/home/HomePage.jsx';
import { TrainingMenuPage } from '@/features/training/TrainingMenuPage.jsx';
import { TrainingRoundPage } from '@/features/training/TrainingRoundPage.jsx';
import { QuestListPage } from '@/features/quest/QuestListPage.jsx';
import { QuestRunPage } from '@/features/quest/QuestRunPage.jsx';
import { ProgressPage } from '@/features/progress/ProgressPage.jsx';
import { BibleMapPage } from '@/features/map/BibleMapPage.jsx';
import { SettingsPage } from '@/features/settings/SettingsPage.jsx';
import { WelcomePage } from '@/features/onboarding/WelcomePage.jsx';
import { NotFoundPage } from '@/features/errors/NotFoundPage.jsx';
import { ROUTES } from './routes.js';

/** The whole navigation map. Each route renders exactly one feature screen. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.welcome} element={<WelcomePage />} />
      <Route
        path={ROUTES.home}
        element={
          <RequireOnboarding>
            <HomePage />
          </RequireOnboarding>
        }
      />
      <Route path={ROUTES.training} element={<TrainingMenuPage />} />
      <Route path={ROUTES.trainingGame()} element={<TrainingRoundPage />} />
      <Route path={ROUTES.quest} element={<QuestListPage />} />
      <Route path={ROUTES.questRun()} element={<QuestRunPage />} />
      <Route path={ROUTES.progress} element={<ProgressPage />} />
      <Route path={ROUTES.map} element={<BibleMapPage />} />
      <Route path={ROUTES.settings} element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/** New devices see the welcome screen once. */
function RequireOnboarding({ children }) {
  const { settings } = useSettings();
  return settings.hasOnboarded ? children : <Navigate to={ROUTES.welcome} replace />;
}
