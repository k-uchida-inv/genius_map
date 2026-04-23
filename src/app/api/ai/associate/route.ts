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
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const usage = await checkAndRecordUsage(parsed.data.mapId, 'associate');
  if (usage.unauthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!usage.allowed) {
    return Response.json({ error: 'AI利用回数の上限に達しました' }, { status: 429 });
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `以下のキーワードに関連するキーワードを5つ、JSON配列形式で返してください。各キーワードは簡潔（10文字以内）にしてください。JSON配列のみを返してください（説明不要）。\n\nキーワード: ${parsed.data.label}`,
    });

    const text = response.text ?? '[]';
    const match = text.match(/\[[\s\S]*\]/);
    let keywords: string[] = [];
    try {
      keywords = match ? JSON.parse(match[0]) : [];
    } catch {
      keywords = [];
    }

    return Response.json({ keywords, remaining: usage.remaining });
  } catch {
    return Response.json({ error: 'AI request failed' }, { status: 500 });
  }
}
