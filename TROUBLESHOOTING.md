# Troubleshooting Guide

Common issues when building with the Cencori SDK and their solutions.

---

## 1. Streaming Returns Empty Response

**Symptom:** API returns 200, but response body is empty. UI shows loading state indefinitely.

**Cause:** Stream errors are returned as chunks with an `error` property, not thrown exceptions.

**Solution:** Always check for error chunks when streaming:
```typescript
for await (const chunk of stream) {
  if (chunk.error) {
    console.error('Stream error:', chunk.error);
    // Handle error (show to user, retry, etc.)
    break;
  }
  controller.enqueue(encoder.encode(chunk.delta));
}
```

---

## 2. Rate Limit Errors

**Symptom:** `chunk.error` contains `"[google] Rate limit exceeded."` or similar.

**Cause:** The underlying provider (Google, OpenAI, etc.) has rate limited requests.

**Solutions:**
1. Switch to a different model: `gemini-2.5-flash` → `gpt-4o`
2. Enable fallback in Cencori dashboard (Settings → Infrastructure)
3. Implement exponential backoff on retries

---

## 3. TypeScript: chatStream() Type Errors

**Symptom:** `AsyncGenerator<StreamChunk>` not assignable to `BodyInit`

**Cause:** Using `await` with `chatStream()` incorrectly.

**Solution:** `chatStream()` returns an AsyncGenerator directly (no await):
```typescript
// ❌ Wrong
const stream = await cencori.ai.chatStream({ ... });

// ✅ Correct
const stream = cencori.ai.chatStream({ ... });
```

---

## 4. GitHub API Rate Limits

**Symptom:** `"Request quota exhausted"` errors when analyzing repos.

**Cause:** Unauthenticated GitHub API requests are limited to 60/hour.

**Solutions:**
1. Add `GITHUB_TOKEN` to `.env.local` for 5000 req/hour
2. Cache repo analysis results
3. Reduce number of files fetched per repo

---

## 5. StreamChunk Format Reference

From [Cencori docs](https://cencori.com/docs):

```typescript
interface StreamChunk {
  delta: string;                    // The text chunk
  finish_reason?: 'stop' | 'length' | 'content_filter' | 'error';
  error?: string;                   // Error message if stream failed
}
```

---

## Full Working Streaming Example

```typescript
import { Cencori } from 'cencori';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const cencori = new Cencori({
    apiKey: process.env.CENCORI_API_KEY!,
  });

  const stream = cencori.ai.chatStream({
    model: 'gemini-2.5-flash',
    messages,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.error) {
          controller.enqueue(encoder.encode(`Error: ${chunk.error}`));
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(chunk.delta));
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```
