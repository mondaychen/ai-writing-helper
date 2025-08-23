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

const DEFAULT_STYLE_INSTRUCTIONS: Array<StyleInstructionItemType> = [
  {
    title: 'Default',
    description: 'Rewrite my text in clear, natural English while keeping my tone.',
  },
  {
    title: 'Grammar & Spelling',
    description: 'Correct grammar and spelling without changing my style.',
  },
  {
    title: 'emoji',
    description: 'Rewrite with emojis only',
  },
];

const storage = createStorage<StyleInstructionStateType>(
  'style-instruction-storage-key',
  {
    items: DEFAULT_STYLE_INSTRUCTIONS,
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
