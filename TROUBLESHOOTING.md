# Troubleshooting Guide

## Summary

During the development of README.wtf, several issues were encountered, primarily related to Cencori SDK integration and streaming response handling.

---

## Issues Encountered

### 1. Cencori SDK Streaming - Incorrect `await` Usage

**Problem:** Initial implementation used `await` with `chatStream()`:
```typescript
const stream = await cencori.ai.chatStream({ ... });
```

**Error:** TypeScript error - `AsyncGenerator<StreamChunk>` not assignable to `BodyInit`.

**Solution:** Per Cencori docs, `chatStream()` returns an AsyncGenerator directly (no await):
```typescript
const stream = cencori.ai.chatStream({ ... });
```

---

### 2. StreamChunk Property Name Mismatch

**Problem:** Initially accessed `chunk.content` for streamed text.

**Error:** `Property 'content' does not exist on type 'StreamChunk'`

**Root Cause:** The SDK types show `StreamChunk` has `delta`, not `content`:
```typescript
interface StreamChunk {
  delta: string;
  finish_reason?: 'stop' | 'length' | 'content_filter' | 'error';
}
```

**Solution:** Changed to `chunk.delta`:
```typescript
for await (const chunk of stream) {
  controller.enqueue(encoder.encode(chunk.delta));
}
```

---

### 3. Silent Errors in Stream - Rate Limiting

**Problem:** After fixing the above, the API returned 200 but the response body was empty. The UI showed "Generating your README now..." but no content ever appeared.

**Diagnosis:** Added logging and discovered Cencori was returning error chunks instead of content:
```
[Chat API] Chunk 1: {"error":"[google] Rate limit exceeded."}
```

**Root Cause:** The `gemini-2.0-flash` model was rate limited, and the SDK returns errors as stream chunks with an `error` property (not typed in `StreamChunk`).

**Solution:** 
1. Added error detection in stream handling:
```typescript
const chunkAny = chunk as unknown as Record<string, unknown>;
if (chunkAny.error) {
  console.error('[Chat API] Cencori error:', chunkAny.error);
  controller.enqueue(encoder.encode(`⚠️ Error: ${chunkAny.error}`));
  controller.close();
  return;
}
```

2. Switched to `gemini-2.5-flash` (recommended default per Cencori docs):
```typescript
export const AI_MODEL = 'gemini-2.5-flash';
```

---

### 4. Frontend Message State Issue

**Problem:** Even when the API worked, the generated README wasn't appearing in the UI.

**Root Cause:** The chat page was calling `generateReadme(data.data, [], style)` with an empty messages array, then filtering for only `user` role messages. No user message was ever sent to the API.

**Solution:** Added explicit user message before calling generateReadme:
```typescript
const userMessage: ChatMessage = {
  id: generateId(),
  role: 'user',
  content: 'Generate a README for this repository.',
  timestamp: new Date(),
};
const initialMessages = [initialMessage, userMessage];
setMessages(initialMessages);
generateReadme(data.data, initialMessages, style);
```

---

## Recommendations for Cencori SDK

1. **Type error responses:** The `StreamChunk` type should include optional `error` property for proper TypeScript handling.

2. **Document error handling:** The streaming docs should show how to handle error chunks.

3. **Rate limit visibility:** Consider throwing a typed `RateLimitError` instead of returning it as a stream chunk.

---

## Final Working Implementation

```typescript
// lib/cencori.ts
import { Cencori } from 'cencori';

export const cencori = new Cencori({
  apiKey: process.env.CENCORI_API_KEY!,
});

export const AI_MODEL = 'gemini-2.5-flash';

// api/chat/route.ts
const stream = cencori.ai.chatStream({
  model: AI_MODEL,
  messages: formattedMessages,
});

const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const chunkAny = chunk as unknown as Record<string, unknown>;
      if (chunkAny.error) {
        controller.enqueue(encoder.encode(`⚠️ Error: ${chunkAny.error}`));
        controller.close();
        return;
      }
      if (chunk.delta) {
        controller.enqueue(encoder.encode(chunk.delta));
      }
    }
    controller.close();
  },
});
```
