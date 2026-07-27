"use client"

import {
  Sparkles,
  CloudSun,
  MapPin,
  Globe,
  FileText,
} from "lucide-react"
import { Card } from "@/components/ui/card"

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void
}

const SUGGESTED_PROMPTS = [
  {
    icon: MapPin,
    title: "Show me top-rated hotels and ramen spots near Tokyo station.",
    subtitle: "Find places somewhere or nearby.",
    prompt: "Show me top-rated hotels and ramen spots near Tokyo station.",
  },
  {
    icon: CloudSun,
    title: "What's the weather in Tokyo right now?",
    subtitle: "Get live weather information for any location.",
    prompt: "What's the weather in Tokyo right now?",
  },
  {
    icon: Globe,
    title: "What is the winner of FIFA World Cup 2026?",
    subtitle: "Search for information on the web.",
    prompt: "What is the winner of FIFA World Cup 2026?",
  },
  {
    icon: FileText,
    title:
      "Extract and summarize content from https://en.wikipedia.org/wiki/Cat_food",
    subtitle: "Extract and summarize content from website.",
    prompt:
      "Extract and summarize content from https://en.wikipedia.org/wiki/Cat_food",
  },
]

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-1 animate-in flex-col items-center justify-center p-6 text-center duration-500 fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <Sparkles className="h-8 w-8 animate-pulse" />
      </div>

      <h2 className="mb-1 text-2xl font-bold tracking-tight">
        How can I help you today?
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Ask a question, check live weather, draft content, or get help with your
        code.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group relative flex cursor-pointer flex-col items-start p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:translate-y-0"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
