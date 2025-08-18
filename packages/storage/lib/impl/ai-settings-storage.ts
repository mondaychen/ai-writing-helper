import { createStorage, StorageEnum } from '../base/index.js';
import { DEFAULT_AI_SETTINGS, type ProviderType } from '../const.js';
import type { BaseStorageType } from '../types.js';

interface AISettingsType {
  apiKey: string;
  baseUrl?: string | undefined;
  modelName: string;
  provider: ProviderType;
  defaultPrompt?: string;
}

type AISettingsStorageType = BaseStorageType<AISettingsType>;

const storage = createStorage<AISettingsType>(
  'ai-settings-storage-key',
  {
    ...DEFAULT_AI_SETTINGS,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const aiSettingsStorage: AISettingsStorageType = {
  ...storage,
};

export { type AISettingsType, type AISettingsStorageType, aiSettingsStorage };
