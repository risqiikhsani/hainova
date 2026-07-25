'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('space-y-2 text-sm leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-3 mb-1.5 text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mt-2.5 mb-1 text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0 text-foreground/90">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside my-2 space-y-1 pl-4 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside my-2 space-y-1 pl-4 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-normal pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/60 pl-3 my-2 italic text-muted-foreground bg-muted/40 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-background/80 border border-border/60 px-1.5 py-0.5 font-mono text-xs text-foreground font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn('block font-mono text-xs text-foreground', className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-xl bg-zinc-950 dark:bg-zinc-900 border border-border p-3.5 font-mono text-xs text-zinc-100 shadow-2xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border/80">
              <table className="w-full text-left text-xs text-foreground">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/80 border-b border-border font-semibold">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-foreground font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-foreground/90">{children}</td>,
          hr: () => <hr className="my-3 border-border/60" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
