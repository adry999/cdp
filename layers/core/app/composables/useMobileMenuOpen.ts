/** Whether the full-screen mobile menu is open. The layouts read it to make `main` and `footer` inert meanwhile. */
export function useMobileMenuOpen() {
  return useState('site-mobile-menu-open', () => false)
}
