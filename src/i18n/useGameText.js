import { useMemo } from 'react';
import { useTranslation } from './I18nProvider.jsx';
import { createGameText } from './gameText.js';

/** Hook flavour of `createGameText`, bound to the active language. */
export function useGameText() {
  const { t, locale } = useTranslation();
  return useMemo(() => createGameText({ t, locale }), [t, locale]);
}
