import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProvider, AI_PROVIDERS } from '@/types/models';

interface ModelSettingsState {
  provider: AIProvider;
  modelId: string;
  customModelId: string;
  ollamaBaseUrl: string;

  setProvider: (provider: AIProvider) => void;
  setModelId: (modelId: string) => void;
  setCustomModelId: (customId: string) => void;
  setOllamaBaseUrl: (url: string) => void;

  // Helper to resolve active model ID (handles 'custom' tag selection)
  getActiveModelId: () => string;
}

export const useModelSettings = create<ModelSettingsState>()(
  persist(
    (set, get) => ({
      provider: 'openai',
      modelId: 'gpt-4o-mini',
      customModelId: '',
      ollamaBaseUrl: 'http://localhost:11434',

      setProvider: (provider) => {
        const defaultModel = AI_PROVIDERS[provider]?.defaultModel || 'gpt-4o-mini';
        set({ provider, modelId: defaultModel });
      },
      setModelId: (modelId) => set({ modelId }),
      setCustomModelId: (customModelId) => set({ customModelId }),
      setOllamaBaseUrl: (ollamaBaseUrl) => set({ ollamaBaseUrl }),

      getActiveModelId: () => {
        const { modelId, customModelId } = get();
        if (modelId === 'custom') {
          return customModelId.trim();
        }
        return modelId;
      },
    }),
    {
      name: 'hainova-model-settings',
    }
  )
);
