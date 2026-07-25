'use client';

import { Sparkles, Code2, Mail, Compass, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Code2,
    title: 'Explain React Server Components',
    subtitle: 'Understand data fetching & performance',
    prompt: 'Can you explain React Server Components and how they differ from Client Components in Next.js 16?',
  },
  {
    icon: Mail,
    title: 'Draft a Professional Email',
    subtitle: 'Communication & tone helper',
    prompt: 'Help me draft a professional email to request project feedback from a client.',
  },
  {
    icon: Compass,
    title: 'Explore Local Places & Routes',
    subtitle: 'Travel & recommendations',
    prompt: 'What are some great strategies for planning a weekend getaway trip with itinerary highlights?',
  },
  {
    icon: HelpCircle,
    title: 'Code Debugging & Refactoring',
    subtitle: 'Clean code & best practices',
    prompt: 'What are the best practices for structuring custom React hooks and managing side effects clean?',
  },
];

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <Sparkles className="h-8 w-8 animate-pulse" />
      </div>

      <h2 className="mb-1 text-2xl font-bold tracking-tight">
        How can I help you today?
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Ask a question, brainstorm ideas, draft content, or get help with your code.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group relative flex cursor-pointer flex-col items-start p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:translate-y-0"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.subtitle}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
