import { THEME_STORAGE_KEY, isTheme, oppositeTheme, resolveInitialTheme, type Theme } from '#layers/core/shared/utils/theme'

// The page theme. The inline <head> script (THEME_INIT_SCRIPT) sets data-theme before first
// paint; this state starts as 'light' on server and client alike and syncs from the DOM after
// hydration (initTheme), so SSR markup never mismatches. Icons switch with CSS, not this state.
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function readStored(): string | null {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      return null
    }
  }

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
  }

  function toggleTheme() {
    const next = oppositeTheme(theme.value)
    apply(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the choice lasts until the page is closed.
    }
  }

  // Client only, once: adopt what the head script chose and follow the system while no choice is stored.
  function initTheme() {
    const fromDom = document.documentElement.dataset.theme
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    theme.value = isTheme(fromDom) ? fromDom : resolveInitialTheme(readStored(), mq.matches)
    mq.addEventListener('change', (event) => {
      if (!isTheme(readStored())) apply(event.matches ? 'dark' : 'light')
    })
  }

  return { theme, toggleTheme, initTheme }
}
