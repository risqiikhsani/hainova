import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider-v2';
import { tavily } from '@tavily/core';
import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  UIMessage,
  type LanguageModel,
} from 'ai';
import { z } from 'zod';
import { checkAndIncrementMapRateLimit } from '@/lib/rate-limit';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SUPPORTED_PROVIDERS = ['openai', 'google', 'ollama'] as const;
type Provider = (typeof SUPPORTED_PROVIDERS)[number];

interface ChatRequestBody {
  messages: UIMessage[];
  userLocation?: { lat: number; lng: number };
  provider?: string;
  modelId?: string;
  ollamaBaseUrl?: string;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const {
    messages,
    userLocation,
    provider: rawProvider = 'openai',
    modelId,
    ollamaBaseUrl = 'http://localhost:11434',
  }: ChatRequestBody = await req.json();

  // Validate the provider name before doing anything else, so a typo'd
  // or unsupported provider fails fast with a clear message instead of
  // silently falling through to the OpenAI branch.
  if (!SUPPORTED_PROVIDERS.includes(rawProvider as Provider)) {
    return jsonError(
      `Unsupported provider "${rawProvider}". Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}.`,
      400
    );
  }
  const provider = rawProvider as Provider;

  // Per-provider default model ids, used when the client doesn't specify one
  const DEFAULT_MODEL_IDS: Record<Provider, string> = {
    openai: 'gpt-4o-mini',
    google: 'gemini-2.5-flash-lite',
    ollama: 'llama3.2',
  };
  const resolvedModelId = modelId || DEFAULT_MODEL_IDS[provider];

