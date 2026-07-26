import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userLocation } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in your .env.local file to use the AI chat.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
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

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      maxSteps: 5,
      system: `You are Hainova AI, a helpful, intelligent, and friendly AI assistant.
You have access to real-time tools including OpenWeatherMap and Google Places API search.
${locationPromptContext}
When users ask about the weather, temperature, or climate conditions for any city or location, ALWAYS use the "getWeather" tool to fetch live data before answering.
When users ask to find, search, or recommend places, hotels, restaurants, cafes, spots, or attractions (e.g. "hotels in Tokyo", "best ramen near me", "coffee shops in Paris"), ALWAYS use the "searchPlaces" tool to search for real places before answering.
Provide concise, clear, and well-structured responses alongside tool results.`,
      tools: {
        searchPlaces: tool({
          description:
            'Search for places, hotels, restaurants, cafes, attractions, or locations using Google Places API.',
          parameters: z.object({
            textQuery: z
              .string()
              .describe(
                'The place search query, e.g. "hotels in Tokyo", "ramen restaurants", "coffee shops"'
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
          parameters: z.object({
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
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'An error occurred while processing your chat request.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
