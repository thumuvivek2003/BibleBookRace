/**
 * The storage port.
 *
 * Nothing above this file knows that `localStorage` exists; repositories depend
 * on this shape only (Dependency Inversion). Swapping in a server, IndexedDB or
 * an in-memory fake for tests is a one-line change in `index.js`.
 *
 * @typedef {object} StorageAdapter
 * @property {(key: string) => unknown|null} read
 * @property {(key: string, value: unknown) => void} write
 * @property {(key: string) => void} remove
 */

export const STORAGE_KEYS = Object.freeze({
  progress: 'bible-explorer:progress',
  settings: 'bible-explorer:settings',
});
