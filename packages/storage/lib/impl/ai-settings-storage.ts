import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

interface AISettingsType {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

type AISettingsStorageType = BaseStorageType<AISettingsType>;

const storage = createStorage<AISettingsType>(
  'ai-settings-storage-key',
  {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
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
