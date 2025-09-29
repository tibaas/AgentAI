import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  // apiKey is read from process.env.OPENAI_API_KEY by default
});