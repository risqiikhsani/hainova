'use client';

import { useState } from 'react';
import { FileText, Loader2, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './markdown-renderer';

export interface TavilyExtractInput {
  urls?: string[];
  extractDepth?: 'basic' | 'advanced';
}

export interface TavilyExtractedPage {
  url: string;
  title: string;
  rawContent: string;
  favicon?: string | null;
  images?: string[];
}

export interface TavilyExtractOutput {
  responseTime?: number;
  results?: TavilyExtractedPage[];
  failedResults?: Array<{ url: string; error?: string }>;
  error?: string;
}

interface TavilyExtractCardProps {
  input?: TavilyExtractInput;
  output?: TavilyExtractOutput | null;
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

export function TavilyExtractCard({
  input,
  output,
  state,
  errorText,
}: TavilyExtractCardProps) {
  const [expandedUrls, setExpandedUrls] = useState<Record<string, boolean>>({});

  const isError = state === 'output-error' || !!output?.error;
  const errorMessage = output?.error || errorText || 'Extraction failed';
  const urlsCount = input?.urls?.length || output?.results?.length || 0;

  const toggleExpand = (url: string) => {
    setExpandedUrls((prev) => ({ ...prev, [url]: !prev[url] }));
  };

  return (
    <div className="mb-3 space-y-2.5">
      {/* Status Badge */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-background/70 border border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-indigo-500 shrink-0 animate-pulse" />
          {state === 'output-available' && !isError ? (
            <span className="truncate">
              Extracted content from{' '}
              <strong className="text-foreground">
                {urlsCount} {urlsCount === 1 ? 'web page' : 'web pages'}
              </strong>
            </span>
          ) : isError ? (
            <span className="text-destructive truncate">Extraction failed: {errorMessage}</span>
          ) : (
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-500 shrink-0" />
              Extracting page content using Tavily...
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

      {/* Extracted Content Results */}
      {state === 'output-available' && !isError && (
        <div className="space-y-2.5">
          {output?.results && output.results.length > 0 ? (
            output.results.map((page, idx) => {
              const domain = getDomain(page.url);
              const isExpanded = !!expandedUrls[page.url];
              const previewContent = page.rawContent.slice(0, 320);

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/70 bg-background/90 p-3 shadow-2xs space-y-2"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {page.favicon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={page.favicon}
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

                      <h4 className="font-semibold text-xs text-foreground leading-snug line-clamp-1">
                        {page.title}
                      </h4>
                    </div>

                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-muted/50 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Body Content Preview */}
                  <div className="relative rounded-lg border border-border/40 bg-muted/30 p-2.5 text-xs leading-relaxed text-muted-foreground">
                    <div className={isExpanded ? 'max-h-96 overflow-y-auto pr-1' : 'line-clamp-3'}>
                      <MarkdownRenderer
                        content={isExpanded ? page.rawContent : `${previewContent}${page.rawContent.length > 320 ? '...' : ''}`}
                      />
                    </div>

                    {page.rawContent.length > 320 && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(page.url)}
                          className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-2"
                        >
                          {isExpanded ? (
                            <>
                              <span>Collapse content</span>
                              <ChevronUp className="ml-1 h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>Show full extracted content ({Math.round(page.rawContent.length / 1024 * 10) / 10} KB)</span>
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-center text-xs text-muted-foreground">
              No content extracted from the provided URL(s).
            </div>
          )}

          {/* Failed URLs if any */}
          {output?.failedResults && output.failedResults.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Failed to extract some URLs:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                {output.failedResults.map((failed, i) => (
                  <li key={i} className="truncate">
                    {failed.url} ({failed.error})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
