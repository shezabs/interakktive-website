import { NextResponse } from 'next/server';

// Finnhub symbol mapping — convert trade symbols to Finnhub format
const FINNHUB_MAP: Record<string, string> = {
  // Forex — Finnhub uses OANDA: prefix for forex
  'EURUSD': 'OANDA:EUR_USD', 'GBPUSD': 'OANDA:GBP_USD', 'USDJPY': 'OANDA:USD_JPY',
  'USDCHF': 'OANDA:USD_CHF', 'AUDUSD': 'OANDA:AUD_USD', 'USDCAD': 'OANDA:USD_CAD',
  'NZDUSD': 'OANDA:NZD_USD', 'EURGBP': 'OANDA:EUR_GBP', 'EURJPY': 'OANDA:EUR_JPY',
  'GBPJPY': 'OANDA:GBP_JPY', 'AUDNZD': 'OANDA:AUD_NZD', 'EURCHF': 'OANDA:EUR_CHF',
  'AUDCAD': 'OANDA:AUD_CAD', 'GBPCAD': 'OANDA:GBP_CAD', 'GBPCHF': 'OANDA:GBP_CHF',
  'CADJPY': 'OANDA:CAD_JPY', 'EURAUD': 'OANDA:EUR_AUD', 'EURCAD': 'OANDA:EUR_CAD',
  'EURNZD': 'OANDA:EUR_NZD', 'GBPAUD': 'OANDA:GBP_AUD', 'GBPNZD': 'OANDA:GBP_NZD',
  'AUDCHF': 'OANDA:AUD_CHF', 'AUDJPY': 'OANDA:AUD_JPY', 'NZDJPY': 'OANDA:NZD_JPY',
  'NZDCAD': 'OANDA:NZD_CAD', 'NZDCHF': 'OANDA:NZD_CHF', 'CHFJPY': 'OANDA:CHF_JPY',
  // Gold / Silver
  'XAUUSD': 'OANDA:XAU_USD', 'GOLD': 'OANDA:XAU_USD', 'XAGUSD': 'OANDA:XAG_USD',
  // Crypto — Finnhub uses BINANCE: prefix
  'BTCUSD': 'BINANCE:BTCUSDT', 'BTCUSDT': 'BINANCE:BTCUSDT',
  'ETHUSD': 'BINANCE:ETHUSDT', 'ETHUSDT': 'BINANCE:ETHUSDT',
  // Indices — Finnhub quote endpoint doesn't support indices directly
  // We'll return null for these
};

function getFinnhubSymbol(symbol: string): string | null {
  const upper = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (FINNHUB_MAP[upper]) return FINNHUB_MAP[upper];
  // Try auto-mapping 6-char forex pairs
  if (upper.length === 6 && /^[A-Z]+$/.test(upper)) {
    return `OANDA:${upper.slice(0, 3)}_${upper.slice(3)}`;
  }
  return null;
}

// Simple in-memory cache to avoid hammering API
const cache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 3000; // 3 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols'); // comma-separated

  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Price feed not configured' }, { status: 503 });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10); // max 10
  const results: Record<string, number | null> = {};
  const now = Date.now();

  for (const sym of symbolList) {
    // Check cache first
    const cached = cache[sym];
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      results[sym] = cached.price;
      continue;
    }

    const finnhubSym = getFinnhubSymbol(sym);
    if (!finnhubSym) {
      results[sym] = null;
      continue;
    }

    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`,
        { next: { revalidate: 0 } }
      );

      if (!res.ok) {
        results[sym] = null;
        continue;
      }

      const data = await res.json();
      // Finnhub returns { c: current, h: high, l: low, o: open, pc: prevClose, t: timestamp }
      if (data && data.c && data.c > 0) {
        results[sym] = data.c;
        cache[sym] = { price: data.c, timestamp: now };
      } else {
        results[sym] = null;
      }
    } catch {
      results[sym] = null;
    }
  }

  return NextResponse.json({ prices: results, timestamp: now });
}
