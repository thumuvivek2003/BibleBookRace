/**
 * In-memory fallback. Used by tests and when the browser denies persistent
 * storage (private windows, locked-down school devices) - the app keeps working
 * for the session instead of crashing.
 * @returns {import('./storageAdapter.js').StorageAdapter}
 */
export function createMemoryStorageAdapter(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    read: (key) => (store.has(key) ? store.get(key) : null),
    write: (key, value) => void store.set(key, value),
    remove: (key) => void store.delete(key),
  };
}
