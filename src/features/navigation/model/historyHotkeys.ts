export function isEditableNavigationTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function getHistoryHotkeyDirection(event: KeyboardEvent): -1 | 0 | 1 {
  if (isEditableNavigationTarget(event.target)) return 0;
  if (!(event.ctrlKey || event.metaKey)) return 0;
  if (event.altKey || event.key.toLowerCase() !== "z") return 0;
  return event.shiftKey ? 1 : -1;
}
