import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../types.js';

export interface StyleInstructionItemType {
  title: string;
  description: string;
}

export interface StyleInstructionStateType {
  items: Array<StyleInstructionItemType>;
}

type StyleInstructionStorageType = BaseStorageType<StyleInstructionStateType>;

const storage = createStorage<StyleInstructionStateType>(
  'style-instruction-storage-key',
  {
    items: [],
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const styleInstructionStorage: StyleInstructionStorageType = {
  ...storage,
};

export { type StyleInstructionStorageType, styleInstructionStorage };
