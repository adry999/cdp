/** True for Ctrl+S / Cmd+S, the admin "save" shortcut. */
export function isSaveShortcut(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 's'
}
