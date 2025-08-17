import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

interface KeyboardShortcutType {
  modifiers: string[];
  key: string;
}

type KeyboardShortcutStorageType = BaseStorageType<KeyboardShortcutType>;

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
