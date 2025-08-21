import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

interface KeyboardShortcutType {
  modifiers: string[];
  key: string;
  enabled: boolean;
}

interface KeyboardShortcutsType {
  dialog: KeyboardShortcutType;
  sidePanel: KeyboardShortcutType;
}

type KeyboardShortcutStorageType = BaseStorageType<KeyboardShortcutsType>;

const storage = createStorage<KeyboardShortcutsType>(
  'keyboard-shortcut-storage-key',
  {
    dialog: {
      modifiers: ['ctrlKey', 'shiftKey'],
      key: 'W',
      enabled: true,
    },
    sidePanel: {
      modifiers: ['ctrlKey', 'shiftKey'],
      key: 'S',
      enabled: false,
    },
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const keyboardShortcutStorage: KeyboardShortcutStorageType = {
  ...storage,
};

export {
  type KeyboardShortcutType,
  type KeyboardShortcutsType,
  type KeyboardShortcutStorageType,
  keyboardShortcutStorage,
};
