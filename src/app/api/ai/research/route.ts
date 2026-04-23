import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAnthropicClient } from '@/lib/ai/client';
import { checkAndRecordUsage } from '@/lib/ai/checkUsage';

const RequestSchema = z.object({
  mapId: z.string(),
  nodeId: z.string(),
  label: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid request', { status: 400 });
  }

  const usage = await checkAndRecordUsage(parsed.data.mapId, 'research');
  if (usage.unauthenticated) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!usage.allowed) {
    return new Response('AI利用回数の上限に達しました', { status: 429 });
  }

  try {
    const client = getAnthropicClient();

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `以下のトピックについて調査し、概要、主要なポイント、関連トピックをマークダウン形式で日本語で記述してください。各セクションには明確な見出し（## または ###）を付けてください。\n\nトピック: ${parsed.data.label}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response('AI request failed', { status: 500 });
  }
}
