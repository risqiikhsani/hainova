# 🌐 Hainova

> **AI-Powered Chat meets Location & Real-World Awareness.**  
> Hainova is a modern Next.js 16 application featuring intelligent conversational AI with real-time Google Places awareness, weather updates, interactive maps, multi-LLM provider switching (OpenAI, Gemini, Ollama), and local/global rate-limiting protection.

---

## ✨ Features

- **🤖 Multi-Provider AI Engine**: Switch seamlessly between top-tier AI providers:
  - **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o3-mini`
  - **Google Gemini**: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-flash`
  - **Local Ollama**: `llama3.2`, `mistral`, `deepseek-r1`, `qwen2.5`, or custom model tags
- **📍 Location & Place Awareness**: Built-in AI tool-calling (`searchPlaces`) leverages the Google Places API to discover restaurants, cafes, attractions, and local spots directly in conversation.
- **⛅ Real-Time Weather Integration**: AI tool-calling (`getWeather`) fetches live weather conditions via OpenWeatherMap.
- **🗺️ Interactive Maps & Place Details**: Dedicated maps interface (`/maps`) to browse places, inspect metadata, and view interactive Google Maps embeds.
- **🔐 Built-in Password Protection**: Optional lightweight password barrier to secure public deployments.
- **⚡ Rate Limiting & Safety**: Daily request limits powered by **Upstash Redis** to protect your API keys from overuse.
- **🎨 Sleek Modern UI**: Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Base UI, Shadcn UI primitives, and dark mode support.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: TypeScript
- **AI SDK**: [Vercel AI SDK v4/v5](https://sdk.vercel.ai/docs) (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `ollama-ai-provider-v2`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS + Shadcn UI / Base UI
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (for client geolocation & model preferences)
- **Database / Rate Limiting**: [Upstash Redis](https://upstash.com/) (`@upstash/ratelimit`, `@upstash/redis`)
- **APIs**: Google Maps & Places API, OpenWeatherMap API

---

## 🚀 Getting Started

Follow these steps to set up Hainova locally on your machine.

### Prerequisites

- **Node.js**: v18+ or v20+ recommended
- **Package Manager**: `pnpm` installed globally (`npm i -g pnpm`)
- *(Optional)* **Ollama**: If you wish to run local LLMs (e.g., DeepSeek, Llama 3.2) locally.

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hainova.git
cd hainova
```

### 2. Install Dependencies

```bash
pnpm install
```

---

### 3. Environment Setup (`.env`)

Create a `.env` file in the root directory by copying the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your API credentials:

```env
# Google Maps & Places API Key (Required for location search & map embeds)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API Key (Required if using GPT models)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API Key (Required if using Gemini models)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here

# Ollama Endpoint (Default local URL, optional for local AI)
OLLAMA_BASE_URL=http://localhost:11434

# OpenWeatherMap API Key (Required for weather tool in chat)
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# Website Access Password (Leave empty to disable password protection)
WEBSITE_PASSWORD=your_website_password_here

# Rate Limiting Configuration (Upstash Redis)
ENABLE_MAX_REQUEST_PER_DAY=true
MAX_REQUEST_PER_DAY=100
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
```

---

### 4. Run Development Server

Start the local development server with:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring Hainova!

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `pnpm dev` | Starts the development server |
| **Build** | `pnpm build` | Builds the production bundle |
| **Start** | `pnpm start` | Starts the production server |
| **Lint** | `pnpm lint` | Runs ESLint check |
| **Typecheck** | `pnpm typecheck` | Validates TypeScript types |
| **Format** | `pnpm format` | Formats code with Prettier |

---

## 📂 Project Structure

```text
hainova/
├── app/
│   ├── api/             # Next.js API Routes (chat, maps, places, auth)
│   ├── chat/            # AI Chat Interface & Components
│   ├── maps/            # Interactive Maps & Place Details Interface
│   ├── login/           # Optional Password Access Page
│   ├── globals.css      # Tailwind CSS v4 & custom theme config
│   └── layout.tsx       # Root Layout
├── components/          # Shared & UI Primitives (Shadcn / Base UI)
├── hooks/               # Custom Hooks (useGeolocation, usePlaces, useModelSettings)
├── types/               # TypeScript interface definitions
├── .env.example         # Environment template
└── package.json
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/hainova/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
