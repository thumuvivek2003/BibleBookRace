import { createContext, useContext, useMemo } from 'react';
import { createStorage } from '@/services/storage/index.js';

/**
 * Composition root for persistence.
 *
 * Injecting the storage object (rather than importing localStorage anywhere)
 * means tests and Storybook can pass an in-memory implementation.
 */
const StorageContext = createContext(null);

export function StorageProvider({ storage, children }) {
  const value = useMemo(() => storage ?? createStorage(), [storage]);
  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used inside <StorageProvider>');
  return context;
}
