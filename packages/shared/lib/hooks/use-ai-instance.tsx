import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type ProviderType = 'openai' | 'google';

export const useAiInstance = (provider: ProviderType, baseURL: string | undefined, apiKey: string | undefined) => {
  if (provider === 'openai') {
    return createOpenAI({
      baseURL,
      apiKey,
    });
  }
  return createGoogleGenerativeAI({
    baseURL,
    apiKey,
  });
};
