# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Run development server: `pnpm dev`
- Build the production app: `pnpm build`
- Start the production build: `pnpm start`
- Run linting: `pnpm lint`
- Run typecheck: `pnpm typecheck`
- Format code: `pnpm format`
- Add shadcn UI component: `npx shadcn@latest add <component-name>`

## Codebase Architecture

### Core Structure
- `app/` - Next.js App Router folders, page components, and backend API routes.
- `components/` - Shared React components. UI primitives reside in `components/ui/`.
- `hooks/` - Custom hooks for client interactions (`useGeolocation` and API routes query helpers `usePlaces`).
- `lib/` - Shared helper utilities, such as `lib/utils.ts` for styling.
- `types/` - TypeScript interface and type declarations (`types/places.ts`).

### Guidelines & Conventions
- **Next.js 16 Parameters**: Route parameters (e.g., in layouts, pages, and route handlers) are `Promise` objects. Always type them as `Promise<{ paramName: string }>` and `await` them before referencing properties.
- **Styling**: Tailwind CSS v4 is used with PostCSS. Custom theme variables and utility styles are configured directly in `app/globals.css` (inside `@theme inline` block). Use the `cn` utility function for merging CSS classes.
- **Client/Server Boundary**: Client-side components must use the `"use client"` directive. All Google API interactions must go through server-side proxy routes (`app/api/places/...` and `app/api/maps/...`) to avoid exposing credentials (uses `GOOGLE_MAPS_API_KEY`).
- **Imports**: Use the path mapping prefix `@/` (defined in `tsconfig.json`) to refer to the project directories (e.g., `@/components/ui/button`).
