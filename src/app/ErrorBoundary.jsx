import { Component } from 'react';

/**
 * Last line of defence. Progress is already persisted after every answer, so a
 * crash costs nothing but the current screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[BibleBookRace]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-canvas p-8 text-center">
        <span className="text-5xl" aria-hidden="true">
          🛟
        </span>
        <h1 className="font-display text-xl font-extrabold">Something went wrong</h1>
        <p className="max-w-xs text-sm text-ink-muted">
          The game hit an unexpected error. Your progress is safe.
        </p>
        <button
          type="button"
          onClick={() => globalThis.location.reload()}
          className="rounded-2xl bg-primary px-5 py-3 font-display font-bold text-on-primary shadow-pop"
        >
          Reload
        </button>
      </div>
    );
  }
}
