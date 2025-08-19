export const PROJECT_URL_OBJECT = {
  url: 'https://github.com/mondaychen/ai-writing-helper',
} as const;

export const AI_PROVIDER = {
  OPENAI: 'openai',
  GOOGLE: 'google',
} as const;

export type ProviderType = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const IFRAME_MESSAGE_TYPE = {
  SHOW_IFRAME: 'SHOW_IFRAME',
  HIDE_IFRAME: 'HIDE_IFRAME',
} as const;

export const IFRAME_MESSAGE_EVENT_NAME = 'CEB:extension:iframe:message';
