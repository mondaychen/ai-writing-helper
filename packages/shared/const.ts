export const PROJECT_URL_OBJECT = {
  url: 'https://github.com/mondaychen/ai-writing-helper',
} as const;

export const AI_PROVIDER = {
  OPENAI: 'openai',
  GOOGLE: 'google',
} as const;

export type ProviderType = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
