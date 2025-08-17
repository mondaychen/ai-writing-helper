import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AI_PROVIDER, type ProviderType } from '@extension/storage';

export const useAiInstance = (provider: ProviderType, baseURL: string | undefined, apiKey: string | undefined) => {
  const baseURLValue = baseURL || undefined; // explicitly set undefined to avoid empty string
  const apiKeyValue = apiKey || undefined;
  if (provider === AI_PROVIDER.OPENAI) {
    return createOpenAI({
      baseURL: baseURLValue,
      apiKey: apiKeyValue,
    });
  }
  return createGoogleGenerativeAI({
    baseURL: baseURLValue,
    apiKey: apiKeyValue,
  });
};
