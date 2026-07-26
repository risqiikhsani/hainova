# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Run development server: `pnpm dev`
- Build production app: `pnpm build`
- Start production build: `pnpm start`
- Run linting: `pnpm lint`
- Run typecheck: `pnpm typecheck`
- Format code: `pnpm format`
- Add shadcn UI component: `npx shadcn@latest add <component-name>`

## Codebase Architecture

### Overview & Core Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4 with PostCSS. Theme variables and custom utilities are defined in `@theme inline` in `app/globals.css`. UI primitives are powered by Base UI & Shadcn (`components/ui/`).
- **AI Integration**: Multi-provider support using Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `ollama-ai-provider`) in `app/api/chat/route.ts`. Supports OpenAI (`gpt-4o-mini`, `gpt-4o`, `o3-mini`), Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-flash`), and local Ollama (`llama3.2`, `mistral`, `deepseek-r1`, `qwen2.5`, or custom model tags) with streaming (`toUIMessageStreamResponse`) and tool calling (`searchPlaces`, `getWeather`).
- **State Management**: Zustand for global client-side state (e.g. `hooks/use-geolocation.ts`, `hooks/use-model-settings.ts`).

### Key Directory Structure
- `app/` - App Router pages (`/chat`, `/maps`), layout, and server-side API proxy routes (`app/api/chat`, `app/api/places`, `app/api/maps`).
- `app/chat/_components/` & `app/maps/_components/` - Page-specific UI components (e.g. `ModelSelector`).
- `components/` - Shared components; UI primitives reside in `components/ui/`.
- `hooks/` - Custom React hooks (`useGeolocation`, `usePlaces`, `useModelSettings`).
- `lib/` - Utilities (`lib/utils.ts` with `cn` class merger).
- `types/` - TypeScript interface declarations (`types/places.ts`, `types/models.ts`).

## Guidelines & Conventions

- **Next.js 16 Parameters**: Dynamic route parameters in pages, layouts, and route handlers are `Promise` objects. Type them as `Promise<{ paramName: string }>` and `await` them before reading properties.
- **Client/Server Boundary**: Add `"use client"` to interactive components. All third-party API interactions (Google Places, OpenWeatherMap) must go through server API routes to keep API keys (`GOOGLE_MAPS_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENWEATHERMAP_API_KEY`) secure.
- **AI SDK Conventions**: AI SDK v5+ standards are used in `app/api/chat/route.ts` (`convertToModelMessages`, `inputSchema` for tools, `stopWhen: stepCountIs(...)`, and `toUIMessageStreamResponse`).
- **Imports**: Use `@/` path alias for root directory imports (e.g. `@/components/ui/button`).
