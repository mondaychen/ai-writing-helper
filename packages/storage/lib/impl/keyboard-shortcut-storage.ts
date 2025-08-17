import { createStorage, StorageEnum } from '../base/index.js';

interface KeyboardShortcutType {
  modifiers: string[];
  key: string;
}

interface KeyboardShortcutStorageType {
  get: () => Promise<KeyboardShortcutType>;
  set: (value: KeyboardShortcutType | ((prev: KeyboardShortcutType) => KeyboardShortcutType)) => Promise<void>;
  getSnapshot: () => KeyboardShortcutType | null;
  subscribe: (listener: () => void) => () => void;
}

const storage = createStorage<KeyboardShortcutType>(
  'keyboard-shortcut-storage-key',
  {
    modifiers: ['ctrlKey', 'shiftKey'],
    key: 'E',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const keyboardShortcutStorage: KeyboardShortcutStorageType = {
  ...storage,
};

export { type KeyboardShortcutType, type KeyboardShortcutStorageType, keyboardShortcutStorage };
