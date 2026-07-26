'use client';

import { Trash2, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from './model-selector';

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  geoStatus: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';
  coords: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
}

export function ChatHeader({
  onClear,
  hasMessages,
  geoStatus,
  coords,
  onRequestLocation,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold leading-tight tracking-tight">
            Hainova AI
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Smart assistant powered by Vercel AI SDK
          </p>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <ModelSelector />
      </div>

      <div className="flex items-center gap-2">
        {geoStatus === 'granted' ? (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Location Active</span>
          </div>
        ) : geoStatus === 'loading' ? (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline">Locating...</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestLocation}
            className="h-8 gap-1.5 text-xs font-medium"
            title="Share current location for 'near me' search"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Use Location</span>
          </Button>
        )}

        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}
      </div>
    </header>
  );
}
