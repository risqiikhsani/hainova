'use client';

import { useState } from 'react';
import { UIMessage, isToolUIPart, getToolName } from 'ai';
import { Bot, User, Copy, Check, Loader2, Wrench, MapPin, Star, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './markdown-renderer';
import { PlaceDetailModal } from './place-detail-modal';
import { TavilySearchCard, TavilySearchInput, TavilySearchOutput } from './tavily-search-card';
import { TavilyExtractCard, TavilyExtractInput, TavilyExtractOutput } from './tavily-extract-card';
import { WeatherCard, GetWeatherInput, GetWeatherOutput } from './weather-card';

const PRICE_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

// Shapes for the two tools we render specially. Adjust to match your
// actual tool's inputSchema / execute return type.
interface SearchPlacesInput {
  textQuery?: string;
  useUserLocation?: boolean;
}
interface SearchPlacesOutput {
  query?: string;
  totalResults?: number;
  places?: {
    id: string;
    displayName: string;
    formattedAddress: string;
    rating?: number | null;
    userRatingCount?: number;
    priceLevel?: string | null;
    primaryTypeDisplayName?: string | null;
    mapsUrl?: string;
  }[];
  error?: string;
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
}

// Pull the plain text out of a message's parts, for copy-to-clipboard.
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n\n');
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isCopied = copiedId === message.id;
        const textContent = getMessageText(message);

        return (
          <div
            key={message.id}
            className={cn(
              'group relative flex items-start gap-3 transition-all',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold shadow-xs',
                isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted border border-border text-foreground'
              )}
            >
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
            </div>

            {/* Bubble Container */}
            <div
              className={cn(
                'relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs transition-all md:max-w-[75%]',
                isUser
                  ? 'bg-primary text-primary-foreground rounded-tr-xs'
                  : 'bg-muted/70 border border-border/60 text-foreground rounded-tl-xs'
              )}
            >
              {/* Parts: text + tool calls, rendered in order */}
              {message.parts.map((part, index) => {
                // --- Plain text ---
                if (part.type === 'text') {
                  return isUser ? (
                    <div
                      key={index}
                      className="whitespace-pre-wrap leading-relaxed wrap-break-word"
                    >
                      {part.text}
                    </div>
                  ) : (
                    <MarkdownRenderer key={index} content={part.text} />
                  );
                }

                // --- searchPlaces tool ---
                if (part.type === 'tool-searchPlaces') {
                  const input = part.input as SearchPlacesInput | undefined;
                  const output =
                    part.state === 'output-available'
                      ? (part.output as SearchPlacesOutput)
                      : null;

                  return (
                    <div key={part.toolCallId} className="mb-3 space-y-2">
                      <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs">
                        <MapPin className="h-4 w-4 text-emerald-500 animate-pulse" />
                        {part.state === 'output-available' ? (
                          <span>
                            Found{' '}
                            <strong className="text-foreground">
                              {output?.places?.length || 0} places
                            </strong>{' '}
                            for &quot;<strong className="text-foreground">{input?.textQuery}</strong>&quot;
                            {input?.useUserLocation ? ' near your location' : ''}
                          </span>
                        ) : part.state === 'output-error' ? (
                          <span className="text-destructive">
                            Search failed: {part.errorText}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Searching Google Places for &quot;
                            <strong className="text-foreground">{input?.textQuery}</strong>&quot;...
                          </span>
                        )}
                      </div>

                      {part.state === 'output-available' &&
                        output?.places &&
                        output.places.length > 0 && (
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {output.places.map((place) => (
                              <div
                                key={place.id}
                                onClick={() => setSelectedPlaceId(place.id)}
                                className="group/place-card flex flex-col justify-between gap-2 rounded-xl bg-background border border-border/80 p-3 shadow-2xs text-foreground hover:border-primary/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-1.5">
                                    <h4 className="font-semibold text-xs leading-snug line-clamp-1 group-hover/place-card:text-primary transition-colors">
                                      {place.displayName}
                                    </h4>
                                    {typeof place.rating === 'number' && (
                                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                        {place.rating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed flex items-start gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                    <span>{place.formattedAddress}</span>
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    {place.primaryTypeDisplayName && (
                                      <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                                        {place.primaryTypeDisplayName}
                                      </span>
                                    )}
                                    {place.priceLevel && PRICE_LABELS[place.priceLevel] && (
                                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {PRICE_LABELS[place.priceLevel]}
                                      </span>
                                    )}
                                  </div>

                                  {place.mapsUrl && (
                                    <a
                                      href={place.mapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                                    >
                                      Maps
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                }

                // --- getWeather tool ---
                if (part.type === 'tool-getWeather') {
                  return (
                    <WeatherCard
                      key={part.toolCallId}
                      input={part.input as GetWeatherInput | undefined}
                      output={
                        part.state === 'output-available'
                          ? (part.output as GetWeatherOutput)
                          : null
                      }
                      state={part.state}
                      errorText={part.errorText}
                    />
                  );
                }

                // --- tavilySearch tool ---
                if (part.type === 'tool-tavilySearch') {
                  return (
                    <TavilySearchCard
                      key={part.toolCallId}
                      input={part.input as TavilySearchInput | undefined}
                      output={
                        part.state === 'output-available'
                          ? (part.output as TavilySearchOutput)
                          : null
                      }
                      state={part.state}
                      errorText={part.errorText}
                    />
                  );
                }

                // --- tavilyExtract tool ---
                if (part.type === 'tool-tavilyExtract') {
                  return (
                    <TavilyExtractCard
                      key={part.toolCallId}
                      input={part.input as TavilyExtractInput | undefined}
                      output={
                        part.state === 'output-available'
                          ? (part.output as TavilyExtractOutput)
                          : null
                      }
                      state={part.state}
                      errorText={part.errorText}
                    />
                  );
                }

                // --- Any other tool call (static or dynamic) ---
                // isToolUIPart's type guard already covers both typed
                // (tool-*) and dynamic-tool parts, so check dynamic-tool
                // *inside* the narrowed block rather than OR-ing it in.
                if (isToolUIPart(part)) {
                  const toolName =
                    part.type === 'dynamic-tool' ? part.toolName : getToolName(part);
                  return (
                    <div
                      key={part.toolCallId}
                      className="mb-3 flex items-center gap-2 rounded-xl bg-background/60 border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      <span>Tool: {toolName}</span>
                    </div>
                  );
                }

                return null;
              })}

              {/* Copy action button for assistant messages */}
              {!isUser && textContent && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(message.id, textContent)}
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    title="Copy message"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Indicator */}
      {isLoading && lastMessage?.role !== 'assistant' && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
            <Bot className="h-4 w-4 text-primary animate-spin" />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs bg-muted/70 border border-border/60 px-4 py-3 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
          </div>
        </div>
      )}
      {/* Detail Modal */}
      <PlaceDetailModal
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />
    </div>
  );
}