import type { KeyboardShortcutType } from '@extension/storage';

/**
 * Available modifier keys for keyboard shortcuts
 */
export const MODIFIER_KEYS = {
  CTRL: 'ctrlKey',
  SHIFT: 'shiftKey',
  ALT: 'altKey',
  META: 'metaKey',
} as const;

/**
 * Display names for modifier keys
 */
export const MODIFIER_DISPLAY_NAMES = {
  [MODIFIER_KEYS.CTRL]: 'Ctrl',
  [MODIFIER_KEYS.SHIFT]: 'Shift',
  [MODIFIER_KEYS.ALT]: 'Alt',
  [MODIFIER_KEYS.META]: 'Cmd',
} as const;

/**
 * All available modifier keys as an array
 */
export const ALL_MODIFIER_KEYS = Object.values(MODIFIER_KEYS);

/**
 * Get the display name for a modifier key
 */
export const getModifierDisplayName = (modifier: string): string => {
  return MODIFIER_DISPLAY_NAMES[modifier as keyof typeof MODIFIER_DISPLAY_NAMES] || modifier;
};

/**
 * Format a keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcutType | undefined): string | null => {
  if (!shortcut?.enabled) return null;

  const modifiers = shortcut.modifiers.map(mod => getModifierDisplayName(mod)).join('+');

  return `${modifiers}+${shortcut.key}`;
};

/**
 * Validate that a shortcut has at least one modifier when enabled
 */
export const validateShortcut = (shortcut: KeyboardShortcutType, shortcutName: string): string | null => {
  if (shortcut.enabled && shortcut.modifiers.length === 0) {
    return `Please select at least one modifier for the ${shortcutName} shortcut. Shortcuts without modifiers will conflict with everyday typing.`;
  }
  return null;
};

/**
 * Create a function that checks if a keyboard event matches a shortcut
 */
export const createShortcutMatcher = (shortcut: KeyboardShortcutType): ((e: KeyboardEvent) => boolean) | null => {
  if (!shortcut.enabled || shortcut.modifiers.length === 0) {
    return null;
  }

  const modifierChecks: ((e: KeyboardEvent) => boolean)[] = [];
  const targetKey = shortcut.key.toUpperCase();

  for (const modifier of shortcut.modifiers) {
    switch (modifier) {
      case MODIFIER_KEYS.CTRL:
        modifierChecks.push((e: KeyboardEvent) => e.ctrlKey);
        break;
      case MODIFIER_KEYS.SHIFT:
        modifierChecks.push((e: KeyboardEvent) => e.shiftKey);
        break;
      case MODIFIER_KEYS.ALT:
        modifierChecks.push((e: KeyboardEvent) => e.altKey);
        break;
      case MODIFIER_KEYS.META:
        modifierChecks.push((e: KeyboardEvent) => e.metaKey);
        break;
    }
  }

  return (e: KeyboardEvent) => {
    if (e.key.toUpperCase() !== targetKey) return false;
    for (const check of modifierChecks) {
      if (!check(e)) return false;
    }
    return true;
  };
};

/**
 * Check if any shortcuts are enabled
 */
export const hasEnabledShortcuts = (shortcuts: {
  dialog?: KeyboardShortcutType;
  sidePanel?: KeyboardShortcutType;
}): boolean => {
  return shortcuts.dialog?.enabled || shortcuts.sidePanel?.enabled || false;
};
