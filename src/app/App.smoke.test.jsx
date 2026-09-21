/**
 * @vitest-environment jsdom
 *
 * Smoke test: every screen must mount, in both languages, without throwing.
 * It is not a design test - it is the guard that the wiring (providers, router,
 * i18n keys, domain calls) actually holds together.
 */
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from './providers/AppProviders.jsx';
import { AppRoutes } from './AppRoutes.jsx';
import { createStorage, createMemoryStorageAdapter } from '@/services/storage/index.js';
import { STORAGE_KEYS } from '@/services/storage/storageAdapter.js';
import { DEFAULT_SETTINGS } from '@/services/storage/settingsRepository.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Mounts the app at `path` and hands back the live DOM for interaction. */
function mountAt(path, settings = {}) {
  const storage = createStorage(
    createMemoryStorageAdapter({
      [STORAGE_KEYS.settings]: { ...DEFAULT_SETTINGS, hasOnboarded: true, ...settings },
    }),
  );

  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <StrictMode>
        <AppProviders storage={storage}>
          <MemoryRouter
            initialEntries={[path]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AppRoutes />
          </MemoryRouter>
        </AppProviders>
      </StrictMode>,
    );
  });

  return {
    container,
    click(element) {
      act(() => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    },
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/** Convenience wrapper for the "does it render at all" checks. */
function renderAt(path, settings = {}) {
  const view = mountAt(path, settings);
  const html = view.container.innerHTML;
  view.unmount();
  return html;
}

const SCREENS = [
  '/',
  '/welcome',
  '/training',
  '/training/bible-map',
  '/training/brain-neighbour',
  '/training/hand-geography',
  '/quest',
  '/quest/nt-run',
  '/progress',
  '/map',
  '/settings',
  '/nowhere',
];

describe('every screen mounts', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it.each(SCREENS)('renders %s in English', (path) => {
    const html = renderAt(path, { locale: 'en' });
    expect(html.length).toBeGreaterThan(50);
  });

  it.each(SCREENS)('renders %s in Telugu', (path) => {
    const html = renderAt(path, { locale: 'te' });
    expect(html.length).toBeGreaterThan(50);
  });

  it('shows the welcome screen before onboarding is done', () => {
    const html = renderAt('/', { hasOnboarded: false });
    expect(html).toContain('Bible Explorer');
  });

  it('shows Telugu book names when Telugu is active', () => {
    const html = renderAt('/map', { locale: 'te' });
    expect(html).toContain('ఆదికాండము');
    expect(html).not.toContain('Genesis');
  });
});

describe('responsive chrome', () => {
  it('gives tab screens both navigations and leaves rounds undistracted', () => {
    const tabScreen = mountAt('/');
    // Phones get the fixed bottom bar, desktop the side rail; CSS decides which
    // one is visible, so both are in the markup.
    expect(tabScreen.container.querySelector('nav')).not.toBeNull();
    expect(tabScreen.container.querySelector('aside')).not.toBeNull();
    tabScreen.unmount();

    const round = mountAt('/training/bible-map');
    expect(round.container.querySelector('nav')).toBeNull();
    expect(round.container.querySelector('aside')).toBeNull();
    round.unmount();
  });

  it('keeps a question column narrow and a dashboard wide', () => {
    const round = mountAt('/training/bible-map');
    expect(round.container.querySelector('.max-w-lg')).not.toBeNull();
    round.unmount();

    const progress = mountAt('/progress');
    expect(progress.container.querySelector('.max-w-5xl')).not.toBeNull();
    progress.unmount();
  });
});

describe('the core loop', () => {
  it('answers a question, shows feedback, and moves on', () => {
    const view = mountAt('/training/bible-map');

    const options = [...view.container.querySelectorAll('button[aria-pressed]')];
    expect(options.length).toBeGreaterThan(1);

    view.click(options[0]);
    const confirm = [...view.container.querySelectorAll('button')].at(-1);
    view.click(confirm);

    // Feedback replaces the question and offers the way forward.
    expect(view.container.textContent).toMatch(/Correct!|Not quite!/);

    const continueButton = [...view.container.querySelectorAll('button')].at(-1);
    view.click(continueButton);

    // Question 2 of the round is now on screen.
    expect(view.container.querySelectorAll('button[aria-pressed]').length).toBeGreaterThan(1);
    expect(view.container.textContent).toContain('2 / 10');

    view.unmount();
  });
});
