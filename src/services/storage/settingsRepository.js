import { STORAGE_KEYS } from './storageAdapter.js';

/** Preferences that survive a reload: language, theme, goal, learner name. */
export const DEFAULT_SETTINGS = Object.freeze({
  locale: null, // null = detect from the browser on first run
  themeId: 'candy',
  dailyGoalMinutes: 10,
  learnerName: '',
  bookPool: 'tier1', // 'tier1' | 'all'
  soundEnabled: true,
  hasOnboarded: false,
});

/** @param {import('./storageAdapter.js').StorageAdapter} adapter */
export function createSettingsRepository(adapter) {
  return {
    load() {
      const stored = adapter.read(STORAGE_KEYS.settings);
      return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
    },
    save(settings) {
      adapter.write(STORAGE_KEYS.settings, settings);
    },
    clear() {
      adapter.remove(STORAGE_KEYS.settings);
    },
  };
}
