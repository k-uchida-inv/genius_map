import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAIClient } from '@/lib/ai/client';
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
    const ai = getAIClient();

    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: `以下のトピックについて調査し、概要、主要なポイント、関連トピックをマークダウン形式で日本語で記述してください。各セクションには明確な見出し（## または ###）を付けてください。\n\nトピック: ${parsed.data.label}`,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
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
