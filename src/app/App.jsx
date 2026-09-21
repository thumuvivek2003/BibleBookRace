import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders.jsx';
import { AppRoutes } from './AppRoutes.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';

/**
 * Stays tiny on purpose: composition only.
 * Data, rules, screens and persistence all live elsewhere.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}
