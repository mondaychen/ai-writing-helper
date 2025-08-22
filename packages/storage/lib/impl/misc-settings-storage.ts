import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

interface MiscSettingsType {
  emDashReplacement: {
    enabled: boolean;
    replacement: string;
  };
}

type MiscSettingsStorageType = BaseStorageType<MiscSettingsType>;

const storage = createStorage<MiscSettingsType>(
  'misc-settings-storage-key',
  {
    emDashReplacement: {
      enabled: false,
      replacement: ' — ',
    },
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const miscSettingsStorage: MiscSettingsStorageType = {
  ...storage,
};

export { type MiscSettingsType, type MiscSettingsStorageType, miscSettingsStorage };
