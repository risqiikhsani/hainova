'use client';

import { Globe, Loader2, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TavilySearchInput {
  query?: string;
  searchDepth?: 'basic' | 'advanced';
  topic?: 'general' | 'news' | 'finance';
  maxResults?: number;
  includeImages?: boolean;
}

export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score?: number;
  publishedDate?: string | null;
  favicon?: string | null;
}

export interface TavilySearchOutput {
  query?: string;
  answer?: string | null;
  responseTime?: number;
  results?: TavilySearchResultItem[];
  images?: Array<{ url: string; description?: string } | string>;
  error?: string;
}

interface TavilySearchCardProps {
  input?: TavilySearchInput;
  output?: TavilySearchOutput | null;
  state: string;
  errorText?: string;
}

function getDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

export function TavilySearchCard({
  input,
  output,
  state,
  errorText,
}: TavilySearchCardProps) {
  const isError = state === 'output-error' || !!output?.error;
  const errorMessage = output?.error || errorText || 'Search failed';
  const queryText = output?.query || input?.query || 'Web Search';

  return (
    <div className="mb-3 space-y-2.5">
      {/* Header status badge */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-background/70 border border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4 text-sky-500 shrink-0 animate-pulse" />
          {state === 'output-available' && !isError ? (
            <span className="truncate">
              Web search results for &quot;<strong className="text-foreground">{queryText}</strong>&quot;
            </span>
          ) : isError ? (
            <span className="text-destructive truncate">Search failed: {errorMessage}</span>
          ) : (
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="h-3 w-3 animate-spin text-sky-500 shrink-0" />
              Searching web for &quot;<strong className="text-foreground">{queryText}</strong>&quot;...
            </span>
          )}
        </div>

        {state === 'output-available' && !isError && output?.responseTime && (
          <span className="text-[10px] text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded font-mono">
            {output.responseTime}s
          </span>
        )}
      </div>

      {/* Error View */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Output Results */}
      {state === 'output-available' && !isError && (
        <div className="space-y-2.5">
          {/* Direct AI Answer from Tavily if available */}
          {output?.answer && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 text-xs leading-relaxed text-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Search Summary</span>
              </div>
              <p className="text-muted-foreground">{output.answer}</p>
            </div>
          )}

          {/* Results Grid */}
          {output?.results && output.results.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-1">
              {output.results.map((item, idx) => {
                const domain = getDomain(item.url);
                const scorePercent = item.score ? Math.round(item.score * 100) : null;

                return (
                  <div
                    key={idx}
                    className="group/card flex flex-col justify-between gap-1.5 rounded-xl border border-border/70 bg-background/90 p-3 shadow-2xs transition-all hover:border-sky-500/50 hover:shadow-xs"
                  >
                    {/* Domain & Score */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0 text-muted-foreground">
                        {item.favicon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.favicon}
                            alt=""
                            className="h-3.5 w-3.5 shrink-0 rounded-xs object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium">{domain}</span>
                      </div>

                      {scorePercent !== null && (
                        <span
                          className={cn(
                            'shrink-0 rounded px-1.5 py-0.2 text-[10px] font-semibold',
                            scorePercent >= 80
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {scorePercent}% match
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-xs leading-snug text-foreground hover:text-sky-600 dark:hover:text-sky-400 line-clamp-1 transition-colors flex items-center gap-1.5"
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60 group-hover/card:opacity-100 transition-opacity" />
                    </a>

                    {/* Snippet Content */}
                    {item.content && (
                      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-center text-xs text-muted-foreground">
              No search results returned for this query.
            </div>
          )}

          {/* Image Thumbnails if available */}
          {output?.images && output.images.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mb-1.5">
                <ImageIcon className="h-3 w-3" />
                <span>Related Images</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {output.images.slice(0, 6).map((img, idx) => {
                  const imgUrl = typeof img === 'string' ? img : img.url;
                  return (
                    <a
                      key={idx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/img relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted transition-transform hover:scale-105"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt=""
                        className="h-full w-full object-cover transition-opacity group-hover/img:opacity-90"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement?.remove();
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
