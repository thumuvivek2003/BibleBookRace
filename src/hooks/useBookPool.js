import { useMemo } from 'react';
import { useSettings } from '@/app/providers/SettingsProvider.jsx';
import { getAllBooks, getTier1Books } from '@/domain/books/bookRepository.js';

/**
 * The books training draws from: the starter 20 for beginners, or all 66.
 * Centralised so every level and quest respects the same setting.
 */
export function useBookPool() {
  const { settings } = useSettings();
  return useMemo(
    () => (settings.bookPool === 'all' ? getAllBooks() : getTier1Books()),
    [settings.bookPool],
  );
}
