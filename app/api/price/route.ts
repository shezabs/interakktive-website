import { NextResponse } from 'next/server';

// Twelve Data /price endpoint — simplest, returns just the price
// Free tier: 8 API credits/minute, 800/day
// /price uses 1 credit per symbol

const cache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 8000; // 8 seconds to stay within rate limits

// Map trade symbols to Twelve Data format
// Twelve Data uses: EUR/USD, GBP/USD, XAU/USD, BTC/USD etc.
function toTwelveDataSymbol(sym: string): string {
  const upper = sym.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Forex pairs (6 chars, all letters) → insert /
  if (upper.length === 6 && /^[A-Z]+$/.test(upper)) {
    return `${upper.slice(0, 3)}/${upper.slice(3)}`;
  }

  // Gold / Silver
  if (upper === 'GOLD') return 'XAU/USD';
  if (upper === 'XAUUSD') return 'XAU/USD';
  if (upper === 'XAGUSD') return 'XAG/USD';

  // Crypto
  if (upper === 'BTCUSD' || upper === 'BTCUSDT') return 'BTC/USD';
  if (upper === 'ETHUSD' || upper === 'ETHUSDT') return 'ETH/USD';

  // Indices
  if (upper === 'US30') return 'DJI';
  if (upper === 'NAS100' || upper === 'USTEC') return 'IXIC';
  if (upper === 'SPX500' || upper === 'US500') return 'SPX';

  // Fallback: return as-is
  return upper;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');
  const debug = searchParams.get('debug') === '1';

  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  // Support both FINNHUB_API_KEY (legacy) and TWELVEDATA_API_KEY
  const apiKey = process.env.TWELVEDATA_API_KEY || process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TWELVEDATA_API_KEY not set', hasKey: false }, { status: 503 });
  }

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')).filter(Boolean).slice(0, 5);
  const results: Record<string, number | null> = {};
  const debugInfo: string[] = [];
  const now = Date.now();

  for (const sym of symbolList) {
    // Check cache
    const cached = cache[sym];
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      results[sym] = cached.price;
      if (debug) debugInfo.push(`${sym}: cached=${cached.price}`);
      continue;
    }

    const tdSymbol = toTwelveDataSymbol(sym);

    try {
      const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(tdSymbol)}&apikey=${apiKey}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (debug) debugInfo.push(`${sym}: td_sym=${tdSymbol} status=${res.status} body=${JSON.stringify(data).slice(0, 150)}`);

      // Twelve Data returns: { "price": "1.15340" } on success
      // Or: { "code": 400, "message": "..." } on error
      if (data && data.price) {
        const price = parseFloat(data.price);
        if (!isNaN(price) && price > 0) {
          results[sym] = price;
          cache[sym] = { price, timestamp: now };
          continue;
        }
      }

      results[sym] = null;
    } catch (err: any) {
      if (debug) debugInfo.push(`${sym}: error=${err?.message}`);
      results[sym] = null;
    }
  }

  const response: any = { prices: results, timestamp: now };
  if (debug) {
    response._debug = {
      provider: 'twelvedata',
      info: debugInfo,
      hasApiKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : null,
    };
  }

  return NextResponse.json(response);
}
