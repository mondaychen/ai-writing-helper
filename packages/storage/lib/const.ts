export const AI_PROVIDER = {
  OPENAI: 'openai',
  GOOGLE: 'google',
} as const;

export type ProviderType = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const DEFAULT_AI_SETTINGS = {
  apiKey: '',
  baseUrl: undefined,
  modelName: 'gpt-4o-mini',
  provider: AI_PROVIDER.OPENAI,
} as const;

export const RECOMMENDED_MODEL_BY_PROVIDER = {
  [AI_PROVIDER.OPENAI]: 'gpt-4o-mini',
  [AI_PROVIDER.GOOGLE]: 'gemini-2.5-flash',
} as const;
