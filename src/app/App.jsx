import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders.jsx';
import { AppRoutes } from './AppRoutes.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';

/**
 * Stays tiny on purpose: composition only.
 * Data, rules, screens and persistence all live elsewhere.
 */

// Vite fills BASE_URL from the build's `base` ("/" in dev, "/BibleBookRace/" on
// GitHub Pages). Router wants it without the trailing slash.
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter
          basename={BASENAME}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}
