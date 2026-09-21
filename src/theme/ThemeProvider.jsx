import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { DEFAULT_THEME_ID, getTheme, isSupportedTheme, themes } from './themes.js';

/**
 * Applies the active theme by setting `data-theme` on <html>; every colour in
 * the app is a CSS variable, so no component re-renders or re-styles itself.
 */

const ThemeContext = createContext(null);

const BROWSER_UI_COLOUR = { light: '#eff6ff', dark: '#0f172a' };

export function ThemeProvider({ themeId = DEFAULT_THEME_ID, onThemeChange, children }) {
  const activeId = isSupportedTheme(themeId) ? themeId : DEFAULT_THEME_ID;
  const theme = getTheme(activeId);

  useEffect(() => {
    document.documentElement.dataset.theme = activeId;
    document.documentElement.style.colorScheme = theme.scheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', BROWSER_UI_COLOUR[theme.scheme]);
  }, [activeId, theme.scheme]);

  const setTheme = useCallback(
    (next) => {
      if (isSupportedTheme(next)) onThemeChange?.(next);
    },
    [onThemeChange],
  );

  const value = useMemo(() => ({ theme, themeId: activeId, setTheme, themes }), [theme, activeId, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
