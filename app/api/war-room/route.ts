import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  try {
    const { system, message, useSearch, password } = await request.json();

    // Password gate
    if (password !== process.env.WAR_ROOM_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const body: any = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: useSearch ? 1500 : 1000,
      messages: [{ role: 'user', content: message }],
      system,
    };

    if (useSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
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
      return NextResponse.json({ error: data.error.message || 'API error' }, { status: 500 });
    }

    const text = data.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n');

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
