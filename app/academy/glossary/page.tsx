// app/academy/glossary/page.tsx
// ATLAS Academy — Interactive Trading Glossary
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, X, BookOpen, ChevronDown } from 'lucide-react';

// ============================================================
// GLOSSARY DATA
// ============================================================
type Level = 'beginner' | 'intermediate' | 'advanced';
type Category = 'basics' | 'price-action' | 'risk' | 'orders' | 'structure' | 'advanced';

interface GlossaryTerm {
  id: string;
  term: string;
  short: string; // one-line definition
  full: string; // detailed explanation
  example?: string; // real-world example
  level: Level;
  category: Category;
  related?: string[]; // ids of related terms
  visual?: 'volatility' | 'spread' | 'leverage' | 'candlestick' | 'support-resistance' | 'risk-reward' | 'pip' | 'trend' | 'volume' | 'order-types' | 'drawdown';
  quiz?: { q: string; opts: string[]; correct: number; explain: string };
}

const glossary: GlossaryTerm[] = [
  // ===== BASICS =====
  {
    id: 'bullish', term: 'Bullish', level: 'beginner', category: 'basics',
    short: 'Expecting the price to go UP.',
    full: 'When someone is "bullish", they believe the price of an asset will rise. A bullish candle closes higher than it opened. A bullish market (or "bull market") is one where prices are generally trending upward over time.',
    example: 'If you say "I\'m bullish on Bitcoin", you believe Bitcoin\'s price will increase. If you buy BTC at $60,000 expecting it to reach $70,000, that\'s a bullish trade.',
    related: ['bearish', 'long', 'trend'],
  },
  {
    id: 'bearish', term: 'Bearish', level: 'beginner', category: 'basics',
    short: 'Expecting the price to go DOWN.',
    full: 'The opposite of bullish. When someone is "bearish", they believe the price will fall. A bearish candle closes lower than it opened. A bear market is a prolonged period of declining prices (typically 20%+ from the peak).',
    example: 'If you say "I\'m bearish on the Euro", you expect EUR/USD to drop. You might sell (go short) to profit from the decline.',
    related: ['bullish', 'short', 'trend'],
  },
  {
    id: 'volatile', term: 'Volatile / Volatility', level: 'beginner', category: 'basics',
    short: 'How much and how fast price moves up and down.',
    full: 'Volatility measures the degree of price fluctuation over time. High volatility means big, fast price swings — both up AND down. Low volatility means price moves slowly and steadily. Volatility is neither good nor bad — it\'s a measure of opportunity AND risk.',
    example: 'Bitcoin might move 5-10% in a single day (high volatility). A major currency pair like EUR/USD might only move 0.3-0.5% per day (low volatility). Crypto traders love volatility for its profit potential. Conservative investors avoid it.',
    visual: 'volatility',
    related: ['risk', 'atr'],
    quiz: { q: 'High volatility means:', opts: ['Price is going up', 'Price is going down', 'Price is swinging a lot in both directions', 'The market is closed'], correct: 2, explain: 'Volatility measures the SIZE of price swings, not the direction. High volatility = big moves both up and down.' },
  },
  {
    id: 'long', term: 'Long (Going Long)', level: 'beginner', category: 'basics',
    short: 'Buying an asset expecting the price to rise.',
    full: 'Going "long" means you BUY first, then SELL later at a higher price to profit. It\'s the most intuitive form of trading — buy low, sell high. When you own shares of Apple stock, you\'re "long" Apple.',
    example: 'You go long on GBP/USD at 1.2700. The price rises to 1.2800. You close your position and profit from the 100-pip move upward.',
    related: ['short', 'bullish', 'position'],
  },
  {
    id: 'short', term: 'Short (Going Short)', level: 'beginner', category: 'basics',
    short: 'Selling an asset expecting the price to fall.',
    full: 'Going "short" means you SELL first (borrowing the asset), then BUY BACK later at a lower price. The difference is your profit. This is how traders make money when prices drop. It feels counterintuitive at first — selling something you don\'t own — but it\'s standard in all major markets.',
    example: 'You go short on Tesla at $250. The price falls to $230. You "cover" (buy back) your short and pocket the $20 per share difference.',
    related: ['long', 'bearish', 'position'],
  },
  {
    id: 'pip', term: 'Pip', level: 'beginner', category: 'basics',
    short: 'The smallest standard price movement in forex (0.0001).',
    full: 'A pip (Percentage In Point) is the fourth decimal place in most currency pairs — a move from 1.2700 to 1.2701 is one pip. For JPY pairs, it\'s the second decimal (110.00 to 110.01). Pips are how forex traders measure profit and loss. In crypto and stocks, we typically just use price change in dollars/cents.',
    example: 'If EUR/USD moves from 1.1050 to 1.1080, that\'s a 30-pip move. If you bought 1 standard lot (100,000 units), each pip is worth roughly $10 — so that\'s a $300 profit.',
    visual: 'pip',
    related: ['spread', 'lot-size'],
  },
  {
    id: 'spread', term: 'Spread', level: 'beginner', category: 'basics',
    short: 'The difference between the buy price (ask) and sell price (bid).',
    full: 'The spread is the cost of entering a trade — it\'s how brokers make money. When you see EUR/USD quoted as 1.1050/1.1052, the spread is 2 pips. You buy at 1.1052 (ask) and sell at 1.1050 (bid). You start every trade slightly in the negative by the spread amount.',
    example: 'If the spread on GBP/USD is 1.5 pips, and each pip is worth $10, you\'re paying $15 to enter and exit that trade. Tighter spreads = cheaper trading.',
    visual: 'spread',
    related: ['pip', 'commission', 'liquidity'],
    quiz: { q: 'You buy EUR/USD at 1.1052 and the bid is 1.1050. The spread is:', opts: ['1.1052', '2 pips', '$2', '0.2 pips'], correct: 1, explain: 'The spread is simply ask minus bid: 1.1052 - 1.1050 = 0.0002 = 2 pips.' },
  },
  {
    id: 'leverage', term: 'Leverage', level: 'beginner', category: 'basics',
    short: 'Borrowing money from your broker to control a larger position.',
    full: 'Leverage lets you control a big position with a small amount of money. With 1:100 leverage, $100 of your money controls $10,000 worth of trades. This amplifies BOTH profits AND losses equally. Leverage is a tool — used wisely it\'s powerful, used recklessly it destroys accounts.',
    example: 'You have $1,000 and use 1:10 leverage. You can open a $10,000 position. If the trade moves 1% in your favour, you make $100 (10% of YOUR money). But if it moves 1% against you, you LOSE $100 (10% of your money).',
    visual: 'leverage',
    related: ['margin', 'risk', 'margin-call'],
    quiz: { q: 'With 1:50 leverage and $200 in your account, how large a position can you control?', opts: ['$200', '$2,000', '$10,000', '$50,000'], correct: 2, explain: '$200 × 50 = $10,000. That\'s the power of leverage — but remember, losses are amplified too.' },
  },
  {
    id: 'margin', term: 'Margin', level: 'beginner', category: 'basics',
    short: 'The deposit required to open a leveraged position.',
    full: 'Margin is the amount of YOUR money that the broker holds as collateral when you open a leveraged trade. It\'s not a fee — you get it back when you close the trade (minus any losses). Think of it as a security deposit.',
    example: 'To open a $10,000 position with 1:100 leverage, you need $100 in margin. That $100 is locked while the trade is open. If your losses approach your margin amount, you get a "margin call".',
    related: ['leverage', 'margin-call'],
  },
  {
    id: 'liquidity', term: 'Liquidity', level: 'beginner', category: 'basics',
    short: 'How easily an asset can be bought or sold without affecting its price.',
    full: 'High liquidity means lots of buyers and sellers are active — you can enter and exit trades quickly with minimal slippage. Low liquidity means fewer participants — your trade might move the price against you, and spreads are wider.',
    example: 'EUR/USD is extremely liquid — millions of trades per second. A small-cap altcoin might have very low liquidity — placing a large order could move the price 5% just from your trade alone.',
    related: ['spread', 'slippage', 'volume'],
  },
  {
    id: 'timeframe', term: 'Timeframe', level: 'beginner', category: 'basics',
    short: 'The time period each candlestick represents on a chart.',
    full: 'A timeframe determines how much time is compressed into each candle. A 1-hour chart means each candle shows one hour of price action. A daily chart means each candle is one full trading day. Shorter timeframes show more detail but more noise. Longer timeframes show the bigger picture.',
    example: 'On a 15-minute chart, you see 4 candles per hour. On a daily chart, you see one candle per day. Day traders typically use 1m-15m charts. Swing traders use 4H-Daily. Investors use Weekly-Monthly.',
    related: ['candlestick', 'trend'],
  },

  // ===== PRICE ACTION =====
  {
    id: 'candlestick', term: 'Candlestick', level: 'beginner', category: 'price-action',
    short: 'A chart element showing Open, High, Low, and Close for a time period.',
    full: 'A candlestick displays four prices in one visual shape: where price opened, the highest and lowest points reached, and where it closed. The filled body shows the range between open and close. The thin wicks (shadows) show the extremes. Invented by Japanese rice traders over 300 years ago.',
    visual: 'candlestick',
    related: ['timeframe', 'bullish', 'bearish'],
  },
  {
    id: 'support', term: 'Support', level: 'beginner', category: 'price-action',
    short: 'A price level where buying pressure tends to prevent further decline.',
    full: 'Support is like a floor — a price level where demand is strong enough to stop the price from falling further. When price approaches support, buyers step in because they consider it a good deal. Support can be a horizontal level, a trendline, or a moving average.',
    example: 'If Bitcoin has bounced off $60,000 three times in the past month, $60,000 is a strong support level. Traders expect buyers to defend that price again.',
    visual: 'support-resistance',
    related: ['resistance', 'trend'],
  },
  {
    id: 'resistance', term: 'Resistance', level: 'beginner', category: 'price-action',
    short: 'A price level where selling pressure tends to prevent further rise.',
    full: 'Resistance is like a ceiling — a price level where supply overwhelms demand. When price approaches resistance, sellers step in to take profit or open short positions. A "breakout" occurs when price pushes through resistance with strong momentum.',
    example: 'If GBP/USD has been rejected at 1.3000 multiple times, that\'s resistance. If it finally breaks above 1.3000 with strong volume, that resistance often "flips" to become new support.',
    related: ['support', 'breakout'],
  },
  {
    id: 'trend', term: 'Trend', level: 'beginner', category: 'price-action',
    short: 'The overall direction price is moving over time.',
    full: 'A trend is the general direction of the market. An uptrend makes higher highs and higher lows. A downtrend makes lower highs and lower lows. A sideways/ranging market has no clear direction. The saying "the trend is your friend" means trading WITH the trend is statistically more profitable than against it.',
    visual: 'trend',
    related: ['support', 'resistance', 'bullish', 'bearish'],
    quiz: { q: 'An uptrend is defined by:', opts: ['Price going up in a straight line', 'Higher highs and higher lows', 'More green candles than red', 'High volume'], correct: 1, explain: 'An uptrend is specifically defined by a pattern of higher highs (each peak is higher than the last) and higher lows (each dip is higher than the last).' },
  },
  {
    id: 'volume', term: 'Volume', level: 'beginner', category: 'price-action',
    short: 'The number of shares/contracts/coins traded in a period.',
    full: 'Volume tells you how many participants are active. High volume confirms a move — if price breaks resistance on high volume, it\'s more likely to hold. Low volume moves are less trustworthy. Think of volume as the "conviction" behind a price move.',
    visual: 'volume',
    related: ['liquidity', 'breakout'],
  },
  {
    id: 'breakout', term: 'Breakout', level: 'intermediate', category: 'price-action',
    short: 'When price pushes through a support or resistance level with momentum.',
    full: 'A breakout occurs when price moves beyond a defined level that previously held. Breakouts can lead to strong trending moves as trapped traders rush to exit and new traders pile in. Not all breakouts are real — "fakeouts" happen when price briefly breaks a level then reverses.',
    example: 'GBP/USD consolidates between 1.2800-1.2900 for a week. It then breaks above 1.2900 on strong volume and rallies to 1.3000. That\'s a breakout.',
    related: ['support', 'resistance', 'fakeout'],
  },

  // ===== RISK MANAGEMENT =====
  {
    id: 'stop-loss', term: 'Stop Loss', level: 'beginner', category: 'risk',
    short: 'An order that automatically closes your trade at a set loss level.',
    full: 'A stop loss is your safety net. You set it BEFORE entering a trade at a price that proves your analysis wrong. When price hits your stop, the trade closes automatically — limiting your loss. Trading without a stop loss is like driving without brakes.',
    example: 'You buy EUR/USD at 1.1050 and set your stop loss at 1.1020 (30 pips below). If price drops to 1.1020, your trade closes automatically. Your maximum loss is 30 pips, no matter what.',
    related: ['take-profit', 'risk-reward', 'risk'],
  },
  {
    id: 'take-profit', term: 'Take Profit', level: 'beginner', category: 'risk',
    short: 'An order that automatically closes your trade at a set profit level.',
    full: 'A take profit (TP) is the opposite of a stop loss — it locks in your profit when price reaches your target. Without a TP, greed can turn a winning trade into a losing one as price reverses.',
    example: 'You buy at 1.1050, stop loss at 1.1020, take profit at 1.1110 (60 pips above). If price hits 1.1110, your trade closes with 60 pips profit. Your risk-reward ratio is 1:2 (risking 30 to make 60).',
    related: ['stop-loss', 'risk-reward'],
  },
  {
    id: 'risk-reward', term: 'Risk-Reward Ratio (R:R)', level: 'beginner', category: 'risk',
    short: 'How much you risk vs how much you stand to gain on a trade.',
    full: 'Risk-reward ratio compares your potential loss (distance to stop loss) with your potential gain (distance to take profit). A 1:2 R:R means for every $1 you risk, you aim to make $2. With a 1:2 ratio, you only need to win 34% of your trades to be profitable. This is why R:R matters more than win rate.',
    visual: 'risk-reward',
    related: ['stop-loss', 'take-profit', 'position-size'],
    quiz: { q: 'With a 1:3 risk-reward ratio, if your stop loss is 20 pips, your take profit should be:', opts: ['20 pips', '40 pips', '60 pips', '30 pips'], correct: 2, explain: '1:3 means your target is 3× your risk. 20 pips × 3 = 60 pips take profit.' },
  },
  {
    id: 'risk', term: 'Risk', level: 'beginner', category: 'risk',
    short: 'The potential for losing money on a trade or investment.',
    full: 'Risk is the probability and magnitude of potential loss. In trading, risk management is more important than finding entries. The best traders aren\'t the ones who win the most — they\'re the ones who control their losses. A common rule: never risk more than 1-2% of your account on a single trade.',
    example: 'Account: $10,000. Risk per trade: 1% = $100 max loss. This means even 10 losing trades in a row only costs you 10% of your account — painful but survivable.',
    related: ['stop-loss', 'risk-reward', 'position-size', 'drawdown'],
  },
  {
    id: 'position-size', term: 'Position Size', level: 'intermediate', category: 'risk',
    short: 'How large your trade is (number of units/lots/contracts).',
    full: 'Position sizing determines HOW MUCH you buy or sell. It\'s calculated based on your account size, the percentage you want to risk, and the distance to your stop loss. Correct position sizing ensures no single trade can blow up your account.',
    example: 'Account: $5,000. Risk: 1% ($50). Stop loss: 25 pips. If each pip = $1 per 0.1 lot, you\'d trade 0.2 lots ($2/pip × 25 pips = $50 risk).',
    related: ['risk', 'lot-size', 'stop-loss'],
  },
  {
    id: 'drawdown', term: 'Drawdown', level: 'intermediate', category: 'risk',
    short: 'The decline from a peak in your account balance to a trough.',
    full: 'Drawdown measures how much your account has fallen from its highest point. A 10% drawdown means your account dropped from, say, $10,000 to $9,000. Prop firms set maximum drawdown limits (often 5-10%). Controlling drawdown is essential for long-term survival.',
    visual: 'drawdown',
    related: ['risk', 'position-size'],
  },
  {
    id: 'margin-call', term: 'Margin Call', level: 'intermediate', category: 'risk',
    short: 'A warning that your losses are approaching your deposited margin.',
    full: 'A margin call happens when your account equity falls below the required margin level. Your broker may force-close (liquidate) your positions to prevent further losses. It\'s essentially your broker saying "you can\'t afford to hold this position anymore." Getting margin called usually means position sizing was too aggressive.',
    related: ['margin', 'leverage', 'risk'],
  },

  // ===== ORDER TYPES =====
  {
    id: 'market-order', term: 'Market Order', level: 'beginner', category: 'orders',
    short: 'An order to buy or sell immediately at the current price.',
    full: 'A market order executes instantly at the best available price. It guarantees execution but not price — in fast markets, you might get slightly worse than the price you saw (this is called slippage). Use market orders when you want to enter or exit NOW.',
    visual: 'order-types',
    related: ['limit-order', 'slippage'],
  },
  {
    id: 'limit-order', term: 'Limit Order', level: 'beginner', category: 'orders',
    short: 'An order to buy or sell at a specific price or better.',
    full: 'A limit order only executes at your specified price or better. A buy limit sits BELOW the current price (you want to buy cheaper). A sell limit sits ABOVE (you want to sell higher). Limit orders guarantee price but not execution — the market might never reach your price.',
    example: 'BTC is at $65,000. You place a buy limit at $63,000. If BTC drops to $63,000, your order fills automatically. If it never drops that low, the order stays pending.',
    related: ['market-order', 'stop-order'],
  },
  {
    id: 'stop-order', term: 'Stop Order', level: 'intermediate', category: 'orders',
    short: 'An order that becomes active only when price reaches a trigger level.',
    full: 'A stop order sits dormant until price hits your specified level, then it becomes a market or limit order. A buy stop sits ABOVE the current price (used to catch breakouts). A sell stop sits BELOW (used for stop losses). Don\'t confuse stop orders with stop losses — a stop loss is a specific USE of a stop order.',
    related: ['market-order', 'limit-order', 'stop-loss', 'breakout'],
  },

  // ===== MARKET STRUCTURE =====
  {
    id: 'bos', term: 'Break of Structure (BOS)', level: 'intermediate', category: 'structure',
    short: 'When price breaks a previous swing high or low, continuing the trend.',
    full: 'A Break of Structure (BOS) confirms that the current trend is still intact. In an uptrend, BOS occurs when price breaks above the most recent swing high. In a downtrend, it breaks below the most recent swing low. BOS is a continuation signal — the trend is healthy.',
    related: ['choch', 'trend', 'support', 'resistance'],
  },
  {
    id: 'choch', term: 'Change of Character (CHoCH)', level: 'intermediate', category: 'structure',
    short: 'When price breaks structure in the OPPOSITE direction, signalling a potential trend reversal.',
    full: 'A Change of Character (CHoCH) is the first sign a trend may be reversing. In an uptrend, CHoCH occurs when price breaks below a previous swing low for the first time. It doesn\'t guarantee reversal — but it\'s the earliest warning signal that the trend is weakening.',
    related: ['bos', 'trend', 'order-block'],
  },
  {
    id: 'order-block', term: 'Order Block (OB)', level: 'intermediate', category: 'structure',
    short: 'A zone where institutional buying or selling occurred before a strong move.',
    full: 'An order block is the last candle (or group of candles) before a strong impulsive move. The idea is that institutions placed large orders there, and when price returns to that zone, they may defend it again. Bullish OBs form before upward moves. Bearish OBs form before downward moves.',
    related: ['fvg', 'support', 'resistance'],
  },
  {
    id: 'fvg', term: 'Fair Value Gap (FVG)', level: 'intermediate', category: 'structure',
    short: 'A gap between candle wicks caused by aggressive buying or selling.',
    full: 'A Fair Value Gap is a three-candle pattern where the first and third candle\'s wicks don\'t overlap — leaving a gap in the second candle. This gap represents an "imbalance" where price moved too fast. Markets tend to revisit these gaps to "fill" them, making FVGs useful targets.',
    related: ['order-block', 'imbalance'],
  },

  // ===== ADVANCED =====
  {
    id: 'atr', term: 'ATR (Average True Range)', level: 'advanced', category: 'advanced',
    short: 'A measure of average price movement over a set number of periods.',
    full: 'ATR tells you how much an asset typically moves per candle. A 14-period ATR of 50 pips on EUR/USD means it moves about 50 pips per day on average. ATR helps with: setting stop losses (1-2× ATR), position sizing, and identifying when volatility is unusually high or low.',
    related: ['volatile', 'stop-loss'],
  },
  {
    id: 'lot-size', term: 'Lot Size', level: 'intermediate', category: 'advanced',
    short: 'The standard unit of trade size in forex.',
    full: 'In forex: 1 standard lot = 100,000 units. 1 mini lot = 10,000 units. 1 micro lot = 1,000 units. For a standard lot on EUR/USD, each pip is worth approximately $10. For a micro lot, each pip is about $0.10. Your lot size directly determines your dollar risk per pip.',
    related: ['pip', 'position-size', 'risk'],
  },
  {
    id: 'slippage', term: 'Slippage', level: 'intermediate', category: 'advanced',
    short: 'The difference between your expected price and the actual fill price.',
    full: 'Slippage occurs when your order executes at a slightly different price than expected — usually during high volatility or low liquidity. Market orders are most prone to slippage. Slippage can be positive (better price) or negative (worse price), but it\'s usually negative.',
    related: ['market-order', 'liquidity', 'spread'],
  },
  {
    id: 'commission', term: 'Commission', level: 'beginner', category: 'advanced',
    short: 'A fee charged by your broker for executing a trade.',
    full: 'Some brokers charge a fixed commission per trade (e.g., $7 per lot) on top of the spread. Others offer "zero commission" but widen the spread instead. Always calculate your total trading cost: spread + commission. Lower total cost = more profit stays in your pocket.',
    related: ['spread', 'pip'],
  },
  {
    id: 'fakeout', term: 'Fakeout', level: 'intermediate', category: 'price-action',
    short: 'A false breakout that traps traders before reversing.',
    full: 'A fakeout occurs when price briefly breaks through support or resistance, triggering breakout traders, then immediately reverses back. Smart money often engineers fakeouts to trigger stop losses and collect liquidity before the real move. This is why waiting for "confirmation" after a breakout is important.',
    related: ['breakout', 'support', 'resistance', 'liquidity'],
  },
  {
    id: 'confluence', term: 'Confluence', level: 'intermediate', category: 'advanced',
    short: 'When multiple technical factors align at the same price level.',
    full: 'Confluence is the overlap of two or more independent signals pointing to the same conclusion. The more factors that agree, the higher probability the trade. A single indicator is unreliable — but when support, a Fibonacci level, and an order block all line up at the same price? That\'s powerful confluence.',
    example: 'You identify: (1) a support level at $1.2800, (2) a 61.8% Fibonacci retracement at $1.2805, (3) a bullish order block at $1.2795. Three independent reasons to buy at the same zone = high-confidence trade.',
    related: ['support', 'order-block'],
    quiz: { q: 'Confluence means:', opts: ['Using only one indicator', 'Multiple signals agreeing at the same level', 'Trading on news events', 'Having a large account'], correct: 1, explain: 'Confluence is when multiple independent factors — support levels, Fibonacci, order blocks, trendlines — all point to the same price zone, increasing the probability of a successful trade.' },
  },
  {
    id: 'position', term: 'Position', level: 'beginner', category: 'basics',
    short: 'An open trade that hasn\'t been closed yet.',
    full: 'When you have an active trade (buy or sell), you\'re "in a position". A long position means you\'ve bought. A short position means you\'ve sold. You "close" or "exit" a position when you take your profit or loss.',
    related: ['long', 'short'],
  },
  {
    id: 'imbalance', term: 'Imbalance', level: 'intermediate', category: 'structure',
    short: 'A zone where aggressive buying or selling created an unfair price gap.',
    full: 'An imbalance occurs when one side (buyers or sellers) overwhelms the other, causing price to move so fast it leaves gaps. These zones often act as magnets — price tends to return to "rebalance" them. Fair Value Gaps are a specific type of imbalance.',
    related: ['fvg', 'liquidity'],
  },
];

