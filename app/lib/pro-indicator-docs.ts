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
            <li><strong>CIPHER + Sessions +</strong> — Check if the killzone is active and ADR is not exhausted before taking a CIPHER signal</li>
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

  'atlas-phantom-pro': {
    title: 'Atlas Phantom Pro',
    subtitle: 'Structure Intelligence — the institutional footprint engine. Dual-layer market structure (BOS/CHoCH), Three-Eye Order Blocks with Zone DNA grading, Fair Value Gaps, Liquidity detection, Institutional Levels with sweep lifecycle, Smart Money Sequence, and a Narrative Engine that reads the market in plain English.',
    tradingViewUrl: 'https://www.tradingview.com/script/fMZJJ8FQ/',
    role: 'Structure Intelligence',
    lines: '~4,563',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Atlas Phantom Pro</strong> is the structure intelligence engine of the ATLAS suite. It maps the institutional footprint — order blocks, structure breaks, liquidity pools, fair value gaps, and institutional levels — then synthesises everything into plain English intelligence via the Narrative Engine.</p>

          <h3>What PHANTOM PRO Does</h3>
          <p>PHANTOM PRO answers the structural question: <em>Where are institutions positioned, what structure has formed, and where is the market likely to move next?</em></p>
          <ul>
            <li><strong>Dual-Layer Market Structure</strong> — Internal (short-term, 3-bar lookback) and Swing (long-term, 14-bar lookback) structure detected simultaneously. BOS, CHoCH, CHoCH+, and CHoCH- events classified with 4-factor strength scoring.</li>
            <li><strong>Three-Eye Order Blocks</strong> — Zones graded by Zone DNA (5-factor A+ to D scoring) with lifecycle tracking (Fresh → Tested → Weak → Critical → Broken → Breaker). POC line shows the actual institutional entry level.</li>
            <li><strong>Fair Value Gaps</strong> — Standard FVG and Inverse FVG (IFVG) detection with fill probability, ETA estimation, and CE (Consequent Encroachment) midpoint lines.</li>
            <li><strong>Liquidity Engine</strong> — Equal Highs/Lows, Liquidity Grabs, and diagonal BSL/SSL trendlines with sweep detection.</li>
            <li><strong>Institutional Levels™</strong> — Previous Day/Week/Month/Quarter highs and lows with live status lifecycle: Untested → Approaching → Testing → Swept.</li>
            <li><strong>Narrative Engine™</strong> — Synthesises all signals into a 3-line plain English market read. No numbers, no codes — just clear intelligence.</li>
          </ul>

          <h3>Architecture</h3>
          <p>PHANTOM PRO is built across 7 phases and 23 features, unified by the ZoneState schema — a single source of truth for every zone's grade, status, and priority:</p>
          <ul>
            <li><strong>Phase 1</strong> — Foundation (constants, inputs, UDTs, global variables)</li>
            <li><strong>Phase 2</strong> — Structure Engine + Structural Flow (dual-layer swing detection, BOS/CHoCH classification, strength scoring, structure grade)</li>
            <li><strong>Phase 3</strong> — Order Block Detection (Three-Eye system)</li>
            <li><strong>Phase 4</strong> — Zone Intelligence (Zone DNA grading, lifecycle, mitigation, trap detection)</li>
            <li><strong>Phase 5</strong> — Order Block Visualisation</li>
            <li><strong>Phase 6</strong> — FVG Engine, Liquidity Engine, Confluence Kill Zones</li>
            <li><strong>Phase 7</strong> — Intelligence Layer (Narrative Engine, Command Center, Ghost Performance, Alerts)</li>
          </ul>

          <h3>Key Properties</h3>
          <ul>
            <li><strong>~4,563 lines</strong> of Pine Script v6</li>
            <li><strong>17 alert events</strong> via JSON payloads (use "Any alert() function call" in TradingView)</li>
            <li><strong>9 request.security() calls</strong> — HTF confluence + 4-TF MTF Panel + Institutional Levels</li>
            <li><strong>Non-repainting</strong> structure detection</li>
            <li><strong>Asset-adaptive</strong> — age decay, sensitivity, and swing detection adjust per asset class and timeframe</li>
          </ul>
        `,
      },
      {
        id: 'market-structure',
        title: 'Market Structure Engine',
        icon: 'trading',
        content: `
          <h3>Dual-Layer Detection</h3>
          <p>PHANTOM PRO runs two independent structure layers simultaneously:</p>
          <ul>
            <li><strong>Internal Layer</strong> — Short-term swings (default 3-bar lookback). Catches every minor structure shift. Best for scalping and intraday entries.</li>
            <li><strong>Swing Layer</strong> — Long-term swings (default 14-bar lookback). Captures major structural shifts. Best for swing trading and position context.</li>
          </ul>

          <h3>Structure Break Types</h3>
          <ul>
            <li><strong>BOS (Break of Structure)</strong> — Continuation. Price breaks a swing high in an uptrend or swing low in a downtrend. Confirms the current trend is intact.</li>
            <li><strong>CHoCH (Change of Character)</strong> — First signal of potential reversal. Price breaks the opposite side — a swing low in an uptrend or swing high in a downtrend.</li>
            <li><strong>CHoCH+</strong> — Strong reversal. CHoCH with above-average strength score (volume + momentum + wick + displacement all aligned).</li>
            <li><strong>CHoCH-</strong> — Weak reversal. CHoCH with below-average strength. May be a false break rather than a real reversal.</li>
          </ul>

          <h3>4-Factor Strength Scoring (0-100)</h3>
          <p>Every structure break is scored on four independent factors:</p>
          <ul>
            <li><strong>Volume (30%)</strong> — Was the break bar backed by institutional volume?</li>
            <li><strong>Momentum (30%)</strong> — Was the break impulsive or gradual?</li>
            <li><strong>Wick Rejection (20%)</strong> — Did the bar close near its extreme (strong) or show a large rejection wick (weak)?</li>
            <li><strong>Displacement (20%)</strong> — How far did price travel past the broken level?</li>
          </ul>

          <h3>Structure Grade (A+ to F)</h3>
          <p>The overall structural quality, factoring in trend consistency, swing health, and break quality. A/B grades = trade confidently. D/F grades = reduce size or wait.</p>

          <h3>Structural Flow</h3>
          <p>A visual line encoding trend health through line width and style. Wider + solid = strong structure. Thin + dashed = deteriorating. Auto mode adapts width from break strength.</p>

          <h3>Cross-Layer Divergence</h3>
          <p>Compares internal and swing layer directions:</p>
          <ul>
            <li><strong>ALIGNED</strong> — Both layers agree. Highest conviction.</li>
            <li><strong>INT LEADING</strong> — Internal has shifted but swing hasn't. Early warning.</li>
            <li><strong>DIVERGED</strong> — Layers in opposite directions. Caution zone.</li>
          </ul>

          <h3>Swing Projection</h3>
          <p>Price targets from recent swings using three methods: Average (mean swing size), Fibonacci (1.0/1.272/1.618 extensions), or ATR (1.5/2.0/3.0× multiples). Confidence adjusts with grade and trend strength.</p>

          <h3>Shift Risk</h3>
          <p>A 0-100 probability score for trend reversal based on failed swings, diverging layers, compression, and momentum decay. When Shift Risk exceeds the threshold, the chart background tints amber as a visual warning.</p>
        `,
      },
      {
        id: 'order-blocks',
        title: 'Order Blocks & Zone DNA',
        icon: 'concept',
        content: `
          <h3>Three-Eye Detection</h3>
          <p>Every Order Block is evaluated on three criteria (the "Three Eyes"):</p>
          <ul>
            <li><strong>Eye 1: Structure</strong> — Is the OB anchored to a structure break (BOS/CHoCH)?</li>
            <li><strong>Eye 2: Displacement</strong> — Did price leave the zone with an impulsive candle?</li>
            <li><strong>Eye 3: Volume</strong> — Is there a volume imbalance confirming institutional activity?</li>
          </ul>
          <p>One-Eye zones are weak. Two-Eye zones are tradeable. Three-Eye zones are the highest conviction.</p>

          <h3>Zone DNA Grading (A+ to D)</h3>
          <p>The ZoneState schema provides a single source of truth for every zone. The base grade is calculated from 5 factors, then modified by real-time events:</p>
          <ul>
            <li><strong>Base grade (0-100)</strong> — Eye count, displacement quality, volume imbalance, session context, birth context</li>
            <li><strong>Trap boost (+15)</strong> — Price returned to zone and rejected (institutional re-entry confirmed)</li>
            <li><strong>CKZ membership (+8)</strong> — Zone overlaps with a Confluence Kill Zone</li>
            <li><strong>Reaction boost (+5)</strong> — Currently reacting to the zone</li>
            <li><strong>Test penalty (-8 per test)</strong> — Cumulative degradation from repeated touches</li>
            <li><strong>Age decay</strong> — Half-life degradation, asset-adaptive (crypto decays faster than stocks)</li>
            <li><strong>Breaker penalty (-20)</strong> — If the zone has been broken and flipped</li>
          </ul>

          <h3>Zone Lifecycle</h3>
          <p>Every zone progresses through a one-directional lifecycle:</p>
          <p><strong>Fresh</strong> → <strong>Tested</strong> (1 touch) → <strong>Weak</strong> (2 touches) → <strong>Critical</strong> (3 touches) → <strong>Broken</strong> (price closes through) → <strong>Breaker</strong> (broken zone that may flip as new S/R)</p>

          <h3>POC vs Midpoint</h3>
          <ul>
            <li><strong>POC Line</strong> — Volume-weighted Point of Control inside the zone. The actual price level where institutional orders concentrated. More accurate than midpoint.</li>
            <li><strong>Mid-Line</strong> — Geometric 50% of the zone. Standard reference level.</li>
          </ul>

          <h3>Power Balance Bar</h3>
          <p>Visual bar inside each zone showing the bull/bear volume split. If the bullish OB has 70% bull volume and 30% bear volume, the Power Balance Bar visually represents that dominance.</p>

          <h3>Ghost Performance™</h3>
          <p>Historical validation tracking how often OB zones were respected (first-touch-only counting via ghost_counted flag). Shows React rate, first-touch success, and grade distribution in the Command Center.</p>
        `,
      },
      {
        id: 'fvg-liquidity',
        title: 'FVGs, Liquidity & Institutional Levels',
        icon: 'interpretation',
        content: `
          <h3>Fair Value Gaps</h3>
          <p>Three-candle imbalance detection with two modes:</p>
          <ul>
            <li><strong>FVG</strong> — Standard Fair Value Gaps. Bullish FVG = gap between bar[0] low and bar[2] high (demand imbalance).</li>
            <li><strong>IFVG</strong> — Inverse FVG. Direction-inverted gaps where a bearish gap becomes a bullish demand zone (and vice versa). More advanced ICT concept.</li>
          </ul>
          <p>Each FVG includes fill probability (based on size, age, distance, trend alignment), estimated bars until fill (ETA), and a CE (Consequent Encroachment) midpoint line.</p>

          <h3>Liquidity Engine</h3>
          <ul>
            <li><strong>Equal Highs/Lows</strong> — Clusters of swing highs or lows at similar prices, indicating resting orders. Short-Term (3-touch) or Medium-Term (5+ touch) clusters.</li>
            <li><strong>Liquidity Grabs</strong> — Classifies sweeps as grabs (wick through + close back inside = institutional collection) vs breaks (close through = real breakout).</li>
            <li><strong>BSL/SSL Trendlines</strong> — Diagonal trendlines connecting swing highs (Buy-Side Liquidity) and swing lows (Sell-Side Liquidity). Sweeps detected on close through the projected line.</li>
          </ul>

          <h3>Liquidity Field™</h3>
          <p>Heatmap bands at BSL and SSL levels. Magenta band above = buyside stops. Teal band below = sellside stops. Thickness and opacity scale with sweep probability — thicker/darker = higher probability of sweep.</p>

          <h3>Institutional Levels™</h3>
          <p>Previous period highs and lows with a live status lifecycle:</p>
          <ul>
            <li><strong>Untested</strong> — Level exists but hasn't been approached</li>
            <li><strong>Approaching</strong> — Price is moving toward the level</li>
            <li><strong>Testing</strong> — Price is at the level</li>
            <li><strong>Swept</strong> — Level has been taken out</li>
          </ul>
          <p>Available periods: Daily (PDH/PDL), Weekly (PWH/PWL), Monthly (PMH/PML), Quarterly (PQH/PQL). Each toggled independently.</p>

          <h3>Confluence Kill Zones (CKZ)</h3>
          <p>Automatically highlights zones where Order Blocks overlap with FVGs or liquidity levels. These are the highest-probability zones on the chart — two or more institutional concepts converging at the same price.</p>
        `,
      },
      {
        id: 'narrative-engine',
        title: 'Narrative Engine & Command Center',
        icon: 'concept',
        content: `
          <h3>Narrative Engine™</h3>
          <p>The Narrative Engine synthesises all PHANTOM signals into a 3-line plain English market read, displayed as a table on the chart. No raw numbers, no cryptic codes — just clear intelligence.</p>
          <p>The three lines are:</p>
          <ul>
            <li><strong>Line 1: Structural Narrative</strong> — The overall market state: "STRONG UPTREND · healthy pulse · low risk · all layers aligned" or "REVERSAL WARNING ▼ · bearish multiple warnings · high risk · grade deteriorating"</li>
            <li><strong>Line 2: Zone Intelligence</strong> — What the OBs, FVGs, and liquidity are saying: current bias direction, active zone count, nearest zones</li>
            <li><strong>Line 3: Action Detail</strong> — Specific context: recent structure events, zone reactions, Smart Money Sequence stage</li>
          </ul>

          <h3>Narrative States</h3>
          <p>The engine classifies the market into one of several narrative states, each with its own color and guidance:</p>
          <ul>
            <li><strong>STRONG UPTREND / DOWNTREND</strong> — High pulse, low shift risk, layers aligned. Trade with the trend.</li>
            <li><strong>WEAK UPTREND / DOWNTREND</strong> — Layers diverging, risk rising, or losing steam. Tighten stops.</li>
            <li><strong>REVERSAL WARNING</strong> — Multiple warning signals firing. Failed swings, diverging layers, high shift risk. Prepare for direction change.</li>
            <li><strong>BREAKOUT PENDING</strong> — Ranging market with EMAs compressed. Watch for direction.</li>
            <li><strong>VOLATILE MARKET</strong> — Rapid expansion detected. Trade with caution.</li>
            <li><strong>CHOPPY / RANGING</strong> — No directional conviction. Consider waiting.</li>
          </ul>

          <h3>Command Center</h3>
          <p>Two modes:</p>
          <ul>
            <li><strong>Compact</strong> — Zone counts + Bias + Action recommendation only</li>
            <li><strong>Full</strong> — Adds engine sub-scores (Zone Bias, Gap Bias, Liquidity Pull, Value Zone, Sweep Flow), Ghost™ performance metrics, and structure intelligence rows</li>
          </ul>

          <h3>Smart Money Sequence™</h3>
          <p>Detects the 5-step ICT institutional playbook: (1) Accumulation/Distribution → (2) Manipulation/Spring → (3) Expansion → (4) Re-accumulation → (5) Distribution. Alerts fire on sequence completion.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Detection Settings</h3>
          <ul>
            <li><strong>Master Sensitivity</strong> (1-10, default: 5) — Controls break threshold, OB displacement/volume requirements, and sweep distance. 1=strict (fewer but stronger signals), 10=loose (more setups).</li>
            <li><strong>ATR Period</strong> (default: 14) — For zone sizing, grading, displacement, and offsets.</li>
            <li><strong>Auto-Adapt to Timeframe</strong> (default: ON) — Adjusts swing lookback by chart timeframe. Scalp (≤15m): tighter. Position (Daily+): wider.</li>
          </ul>

          <h3>Market Structure</h3>
          <ul>
            <li><strong>Internal / Swing Mode</strong> — All, BOS, CHoCH, CHoCH+, or None. Filter which structure events to display per layer.</li>
            <li><strong>Internal / Swing Lookback</strong> — Bars left/right for swing detection. Internal default: 3. Swing default: 14.</li>
            <li><strong>Structure Grade</strong> (default: ON) — A+ to F quality grade shown in Narrative and Command Center.</li>
            <li><strong>Swing Projection</strong> — Average, Fibonacci, or ATR-based price targets from recent swings.</li>
            <li><strong>HTF Confluence / 4-TF Panel</strong> — Multi-timeframe structure alignment.</li>
          </ul>

          <h3>Order Blocks</h3>
          <ul>
            <li><strong>Show Last</strong> (default: 5) — Number of most recent active OBs to display.</li>
            <li><strong>Breakers</strong> (default: ON, 1-3) — Show broken zones that flipped.</li>
            <li><strong>Mitigation Method</strong> — Close, Wick, or Average.</li>
            <li><strong>Zone Style</strong> — Extended (to chart edge) or Compact (fixed width).</li>
            <li><strong>Detail Level</strong> — Minimal (grade+direction), Clean (status+tests), Full (adds eyes+context).</li>
            <li><strong>POC Line / Mid-Line / Extension Line</strong> — Toggle individual zone reference lines.</li>
          </ul>

          <h3>Fair Value Gaps</h3>
          <ul>
            <li><strong>FVG Type</strong> — FVG (standard) or IFVG (inverse direction).</li>
            <li><strong>Volatility Threshold</strong> (default: 0) — Minimum gap size in ATR multiples.</li>
            <li><strong>Fill Probability / Fill ETA</strong> — Estimated chance and timing of gap fill.</li>
          </ul>

          <h3>Liquidity</h3>
          <ul>
            <li><strong>Equal H&L</strong> — Short-Term (3-touch) or Medium-Term (5+ touch).</li>
            <li><strong>Liquidity Grabs</strong> — Classify sweeps as grabs vs breaks.</li>
            <li><strong>Liquidity Trendlines</strong> — Diagonal BSL/SSL from Internal or Swing layer.</li>
          </ul>

          <h3>Narrative & Command Center</h3>
          <ul>
            <li><strong>Narrative Engine™</strong> (default: ON) — Plain English market read.</li>
            <li><strong>Command Center</strong> — Compact or Full mode. Position, size, and optional Ghost™ performance and engine score rows.</li>
          </ul>
        `,
      },
      {
        id: 'alerts',
        title: 'Alert System',
        icon: 'settings',
        content: `
          <p>PHANTOM PRO uses <code>alert()</code> with JSON payloads. In TradingView, set your alert to <strong>"Any alert() function call"</strong> to receive all events.</p>

          <h3>Structure Events</h3>
          <ul>
            <li><strong>BOS_BULL / BOS_BEAR</strong> — Break of Structure (continuation)</li>
            <li><strong>CHOCH_BULL / CHOCH_BEAR</strong> — Change of Character (reversal signal)</li>
            <li><strong>REVERSAL</strong> — Any CHoCH event (shortcut for reversal alerts)</li>
          </ul>

          <h3>Zone Events</h3>
          <ul>
            <li><strong>OB_NEW</strong> — New Order Block formed</li>
            <li><strong>OB_TEST</strong> — Order Block tested (price touched zone)</li>
            <li><strong>OB_BREAK</strong> — Order Block broken (zone invalidated)</li>
            <li><strong>FVG_NEW</strong> — New Fair Value Gap detected</li>
            <li><strong>FVG_FILL</strong> — Fair Value Gap filled</li>
            <li><strong>TRAP</strong> — Price trapped inside an OB zone (institutional re-entry)</li>
          </ul>

          <h3>Liquidity Events</h3>
          <ul>
            <li><strong>LIQ_SWEEP</strong> — Liquidity sweep detected</li>
            <li><strong>CKZ</strong> — Confluence Kill Zone formed (OB + FVG/Liquidity overlap)</li>
          </ul>

          <h3>Intelligence Events</h3>
          <ul>
            <li><strong>SMS_COMPLETE</strong> — Smart Money Sequence completed</li>
            <li><strong>PATTERN</strong> — ICT/SMC pattern detected (Accumulation, Distribution, Spring, Upthrust)</li>
            <li><strong>BIAS_FLIP</strong> — Institutional bias flipped (includes direction and score)</li>
            <li><strong>SHIFT_RISK_HIGH</strong> — Shift Risk exceeded 70% (reversal warning)</li>
          </ul>

          <h3>JSON Payload Format</h3>
          <p>Every alert includes: <code>{"event":"TYPE","dir":"BULL/BEAR","price":12345.67,"sym":"BTCUSD"}</code></p>
          <p>This format is designed for webhook integration — pipe directly to Discord, Telegram, or custom trading systems.</p>
        `,
      },
      {
        id: 'how-to',
        title: 'How To Use PHANTOM PRO',
        icon: 'usage',
        content: `
          <h3>Getting Started</h3>
          <ol>
            <li>Add PHANTOM PRO to your chart</li>
            <li>Enable the Narrative Engine (ON by default) — it will immediately tell you the market state in plain English</li>
            <li>Order Blocks are ON by default — watch for zones forming after structure breaks</li>
            <li>Enable FVGs and Liquidity as needed for additional context</li>
          </ol>

          <h3>Reading the Chart</h3>
          <ul>
            <li><strong>Teal zones = demand (bullish OBs)</strong> — expect price to bounce UP from these</li>
            <li><strong>Magenta zones = supply (bearish OBs)</strong> — expect price to bounce DOWN from these</li>
            <li><strong>Zone grade (A+ to D)</strong> — higher grade = higher probability of reaction</li>
            <li><strong>Zone lifecycle</strong> — Fresh zones react best. Tested/Weak zones are less reliable. Critical zones are likely to break.</li>
            <li><strong>Three Eyes indicator</strong> — Look for 2-3 Eye zones for highest conviction</li>
          </ul>

          <h3>Trading Order Block Reactions</h3>
          <ol>
            <li>Identify a high-grade (A/B) demand or supply zone</li>
            <li>Wait for price to return to the zone (first test is strongest)</li>
            <li>Look for a rejection candle or CHoCH at the zone</li>
            <li>Enter with SL beyond the zone, TP at the next opposing zone or structure level</li>
          </ol>

          <h3>Combining with CIPHER PRO</h3>
          <ul>
            <li><strong>CIPHER fires Long</strong> → Check PHANTOM: Is price at a demand OB? Is structure bullish (BOS confirmed)? Is the zone A or B grade? If all three: high-conviction trade.</li>
            <li><strong>PHANTOM shows CHoCH+</strong> → Check CIPHER: Did a TS (Tension Snap) fire? Is the ribbon crossing? If so: confirmed reversal, enter early.</li>
            <li><strong>CKZ highlighted</strong> → This is the highest-probability zone. Wait for any signal (CIPHER PX/TS or PHANTOM CHoCH) at this zone for maximum confluence.</li>
          </ul>

          <h3>What NOT to Do</h3>
          <ul>
            <li>Don't trade every OB — focus on A/B grade, Fresh/Tested status, 2-3 Eye zones</li>
            <li>Don't ignore the Narrative Engine — it synthesises everything for you</li>
            <li>Don't fight a CHoCH+ with high Shift Risk — the structure is changing</li>
            <li>Don't use PHANTOM on very low timeframes (1m) with high swing lookbacks — the structure becomes noise</li>
          </ul>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip 1: Three-Eye Zones are Rare — Trade Them</h3>
          <p>A Three-Eye OB (structure + displacement + volume) appears maybe a few times per day. When one forms at an A+ or A grade, it is the single highest-probability zone on your chart. Set alerts for OB_NEW and check the eye count.</p>

          <h3>Tip 2: Fresh Zones React Best</h3>
          <p>The first touch of a zone has the highest probability of reaction. Each subsequent test degrades the zone (-8 grade per test). If you missed the first touch, the second is still tradeable on A-grade zones, but don't chase a Weak or Critical zone.</p>

          <h3>Tip 3: Breaker Blocks Are Powerful</h3>
          <p>When an OB breaks and flips to a Breaker, it often becomes the strongest S/R on the chart. Old demand becomes new supply (and vice versa). Watch for price to return to Breaker zones for reversal entries.</p>

          <h3>Tip 4: Use the 4-TF Panel for Full Alignment</h3>
          <p>When all 4 timeframes in the MTF Panel agree (all bullish or all bearish), you have maximum structural conviction. These are the highest-probability trending conditions.</p>

          <h3>Tip 5: Shift Risk is Your Early Warning System</h3>
          <p>Don't wait for the CHoCH to confirm a reversal — Shift Risk often rises above 70% several bars before the actual break. Use it to tighten stops or reduce exposure before the reversal prints.</p>

          <h3>Tip 6: CKZ = Maximum Confluence</h3>
          <p>Confluence Kill Zones (OB + FVG overlap) are statistically the highest-probability zones. When a CKZ forms at an Institutional Level (PDH/PDL) and the Narrative says "REVERSAL WARNING", you have a multi-dimensional setup that no competitor can replicate.</p>

          <h3>Tip 7: JSON Alerts for Automation</h3>
          <p>Every alert is a JSON payload with event type, direction, price, and symbol. Pipe these directly to a webhook (Discord, Telegram, or your own system) for real-time notifications with full context.</p>

          <h3>Tip 8: Ghost™ Tells You What Actually Works</h3>
          <p>Enable Ghost™ Performance in Full Command Center mode. It shows you the historical react rate for OBs, FVG fills, and liquidity sweeps on YOUR specific instrument. If OB React is 30%, the zones aren't working on this asset — switch to FVG-based trading instead.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'atlas-cipher-pro', title: 'Atlas Cipher Pro' },
    nextIndicator: { slug: 'atlas-pulse-pro', title: 'Atlas Pulse Pro' },
  },

  'atlas-pulse-pro': {
    title: 'Atlas Pulse Pro',
    subtitle: 'Momentum Intelligence — the momentum diagnostic pillar of the ATLAS suite. Dual FLOW/WAVE oscillator, Pressure Bands, Rhythm acceleration, Fatigue detection, Divergence lifecycle, 6-component Pulse Score with consensus penalty, Pulse Memory, DNA multi-timeframe strip, Edge Bars, and Exhaustion signals. No trade signals — pure intelligence.',
    tradingViewUrl: 'https://www.tradingview.com/script/nHfT0sXk/',
    role: 'Momentum Intelligence',
    lines: '~1,304',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Atlas Pulse Pro</strong> is the momentum intelligence pillar of the ATLAS suite. It answers the question every trader needs answered: <em>What is momentum DOING right now, and what will it do NEXT?</em></p>

          <h3>What PULSE PRO Is NOT</h3>
          <p>PULSE PRO deliberately does not generate trade signals. After extensive testing, trend/reversal signals were removed because oscillator crossovers cannot match the accuracy of price-structure signals (CIPHER PRO handles that). PULSE PRO is a pure diagnostic tool — it tells you the momentum health so you can make better decisions with signals from other indicators.</p>

          <h3>Dual-Layer Architecture</h3>
          <ul>
            <li><strong>PULSE FLOW</strong> — Institutional momentum. Volume-weighted, efficiency-adaptive. Captures the bigger picture of where smart money is pushing. Slow to turn but highly reliable when it does.</li>
            <li><strong>PULSE WAVE</strong> — Reactive momentum. ROC-based, ATR-normalised. Captures short-term momentum shifts. Faster but noisier.</li>
            <li><strong>When they AGREE</strong> → High conviction directional move.</li>
            <li><strong>When they DIVERGE</strong> → Caution — layers are in conflict.</li>
          </ul>

          <h3>Feature Stack</h3>
          <ul>
            <li><strong>Pressure Bands</strong> — Adaptive overbought/oversold that breathe with the volatility regime. In a squeeze: bands tighten. In a trend: bands widen.</li>
            <li><strong>Rhythm Histogram</strong> — Momentum acceleration. Is the move speeding up or slowing down?</li>
            <li><strong>Fatigue Detection</strong> — Amber diamonds when momentum acceleration inverts. The earliest possible warning that a move is running out of energy.</li>
            <li><strong>Divergence Engine</strong> — Regular and Hidden divergences between price and FLOW, with lifecycle tracking (Forming → Confirmed → Active → Swept).</li>
            <li><strong>Exhaustion Signals</strong> — Three types: Pulse Velocity (both layers extreme), Pulse Flow (institutional overextended), Pulse Trap (momentum against divergence).</li>
            <li><strong>Pulse Score</strong> — Single 0-100 number that collapses all momentum intelligence into one reading, with consensus penalty when FLOW and WAVE disagree.</li>
            <li><strong>Pulse Memory</strong> — "Last time FLOW was at this level, price did X." Historical context for the current reading.</li>
            <li><strong>DNA Strip</strong> — Multi-timeframe momentum alignment across 4 higher timeframes with auto-adaptive TF selection.</li>
            <li><strong>Edge Bars</strong> — Score-driven colour strips at pane edges acting as a momentum thermometer.</li>
          </ul>

          <h3>Key Properties</h3>
          <ul>
            <li><strong>~1,304 lines</strong> of Pine Script v6</li>
            <li><strong>49/64 outputs</strong> (15 headroom remaining)</li>
            <li><strong>19 alert conditions</strong></li>
            <li><strong>Non-repainting</strong> — all calculations use closed-bar data</li>
            <li><strong>Timeframe-adaptive</strong> — signal sensitivity auto-adjusts by chart timeframe</li>
          </ul>
        `,
      },
      {
        id: 'oscillator',
        title: 'FLOW & WAVE Oscillator',
        icon: 'calculation',
        content: `
          <h3>PULSE FLOW — The Institutional Layer</h3>
          <p>FLOW measures where institutional money is pushing. It combines three proprietary components:</p>
          <ul>
            <li><strong>Volume-Weighted ROC</strong> — Rate of change multiplied by a volume factor. High-volume bars carry more "truth" than low-volume bars.</li>
            <li><strong>Efficiency Ratio</strong> — Measures directional efficiency (net progress / total movement). High efficiency = clean trend. Low efficiency = choppy noise.</li>
            <li><strong>Adaptive Smoothing (KAMA)</strong> — When efficiency is high, FLOW responds fast. When efficiency is low, FLOW smooths heavily, filtering out the chop.</li>
          </ul>
          <p>The result is normalised to 0-100. Above 50 = bullish institutional momentum. Below 50 = bearish. The colour of the FLOW line changes at the 50 midline.</p>

          <h3>PULSE WAVE — The Reactive Layer</h3>
          <p>WAVE captures short-term momentum shifts using ATR-normalised Rate of Change. It is deliberately simpler and faster than FLOW — its job is to detect turns early, even at the cost of occasional false signals.</p>

          <h3>Consensus & Conviction</h3>
          <p>The fill between FLOW and WAVE shows their agreement:</p>
          <ul>
            <li><strong>Teal fill</strong> — Both bullish. High conviction long.</li>
            <li><strong>Magenta fill</strong> — Both bearish. High conviction short.</li>
            <li><strong>Amber fill</strong> — Mixed. One bullish, one bearish. Caution zone.</li>
          </ul>
          <p>The <strong>Consensus Strip</strong> at the top of the pane shows this at a glance — teal, magenta, or amber bar.</p>

          <h3>Settings</h3>
          <ul>
            <li><strong>Flow Length</strong> (default: 35) — Smoothing of institutional layer. Higher = smoother, captures bigger moves.</li>
            <li><strong>Volume Influence</strong> (default: 0.7) — How much volume affects FLOW. 1.0 = fully institutional. 0.0 = pure price.</li>
            <li><strong>Adaptive Smoothing</strong> (default: ON) — FLOW auto-adjusts speed. ON for swing trading, OFF for scalping.</li>
            <li><strong>Wave Length</strong> (default: 10) — Speed of reactive layer. Lower = faster but noisier.</li>
            <li><strong>Wave Smoothing</strong> (default: 3) — Additional noise reduction. 1 = raw.</li>
          </ul>
        `,
      },
      {
        id: 'intelligence',
        title: 'Pressure, Rhythm, Fatigue & Divergence',
        icon: 'interpretation',
        content: `
          <h3>Pressure Bands (Adaptive OB/OS)</h3>
          <p>Unlike static 70/30 levels, Pressure Bands breathe with the market. They detect the current volatility regime and adapt:</p>
          <ul>
            <li><strong>Squeeze regime</strong> (ATR at 20th percentile) — Bands at 0.6x width. Even small moves are extreme.</li>
            <li><strong>Ranging regime</strong> — Bands at 1.0x (default width).</li>
            <li><strong>Trending regime</strong> — Bands at 1.2x. Strong readings are normal in trends.</li>
            <li><strong>Volatile regime</strong> (ATR at 80th percentile) — Bands at 1.4x. Only truly extreme moves register.</li>
          </ul>
          <p>When FLOW enters the Pressure Zone (above upper band or below lower band), the zone glows bright — this is the exhaustion zone where reversal probability spikes.</p>

          <h3>Rhythm Histogram</h3>
          <p>The rate of change of WAVE momentum — momentum's acceleration. Positive bars = momentum speeding up. Negative bars = momentum slowing down. Colour intensity scales with magnitude. Peak bars (brighter) show maximum acceleration.</p>

          <h3>Fatigue Detection</h3>
          <p>Amber diamond markers fire when momentum acceleration inverts — the earliest possible signal that a move is running out of energy. Appears BEFORE the oscillator lines turn.</p>
          <ul>
            <li><strong>Bull fatigue</strong> — Rhythm turns negative while WAVE is above 50 (uptrend losing steam)</li>
            <li><strong>Bear fatigue</strong> — Rhythm turns positive while WAVE is below 50 (downtrend losing steam)</li>
            <li><strong>Double fatigue</strong> — Both FLOW and WAVE showing fatigue simultaneously (strongest warning)</li>
          </ul>

          <h3>Divergence Engine</h3>
          <p>Detects four divergence types between price and FLOW with full lifecycle tracking:</p>
          <ul>
            <li><strong>Regular Bullish</strong> — Price makes lower low, FLOW makes higher low → reversal UP expected</li>
            <li><strong>Regular Bearish</strong> — Price makes higher high, FLOW makes lower high → reversal DOWN expected</li>
            <li><strong>Hidden Bullish</strong> — Price makes higher low, FLOW makes lower low → trend continuation UP</li>
            <li><strong>Hidden Bearish</strong> — Price makes lower high, FLOW makes higher high → trend continuation DOWN</li>
          </ul>
          <p>Lifecycle: <strong>Forming</strong> → <strong>Confirmed</strong> → <strong>Active</strong> → <strong>Swept</strong>. Visual: background glow (cyan for bullish, pink for bearish) + labels at detection point.</p>
        `,
      },
      {
        id: 'pulse-score',
        title: 'Pulse Score & Pulse Memory',
        icon: 'concept',
        content: `
          <h3>Pulse Score (0-100)</h3>
          <p>A single number that collapses all momentum intelligence into one reading. Users who don't understand oscillators can follow this one number.</p>

          <h3>6-Component Weighted Composite</h3>
          <ul>
            <li><strong>FLOW position (30%)</strong> — Where is institutional momentum? The core reading.</li>
            <li><strong>Price Trend (30%)</strong> — Is price actually going up or down? Grounds the score in reality.</li>
            <li><strong>WAVE confirmation (10%)</strong> — Does the reactive layer agree with FLOW?</li>
            <li><strong>Rhythm (10%)</strong> — Is momentum accelerating or decelerating?</li>
            <li><strong>DNA alignment (10%)</strong> — How many higher timeframes agree?</li>
            <li><strong>Divergence modifier (10%)</strong> — Active divergences push the score toward reversal.</li>
          </ul>

          <h3>Consensus Penalty</h3>
          <p>When FLOW and WAVE disagree, the score is mathematically dampened toward 50 (neutral). This is critical — without it, the Score might say "LEAN BULL" while the Narrative says "layers disagree." The penalty uses a sqrt curve with 90% maximum pull, ensuring the score honestly reflects disagreement.</p>

          <h3>Score Classification</h3>
          <ul>
            <li><strong>80-100</strong> — STRONG BULL (deep teal)</li>
            <li><strong>65-79</strong> — BULLISH (teal)</li>
            <li><strong>55-64</strong> — LEAN BULL (light teal)</li>
            <li><strong>45-54</strong> — NEUTRAL (amber)</li>
            <li><strong>35-44</strong> — LEAN BEAR (light magenta)</li>
            <li><strong>20-34</strong> — BEARISH (magenta)</li>
            <li><strong>0-19</strong> — STRONG BEAR (deep magenta)</li>
          </ul>

          <h3>Pulse Memory</h3>
          <p>"Last time FLOW was at this level, price did X." Uses a ring buffer of 200 snapshots (every 5 bars = 1,000 bars of history). Searches for the most recent snapshot where FLOW was within ±3 points of the current level, then reports what price did 15 bars later.</p>
          <p>Examples: "Flow at 72 → +0.8%" (last time FLOW was at 72, price rallied 0.8%) or "Flow at 28 → -1.2%" (last time at 28, price dropped 1.2%). Gives historical context to the current momentum reading.</p>
        `,
      },
      {
        id: 'exhaustion-signals',
        title: 'Exhaustion Signals & Ghost Performance',
        icon: 'trading',
        content: `
          <h3>Three Exhaustion Types</h3>
          <ul>
            <li><strong>Pulse Velocity (VEL)</strong> — Both FLOW and WAVE hit the pressure zone together. Full consensus exhaustion. The strongest reversal signal in the system.</li>
            <li><strong>Pulse Flow (FL)</strong> — Institutional momentum overextended (FLOW in pressure zone alone). Smart money has pushed too far.</li>
            <li><strong>Pulse Trap (TRAP)</strong> — Momentum erupted AGAINST an active divergence. Price is moving one way but the divergence says the opposite. Highest caution.</li>
          </ul>

          <h3>Multi-Factor Scoring</h3>
          <p>Each exhaustion signal is scored by up to 6 factors: exhaustion type (2 pts), velocity type bonus, rhythm alignment, divergence support, and session trust. Thresholds are timeframe-adaptive — scalp needs 3+ factors, swing needs 2+.</p>

          <h3>Session Awareness</h3>
          <p>Signals in the London-NY overlap get full trust (1.0x). Asian session signals get reduced trust (0.6x). This prevents false exhaustion signals during low-liquidity periods.</p>

          <h3>Ghost Performance™</h3>
          <p>Tracks every exhaustion signal's outcome: did price hit the 1-ATR target within 15 bars? Shows cumulative win rate in the Narrative Engine. If Ghost™ shows 65% win rate, 65% of exhaustion signals on this instrument led to a meaningful reversal.</p>
        `,
      },
      {
        id: 'dna-edge',
        title: 'DNA Strip & Edge Bars',
        icon: 'concept',
        content: `
          <h3>Pulse DNA Strip</h3>
          <p>A horizontal strip above the oscillator showing FLOW direction on 4 higher timeframes. Each cell is coloured: teal = bullish, magenta = bearish, amber = near midline (45-55 neutral zone).</p>

          <h3>Auto-Adaptive Timeframes</h3>
          <p>When Auto-Select is ON, the 4 timeframes are automatically chosen above your chart:</p>
          <ul>
            <li><strong>1m chart</strong> → 5m, 15m, 1H, 4H</li>
            <li><strong>5m chart</strong> → 15m, 1H, 4H, Daily</li>
            <li><strong>15m chart</strong> → 1H, 4H, Daily, Weekly</li>
            <li><strong>1H chart</strong> → 4H, Daily, Weekly, Monthly</li>
            <li><strong>4H chart</strong> → Daily, Weekly, Monthly, 3-Month</li>
          </ul>

          <h3>DNA Alignment Score</h3>
          <ul>
            <li><strong>FULL BULL</strong> — All 4 timeframes bullish. Maximum conviction long.</li>
            <li><strong>FULL BEAR</strong> — All 4 bearish. Maximum conviction short.</li>
            <li><strong>MOSTLY BULL/BEAR</strong> — 3 of 4 agree.</li>
            <li><strong>MIXED</strong> — No clear alignment. Stay cautious.</li>
          </ul>

          <h3>Edge Bars</h3>
          <p>Thin coloured strips at the top and bottom edges of the oscillator pane. Bottom edge glows teal when Pulse Score is bullish. Top edge glows magenta when bearish. Brightness scales with conviction strength — the brighter the edge, the stronger the directional reading. Acts as a momentum thermometer you can see at a glance.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Pulse Flow</h3>
          <ul>
            <li><strong>Flow Length</strong> (default: 35) — Institutional momentum smoothing</li>
            <li><strong>Volume Influence</strong> (default: 0.7) — Volume weighting (0=none, 1=full)</li>
            <li><strong>Adaptive Smoothing</strong> (default: ON) — Faster in trends, slower in chop</li>
          </ul>

          <h3>Pulse Wave</h3>
          <ul>
            <li><strong>Wave Length</strong> (default: 10) — Reactive layer speed</li>
            <li><strong>Wave Smoothing</strong> (default: 3) — Noise reduction</li>
          </ul>

          <h3>Pressure Bands</h3>
          <ul>
            <li><strong>Band Width</strong> (default: 10) — Base distance from 50 midline</li>
            <li><strong>Regime Lookback</strong> (default: 50) — Bars to assess volatility regime</li>
          </ul>

          <h3>Divergence</h3>
          <ul>
            <li><strong>Pivot Depth</strong> (default: 5) — Bars each side for pivot confirmation</li>
            <li><strong>Max Lookback</strong> (default: 80) — Maximum bars between divergence pivots</li>
            <li><strong>Divergence Glow / Labels</strong> — Toggle visual elements</li>
          </ul>

          <h3>DNA Strip</h3>
          <ul>
            <li><strong>Auto-Select Timeframes</strong> (default: ON) — Auto-picks 4 TFs above your chart</li>
            <li><strong>DNA Strip Size</strong> — Tiny or Small</li>
            <li><strong>Manual TF1-TF4</strong> — Override when Auto-Select is OFF</li>
          </ul>

          <h3>Display</h3>
          <ul>
            <li><strong>Pulse Score</strong> (default: ON) — The single 0-100 number</li>
            <li><strong>Pulse Memory</strong> (default: ON) — Historical context</li>
            <li><strong>Edge Bars</strong> (default: ON) — Score-driven strips</li>
            <li><strong>Consensus Strip</strong> (default: ON) — FLOW/WAVE agreement bar</li>
            <li><strong>Conviction Gauge</strong> (default: ON) — Right-edge marker</li>
            <li><strong>Momentum Fill</strong> (default: ON) — Fill between FLOW and WAVE</li>
          </ul>
        `,
      },
      {
        id: 'how-to',
        title: 'How To Use PULSE PRO',
        icon: 'usage',
        content: `
          <h3>The One-Number Approach</h3>
          <p>If you only look at one thing: the <strong>Pulse Score</strong>. Above 65 = bullish momentum. Below 35 = bearish. Between 35-65 = neutral/conflicting. This single number integrates FLOW, WAVE, Rhythm, DNA, Price Trend, and Divergence into one reading.</p>

          <h3>Confirming CIPHER PRO Signals</h3>
          <ol>
            <li>CIPHER PRO fires a Long signal</li>
            <li>Check PULSE PRO: Is the Score above 55? Is FLOW above 50? Are Pressure Bands NOT in overbought?</li>
            <li>If all yes: momentum confirms the signal. Enter with confidence.</li>
            <li>If Score is below 45 or FLOW is in the pressure zone: momentum is against you. Skip or reduce size.</li>
          </ol>

          <h3>Detecting Momentum Exhaustion</h3>
          <ol>
            <li>Watch for Fatigue markers (amber diamonds) — earliest warning</li>
            <li>Then Exhaustion signals (VEL/FL/TRAP labels) — confirmed overextension</li>
            <li>Then Divergence glow — structural disagreement between price and momentum</li>
            <li>Each layer adds conviction to the reversal thesis</li>
          </ol>

          <h3>Reading the DNA Strip for Swing Trades</h3>
          <p>Before entering a swing trade, check the DNA strip. If all 4 timeframes are teal (FULL BULL), you have multi-timeframe momentum alignment. If the strip is MIXED, the higher timeframes haven't confirmed — your trade is fighting the current on at least one level.</p>

          <h3>Using Pulse Memory for Context</h3>
          <p>When the Score says "LEAN BULL" but Memory says "Last time at this level → -0.9%", you have a historical warning. Memory doesn't override the Score, but it adds context that the current reading has historically led to a drop.</p>

          <h3>What NOT to Do</h3>
          <ul>
            <li>Don't use PULSE PRO as a signal generator — it deliberately doesn't have buy/sell signals</li>
            <li>Don't trade FLOW/WAVE crossovers as entries — they fire late, during noise, and miss real moves (this was tested extensively and removed)</li>
            <li>Don't ignore the consensus penalty — when the Score reads "NEUTRAL" it often means FLOW and WAVE disagree, not that nothing is happening</li>
            <li>Don't expect Pulse Memory to match on every bar — it searches for historical FLOW matches, which may not exist for every reading</li>
          </ul>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip 1: Pulse VEL is the Strongest Reversal Signal</h3>
          <p>When both FLOW and WAVE hit the pressure zone simultaneously (Pulse Velocity exhaustion), the reversal probability is at its highest. This is the single most reliable momentum signal in the system.</p>

          <h3>Tip 2: Double Fatigue = Exit NOW</h3>
          <p>When both FLOW and WAVE show fatigue at the same time, the move is definitively over. If you're in a position, this is your exit signal — don't wait for the oscillator to actually turn.</p>

          <h3>Tip 3: DNA Full Alignment is Rare — Trade It</h3>
          <p>FULL BULL or FULL BEAR on the DNA strip (all 4 timeframes aligned) happens maybe a few times per week. When it does, momentum is aligned from the shortest to the longest timeframe. These are the highest-conviction trending conditions.</p>

          <h3>Tip 4: The Consensus Penalty is a Feature, Not a Bug</h3>
          <p>When the Score reads 48 (near neutral) and you see FLOW at 65 but WAVE at 35, the penalty is correctly telling you "the layers disagree." This is more valuable than a false directional reading.</p>

          <h3>Tip 5: Pressure Bands in Squeeze = Maximum Sensitivity</h3>
          <p>When the market is in a squeeze (volatility compression), Pressure Bands tighten to 0.6x their normal width. This means FLOW entering the pressure zone during a squeeze is an especially strong exhaustion signal — even a small move is extreme relative to the compressed conditions.</p>

          <h3>Tip 6: Combine Pulse Memory with Sessions +</h3>
          <p>If Pulse Memory says "last time → +1.2%" AND Sessions + shows you're in a London KZ with DNA bullish: that's historical precedent + session timing + multi-TF alignment. Stack the confluences.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'atlas-phantom-pro', title: 'Atlas Phantom Pro' },
    nextIndicator: { slug: 'atlas-radar-pro', title: 'Atlas Radar Pro' },
  },

  'atlas-radar-pro': {
    title: 'Atlas Radar Pro',
    subtitle: 'Screening Intelligence — the multi-ticker scanner of the ATLAS suite. Scans 10 tickers simultaneously across three independent engines (Signal, Structure, Momentum) with unified Confluence rating, 5-column sorting, 3 stackable filters, volatility classification, and JSON alerts for automation.',
    tradingViewUrl: 'https://www.tradingview.com/script/V6tg80MI-Atlas-Radar-Pro-Interakktive/',
    role: 'Screening Intelligence',
    lines: '819',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Atlas Radar Pro</strong> is the screening intelligence pillar of the ATLAS suite. It scans up to 10 tickers simultaneously across three independent analytical engines and produces a unified Confluence rating for each. No other screener on TradingView has three genuinely independent engines in a single indicator.</p>

          <h3>What RADAR PRO Does</h3>
          <p>RADAR PRO answers the watchlist question: <em>Which tickers have the highest confluence right now, and which should I focus on?</em></p>
          <ul>
            <li><strong>Signal Engine</strong> — 6-factor stateless directional assessment (Ribbon Stack, Price vs Flow, EMA Trend, MACD Momentum, RSI Position, Volume Conviction)</li>
            <li><strong>Structure Engine</strong> — Stateless HH/HL vs LH/LL bias detection using the last 3 confirmed swing highs and lows</li>
            <li><strong>Momentum Engine</strong> — 6-factor proprietary adaptive computation (Spread Velocity, Tension Momentum, Efficiency Trend, Volume Conviction Trend, ADX Direction, Anchor Slope)</li>
            <li><strong>Confluence Rating</strong> — How many engines agree? 3/3 = highest conviction. Shows direction (▲/▼) and strength.</li>
            <li><strong>Overall Rating</strong> — Weighted composite: Strong Bull → Bull → Neutral → Bear → Strong Bear</li>
          </ul>

          <h3>Architecture</h3>
          <p>RADAR PRO uses a stateless architecture by design. Unlike CIPHER or PHANTOM which track state over time (var arrays, ring buffers), RADAR computes everything fresh each bar for each ticker. This prevents the critical "var state bleed" problem where compound state computed for the chart symbol contaminates request.security() calls for other tickers.</p>

          <h3>Key Properties</h3>
          <ul>
            <li><strong>819 lines</strong> of Pine Script v6</li>
            <li><strong>40 request.security() calls</strong> (10 tickers × 4 fetch loops — at the Pine Script limit)</li>
            <li><strong>6 JSON alert types</strong> with transition detection</li>
            <li><strong>Per-ticker timeframe override</strong> — each ticker can scan a different timeframe</li>
            <li><strong>Entirely stateless computation</strong> — no var state bleed across tickers</li>
          </ul>
        `,
      },
      {
        id: 'three-engines',
        title: 'The Three Engines',
        icon: 'calculation',
        content: `
          <h3>Signal Engine (6 Factors)</h3>
          <p>Assesses directional bias using six independent votes. Each factor returns +1 (bull), -1 (bear), or 0 (neutral):</p>
          <ul>
            <li><strong>Factor 1: Ribbon Stack</strong> — Are the adaptive Core/Flow/Anchor lines stacked bullish (Core > Flow > Anchor) or bearish?</li>
            <li><strong>Factor 2: Price vs Flow</strong> — Is price above or below the adaptive Flow line?</li>
            <li><strong>Factor 3: EMA Trend</strong> — Fast EMA (9) above slow EMA (21) = bullish momentum</li>
            <li><strong>Factor 4: MACD Momentum</strong> — Histogram positive + improving = bullish. Negative + deteriorating = bearish.</li>
            <li><strong>Factor 5: RSI Position</strong> — RSI > 55 = bullish bias. RSI < 45 = bearish. Between = neutral.</li>
            <li><strong>Factor 6: Volume Conviction</strong> — Above-average volume on a bull candle = bullish conviction.</li>
          </ul>
          <p>Signal classification: 5-6 bull votes = Strong Bull. 4 bull + ≤1 bear = Bull. Net bull = Lean Bull. Same logic for bear side.</p>

          <h3>Structure Engine (Stateless HH/HL vs LH/LL)</h3>
          <p>Uses <code>ta.valuewhen()</code> to retrieve the last 3 confirmed swing highs and lows, then compares consecutive swings:</p>
          <ul>
            <li><strong>HH + HL</strong> — Classic uptrend structure (score: +3)</li>
            <li><strong>LH + LL</strong> — Classic downtrend structure (score: -3)</li>
            <li><strong>HH + LL</strong> — Expanding/volatile pattern (score: +1)</li>
            <li><strong>LH + HL</strong> — Contracting/range pattern (score: -1)</li>
          </ul>
          <p>Also checks price position relative to the most recent key swing high/low for additional bias.</p>

          <h3>Momentum Engine (6 Proprietary Factors)</h3>
          <p>100% proprietary adaptive computations — no standard RSI/Stochastic. Each factor is derived from the ATLAS adaptive engine:</p>
          <ul>
            <li><strong>M1: Spread Velocity</strong> — How fast is the Core-Anchor spread changing? Z-score normalised against recent velocity.</li>
            <li><strong>M2: Tension Momentum</strong> — Price displacement from Flow in ATR units. Moderate = healthy trending, extreme = potential exhaustion.</li>
            <li><strong>M3: Efficiency Trend</strong> — Is the efficiency ratio improving (cleaner trend) or deteriorating (getting choppy)?</li>
            <li><strong>M4: Volume Conviction Trend</strong> — Is volume conviction rising or falling? Directional by candle colour.</li>
            <li><strong>M5: ADX Trend Direction</strong> — Not just "is there a trend" but "is the trend strengthening" + directional (DI+ vs DI-).</li>
            <li><strong>M6: Anchor Slope</strong> — The slowest adaptive line. If Anchor is rising, deep structural momentum is bullish.</li>
          </ul>
        `,
      },
      {
        id: 'confluence-rating',
        title: 'Confluence & Rating',
        icon: 'interpretation',
        content: `
          <h3>Confluence Score</h3>
          <p>Confluence measures how many of the three engines agree:</p>
          <ul>
            <li><strong>3/3</strong> — All three engines agree (Signal + Structure + Momentum). Highest conviction. Displayed with ▲ or ▼ direction.</li>
            <li><strong>2/3</strong> — Two engines agree. Good conviction but one dimension is neutral or opposing.</li>
            <li><strong>1/3 or 0/3</strong> — Engines disagree or all neutral. Low conviction — avoid or wait for alignment.</li>
          </ul>

          <h3>Overall Rating</h3>
          <p>A weighted composite of all three engine scores, classified into 5 tiers:</p>
          <ul>
            <li><strong>Strong Bull (5)</strong> — All engines strongly bullish, 3/3 confluence</li>
            <li><strong>Bull (4)</strong> — Most engines bullish, 2-3/3 confluence</li>
            <li><strong>Neutral (3)</strong> — Mixed or no conviction</li>
            <li><strong>Bear (2)</strong> — Most engines bearish</li>
            <li><strong>Strong Bear (1)</strong> — All engines strongly bearish, 3/3 confluence</li>
          </ul>

          <h3>Volatility Classification</h3>
          <p>Each ticker is classified into one of 5 volatility tiers based on ATR ratio (current ATR / 50-bar ATR average):</p>
          <ul>
            <li><strong>Compressed</strong> (< 0.65) — Very low volatility, potential squeeze</li>
            <li><strong>Low</strong> (0.65-0.9) — Below average volatility</li>
            <li><strong>Normal</strong> (0.9-1.3) — Average volatility</li>
            <li><strong>Expanding</strong> (1.3-1.8) — Volatility increasing</li>
            <li><strong>High</strong> (> 1.8) — Significantly elevated volatility</li>
          </ul>
        `,
      },
      {
        id: 'table-display',
        title: 'Table, Filters & Sorting',
        icon: 'settings',
        content: `
          <h3>Table Columns</h3>
          <p>Each column can be toggled independently:</p>
          <ul>
            <li><strong>Ticker</strong> — Always shown. Symbol name extracted from the full exchange:symbol format.</li>
            <li><strong>Price</strong> — Current close price</li>
            <li><strong>% Change</strong> — Percentage change from previous bar. Green = up, red = down.</li>
            <li><strong>Rating</strong> — Overall rating (Strong Bull → Strong Bear) with colour coding</li>
            <li><strong>Signal</strong> — Signal Engine output (Strong Long/Long/Lean/Neutral/Lean/Short/Strong Short)</li>
            <li><strong>Structure</strong> — Structure Engine output with pattern description (HH+HL, LH+LL, etc.)</li>
            <li><strong>Momentum</strong> — Momentum Engine output with bull/bear vote count</li>
            <li><strong>Confluence</strong> — Engine agreement level (3/3, 2/3, 1/3) with direction arrow</li>
            <li><strong>Volatility</strong> — Current volatility regime</li>
          </ul>

          <h3>Filters (3 Stackable)</h3>
          <p>Filters hide tickers that don't match. Multiple filters can be active simultaneously:</p>
          <ul>
            <li><strong>Rating Filter</strong> — Strong Bull, Bull+, Bear+, Strong Bear</li>
            <li><strong>Signal Filter</strong> — Any Bull, Any Bear, Strong Only</li>
            <li><strong>Confluence Filter</strong> — 3/3 Only, 2/3+</li>
          </ul>

          <h3>Sorting (5 Columns)</h3>
          <p>Sort the table by any of: Rating, Signal, Confluence, Momentum, or % Change. Default descending (strongest first). Toggle ascending for weakest first.</p>

          <h3>Per-Ticker Timeframe</h3>
          <p>Each ticker can have its own timeframe override. Leave blank to follow the chart timeframe. Set to a specific TF (e.g., "60" for 1H) to scan that ticker on a different timeframe than the chart. This lets you scan a mix of timeframes in one table.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Watchlist (10 Tickers)</h3>
          <p>Each ticker has an enable toggle, symbol selector, and optional timeframe override. Default watchlist covers crypto (BTC, ETH, SOL), commodities (XAUUSD), indices (SPX), stocks (AAPL, TSLA, NVDA), and forex (EURUSD, GBPUSD).</p>

          <h3>Intelligence Tuning</h3>
          <ul>
            <li><strong>Signal Sensitivity</strong> (default: 1.5) — Controls how quickly the signal engine reacts. Lower = more responsive, higher = fewer signals but higher conviction.</li>
            <li><strong>Signal Smoothing</strong> (default: 3) — Smoothing on the adaptive trend line.</li>
            <li><strong>Structure Sensitivity</strong> (default: 5) — Swing point detection bars. Lower = more swings detected.</li>
          </ul>

          <h3>Display</h3>
          <ul>
            <li><strong>Table Position</strong> — 9 positions (corners, edges, center). Middle Center is default for the dedicated pane.</li>
            <li><strong>Table Size</strong> — Tiny, Small, Normal</li>
          </ul>

          <h3>Columns, Filters, Sort</h3>
          <p>All toggleable. See the Table, Filters & Sorting section for details.</p>
        `,
      },
      {
        id: 'alerts',
        title: 'Alert System',
        icon: 'settings',
        content: `
          <p>RADAR PRO uses <code>alert()</code> with JSON payloads. Set your TradingView alert to <strong>"Any alert() function call"</strong>.</p>

          <h3>6 Alert Types with Transition Detection</h3>
          <p>Alerts only fire on transitions — when a value changes from the previous bar. This prevents spam.</p>
          <ul>
            <li><strong>RATING_CHANGE</strong> — Ticker's overall rating changed (e.g., Neutral → Bull)</li>
            <li><strong>SIGNAL_CHANGE</strong> — Signal Engine output changed direction</li>
            <li><strong>CONFLUENCE_CHANGE</strong> — Confluence level changed (e.g., 2/3 → 3/3)</li>
            <li><strong>MOMENTUM_CHANGE</strong> — Momentum Engine state changed</li>
            <li><strong>VOLATILITY_CHANGE</strong> — Volatility regime shifted (e.g., Normal → Expanding)</li>
            <li><strong>STRONG_SETUP</strong> — Ticker reached Strong Bull or Strong Bear rating with 3/3 confluence</li>
          </ul>

          <h3>JSON Format</h3>
          <p>Every alert includes ticker symbol, event type, old value, new value, and price: <code>{"event":"RATING_CHANGE","sym":"BTCUSDT","from":"Neutral","to":"Bull","price":87654.32}</code></p>
          <p>Designed for webhook integration — pipe to Discord, Telegram, or custom systems.</p>
        `,
      },
      {
        id: 'how-to',
        title: 'How To Use RADAR PRO',
        icon: 'usage',
        content: `
          <h3>Basic Workflow</h3>
          <ol>
            <li>Add RADAR PRO to a dedicated pane (it's a non-overlay indicator)</li>
            <li>Configure your 10 tickers in the Watchlist settings</li>
            <li>Sort by Confluence (strongest agreement first) or Rating (overall strength first)</li>
            <li>Filter to 3/3 confluence only to see the highest-conviction setups</li>
            <li>Click through to the top-rated tickers and apply CIPHER PRO or PHANTOM PRO for entry timing</li>
          </ol>

          <h3>The RADAR → CIPHER → PHANTOM Workflow</h3>
          <p>This is the intended multi-indicator workflow:</p>
          <ol>
            <li><strong>RADAR PRO scans</strong> — Identifies which tickers have 3/3 confluence (all engines agree)</li>
            <li><strong>CIPHER PRO executes</strong> — Switch to the top-rated ticker, wait for a PX or TS signal with Strong conviction</li>
            <li><strong>PHANTOM PRO confirms</strong> — Check structure: Is there an A-grade OB at the signal level? Is the BOS/CHoCH direction aligned?</li>
            <li><strong>Enter with full confluence</strong> — RADAR says the ticker is ready, CIPHER gives the entry, PHANTOM confirms the structure.</li>
          </ol>

          <h3>Scanning Multiple Timeframes</h3>
          <p>Set different timeframes per ticker to scan your watchlist across multiple perspectives. For example: BTC on 1H, ETH on 4H, SPX on Daily — all in one table. When a ticker shows Strong on a higher TF, it's a swing setup. Strong on a lower TF = a scalp opportunity.</p>

          <h3>Using Filters Effectively</h3>
          <ul>
            <li><strong>Morning scan</strong> — Filter to 3/3 Confluence to find the day's best opportunities</li>
            <li><strong>Trend following</strong> — Filter to Bull+ Rating to see only bullish tickers</li>
            <li><strong>Mean reversion</strong> — Sort by %Chg ascending to find the biggest losers that might snap back (combine with PULSE PRO exhaustion confirmation)</li>
          </ul>

          <h3>What NOT to Do</h3>
          <ul>
            <li>Don't blindly trade the highest-rated ticker — RADAR identifies opportunities, CIPHER times entries</li>
            <li>Don't ignore Volatility — a Strong Bull rating on a Compressed volatility ticker means the move hasn't started yet (patience needed), while High volatility means it may be overextended</li>
            <li>Don't add more than 10 tickers — Pine Script limits request.security() to 40 calls, and RADAR uses all 40 (10 tickers × 4 fetch loops)</li>
          </ul>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip 1: 3/3 Confluence is the Only Filter That Matters</h3>
          <p>When all three engines agree, you have signal direction + structural alignment + momentum confirmation. This is the single most powerful screening criterion. Everything else is secondary.</p>

          <h3>Tip 2: Compressed Volatility + Strong Rating = Pre-Breakout</h3>
          <p>A ticker showing Strong Bull with Compressed volatility means all three engines agree AND volatility is at its lowest. This is the classic squeeze setup — energy is stored and waiting to release. Combine with CIPHER PRO's Coil feature for exact breakout timing.</p>

          <h3>Tip 3: Confluence is the Unique Selling Point</h3>
          <p>No competitor can replicate RADAR's confluence because no one else has three genuinely independent engines (proprietary adaptive signal, stateless structure, and 100% proprietary momentum) in a single screener. This is what justifies the premium pricing.</p>

          <h3>Tip 4: Use Per-Ticker TF for Multi-Timeframe Scanning</h3>
          <p>Set your main holdings to higher timeframes (Daily/Weekly) and your trading watchlist to lower timeframes (1H/4H). One table gives you both the macro view and the trading view simultaneously.</p>

          <h3>Tip 5: Set STRONG_SETUP Alerts</h3>
          <p>The STRONG_SETUP alert fires when a ticker reaches Strong Bull or Strong Bear with 3/3 confluence. This is the highest-conviction setup RADAR can produce. Set it and let RADAR notify you instead of watching the table all day.</p>

          <h3>Tip 6: An Entire Premium Indicator Built in One Session</h3>
          <p>RADAR PRO was designed and published in approximately 6 hours using the stateless architecture approach. The lesson: with clear architecture decisions and the right constraints (stateless-only, no var state in request.security), complex screeners can be built rapidly and reliably.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'atlas-pulse-pro', title: 'Atlas Pulse Pro' },
  },

  // All 4 Pro indicators documented
};

export function getProIndicatorDoc(slug: string): ProIndicatorDoc | undefined {
  return proIndicatorDocs[slug];
}
