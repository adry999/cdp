export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'codepedia:theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/** A stored choice wins; without one the system preference decides. */
export function resolveInitialTheme(stored: string | null | undefined, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored
  return prefersDark ? 'dark' : 'light'
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}

/**
 * Inline <head> script: sets data-theme on <html> before first paint so there is no flash.
 * Same rule as resolveInitialTheme (a test runs both); it must stay ES5 and self-contained.
 */
export const THEME_INIT_SCRIPT =
  `try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");` +
  `var t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");` +
  `document.documentElement.dataset.theme=t}catch(e){}`
