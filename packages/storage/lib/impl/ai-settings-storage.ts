import { createStorage, StorageEnum } from '../base/index.js';

interface AISettingsType {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface AISettingsStorageType {
  get: () => Promise<AISettingsType>;
  set: (value: AISettingsType | ((prev: AISettingsType) => AISettingsType)) => Promise<void>;
  getSnapshot: () => AISettingsType | null;
  subscribe: (listener: () => void) => () => void;
}

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