  // Validate API key / provider configuration before initializing stream
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    return jsonError(
      'OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in your .env.local file to use OpenAI models.',
      400
    );
  }

  if (
    provider === 'google' &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
    !process.env.GEMINI_API_KEY
  ) {
    return jsonError(
      'GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your .env.local file to use Google Gemini models.',
      400
    );
  }

  // Ollama runs locally and has no API key, but a reachable base URL is
  // required — fail fast with a clear message rather than letting the
  // request hang until streamText's own fetch times out.
  if (provider === 'ollama') {
    try {
      const pingRes = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!pingRes.ok) {
        return jsonError(
          `Ollama server at ${ollamaBaseUrl} responded with status ${pingRes.status}.`,
          400
        );
      }
    } catch {
      return jsonError(
        `Could not reach Ollama server at ${ollamaBaseUrl}. Make sure Ollama is running (\`ollama serve\`) and the URL is correct.`,
        400
      );
    }
  }

  // Resolve language model instance based on provider
  let modelInstance: LanguageModel;
  try {
    if (provider === 'google') {
      modelInstance = google(resolvedModelId);
    } else if (provider === 'ollama') {
      const sanitizedBaseUrl = ollamaBaseUrl.replace(/\/$/, '');
      const ollama = createOllama({
        baseURL: `${sanitizedBaseUrl}/api`,
      });
      modelInstance = ollama(resolvedModelId);
    } else {
      modelInstance = openai(resolvedModelId);
    }
  } catch (err: any) {
    return jsonError(
      `Failed to initialize ${provider} model "${resolvedModelId}": ${err?.message || 'Unknown error'}`,
      400
    );
  }

  try {
    const hasUserLocation =
      userLocation &&
      typeof userLocation.lat === 'number' &&
      typeof userLocation.lng === 'number';

    const locationPromptContext = hasUserLocation
      ? `User's current coordinates: Latitude ${userLocation.lat}, Longitude ${userLocation.lng}. When the user asks for places "near me", "nearby", or around their current location, set "useUserLocation" to true when calling "searchPlaces".`
      : 'User location is currently unknown or not shared. If the user asks for places "near me" without specifying a location, remind them to enable location access or specify a city name.';

    const isLocalOrSmallModel = provider === 'ollama';

    const systemPrompt = `You are Hainova AI, a helpful, intelligent, and friendly AI assistant.

### TOOL USE GUIDELINES:
1. **Call tools when external, real-time, or up-to-date data is needed** (e.g. live weather, place recommendations, news, sports results/events, recent developments, or web facts).
2. **DO NOT call any tools** for:
   - Greetings, casual chat, or follow-ups (e.g. "hi", "hello", "how are you", "who are you").
   - Simple math, basic logic, or questions where all necessary information is already provided in the prompt.

### WHEN TO USE TOOLS:
- Call **tavilySearch** whenever the user asks about live events, current news, sports results or tournaments (e.g., FIFA, World Cup, Olympics), recent facts, real-time web information, or any question where current/up-to-date web data is helpful.
- Call **tavilyExtract** when the user provides specific web page URLs (e.g., "https://...") or asks to read, scrape, extract, or summarize a specific webpage URL.
- Call **getWeather** ONLY when the user explicitly asks for current weather, forecast, temperature, or climate conditions of a specific city or region.
- Call **searchPlaces** ONLY when the user asks to find, locate, recommend, or search for real-world places, hotels, restaurants, cafes, attractions, or spots.

### RESPONSE FORMAT:
- If a tool is called, synthesize the tool results into a natural, helpful, and nicely structured response using Markdown.
- If no tool is needed, respond directly and concisely to the user in plain text.
${locationPromptContext}${
      isLocalOrSmallModel
        ? `\n\nCRITICAL FOR LOCAL MODEL REASONING: Think carefully before invoking tools. If the message is a greeting or general question, DO NOT call any tool.`
        : ''
    }`;

    const result = streamText({
      model: modelInstance,
      // Client sends UIMessage[] (parts-based); convert to ModelMessage[] for the LLM
      // Note: convertToModelMessages is async as of AI SDK v6 (was sync in v5)
      messages: await convertToModelMessages(messages),
      // stepCountIs(5) caps the agentic tool-calling loop at 5 steps.
      stopWhen: stepCountIs(5),
      system: systemPrompt,
      tools: {
        searchPlaces: tool({
          description:
            'Search for real-world places, hotels, restaurants, cafes, attractions, or locations using Google Places API. ONLY use when user asks to find/locate specific places.',
          inputSchema: z.object({
            textQuery: z
              .string()
              .describe(
                'A clean place query string without full sentence filler, e.g. "hotels in Tokyo", "ramen restaurants", "coffee shops"'
              ),
            useUserLocation: z
              .boolean()
              .optional()
              .describe(
                'Set to true if searching near the user current location (e.g. for "hotels near me").'
              ),
            radiusMeters: z
              .number()
              .optional()
              .default(5000)
              .describe('Search radius in meters when biasing location (default: 5000).'),
          }),
          execute: async ({ textQuery, useUserLocation, radiusMeters }) => {
            const rateLimit = await checkAndIncrementMapRateLimit();
            if (!rateLimit.allowed) {
              return {
                error:
                  rateLimit.error ??
                  'Daily limit exceeded for map requests. Please try again tomorrow.',
              };
            }

            const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

            if (!googleApiKey) {
              return {
                error:
                  'GOOGLE_MAPS_API_KEY is missing in environment variables. Please add GOOGLE_MAPS_API_KEY to .env.local.',
              };
            }

            try {
              const requestBody: any = {
                textQuery,
                maxResultCount: 8,
                languageCode: 'en',
              };

              if (useUserLocation && hasUserLocation) {
                requestBody.locationBias = {
                  circle: {
                    center: {
                      latitude: userLocation.lat,
                      longitude: userLocation.lng,
                    },
                    radius: radiusMeters ?? 5000,
                  },
                };
              }

              const res = await fetch(
                'https://places.googleapis.com/v1/places:searchText',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': googleApiKey,
                    'X-Goog-FieldMask':
                      'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryTypeDisplayName,places.location',
                  },
                  body: JSON.stringify(requestBody),
                  cache: 'no-store',
                }
              );

              if (!res.ok) {
                const errorText = await res.text();
                console.error('[searchPlaces] Google Places API error:', errorText);
                return { error: `Google Places API request failed with status ${res.status}.` };
              }

              const data = await res.json();
              const rawPlaces = data.places || [];

              const places = rawPlaces.map((p: any) => ({
                id: p.id,
                displayName: p.displayName?.text || 'Unnamed place',
                formattedAddress: p.formattedAddress || '',
                rating: p.rating ?? null,
                userRatingCount: p.userRatingCount ?? 0,
                priceLevel: p.priceLevel ?? null,
                primaryTypeDisplayName: p.primaryTypeDisplayName?.text || null,
                location: p.location || null,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  p.displayName?.text || textQuery
                )}&query_place_id=${p.id}`,
              }));

              return {
                query: textQuery,
                usedUserLocation: Boolean(useUserLocation && hasUserLocation),
                totalResults: places.length,
                places,
              };
            } catch (err: any) {
              console.error('Error fetching Google Places data:', err);
              return { error: 'Failed to search places from Google Places API.' };
            }
          },
        }),
        getWeather: tool({
          description:
            'Get the current weather conditions for a specified city or location using OpenWeatherMap API.',
          inputSchema: z.object({
            city: z
              .string()
              .describe('The name of the city or location (e.g., "Tokyo", "London, UK", "Jakarta")'),
            units: z
              .enum(['metric', 'imperial'])
              .default('metric')
              .describe('Unit system: metric (°C) or imperial (°F). Default is metric.'),
          }),
          execute: async ({ city, units }) => {
            const apiKey = process.env.OPENWEATHERMAP_API_KEY;

            if (!apiKey) {
              return {
                error:
                  'OPENWEATHERMAP_API_KEY is missing in environment variables. Please add OPENWEATHERMAP_API_KEY to .env.local.',
              };
            }

            try {
              const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                  city
                )}&appid=${apiKey}&units=${units}`
              );

              if (!res.ok) {
                if (res.status === 404) {
                  return { error: `City "${city}" not found. Please check the spelling.` };
                }
                if (res.status === 401) {
                  return { error: 'Invalid OpenWeatherMap API key provided.' };
                }
                return { error: `OpenWeatherMap API request failed with status ${res.status}.` };
              }

              const data = await res.json();
              const unitSymbol = units === 'metric' ? '°C' : '°F';
              const speedSymbol = units === 'metric' ? 'm/s' : 'mph';

              return {
                location: `${data.name}, ${data.sys?.country || ''}`,
                temperature: `${Math.round(data.main?.temp)}${unitSymbol}`,
                feelsLike: `${Math.round(data.main?.feels_like)}${unitSymbol}`,
                tempMin: `${Math.round(data.main?.temp_min)}${unitSymbol}`,
                tempMax: `${Math.round(data.main?.temp_max)}${unitSymbol}`,
                condition: data.weather?.[0]?.main || 'Unknown',
                description: data.weather?.[0]?.description || '',
                humidity: `${data.main?.humidity}%`,
                windSpeed: `${data.wind?.speed} ${speedSymbol}`,
                cloudiness: `${data.clouds?.all}%`,
              };
            } catch (err: any) {
              console.error('Error fetching OpenWeatherMap data:', err);
              return { error: 'Failed to fetch weather data from OpenWeatherMap API.' };
            }
          },
        }),
        tavilySearch: tool({
          description:
            'Search the web for real-time information, news, current events, technical documentation, or live web data using Tavily Search API.',
          inputSchema: z.object({
            query: z.string().describe('The web search query string'),
            searchDepth: z
              .enum(['basic', 'advanced'])
              .optional()
              .default('basic')
              .describe('Search depth: basic is faster, advanced is deeper and more thorough'),
            topic: z
              .enum(['general', 'news', 'finance'])
              .optional()
              .default('general')
              .describe('Topic category to narrow down search results'),
            maxResults: z
              .number()
              .optional()
              .default(5)
              .describe('Maximum number of search results to return (1-10)'),
            includeImages: z
              .boolean()
              .optional()
              .default(true)
              .describe('Whether to include image search results'),
          }),
          execute: async ({ query, searchDepth, topic, maxResults, includeImages }) => {
            const tavilyApiKey = process.env.TAVILY_API_KEY;

            if (!tavilyApiKey) {
              return {
                error:
                  'TAVILY_API_KEY is not configured in environment variables. Please add TAVILY_API_KEY to your .env.local file to enable web search.',
              };
            }

            try {
              const tvly = tavily({ apiKey: tavilyApiKey });
              const response = await tvly.search(query, {
                searchDepth,
                topic,
                maxResults,
                includeImages,
                includeFavicon: true,
              });

              return {
                query: response.query || query,
                answer: response.answer || null,
                responseTime: response.responseTime,
                results: (response.results || []).map((r: any) => ({
                  title: r.title || 'Untitled',
                  url: r.url,
                  content: r.content || '',
                  score: r.score,
                  publishedDate: r.publishedDate || null,
                  favicon: r.favicon || null,
                })),
                images: (response.images || []).map((img: any) =>
                  typeof img === 'string' ? { url: img } : img
                ),
              };
            } catch (err: any) {
              console.error('[tavilySearch] Tavily API error:', err);
              return {
                error:
                  err?.message || 'Failed to perform web search using Tavily API.',
              };
            }
          },
        }),
        tavilyExtract: tool({
          description:
            'Extract clean main web content, markdown, titles, and images from specific web page URLs using Tavily Extract API.',
          inputSchema: z.object({
            urls: z
              .array(z.string().url())
              .describe('List of web page URLs to extract text and content from'),
            extractDepth: z
              .enum(['basic', 'advanced'])
              .optional()
              .default('basic')
              .describe('Extraction depth: basic or advanced'),
          }),
          execute: async ({ urls, extractDepth }) => {
            const tavilyApiKey = process.env.TAVILY_API_KEY;

            if (!tavilyApiKey) {
              return {
                error:
                  'TAVILY_API_KEY is not configured in environment variables. Please add TAVILY_API_KEY to your .env.local file to enable URL content extraction.',
              };
            }

            try {
              const tvly = tavily({ apiKey: tavilyApiKey });
              const response = await tvly.extract(urls, {
                extractDepth,
                format: 'markdown',
                includeFavicon: true,
              });

              return {
                responseTime: response.responseTime,
                results: (response.results || []).map((r: any) => ({
                  url: r.url,
                  title: r.title || 'Extracted Web Page',
                  rawContent: r.rawContent || '',
                  favicon: r.favicon || null,
                  images: r.images || [],
                })),
                failedResults: (response.failedResults || []).map((f: any) => ({
                  url: f.url,
                  error: f.error || 'Failed to extract content from URL',
                })),
              };
            } catch (err: any) {
              console.error('[tavilyExtract] Tavily API error:', err);
              return {
                error:
                  err?.message || 'Failed to extract content from URLs using Tavily API.',
              };
            }
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('Stream error:', error);
        return `An error occurred while processing your request with ${provider}/${resolvedModelId}.`;
      },
    });
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return jsonError(
      error?.message || 'An error occurred while processing your chat request.',
      500
    );
  }
}