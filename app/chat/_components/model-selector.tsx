'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Cpu,
  Globe,
  HardDrive,
  Sparkles,
  Settings2,
  Check,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModelSettings } from '@/hooks/use-model-settings';
import { AI_PROVIDERS, AIProvider } from '@/types/models';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    provider,
    modelId,
    customModelId,
    ollamaBaseUrl,
    setProvider,
    setModelId,
    setCustomModelId,
    setOllamaBaseUrl,
    getActiveModelId,
  } = useModelSettings();

  const currentProviderConfig = AI_PROVIDERS[provider];
  const activeModelId = getActiveModelId();

  // Find model display name
  const currentModelOption = currentProviderConfig?.models.find(
    (m) => m.id === modelId
  );
  const displayName =
    modelId === 'custom'
      ? customModelId || 'Custom Model'
      : currentModelOption?.name || modelId;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 gap-1.5 px-2.5 text-xs font-medium bg-background hover:bg-muted transition-colors border-border/60"
      >
        <span className="flex items-center gap-1 text-primary">
          {provider === 'openai' && <Sparkles className="h-3.5 w-3.5" />}
          {provider === 'google' && <Globe className="h-3.5 w-3.5 text-blue-500" />}
          {provider === 'ollama' && <HardDrive className="h-3.5 w-3.5 text-emerald-500" />}
        </span>
        <span className="font-semibold text-foreground">{currentProviderConfig.name}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground truncate max-w-[120px]">{displayName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal / Popover Content */}
          <div className="absolute left-0 top-full z-50 mt-2 w-[340px] sm:w-[380px] rounded-xl border border-border bg-background p-4 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Model Settings</h3>
              </div>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                Vercel AI SDK
              </span>
            </div>

            {/* Provider Tabs */}
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Select Provider
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted p-1">
                {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((pKey) => {
                  const pConfig = AI_PROVIDERS[pKey];
                  const isActive = provider === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setProvider(pKey)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-background text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      <span className="mb-0.5">
                        {pKey === 'openai' && <Sparkles className="h-3.5 w-3.5" />}
                        {pKey === 'google' && <Globe className="h-3.5 w-3.5 text-blue-500" />}
                        {pKey === 'ollama' && <HardDrive className="h-3.5 w-3.5 text-emerald-500" />}
                      </span>
                      <span>{pConfig.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model List */}
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Select Model
              </label>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {currentProviderConfig.models.map((option) => {
                  const isSelected = modelId === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setModelId(option.id)}
                      className={`flex items-start justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary/50 bg-primary/5 text-foreground shadow-2xs'
                          : 'border-border/50 hover:border-border hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                            {option.name}
                          </span>
                          {option.supportsTools && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium"
                              title="Supports searchPlaces and getWeather tool calls"
                            >
                              <Wrench className="h-2.5 w-2.5" />
                              Tools
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Model Input for Ollama */}
            {provider === 'ollama' && modelId === 'custom' && (
              <div className="mt-3 space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Custom Ollama Model Tag
                </label>
                <input
                  type="text"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder="e.g. llama3:8b or deepseek-r1:14b"
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Ollama Endpoint Config */}
            {provider === 'ollama' && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-primary" />
                    Ollama Server Endpoint
                  </label>
                </div>
                <input
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                  Ensure local Ollama service is running (`ollama serve`).
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 text-xs px-3 font-medium"
              >
                Done
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
