import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

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
      system:
        'You are Hainova AI, a helpful, intelligent, and friendly AI assistant. Provide concise, well-structured, and helpful answers.',
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
