import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

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
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      maxSteps: 5,
      system: `You are Hainova AI, a helpful, intelligent, and friendly AI assistant.
You have access to real-time tools including the OpenWeatherMap integration.
When users ask about the weather, temperature, or climate conditions for any city or location, ALWAYS use the "getWeather" tool to fetch live data before answering.
Provide concise, clear, and well-structured responses. Include helpful details like temperature (°C/°F), weather condition, humidity, and wind speed when presenting weather reports.`,
      tools: {
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
