/** True for Ctrl+S / Cmd+S, the admin "save" shortcut. */
export function isSaveShortcut(event: { key: string; code?: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && (event.key.toLowerCase() === 's' || event.code === 'KeyS')
}
