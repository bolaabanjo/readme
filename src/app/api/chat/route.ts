import { cencori, AI_MODEL } from '@/lib/cencori';
import { buildSystemPrompt } from '@/lib/prompts';
import type { ChatRequest } from '@/types';

export async function POST(request: Request) {
    try {
        const body: ChatRequest = await request.json();
        const { messages, repoContext, style } = body;

        if (!repoContext) {
            return new Response('Repository context is required', { status: 400 });
        }

        // Build the system prompt with repo context
        const systemPrompt = buildSystemPrompt(repoContext, style || 'professional');

        // Convert our messages to Cencori format
        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        console.log('[Chat API] Starting stream with model:', AI_MODEL);

        // Stream the response using Cencori SDK (no await - returns AsyncGenerator)
        const stream = cencori.ai.chatStream({
            model: AI_MODEL,
            messages: formattedMessages,
        });

        // Convert AsyncGenerator to ReadableStream
        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        // Check for error responses from Cencori
                        const chunkAny = chunk as unknown as Record<string, unknown>;
                        if (chunkAny.error) {
                            console.error('[Chat API] Cencori error:', chunkAny.error);
                            // Send error message to client
                            controller.enqueue(encoder.encode(`\n\n⚠️ Error: ${chunkAny.error}\n\nPlease try again in a moment.`));
                            controller.close();
                            return;
                        }

                        // chunk.delta contains the streamed text per Cencori docs
                        if (chunk.delta) {
                            controller.enqueue(encoder.encode(chunk.delta));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('[Chat API] Stream error:', error);
                    controller.error(error);
                }
            },
        });

        // Return the stream
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('[Chat API] Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate response';
        return new Response(message, { status: 500 });
    }
}
