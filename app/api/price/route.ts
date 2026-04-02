import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 4000; // 4 seconds

// Forex rates cache (single call returns ALL pairs)
let forexRatesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const FOREX_CACHE_TTL = 3000;

// Known forex pairs — base/quote
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
};

// Gold/Silver — use quote endpoint with OANDA symbols
const COMMODITY_MAP: Record<string, string> = {
  'XAUUSD': 'OANDA:XAU_USD', 'GOLD': 'OANDA:XAU_USD', 'XAGUSD': 'OANDA:XAG_USD',
};

// Crypto — use quote endpoint with BINANCE symbols
const CRYPTO_MAP: Record<string, string> = {
  'BTCUSD': 'BINANCE:BTCUSDT', 'BTCUSDT': 'BINANCE:BTCUSDT',
  'ETHUSD': 'BINANCE:ETHUSDT', 'ETHUSDT': 'BINANCE:ETHUSDT',
};

async function getForexRates(apiKey: string): Promise<Record<string, number> | null> {
  const now = Date.now();
  if (forexRatesCache && (now - forexRatesCache.timestamp) < FOREX_CACHE_TTL) {
    return forexRatesCache.rates;
  }

  try {
    // Finnhub forex/rates returns all rates relative to USD base
    const res = await fetch(
      `https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // data.quote = { "AUD": 0.64, "EUR": 0.87, "GBP": 0.79, ... }
    if (data && data.quote) {
      forexRatesCache = { rates: data.quote, timestamp: now };
      return data.quote;
    }
    return null;
  } catch {
    return null;
  }
}

function calcForexPrice(base: string, quote: string, rates: Record<string, number>): number | null {
  // rates are USD-based: rates[X] = how much X per 1 USD
  // e.g. rates["EUR"] = 0.87 means 1 USD = 0.87 EUR
  // EURUSD = 1 / rates["EUR"] = 1.149
  // GBPJPY = rates["JPY"] / rates["GBP"]

  if (base === 'USD' && rates[quote]) {
    // e.g. USDJPY = rates["JPY"]
    return rates[quote];
  }
  if (quote === 'USD' && rates[base]) {
    // e.g. EURUSD = 1 / rates["EUR"]
    return 1 / rates[base];
  }
  if (rates[base] && rates[quote]) {
    // Cross rate: e.g. EURJPY = rates["JPY"] / rates["EUR"]
    return rates[quote] / rates[base];
  }
  return null;
}

async function getQuotePrice(symbol: string, apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.c && data.c > 0) return data.c;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Price feed not configured' }, { status: 503 });
  }

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')).filter(Boolean).slice(0, 10);
  const results: Record<string, number | null> = {};
  const now = Date.now();

  // Check which symbols are forex
  const forexSymbols = symbolList.filter(s => FOREX_PAIRS[s]);
  const otherSymbols = symbolList.filter(s => !FOREX_PAIRS[s]);

  // Fetch forex rates (single API call for ALL forex pairs)
  if (forexSymbols.length > 0) {
    const rates = await getForexRates(apiKey);
    if (rates) {
      for (const sym of forexSymbols) {
        const cached = cache[sym];
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          results[sym] = cached.price;
          continue;
        }

        const [base, quote] = FOREX_PAIRS[sym];
        const price = calcForexPrice(base, quote, rates);
        if (price !== null) {
          // Round to 5 decimal places for forex
          const rounded = Math.round(price * 100000) / 100000;
          results[sym] = rounded;
          cache[sym] = { price: rounded, timestamp: now };
        } else {
          results[sym] = null;
        }
      }
    } else {
      forexSymbols.forEach(s => results[s] = null);
    }
  }

  // Fetch other symbols (commodities, crypto) via quote endpoint
  for (const sym of otherSymbols) {
    const cached = cache[sym];
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      results[sym] = cached.price;
      continue;
    }

    const quoteSymbol = COMMODITY_MAP[sym] || CRYPTO_MAP[sym];
    if (quoteSymbol) {
      const price = await getQuotePrice(quoteSymbol, apiKey);
      if (price !== null) {
        results[sym] = price;
        cache[sym] = { price, timestamp: now };
      } else {
        results[sym] = null;
      }
    } else {
      results[sym] = null;
    }
  }

  return NextResponse.json({ prices: results, timestamp: now });
}
