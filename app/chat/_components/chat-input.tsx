'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.form;
        if (form) form.requestSubmit();
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/80 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xs transition-within focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hainova AI anything... (Press Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-hidden placeholder:text-muted-foreground/70 min-h-[40px] max-h-[200px]"
        />

        {isLoading ? (
          <Button
            type="button"
            size="icon"
            onClick={stop}
            variant="destructive"
            className="h-9 w-9 shrink-0 rounded-xl transition-all"
            title="Stop generating"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-9 w-9 shrink-0 rounded-xl transition-all disabled:opacity-40"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
        AI responses may occasionally contain inaccuracies. Configure <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">OPENAI_API_KEY</code> in <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">.env.local</code> to activate live API.
      </p>
    </div>
  );
}
