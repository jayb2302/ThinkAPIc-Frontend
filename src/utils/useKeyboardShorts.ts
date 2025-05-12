import { onMounted, onBeforeUnmount } from 'vue';

type ShortcutHandler = {
  combo: string; // e.g. "⌘+Q"
  callback: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandler[]) {
  const normalizeKey = (e: KeyboardEvent) => {
    let combo = '';
    if (e.metaKey) combo += '⌘+';
    if (e.ctrlKey) combo += '⌃+';
    if (e.altKey) combo += '⌥+';
    if (e.shiftKey) combo += '⇧+';
    combo += e.key.toUpperCase();
    return combo;
  };
  const listener = (e: KeyboardEvent) => {
    const pressed = normalizeKey(e);
    handlers.forEach(({ combo, callback }) => {
      if (pressed === combo.toUpperCase()) {
        e.preventDefault();
        callback();
      }
    });
  };

  if (typeof window !== 'undefined') {
    onMounted(() => window.addEventListener('keydown', listener));
    onBeforeUnmount(() => window.removeEventListener('keydown', listener));
  }
}