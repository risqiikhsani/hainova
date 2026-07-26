export type AIProvider = 'openai' | 'google' | 'ollama';

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  supportsTools?: boolean;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  models: ModelOption[];
  defaultModel: string;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
}

export const AI_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry standard models with high reasoning capability and tool integration.',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, lightweight & highly capable', supportsTools: true },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'High intelligence & complex reasoning', supportsTools: true },
    ],
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini models featuring fast response times and large context capabilities.',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Next-gen fast multimodal model', supportsTools: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Lightweight version of Gemini 2.5 Flash', supportsTools: true },
    ],
    defaultModel: 'gemini-2.5-flash-lite',
    requiresApiKey: true,
    apiKeyEnvVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run open-source LLMs locally on your own machine.',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', description: 'Meta lightweight open model', supportsTools: true },
      { id: 'mistral', name: 'Mistral 7B', description: 'High performance open model', supportsTools: true },
      { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Open reasoning LLM', supportsTools: false },
      { id: 'qwen2.5', name: 'Qwen 2.5', description: 'Alibaba open multilingual LLM', supportsTools: true },
      { id: 'custom', name: 'Custom Model...', description: 'Specify any local model tag', supportsTools: true },
    ],
    defaultModel: 'llama3.2',
    requiresApiKey: false,
  },
};
