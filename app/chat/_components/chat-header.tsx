'use client';

import { Sparkles, Trash2, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold leading-tight tracking-tight">
              Hainova AI
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              gpt-4o-mini
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Smart assistant powered by Vercel AI SDK
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {geoStatus === 'granted' ? (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Location Active</span>
          </div>
        ) : geoStatus === 'loading' ? (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Locating...</span>
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
            Clear Chat
          </Button>
        )}
      </div>
    </header>
  );
}
