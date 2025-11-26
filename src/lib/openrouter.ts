import { ChatOpenAI } from "@langchain/openai";

/**
 * ChatOpenRouter - A LangChain compatible chat model for OpenRouter
 * Uses OpenRouter's API with any supported model
 */
export class ChatOpenRouter extends ChatOpenAI {
  constructor({
    modelName = "google/gemini-2.5-flash",
    openAIApiKey,
    ...kwargs
  }: {
    modelName?: string;
    openAIApiKey?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: unknown;
  } = {}) {
    const apiKey = openAIApiKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is required. Please set it in your environment variables."
      );
    }

    super({
      modelName,
      openAIApiKey: apiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      ...kwargs,
    });
  }
}

/**
 * Get a pre-configured OpenRouter model instance
 */
export function getOpenRouterModel(options?: {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return new ChatOpenRouter({
    modelName: options?.modelName || "google/gemini-2.5-flash",
    temperature: options?.temperature ?? 0.1,
    maxTokens: options?.maxTokens,
  });
}

