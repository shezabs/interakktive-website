import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MAX_MARKET_DATA_CHARS = 3000; // Trim market data to reduce token usage

export async function POST(request: Request) {
  try {
    const { system, message, useSearch, password, isCeo } = await request.json();

    // Password gate
    if (password !== process.env.WAR_ROOM_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // Trim message if it contains market data (agents get a condensed version)
    const trimmedMessage = message.length > MAX_MARKET_DATA_CHARS + 500
      ? message.substring(0, MAX_MARKET_DATA_CHARS) + '\n\n[Market data truncated for brevity — analyse what is provided]'
      : message;

    // Use Sonnet for market data search and CEO, Haiku for individual agents (faster + cheaper)
    const model = (useSearch || isCeo) ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5-20251001';

    const body: any = {
      model,
      max_tokens: useSearch ? 1200 : isCeo ? 1000 : 600,
      messages: [{ role: 'user', content: trimmedMessage }],
      system,
    };

    if (useSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    // Retry logic for rate limits
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // Wait before retry — exponential backoff
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
        // If rate limited, retry
        if (res.status === 429 || lastError.includes('rate limit')) {
          continue;
        }
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