// ============================================================
// CATEGORIES
// ============================================================
const categories: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Terms', icon: '📚' },
  { id: 'basics', label: 'Basics', icon: '🏠' },
  { id: 'price-action', label: 'Price Action', icon: '📈' },
  { id: 'risk', label: 'Risk Management', icon: '🛡️' },
  { id: 'orders', label: 'Order Types', icon: '📋' },
  { id: 'structure', label: 'Market Structure', icon: '🧱' },
  { id: 'advanced', label: 'Advanced', icon: '🎓' },
];

const levelColors: Record<Level, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Beginner' },
  intermediate: { bg: 'bg-primary-500/10', text: 'text-primary-400', label: 'Intermediate' },
  advanced: { bg: 'bg-accent-500/10', text: 'text-accent-400', label: 'Advanced' },
};

// ============================================================
// VISUAL DEMOS
// ============================================================
function VolatilityDemo() {
  const [highVol, setHighVol] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = 600; c.height = 200; c.style.width = '100%'; c.style.height = '100px';
    let animId: number;
    const draw = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      const w = 300, h = 100;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, w, h);
      const t = frameRef.current * 0.03;
      const amp = highVol ? 30 : 8;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 60; i++) {
        pts.push({ x: (i / 60) * w, y: h / 2 + Math.sin(t + i * 0.3) * amp + Math.sin(t * 1.7 + i * 0.15) * amp * 0.5 + (highVol ? Math.cos(t * 3 + i * 0.8) * amp * 0.3 : 0) });
      }
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = highVol ? '#f59e0b' : '#0ea5e9'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center';
      ctx.fillText(highVol ? '⚡ HIGH VOLATILITY' : '〰️ LOW VOLATILITY', w / 2, 16);
      frameRef.current++; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [highVol]);
  return (
    <div className="mt-3">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <div className="flex gap-2 mt-2">
        <button onClick={() => setHighVol(true)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${highVol ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-500'}`}>High Volatility</button>
        <button onClick={() => setHighVol(false)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${!highVol ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-500'}`}>Low Volatility</button>
      </div>
    </div>
  );
}

function SpreadDemo() {
  return (
    <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-center flex-1">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bid (Sell)</div>
          <div className="text-lg font-bold text-red-400 font-mono">1.2748</div>
        </div>
        <div className="text-center px-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Spread</div>
          <div className="text-lg font-bold text-amber-400 font-mono">2 pips</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ask (Buy)</div>
          <div className="text-lg font-bold text-green-400 font-mono">1.2750</div>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 relative">
        <div className="absolute left-[49%] right-[49%] h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full" />
        <div className="absolute left-[46%] right-[46%] h-full bg-amber-500/40 rounded-full animate-pulse" />
      </div>
      <p className="text-[11px] text-gray-500 mt-2 text-center">You pay the spread every time you open a trade</p>
    </div>
  );
}

function LeverageDemo() {
  const [lev, setLev] = useState(10);
  const deposit = 100;
  const position = deposit * lev;
  const profitPer1Pct = position * 0.01;
  return (
    <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">Leverage</span>
        <span className="font-mono font-bold text-primary-400">1:{lev}</span>
      </div>
      <input type="range" min={1} max={100} value={lev} onChange={e => setLev(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400 [&::-webkit-slider-thumb]:cursor-pointer" />
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-[9px] text-gray-500 uppercase">Your Money</div>
          <div className="text-sm font-bold font-mono">${deposit}</div>
        </div>
        <div className="p-2 rounded-lg bg-primary-500/10">
          <div className="text-[9px] text-primary-400 uppercase">Position</div>
          <div className="text-sm font-bold font-mono text-primary-400">${position.toLocaleString()}</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-[9px] text-gray-500 uppercase">1% Move =</div>
          <div className="text-sm font-bold font-mono">${profitPer1Pct.toFixed(0)}</div>
        </div>
      </div>
      {lev > 50 && <p className="text-[11px] text-red-400 mt-2 text-center">⚠️ Extreme leverage — a 1% move against you loses ${profitPer1Pct.toFixed(0)} ({(profitPer1Pct / deposit * 100).toFixed(0)}% of your deposit!)</p>}
    </div>
  );
}

function RiskRewardDemo() {
  return (
    <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-stretch gap-1 h-24 mb-3">
        <div className="flex-1 bg-red-500/20 rounded-lg flex flex-col items-center justify-center border border-red-500/20">
          <div className="text-[9px] text-red-400 uppercase font-semibold">Risk</div>
          <div className="text-lg font-bold text-red-400">30</div>
          <div className="text-[9px] text-red-400/60">pips</div>
        </div>
        <div className="flex items-center px-1"><span className="text-gray-600 text-xs">→</span></div>
        <div className="flex-[2] bg-green-500/20 rounded-lg flex flex-col items-center justify-center border border-green-500/20">
          <div className="text-[9px] text-green-400 uppercase font-semibold">Reward</div>
          <div className="text-lg font-bold text-green-400">60</div>
          <div className="text-[9px] text-green-400/60">pips</div>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs text-gray-500">Ratio: </span>
        <span className="font-mono font-bold text-primary-400">1:2 R:R</span>
        <p className="text-[11px] text-gray-500 mt-1">You only need to win 34% of trades to be profitable at 1:2</p>
      </div>
    </div>
  );
}

function PipDemo() {
  return (
    <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="font-mono text-center text-2xl font-bold tracking-wider mb-2">
        1.<span className="text-gray-400">27</span><span className="text-primary-400 relative">5<span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-primary-400 font-sans">← pip</span></span><span className="text-gray-600">0</span>
      </div>
      <p className="text-[11px] text-gray-500 text-center">The 4th decimal place is one pip. The 5th is a "pipette" (1/10th of a pip).</p>
    </div>
  );
}

const visualComponents: Record<string, React.ReactNode> = {
  'volatility': <VolatilityDemo />,
  'spread': <SpreadDemo />,
  'leverage': <LeverageDemo />,
  'risk-reward': <RiskRewardDemo />,
  'pip': <PipDemo />,
};

// ============================================================
// INLINE QUIZ COMPONENT
// ============================================================
function InlineQuiz({ quiz }: { quiz: NonNullable<GlossaryTerm['quiz']> }) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div className="mt-3 p-4 rounded-xl bg-accent-500/5 border border-accent-500/15">
      <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-2">Quick Check</p>
      <p className="text-sm font-semibold mb-3">{quiz.q}</p>
      <div className="space-y-1.5">
        {quiz.opts.map((opt, i) => {
          let cls = 'p-2.5 rounded-lg text-xs cursor-pointer transition-all border ';
          if (answer === null) cls += 'bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.98]';
          else if (i === quiz.correct) cls += 'bg-green-500/10 border-green-500/30 text-green-400';
          else if (i === answer) cls += 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60';
          else cls += 'bg-white/[0.02] border-white/[0.03] opacity-30 pointer-events-none';
          return <div key={i} className={cls} onClick={() => answer === null && setAnswer(i)}>{opt}</div>;
        })}
      </div>
      {answer !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-gray-400 leading-relaxed">
          <span className="text-primary-400 font-bold">✓</span> {quiz.explain}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setScrollPct(Math.min(100, Math.round((window.scrollY / t) * 100))); };
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const filtered = useMemo(() => {
    let items = glossary;
    if (activeCategory !== 'all') items = items.filter(t => t.category === activeCategory);
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(t => t.term.toLowerCase().includes(s) || t.short.toLowerCase().includes(s) || t.full.toLowerCase().includes(s));
    }
    return items;
  }, [search, activeCategory]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} /></div>
          <span className="font-mono text-[10px] text-gray-500">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-10 px-6 text-center">
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative z-10 max-w-2xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-400">Reference</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            Trading{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Glossary</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-base max-w-md mx-auto leading-relaxed mb-8">
            Every trading term explained in plain English — with interactive examples, visuals, and quick quizzes.
          </motion.p>

          {/* Search */}
          <motion.div variants={fadeUp} className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search terms..."
              className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-500/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </motion.div>

          {/* Category filters */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  activeCategory === cat.id ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'bg-white/5 text-gray-500 border border-transparent hover:bg-white/[0.08]'
                }`}>
                <span className="mr-1">{cat.icon}</span>{cat.label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Results count */}
      <div className="max-w-2xl mx-auto px-5 mb-4">
        <p className="text-xs text-gray-600">{filtered.length} term{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Terms list */}
      <section className="max-w-2xl mx-auto px-5 pb-32">
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map((term, i) => {
              const isExpanded = expandedId === term.id;
              const lv = levelColors[term.level];
              return (
                <motion.div
                  key={term.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                >
                  <div
                    className={`glass-card rounded-2xl overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-primary-500/20' : ''}`}
                  >
                    {/* Header — always visible */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : term.id)}
                      className="w-full flex items-start gap-3 p-4 text-left active:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-[15px]">{term.term}</h3>
                          <span className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${lv.bg} ${lv.text}`}>{lv.label}</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{term.short}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-600 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            <div className="h-px bg-white/[0.06]" />

                            {/* Full explanation */}
                            <p className="text-sm text-gray-300 leading-relaxed">{term.full}</p>

                            {/* Example */}
                            {term.example && (
                              <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
                                <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider mb-1">Example</p>
                                <p className="text-sm text-gray-400 leading-relaxed">{term.example}</p>
                              </div>
                            )}

                            {/* Visual demo */}
                            {term.visual && visualComponents[term.visual]}

                            {/* Quiz */}
                            {term.quiz && <InlineQuiz quiz={term.quiz} />}

                            {/* Related terms */}
                            {term.related && term.related.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Related:</span>
                                {term.related.map(rid => {
                                  const rt = glossary.find(g => g.id === rid);
                                  if (!rt) return null;
                                  return (
                                    <button key={rid} onClick={() => { setExpandedId(rid); setSearch(''); setActiveCategory('all'); setTimeout(() => document.getElementById(`term-${rid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-2 decoration-primary-400/30">
                                      {rt.term}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div id={`term-${term.id}`} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-gray-500">No terms found for &quot;{search}&quot;</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
