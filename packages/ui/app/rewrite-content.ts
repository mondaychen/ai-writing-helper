import { generateObject } from 'ai';
import type { ProviderV2 } from '@ai-sdk/provider';
import { z } from 'zod';

const schema = z.object({
  reason: z.string(),
  rewrittenContent: z.string(),
});

const systemPrompt = `You are a writing assistant.
User will provide you a XML with content to rewrite, as well as preferred style.
You will rewrite the content according to the user's instruction. You will return a JSON object with the following fields:
- reason: a short, brief explanation of why you made the changes
- rewrittenContent: the rewritten content per user's instruction (just the content, no XML tags)
`;

const promptMaker = (editorContent: string, prompt: string) => {
  return `<xml>
  <style>
    ${prompt}
  </style>
  <content>
    ${editorContent}
  </content>
</xml>`;
};

export const rewriteContent = async (
  provider: ProviderV2,
  editorContent: string,
  prompt: string,
): Promise<z.infer<typeof schema>> => {
  const response = await generateObject({
    model: provider.languageModel('gpt-4o'),
    schema,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: promptMaker(editorContent, prompt),
      },
    ],
  });

  const rewrittenText = response.object.rewrittenContent;

  if (rewrittenText) {
    return {
      reason: response.object.reason,
      rewrittenContent: rewrittenText,
    };
  } else {
    throw new Error('No content received from API');
  }
};
