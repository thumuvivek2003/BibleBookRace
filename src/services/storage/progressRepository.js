import { createEmptyProgress, migrateProgress } from '@/domain/progress/progressModel.js';
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from './storageAdapter.js';

/**
 * Persistence for the progress document.
 * The rest of the app calls `load`/`save`, never `localStorage` directly.
 *
 * @param {import('./storageAdapter.js').StorageAdapter} adapter
 */
export function createProgressRepository(adapter) {
  return {
    load() {
      const stored =
        adapter.read(STORAGE_KEYS.progress) ?? adapter.read(LEGACY_STORAGE_KEYS.progress);
      return stored ? migrateProgress(stored) : createEmptyProgress();
    },
    save(progress) {
      adapter.write(STORAGE_KEYS.progress, progress);
    },
    clear() {
      adapter.remove(STORAGE_KEYS.progress);
      adapter.remove(LEGACY_STORAGE_KEYS.progress);
    },
  };
}
