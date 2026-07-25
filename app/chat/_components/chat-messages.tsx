'use client';

import { useState } from 'react';
import { Message } from 'ai';
import { Bot, User, Copy, Check, CloudSun, Loader2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './markdown-renderer';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isCopied = copiedId === message.id;

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
              {/* Tool Invocations Display */}
              {message.toolInvocations && message.toolInvocations.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.toolInvocations.map((toolInvocation) => {
                    const { toolName, toolCallId, state } = toolInvocation;

                    if (toolName === 'getWeather') {
                      const args = toolInvocation.args as { city?: string };
                      return (
                        <div
                          key={toolCallId}
                          className="flex items-center gap-2 rounded-xl bg-background/60 border border-border px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs"
                        >
                          <CloudSun className="h-4 w-4 text-amber-500 animate-pulse" />
                          {state === 'result' ? (
                            <span>
                              Retrieved live weather data for{' '}
                              <strong className="text-foreground">{args?.city}</strong>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              Fetching OpenWeatherMap data for{' '}
                              <strong className="text-foreground">{args?.city}</strong>...
                            </span>
                          )}
                        </div>
                      );
                    }

                    // Generic tool call fallback
                    return (
                      <div
                        key={toolCallId}
                        className="flex items-center gap-2 rounded-xl bg-background/60 border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
                      >
                        <Wrench className="h-3.5 w-3.5 text-primary" />
                        <span>Tool: {toolName}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Content */}
              {message.content && (
                isUser ? (
                  <div className="whitespace-pre-wrap leading-relaxed break-words">
                    {message.content}
                  </div>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )
              )}

              {/* Copy action button for assistant messages */}
              {!isUser && message.content && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(message.id, message.content)}
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
      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
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
    </div>
  );
}
