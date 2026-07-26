import Link from "next/link"
import {
  Bot,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Navigation,
  Search,
  Globe,
  Zap,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function Page() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,var(--color-primary)_0%,transparent_100%)] opacity-15 blur-3xl" />

          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="size-3.5 text-primary" />
              Hainova AI Platform
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl/tight">
              Explore the world with{" "}
              <span className="bg-linear-to-r from-primary via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Hainova AI
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Hainova combines smart AI recommendations with real-time Google Places search and interactive map embeds. Find great spots nearby or get conversational local recommendations in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/chat"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}
              >
                <Bot className="size-5" />
                Try AI Chat Assistant
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/maps"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "gap-2 px-6")}
              >
                <MapPin className="size-5" />
                Explore Maps & Places
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Chat Feature Card */}
            <Card className="relative flex flex-col justify-between overflow-hidden border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Bot className="size-32 text-primary" />
              </div>
              <CardHeader className="pb-4">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </div>
                <CardTitle className="text-xl">AI Location Assistant</CardTitle>
                <CardDescription className="text-sm">
                  Conversational assistant equipped with location context to suggest places, answer queries, and plan outings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Navigation className="size-4 text-primary shrink-0" />
                  <span>Integrated browser geolocation support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary shrink-0" />
                  <span>Real-time streaming responses powered by AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary shrink-0" />
                  <span>Interactive place modals & recommendation cards</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Link
                  href="/chat"
                  className={cn(buttonVariants(), "w-full gap-2")}
                >
                  Open AI Chat
                  <ArrowRight className="size-4" />
                </Link>
              </CardFooter>
            </Card>

            {/* Maps Feature Card */}
            <Card className="relative flex flex-col justify-between overflow-hidden border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <MapPin className="size-32 text-primary" />
              </div>
              <CardHeader className="pb-4">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </div>
                <CardTitle className="text-xl">Place & Maps Explorer</CardTitle>
                <CardDescription className="text-sm">
                  Search points of interest, restaurants, or landmarks with live Google Places data and embedded map views.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-primary shrink-0" />
                  <span>Text search with optional location bias (nearby radius)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>Detailed place information, ratings, and addresses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary shrink-0" />
                  <span>Google Maps interactive embed integration</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Link
                  href="/maps"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
                >
                  Open Maps & Places
                  <ArrowRight className="size-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            <span className="font-semibold text-foreground">Hainova</span>
            <span>— Intelligent Location & AI Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/chat" className="hover:underline">
              AI Chat (<code className="rounded bg-muted px-1">/chat</code>)
            </Link>
            <Link href="/maps" className="hover:underline">
              Maps (<code className="rounded bg-muted px-1">/maps</code>)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
