import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MAX_MARKET_DATA_CHARS = 3000;

export async function POST(request: Request) {
  try {
    const { system, message, useSearch, password, isCeo, imageBase64 } = await request.json();

    if (password !== process.env.WAR_ROOM_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const trimmedMessage = message.length > MAX_MARKET_DATA_CHARS + 500
      ? message.substring(0, MAX_MARKET_DATA_CHARS) + '\n\n[Market data truncated — analyse what is provided]'
      : message;

    // Sonnet for search, CEO, and image analysis. Haiku for text-only agents.
    const model = (useSearch || isCeo || imageBase64) ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5-20251001';

    // Build message content — support image + text
    let content: any;
    if (imageBase64) {
      content = [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageBase64 } },
        { type: 'text', text: trimmedMessage },
      ];
    } else {
      content = trimmedMessage;
    }

    const body: any = {
      model,
      max_tokens: useSearch ? 1200 : isCeo ? 1200 : imageBase64 ? 800 : 600,
      messages: [{ role: 'user', content }],
      system,
    };

    if (useSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, (attempt * 5000) + 2000));
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        lastError = data.error.message || 'API error';
        if (res.status === 429 || lastError.includes('rate limit')) continue;
        return NextResponse.json({ error: lastError }, { status: 500 });
      }

      const text = data.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n');

      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: `Rate limited after retries: ${lastError}` }, { status: 429 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
