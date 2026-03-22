import { DocSection } from './indicator-docs';

export interface ProIndicatorDoc {
  title: string;
  subtitle: string;
  tradingViewUrl: string;
  role: string;
  lines: string;
  sections: DocSection[];
  prevIndicator?: { slug: string; title: string };
  nextIndicator?: { slug: string; title: string };
}

export const proIndicatorDocs: Record<string, ProIndicatorDoc> = {
  'atlas-cipher-pro': {
    title: 'Atlas Cipher Pro',
    subtitle: 'Signal Intelligence — the complete signal engine of the ATLAS suite. Proprietary PX (Pulse Cross) and TS (Tension Snap) signals, adaptive ribbon, risk envelope, smart structure, imbalance tracking, liquidity sweeps, and a 14-row Command Center.',
    tradingViewUrl: 'https://www.tradingview.com/script/vvf2W2ZG/',
    role: 'Signal Intelligence',
    lines: '3,514',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Atlas Cipher Pro</strong> is the signal intelligence engine of the ATLAS suite. It generates trade signals, visualises market structure, and provides a Command Center dashboard that explains every market condition in plain English. At 3,514 lines of Pine Script v6, it is one of the most feature-dense overlay indicators on TradingView.</p>

          <h3>What CIPHER PRO Does</h3>
          <p>CIPHER PRO answers the core trading question: <em>Should I enter a trade right now, and if so, where do I put my stop and targets?</em></p>
          <ul>
            <li><strong>Signal Engine</strong> — Two proprietary signal types: PX (Pulse Cross) for trend entries and TS (Tension Snap) for reversal entries. Each signal includes a full Risk Map (SL + TP1/TP2/TP3) in the tooltip.</li>
            <li><strong>Visual Analysis Layers</strong> — Eight independent chart overlays: Cipher Ribbon, Risk Envelope, Cipher Structure, Cipher Spine, Cipher Imbalance, Cipher Sweeps, Cipher Coil, and Cipher Pulse. Each can be toggled independently or managed via presets.</li>
            <li><strong>Command Center</strong> — Up to 14 dashboard rows showing trend, pulse, tension, momentum, volatility, volume, risk, structure, imbalance, sweeps, market bias, session, regime, HTF alignment, last signal, and live conditions — all in plain English.</li>
            <li><strong>Asset Intelligence</strong> — Auto-detects asset class (Crypto, Forex, Stocks, Indices, Commodities) and adjusts signal thresholds, Pulse width, SL/TP methods, and context symbols accordingly.</li>
          </ul>

          <h3>The Proprietary Engine</h3>
          <p>Every signal in CIPHER PRO is built from proprietary metrics — not generic indicators:</p>
          <ul>
            <li><strong>Cipher Core / Flow / Anchor</strong> — Three adaptive trend lines that form the ribbon. Each adapts independently to efficiency ratio, ADX, ATR, and volume conviction. This is NOT a moving average crossover.</li>
            <li><strong>Cipher Velocity</strong> — Rate of change of the ribbon spread, measuring how fast the trend is accelerating or decelerating.</li>
            <li><strong>Cipher Tension</strong> — Distance from price to Cipher Flow in ATR units. Measures how stretched price is from equilibrium.</li>
            <li><strong>Cipher Pulse</strong> — Dynamic support/resistance line anchored to Flow with ATR distance. Ratchets like a Supertrend but built on proprietary adaptive internals.</li>
          </ul>
          <p>RSI, MACD, and ADX are used <em>only</em> for quality scoring and dashboard context — never for signal triggers.</p>

          <h3>Six Presets</h3>
          <p>Quick-start configurations with max 3 visual layers each for a clean chart:</p>
          <ul>
            <li><strong>Trend Trader</strong> — Ribbon + Pulse + Trend candles. Follow the wave.</li>
            <li><strong>Scalper</strong> — Structure + Imbalance + Pulse (tight) + Composite candles.</li>
            <li><strong>Swing Trader</strong> — Ribbon + Spine + Pulse (wide). Strong signals only.</li>
            <li><strong>Reversal</strong> — Spine + Imbalance + Risk Envelope + Tension candles.</li>
            <li><strong>Sniper</strong> — Pulse (widest) + Coil. Wait for the squeeze, then strike.</li>
            <li><strong>Structure</strong> — Structure + Imbalance + Sweeps. No signals — pure chart reading.</li>
          </ul>

          <h3>Key Properties</h3>
          <ul>
            <li><strong>3,514 lines</strong> of Pine Script v6</li>
            <li><strong>64/64 outputs</strong> — zero headroom (at the TradingView maximum)</li>
            <li><strong>15 alert conditions</strong> covering signals, regime changes, squeezes, sweeps, momentum, divergence, and risk zones</li>
            <li><strong>Non-repainting</strong> signals — all triggers use closed-bar data</li>
            <li><strong>Cross-asset adaptive</strong> — Crypto, Forex, Stocks, Indices, Commodities</li>
          </ul>
        `,
      },
      {
        id: 'signal-engine',
        title: 'Signal Engine',
        icon: 'trading',
        content: `
          <h3>Signal Type 1: PX (Pulse Cross)</h3>
          <p>The primary trend signal. Fires when price crosses the Cipher Pulse line — the dynamic support/resistance that tracks the trend.</p>
          <ul>
            <li><strong>Trigger</strong> — Price closes above Pulse (Long) or below Pulse (Short)</li>
            <li><strong>Filters</strong> — Body > minimum size (asset-adaptive), pre-cross distance > threshold, rapid-flip suppression, failed-flip exemption</li>
            <li><strong>Character</strong> — Catches trend starts, breakouts, and continuations. Self-limiting (Pulse only flips once per move).</li>
          </ul>

          <h3>Signal Type 2: TS (Tension Snap)</h3>
          <p>The reversal signal. Fires when price has been stretched from equilibrium and snaps back with conviction.</p>
          <p>Four conditions must all align:</p>
          <ol>
            <li><strong>Was Stretched</strong> — Tension exceeded the asset-adaptive threshold within the lookback window</li>
            <li><strong>Snapping Back</strong> — Tension is now reducing from the extreme</li>
            <li><strong>Rejection Candle</strong> — Strong body (>40% of range) confirming real buyers/sellers</li>
            <li><strong>Velocity Shifting</strong> — Momentum is turning with meaningful magnitude (>20% of median velocity)</li>
          </ol>
          <p>TS has an explicit cooldown to prevent spam during choppy reversals (8-12 bars depending on timeframe).</p>

          <h3>Signal Direction Filter</h3>
          <p>Choose which signals to see: Both, Long Only, or Short Only. Use with higher-timeframe bias to filter against the trend.</p>

          <h3>Strong Signal Filter</h3>
          <p>When "Strong Signals Only" is ON, signals require 3+ out of 4 conviction factors:</p>
          <ul>
            <li>Ribbon stacked with signal direction</li>
            <li>ADX > 20 (trend strength present)</li>
            <li>Volume > 1.0x average (institutional participation)</li>
            <li>Momentum health > 50% (fuel remaining)</li>
          </ul>

          <h3>Signal Context Tags</h3>
          <p>Every signal label includes a context tag in the tooltip describing the setup type — such as "Trend + Ribbon", "Squeeze Breakout", "Sweep Reversal", "FVG Confluence", and others. The tag tells you WHY the signal fired, not just that it did.</p>

          <h3>Risk Map (Tooltip)</h3>
          <p>Hover any signal label to see the full trade plan:</p>
          <ul>
            <li><strong>Entry</strong> — Signal close price</li>
            <li><strong>SL</strong> — Auto-selected per asset class: Structure (swing low/high), Pulse (invalidation level), or ATR-based. Safety guard ensures SL is always on the loss side.</li>
            <li><strong>TP1 / TP2 / TP3</strong> — Auto-selected per asset class: R-Multiple (crypto), ATR Targets (forex), or Structure S/R levels (stocks/indices). Falls back to R-Multiple if structure levels are insufficient.</li>
            <li><strong>Market snapshot</strong> — HTF alignment, regime, ribbon state, pulse state, ADX, volume, momentum, tension, mean reversion score</li>
          </ul>
        `,
      },
      {
        id: 'visual-layers',
        title: 'Visual Analysis Layers',
        icon: 'concept',
        content: `
          <h3>1. Cipher Ribbon</h3>
          <p>Three adaptive trend lines (Core/Flow/Anchor) that wrap price like a sleeve. Not moving average crossovers — each line adapts independently to efficiency ratio, ADX, ATR, and volume conviction.</p>
          <ul>
            <li><strong>Stacked bull</strong> (Core > Flow > Anchor) = trend is healthy</li>
            <li><strong>Stacked bear</strong> (Core < Flow < Anchor) = downtrend is healthy</li>
            <li><strong>Crossing</strong> = trend is transitioning</li>
            <li><strong>Ribbon Divergence</strong> — Price makes new highs/lows but ribbon spread is weakening. The trend is deteriorating from inside before it shows on the surface. Amber diamond marks the first bar.</li>
            <li><strong>Ribbon Projection</strong> — Kinematic extrapolation of the Core line 6 bars forward. When the projection curves back toward Flow, a trend flip may be approaching.</li>
          </ul>

          <h3>2. Cipher Risk Envelope</h3>
          <p>Adaptive volatility cloud around Fair Value (EMA of HL2, 20). Four zones: Safe, Watch, Caution, Danger. Width reflects volatility, opacity reflects conviction.</p>
          <ul>
            <li><strong>Fair Value Line</strong> — The gravitational center that price reverts to</li>
            <li><strong>Zone Transition Markers</strong> — Magenta X when entering Danger, Amber X when entering Caution</li>
            <li><strong>Adaptive Intensity</strong> — Fills brighten as price pushes deeper into danger zones and as ATR expands</li>
          </ul>

          <h3>3. Cipher Structure</h3>
          <p>Institutional support/resistance levels with proximity glow, polarity flip detection, and test tracking. Zones are pruned after N tests (liquidity consumed) or by age.</p>

          <h3>4. Cipher Spine (Momentum Spine)</h3>
          <p>Momentum decay visualisation — shows when energy behind the trend is fading. Includes a "detachment" state when momentum spine separates from the ribbon, signalling exhaustion.</p>

          <h3>5. Cipher Imbalance (Fair Value Gaps)</h3>
          <p>Smart FVG tracking with progressive mitigation — boxes SHRINK as price fills the gap, showing only the remaining magnet. Features include:</p>
          <ul>
            <li>Volume-filtered detection (displacement candle must have 1.2x+ volume)</li>
            <li>Consequential vs non-consequential classification (with-trend FVGs get brightness boost)</li>
            <li>50% equilibrium midline on each gap</li>
            <li>Fill percentage labels and detailed tooltips</li>
            <li>Age expiry at 100 bars</li>
          </ul>

          <h3>6. Cipher Sweeps (Liquidity Sweeps)</h3>
          <p>Detects when price wicks beyond a swing level and reverses — the classic institutional stop hunt. Five-factor quality scoring:</p>
          <ol>
            <li>Volume spike on sweep bar</li>
            <li>Wick depth (deeper = more stops grabbed)</li>
            <li>Rejection quality (small body = strong rejection)</li>
            <li>Trend alignment (with-trend shakeout = higher probability)</li>
            <li>Multi-level sweep (2+ levels raided simultaneously)</li>
          </ol>
          <p>Includes Sweep + FVG Confluence detection — when a sweep occurs at an active imbalance zone, the highest-conviction reversal setup.</p>

          <h3>7. Cipher Coil (Squeeze Detection)</h3>
          <p>BB-inside-KC compression detection with energy scoring (0-100) based on compression depth, duration, and volume drying. Three phases: Building → Coiling → Breakout Ready. Includes Double Coil detection (ribbon + BB/KC both compressed simultaneously).</p>

          <h3>8. Cipher Pulse</h3>
          <p>The heartbeat of the trend — a dynamic support/resistance line always visible on chart. Built on Cipher Flow + ATR distance with ratchet logic. Includes tension fill (brighter when price is stretched), glow effect, hold duration tracking, chop detection, and slope analysis.</p>
        `,
      },
      {
        id: 'command-center',
        title: 'Command Center',
        icon: 'settings',
        content: `
          <p>The Command Center is a compact intelligence panel that translates raw market data into plain English decisions. Up to 14 rows, each toggled independently.</p>

          <h3>Available Rows</h3>
          <ul>
            <li><strong>Ribbon</strong> — Direction + stack state + priority intelligence (DIVERGING, CURVING, COILED, DOUBLE COIL, AGING, lifecycle info)</li>
            <li><strong>Pulse</strong> — SUPPORT or RESISTANCE state, proximity to flip (HOLDING → CLOSE → VERY CLOSE → FLIP WARNING → FLIPPED), hold duration, chop warning</li>
            <li><strong>Tension</strong> — Snap-back pressure (RELAXED → BUILDING → STRETCHED → SNAPPING)</li>
            <li><strong>Momentum</strong> — NOW state (SURGING → STRONG → BUILDING → FADING → WEAKENING → EXHAUSTED) + NEXT guidance (HOLD POSITION, RIDE IT, ENTRY ZONE, TIGHTEN STOPS, EXIT SOON, REVERSAL COMING)</li>
            <li><strong>Volatility & Squeeze</strong> — Dual-mode: volatility state during normal conditions (VERY LOW → CONTRACTING → NORMAL → EXPANDING → HIGH), squeeze intelligence when compression is active (BUILDING → COILING → BREAKOUT READY + energy score)</li>
            <li><strong>Volume</strong> — Participation level (EMPTY → THIN → NORMAL → STRONG → EXTREME) with guidance</li>
            <li><strong>Risk Envelope</strong> — Position sizing guidance (SAFE → WATCH → CAUTION → DANGER)</li>
            <li><strong>Structure</strong> — Nearest support and resistance with ATR distance and proximity guidance</li>
            <li><strong>Imbalance</strong> — Nearest bull and bear FVG magnets with distance and fill status</li>
            <li><strong>Sweeps</strong> — Last sweep event with freshness (HOT → COOLING → COLD) and quality score</li>
            <li><strong>Market Bias</strong> — Cross-asset macro context: Crypto (BTC.D/USDT.D → RISK ON/OFF), Stocks (VIX/SPX → RISK ON/OFF/CAUTIOUS), Forex (DXY/US10Y → USD BULL/BEAR/MIXED)</li>
            <li><strong>Session</strong> — Active trading session with quality rating (KILLZONE → OVERLAP → ACTIVE → QUIET)</li>
            <li><strong>Regime</strong> — Market structure (TREND/RANGE/VOLATILE) with transition probability and predicted next regime</li>
            <li><strong>HTF Trend</strong> — Two higher timeframes with directional alignment (ALIGNED BULL / ALIGNED BEAR / CONFLICTING)</li>
            <li><strong>Last Signal</strong> — Most recent signal with freshness (JUST FIRED → FRESH → ACTIVE → AGING)</li>
            <li><strong>Live Conditions</strong> — Four at-a-glance gauges: Trend, Momentum, Volume, Tension</li>
          </ul>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Preset</h3>
          <p>Six quick-start configurations (Trend Trader, Scalper, Swing Trader, Reversal, Sniper, Structure). Each activates max 3 visual layers and sets appropriate signal type, candle colouring, conviction threshold, and Pulse width. Set to "None" for full manual control.</p>

          <h3>Visual Layers (8 toggles)</h3>
          <p>Each layer has its own toggle + Intensity setting (Subtle/Normal/Bold). When a preset is active, these are overridden.</p>

          <h3>Signal Engine</h3>
          <ul>
            <li><strong>Signal Engine</strong> — All Signals, Trend (PX only), Reversal (TS only), or Visuals Only (no signals)</li>
            <li><strong>Direction</strong> — Both, Long Only, Short Only</li>
            <li><strong>Strong Signals Only</strong> — Requires 3+/4 conviction factors</li>
            <li><strong>Cipher Candles</strong> — Default, Trend, Trend Bold, Tension, Tension Bold, Composite, Composite Bold</li>
          </ul>

          <h3>Cipher Risk Map (TP/SL)</h3>
          <ul>
            <li><strong>TP/SL in Tooltip</strong> — Adds Risk Map to every signal tooltip</li>
            <li><strong>TP Lines on Chart / SL Line on Chart</strong> — Draw visual levels when a signal fires</li>
            <li><strong>Stop Loss Method</strong> — Auto (per asset class), Structure, Pulse, or ATR</li>
            <li><strong>Take Profit Method</strong> — Auto (per asset class), R-Multiple, Structure, or ATR Targets</li>
            <li><strong>TP1/TP2/TP3 Targets</strong> — Configurable multipliers (default: 1R, 2R, 3R)</li>
          </ul>

          <h3>Cipher Pulse</h3>
          <ul>
            <li><strong>Pulse ATR Factor</strong> (default: 1.5) — Distance from Flow. Lower = tighter (more signals). Higher = wider (fewer signals, survives more noise).</li>
            <li><strong>Pulse Smoothing</strong> (default: 3) — Smoothing periods for Pulse line movement</li>
          </ul>

          <h3>Structure Settings</h3>
          <ul>
            <li><strong>Pivot Detection Length</strong> (default: 5) — Bars left/right for swing detection</li>
            <li><strong>Max Levels</strong> (default: 8) — Maximum S/R zones displayed</li>
            <li><strong>Remove After N Tests</strong> (default: 4) — Zone removed after this many touches</li>
            <li><strong>Max Zone Age</strong> (default: 200 bars) — Age-based expiry</li>
          </ul>

          <h3>Command Center</h3>
          <p>14 individually togglable rows. Position (four corners), Size (Small/Normal/Large). "Live Conditions" is the recommended default — shows trend, momentum, volume, and tension in one compact row.</p>
        `,
      },
      {
        id: 'asset-intelligence',
        title: 'Asset Intelligence',
        icon: 'concept',
        content: `
          <p>CIPHER PRO auto-detects the asset class from <code>syminfo.type</code> and adapts multiple systems accordingly. No manual configuration needed — just add the indicator to any chart.</p>

          <h3>What Adapts Per Asset Class</h3>

          <h4>Crypto</h4>
          <ul>
            <li>Pulse width: 0.90x (big wicks, wide ranges)</li>
            <li>TS tension threshold: 1.0 ATR</li>
            <li>SL: Structure (volatile wicks need structural stops)</li>
            <li>TP: R-Multiple (momentum-driven, let R run)</li>
            <li>Context: BTC.D + USDT.D → RISK ON / RISK OFF</li>
          </ul>

          <h4>Forex</h4>
          <ul>
            <li>Pulse width: 0.80x (tight ranges)</li>
            <li>TS tension threshold: 0.8 ATR</li>
            <li>SL: Pulse (tight ranges, Pulse invalidation)</li>
            <li>TP: ATR Targets (range-bound, fixed distances)</li>
            <li>Context: DXY + US10Y → USD BULL / USD BEAR / MIXED</li>
          </ul>

          <h4>Stocks & Indices</h4>
          <ul>
            <li>Pulse width: 1.0x stocks, 0.95x indices</li>
            <li>TS tension threshold: 1.2 ATR (stocks), 1.0 ATR (indices)</li>
            <li>SL: Structure (institutional swing levels)</li>
            <li>TP: Structure (key S/R levels as price magnets)</li>
            <li>Context: VIX + SPX → RISK ON / RISK OFF / CAUTIOUS</li>
          </ul>

          <h4>Commodity CFDs</h4>
          <ul>
            <li>Pulse width: 0.80x (behaves like forex)</li>
            <li>TS tension threshold: 0.8 ATR</li>
            <li>SL/TP: Same as forex</li>
            <li>Context: DXY-based</li>
          </ul>

          <h3>Index Detection</h3>
          <p>Brokers report index CFDs inconsistently (some as "index", others as "cfd"). CIPHER PRO uses dual detection — both <code>syminfo.type</code> and ticker pattern matching (NAS100, US500, DAX, FTSE, etc.) to correctly identify indices regardless of broker.</p>

          <h3>Timeframe Adaptation</h3>
          <p>Pulse width tightens on higher timeframes (Weekly ATR is huge — 1.5x would be absurd). Signal body thresholds, distance filters, and cooldown windows all scale by timeframe category (Scalp, Intra, Swing, Daily+).</p>
        `,
      },
      {
        id: 'regime-detection',
        title: 'Regime Detection & Prediction',
        icon: 'interpretation',
        content: `
          <h3>Three Regimes</h3>
          <ul>
            <li><strong>TREND</strong> — ADX-driven. High directional efficiency. Strategy: follow the move, use Pulse as trailing stop.</li>
            <li><strong>RANGE</strong> — Low trend score, low volatility. Price rotating. Strategy: fade extremes, target mean (Fair Value Line).</li>
            <li><strong>VOLATILE</strong> — ATR spiking above 1.5-2x normal. Strategy: widen stops, reduce size, expect noise.</li>
          </ul>

          <h3>Regime Transition Predictor</h3>
          <p>CIPHER PRO tracks how long each regime lasts historically and what typically follows. Using a sigmoid probability curve, it predicts when the current regime is likely to change and what the most probable next regime is.</p>
          <ul>
            <li>At 50% of average duration → ~25% change probability</li>
            <li>At 100% of average duration → ~60% change probability</li>
            <li>At 150% of average duration → ~85% change probability</li>
          </ul>
          <p>The transition matrix tracks all six possible transitions (TREND→RANGE, TREND→VOLATILE, RANGE→TREND, etc.) and reports the most likely next state with its historical probability.</p>
          <p>Dashboard output example: "TREND for 23 bars (avg 35) | 66% → RANGE"</p>
        `,
      },
      {
        id: 'alerts',
        title: 'Alert System',
        icon: 'settings',
        content: `
          <p>CIPHER PRO provides 15 alert conditions covering every major event.</p>

          <h3>Signal Alerts</h3>
          <ul>
            <li><strong>Long Signal</strong> — Any long signal fired (PX or TS)</li>
            <li><strong>Short Signal</strong> — Any short signal fired</li>
            <li><strong>Any Signal</strong> — Either direction</li>
            <li><strong>Strong Long</strong> — 3+ conviction factors aligned</li>
            <li><strong>Strong Short</strong> — 3+ conviction factors aligned</li>
          </ul>

          <h3>Structure Alerts</h3>
          <ul>
            <li><strong>Pulse Flip</strong> — Primary trend change</li>
            <li><strong>Squeeze Breakout</strong> — Compressed energy released</li>
            <li><strong>Liquidity Sweep</strong> — Stops raided beyond swing level</li>
            <li><strong>Sweep + FVG Confluence</strong> — Sweep at an active imbalance zone</li>
          </ul>

          <h3>Intelligence Alerts</h3>
          <ul>
            <li><strong>Regime Change</strong> — Market shifted between TREND / RANGE / VOLATILE</li>
            <li><strong>Momentum Exhausted</strong> — Fuel depleted, reversal likely</li>
            <li><strong>Momentum Dying</strong> — Trend losing energy</li>
            <li><strong>Risk: DANGER Zone</strong> — Price entered danger zone in Risk Envelope</li>
            <li><strong>Ribbon Divergence</strong> — Internal trend deterioration detected</li>
            <li><strong>Double Coil</strong> — Ribbon + BB/KC both compressed (highest energy state)</li>
          </ul>
        `,
      },
      {
        id: 'how-to',
        title: 'How To Use CIPHER PRO',
        icon: 'usage',
        content: `
          <h3>Getting Started (First 5 Minutes)</h3>
          <ol>
            <li>Add CIPHER PRO to your chart</li>
            <li>Select a Preset that matches your style (Trend Trader is the best starting point)</li>
            <li>Enable "Live Conditions" in the Command Center (it is on by default)</li>
            <li>Watch for Long/Short triangle labels — hover them to see the full Risk Map</li>
          </ol>

          <h3>Reading a Signal Tooltip</h3>
          <p>Every signal tooltip contains:</p>
          <ul>
            <li><strong>Source</strong> — "Pulse Cross" or "Tension Snap" (tells you the signal type)</li>
            <li><strong>Context Tag</strong> — Why this signal fired (e.g., "Trend + Ribbon", "Squeeze Release")</li>
            <li><strong>HTF Alignment</strong> — Are higher timeframes with you or against you?</li>
            <li><strong>Regime</strong> — Current market structure</li>
            <li><strong>Ribbon, Pulse, ADX, Volume, Momentum, Tension</strong> — Full market snapshot</li>
            <li><strong>Risk Map</strong> — Entry, SL, TP1/TP2/TP3 with exact prices and methods</li>
          </ul>

          <h3>Using Presets Effectively</h3>
          <ul>
            <li><strong>Start with a preset</strong> — Don't turn everything on at once. Each preset activates max 3 visual layers.</li>
            <li><strong>Graduate to "None"</strong> — Once you understand each layer, switch to None and build your own combination.</li>
            <li><strong>Match preset to market</strong> — Trend Trader in trending markets, Reversal in ranging markets, Sniper when waiting for a squeeze.</li>
          </ul>

          <h3>Using the Command Center</h3>
          <ul>
            <li><strong>Start with Live Conditions only</strong> — Four compact gauges give you the full picture</li>
            <li><strong>Add rows as needed</strong> — Enable Pulse when you want Pulse intelligence, Ribbon when using the ribbon visual</li>
            <li><strong>Position it away from your chart</strong> — Bottom Right is default, move if it overlaps your analysis area</li>
          </ul>

          <h3>Combining with Other ATLAS Indicators</h3>
          <ul>
            <li><strong>CIPHER + Sessions+</strong> — Check if the killzone is active and ADR is not exhausted before taking a CIPHER signal</li>
            <li><strong>CIPHER + PHANTOM PRO</strong> — CIPHER fires the signal, PHANTOM confirms the structure (order blocks, BOS/CHoCH alignment)</li>
            <li><strong>CIPHER + PULSE PRO</strong> — CIPHER fires the signal, PULSE PRO confirms momentum health and checks for divergences</li>
            <li><strong>CIPHER + RADAR PRO</strong> — RADAR screens for tickers with confluence, CIPHER executes on the best setups</li>
          </ul>

          <h3>What NOT to Do</h3>
          <ul>
            <li>Don't enable all 8 visual layers at once — the chart becomes unreadable</li>
            <li>Don't ignore the "Strong Signals Only" filter — it exists because weak signals have significantly lower win rates</li>
            <li>Don't trade against HTF alignment shown in the tooltip — if both higher timeframes are against you, the signal is fighting the current</li>
            <li>Don't use CIPHER PRO on timeframes below 1m — the signal engine needs enough price data to be meaningful</li>
          </ul>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip 1: The Tooltip is the Product</h3>
          <p>The triangle on the chart is just the trigger. The real value is in the tooltip — it contains the complete market snapshot, Risk Map, and context tag. Always hover before acting.</p>

          <h3>Tip 2: Ribbon Divergence is the Earliest Warning</h3>
          <p>When you see an amber diamond (Ribbon Divergence), the trend is dying from the inside even though price looks fine. This often appears 10-30 bars before the actual reversal. Start tightening stops.</p>

          <h3>Tip 3: Double Coil is the Highest Energy State</h3>
          <p>When the Cipher Coil shows a Double Coil (ribbon compressed AND BB inside KC), this is the maximum stored energy state. The breakout from a Double Coil is statistically the most explosive move. Set alerts for it.</p>

          <h3>Tip 4: TS Signals Near Pulse are Highest Conviction</h3>
          <p>When a Tension Snap (TS) fires near the Cipher Pulse line, you get two confluences — the price is both stretched AND at the dynamic S/R level. The tooltip will show "Pulse TP ref" with a mean reversion target.</p>

          <h3>Tip 5: Use Regime to Choose Your Preset</h3>
          <p>TREND regime → Trend Trader preset. RANGE regime → Reversal preset. Pre-squeeze → Sniper preset. Match the tool to the conditions.</p>

          <h3>Tip 6: Check Sweep Freshness Before Entries</h3>
          <p>A HOT sweep (within 3 bars) in your signal direction is a major confluence. The Smart Money just grabbed stops — your entry aligns with the institutional flow. A COLD sweep (10+ bars ago) is less relevant.</p>

          <h3>Tip 7: FVG Consequential Classification Matters</h3>
          <p>Consequential FVGs (with-trend) are brighter and act as stronger magnets. Non-consequential FVGs often get filled quickly and don't provide reliable support/resistance.</p>

          <h3>Tip 8: The Fair Value Line is Your Mean Reversion Target</h3>
          <p>When the Risk Envelope is active, the dotted white Fair Value Line is the gravitational centre. In ranging markets, price reverts to it. Use it as a target for Tension Snap trades.</p>
        `,
      },
    ],
    nextIndicator: { slug: 'atlas-phantom-pro', title: 'Atlas Phantom Pro' },
  },

  // PHANTOM PRO, PULSE PRO, RADAR PRO — to be added in follow-up sessions
};

export function getProIndicatorDoc(slug: string): ProIndicatorDoc | undefined {
  return proIndicatorDocs[slug];
}
