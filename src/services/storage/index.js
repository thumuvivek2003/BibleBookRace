import { createLocalStorageAdapter, isLocalStorageAvailable } from './localStorageAdapter.js';
import { createMemoryStorageAdapter } from './memoryStorageAdapter.js';
import { createProgressRepository } from './progressRepository.js';
import { createSettingsRepository } from './settingsRepository.js';

/**
 * Composition root for persistence: picks the best available adapter once and
 * hands ready-made repositories to the providers.
 */
export function createStorage(adapter = defaultAdapter()) {
  return {
    adapter,
    progress: createProgressRepository(adapter),
    settings: createSettingsRepository(adapter),
  };
}

function defaultAdapter() {
  return isLocalStorageAvailable()
    ? createLocalStorageAdapter(globalThis.localStorage)
    : createMemoryStorageAdapter();
}

export { createMemoryStorageAdapter, createLocalStorageAdapter };
