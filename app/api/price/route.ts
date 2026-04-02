import { NextResponse } from 'next/server';

// Cache
const cache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 4000;

let forexRatesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const FOREX_CACHE_TTL = 3000;

const FOREX_PAIRS: Record<string, [string, string]> = {
  'EURUSD': ['EUR', 'USD'], 'GBPUSD': ['GBP', 'USD'], 'USDJPY': ['USD', 'JPY'],
  'USDCHF': ['USD', 'CHF'], 'AUDUSD': ['AUD', 'USD'], 'USDCAD': ['USD', 'CAD'],
  'NZDUSD': ['NZD', 'USD'], 'EURGBP': ['EUR', 'GBP'], 'EURJPY': ['EUR', 'JPY'],
  'GBPJPY': ['GBP', 'JPY'], 'AUDNZD': ['AUD', 'NZD'], 'EURCHF': ['EUR', 'CHF'],
  'AUDCAD': ['AUD', 'CAD'], 'GBPCAD': ['GBP', 'CAD'], 'GBPCHF': ['GBP', 'CHF'],
  'CADJPY': ['CAD', 'JPY'], 'EURAUD': ['EUR', 'AUD'], 'EURCAD': ['EUR', 'CAD'],
  'EURNZD': ['EUR', 'NZD'], 'GBPAUD': ['GBP', 'AUD'], 'GBPNZD': ['GBP', 'NZD'],
  'AUDCHF': ['AUD', 'CHF'], 'AUDJPY': ['AUD', 'JPY'], 'NZDJPY': ['NZD', 'JPY'],
  'NZDCAD': ['NZD', 'CAD'], 'NZDCHF': ['NZD', 'CHF'], 'CHFJPY': ['CHF', 'JPY'],
  'XAUUSD': ['XAU', 'USD'], 'GOLD': ['XAU', 'USD'], 'XAGUSD': ['XAG', 'USD'],
};

async function getForexRates(apiKey: string): Promise<{ rates: Record<string, number> | null; debug: string }> {
  const now = Date.now();
  if (forexRatesCache && (now - forexRatesCache.timestamp) < FOREX_CACHE_TTL) {
    return { rates: forexRatesCache.rates, debug: 'cached' };
  }

  try {
    const url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    
    if (!res.ok) {
      return { rates: null, debug: `finnhub_error: status=${res.status} body=${text.slice(0, 200)}` };
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { rates: null, debug: `json_parse_error: ${text.slice(0, 200)}` };
    }

    if (data && data.quote && typeof data.quote === 'object') {
      forexRatesCache = { rates: data.quote, timestamp: now };
      return { rates: data.quote, debug: `ok: ${Object.keys(data.quote).length} currencies` };
    }
    
    return { rates: null, debug: `unexpected_format: ${JSON.stringify(data).slice(0, 300)}` };
  } catch (err: any) {
    return { rates: null, debug: `fetch_error: ${err?.message || 'unknown'}` };
  }
}

function calcForexPrice(base: string, quote: string, rates: Record<string, number>): number | null {
  if (base === 'USD' && rates[quote]) return rates[quote];
  if (quote === 'USD' && rates[base]) return 1 / rates[base];
  if (rates[base] && rates[quote]) return rates[quote] / rates[base];
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');
  const debug = searchParams.get('debug') === '1';

  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY not set', hasKey: false }, { status: 503 });
  }

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')).filter(Boolean).slice(0, 10);
  const results: Record<string, number | null> = {};
  const now = Date.now();

  // Fetch forex rates
  const { rates, debug: ratesDebug } = await getForexRates(apiKey);

  for (const sym of symbolList) {
    const cached = cache[sym];
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      results[sym] = cached.price;
      continue;
    }

    const pair = FOREX_PAIRS[sym];
    if (pair && rates) {
      const [base, quote] = pair;
      const price = calcForexPrice(base, quote, rates);
      if (price !== null) {
        // Round appropriately
        const isJpy = quote === 'JPY';
        const isXau = base === 'XAU';
        const isXag = base === 'XAG';
        const decimals = isJpy ? 3 : isXau ? 2 : isXag ? 4 : 5;
        const rounded = Math.round(price * Math.pow(10, decimals)) / Math.pow(10, decimals);
        results[sym] = rounded;
        cache[sym] = { price: rounded, timestamp: now };
      } else {
        results[sym] = null;
      }
    } else {
      results[sym] = null;
    }
  }

  const response: any = { prices: results, timestamp: now };
  if (debug) {
    response._debug = {
      ratesStatus: ratesDebug,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.slice(0, 6) + '...' : null,
    };
  }

  return NextResponse.json(response);
}
