import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

export const UI_MODE = {
  DIALOG: 'dialog',
  SIDE_PANEL: 'side_panel',
} as const;

export type UIModeType = (typeof UI_MODE)[keyof typeof UI_MODE];

interface UIModeSettingsType {
  mode: UIModeType;
}

type UIModeSettingsStorageType = BaseStorageType<UIModeSettingsType>;

const storage = createStorage<UIModeSettingsType>(
  'ui-mode-storage-key',
  {
    mode: UI_MODE.DIALOG,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const uiModeStorage: UIModeSettingsStorageType = {
  ...storage,
};

export { type UIModeSettingsType, type UIModeSettingsStorageType, uiModeStorage };
