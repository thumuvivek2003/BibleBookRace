/**
 * localStorage implementation of the storage port.
 * Every call is guarded: a full quota or a blocked origin must never take the
 * game down mid-round.
 * @returns {import('./storageAdapter.js').StorageAdapter}
 */
export function createLocalStorageAdapter(storage) {
  return {
    read(key) {
      try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch {
        /* quota exceeded or storage disabled - progress stays in memory */
      }
    },
    remove(key) {
      try {
        storage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/** True when this browser really lets us persist. */
export function isLocalStorageAvailable() {
  try {
    const probe = '__bible_book_race_probe__';
    globalThis.localStorage.setItem(probe, '1');
    globalThis.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
