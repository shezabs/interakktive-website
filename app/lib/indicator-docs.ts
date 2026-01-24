export interface DocSection {
  id: string;
  title: string;
  icon: 'overview' | 'settings' | 'concept' | 'usage' | 'warning' | 'tips' | 'calculation' | 'interpretation' | 'trading';
  content: string;
}

export interface IndicatorDoc {
  title: string;
  subtitle: string;
  tradingViewUrl: string;
  sections: DocSection[];
  prevIndicator?: { slug: string; title: string };
  nextIndicator?: { slug: string; title: string };
}

// Placeholder documentation - will be populated with full content
export const indicatorDocs: Record<string, IndicatorDoc> = {
  'market-acceptance-envelope': {
    title: 'Market Acceptance Envelope',
    subtitle: 'Dynamic envelope system identifying institutional acceptance zones through probabilistic boundaries.',
    tradingViewUrl: 'https://www.tradingview.com/script/ZICs0t70-Market-Acceptance-Envelope-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market Acceptance Envelope indicator, including its purpose, methodology, and key benefits.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will detail every input parameter, including default values, recommended ranges, and how each setting affects the indicator's behavior.</p>
        `,
      },
    ],
    nextIndicator: { slug: 'market-state-intelligence', title: 'Market State Intelligence' },
  },

  'market-state-intelligence': {
    title: 'Market State Intelligence',
    subtitle: 'Multi-dimensional regime classifier synthesizing trend, momentum, volatility, and structure.',
    tradingViewUrl: 'https://www.tradingview.com/script/I1eqEIHI-Market-State-Intelligence-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market State Intelligence indicator.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>Detailed input parameters documentation will be added here.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-acceptance-envelope', title: 'Market Acceptance Envelope' },
    nextIndicator: { slug: 'market-acceptance-zones', title: 'Market Acceptance Zones' },
  },

  'market-acceptance-zones': {
    title: 'Market Acceptance Zones',
    subtitle: 'Identifies institutional acceptance levels with significant volume concentration and price equilibrium.',
    tradingViewUrl: 'https://www.tradingview.com/script/yZ4KaZk4-Market-Acceptance-Zones-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market Acceptance Zones indicator.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>Detailed input parameters documentation will be added here.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-state-intelligence', title: 'Market State Intelligence' },
    nextIndicator: { slug: 'market-participation-gradient', title: 'Market Participation Gradient' },
  },

  'market-participation-gradient': {
    title: 'Market Participation Gradient',
    subtitle: 'Tracks the intensity and directional bias of market participation through momentum pressure analysis.',
    tradingViewUrl: 'https://www.tradingview.com/script/CxnjSZB9-Market-Participation-Gradient-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market Participation Gradient indicator.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>Detailed input parameters documentation will be added here.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-acceptance-zones', title: 'Market Acceptance Zones' },
    nextIndicator: { slug: 'market-pressure-regime', title: 'Market Pressure Regime' },
  },

  'market-pressure-regime': {
    title: 'Market Pressure Regime',
    subtitle: 'Multi-dimensional pressure state classifier identifying buyer, seller, or equilibrium dominance.',
    tradingViewUrl: 'https://www.tradingview.com/script/V3jfGrc1-Market-Pressure-Regime-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market Pressure Regime indicator.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>Detailed input parameters documentation will be added here.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-participation-gradient', title: 'Market Participation Gradient' },
    nextIndicator: { slug: 'volatility-state-index', title: 'Volatility State Index' },
  },

  'volatility-state-index': {
    title: 'Volatility State Index',
    subtitle: 'Comprehensive volatility regime detection for position sizing and strategy adaptation.',
    tradingViewUrl: 'https://www.tradingview.com/script/7K0MaDFs-Volatility-State-Index-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Volatility State Index indicator.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <p><strong>Documentation coming soon.</strong></p>
          <p>Detailed input parameters documentation will be added here.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-pressure-regime', title: 'Market Pressure Regime' },
    nextIndicator: { slug: 'effort-result-divergence', title: 'Effort-Result Divergence' },
  },

  'effort-result-divergence': {
    title: 'Effort-Result Divergence',
    subtitle: 'Wyckoff-inspired tool comparing volume effort against price result for institutional activity detection.',
    tradingViewUrl: 'https://www.tradingview.com/script/kb56fTI3-Effort-Result-Divergence-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p>The <strong>Effort-Result Divergence (ERD)</strong> is a Wyckoff-inspired indicator that answers a critical question: <em>"Is the volume (effort) producing proportional price movement (result)?"</em></p>

          <p>This concept comes from Richard Wyckoff's analysis methodology. Wyckoff observed that when large players accumulate or distribute, volume patterns often diverge from price behavior. The ERD quantifies this relationship mathematically.</p>

          <h3>Core Concept</h3>
          <p>The indicator compares two normalized measurements:</p>
          <ul>
            <li><strong>Effort</strong> — Current volume relative to average volume (how much energy is being expended)</li>
            <li><strong>Result</strong> — Current price movement relative to ATR (how much the market actually moved)</li>
          </ul>

          <p><strong>ERD Score = Result - Effort</strong></p>

          <h3>What It Tells You</h3>
          <ul>
            <li><strong>Positive ERD (Teal)</strong> — Result exceeds effort. Price moved significantly on relatively low volume. This is a "vacuum" condition — thin liquidity, easy movement.</li>
            <li><strong>Negative ERD (Magenta)</strong> — Effort exceeds result. High volume produced little price movement. This is "absorption" — someone is absorbing the selling/buying pressure.</li>
            <li><strong>Near Zero</strong> — Effort and result are balanced. Normal market conditions.</li>
          </ul>

          <h3>Why This Matters</h3>
          <p>Absorption is one of the most powerful signals in Wyckoff analysis. When heavy volume fails to move price, it often indicates:</p>
          <ul>
            <li>Institutional accumulation (absorbing selling pressure)</li>
            <li>Institutional distribution (absorbing buying pressure)</li>
            <li>Potential reversal zones forming</li>
            <li>Support/resistance being established</li>
          </ul>

          <p>Vacuum conditions (positive ERD) reveal when markets can move easily — useful for breakout confirmation or identifying thin liquidity zones.</p>
        `,
      },
      {
        id: 'calculation',
        title: 'How It\'s Calculated',
        icon: 'concept',
        content: `
          <p>Understanding the calculation helps you interpret signals correctly and adjust settings for your market.</p>

          <h3>Step 1: Calculate Effort (Volume Normalized)</h3>
          <p>Effort measures how much volume is being expended relative to the norm:</p>
          <pre>Effort Ratio = Current Volume ÷ Average Volume (SMA)
Effort (0-100) = (Effort Ratio ÷ Effort Cap) × 100</pre>
          <p><strong>Example:</strong> If average volume is 1M shares and current volume is 2M, effort ratio = 2.0. With default effort cap of 3.0, this maps to 66.7 on the 0-100 scale.</p>

          <h3>Step 2: Calculate Result (Price Move Normalized)</h3>
          <p>Result measures how much price actually moved relative to typical volatility:</p>
          <pre>Price Move = |Close - Previous Close|
Result Ratio = Price Move ÷ ATR
Result (0-100) = (Result Ratio ÷ Result Cap) × 100</pre>
          <p><strong>Example:</strong> If ATR is $2 and price moved $1.5, result ratio = 0.75. With default result cap of 1.0, this maps to 75 on the 0-100 scale.</p>

          <h3>Step 3: Calculate ERD Score</h3>
          <pre>ERD = Result - Effort</pre>
          <p>Using the examples above: ERD = 75 - 66.7 = +8.3 (slight vacuum — result exceeded effort)</p>

          <h3>Step 4: Statistical Divergence Detection</h3>
          <p>To identify significant divergence events, ERD uses z-score analysis:</p>
          <pre>ERD Mean = SMA(ERD, Z-Score Lookback)
ERD StdDev = Standard Deviation(ERD, Z-Score Lookback)
Z-Score = (ERD - ERD Mean) ÷ ERD StdDev</pre>

          <h3>Step 5: Flag Divergence Events</h3>
          <ul>
            <li><strong>Absorption Event:</strong> Z-Score ≤ -Threshold (significant negative divergence)</li>
            <li><strong>Vacuum Event:</strong> Z-Score ≥ +Threshold (significant positive divergence)</li>
          </ul>
          <p>Default threshold is 2.0 standard deviations — meaning these events are statistically significant (occurring roughly 5% of the time).</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Core Settings</h3>

          <h4>Volume Average Length (Default: 20)</h4>
          <p><strong>Range:</strong> 5–200 bars</p>
          <p>Lookback period for calculating average volume baseline.</p>
          <ul>
            <li><strong>Lower values (5-10):</strong> More reactive to recent volume changes. Better for fast-moving markets or shorter timeframes.</li>
            <li><strong>Default (20):</strong> Standard baseline that captures roughly one month of daily data or one trading day of hourly data.</li>
            <li><strong>Higher values (50-100+):</strong> Smoother baseline, less sensitive to short-term volume spikes. Better for filtering noise.</li>
          </ul>

          <h4>ATR Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Period for Average True Range calculation used to normalize price movement.</p>
          <ul>
            <li><strong>Lower values:</strong> More responsive to recent volatility changes.</li>
            <li><strong>Default (14):</strong> Industry standard ATR period.</li>
            <li><strong>Higher values:</strong> Smoother volatility baseline.</li>
          </ul>

          <h4>Effort Cap (Default: 3.0)</h4>
          <p><strong>Range:</strong> 0.5–10.0</p>
          <p>The volume ratio that maps to 100 on the effort scale. When volume is 3× average, effort reads 100.</p>
          <ul>
            <li><strong>Lower values:</strong> Volume spikes hit 100 faster. Use for low-volume markets where 2× is significant.</li>
            <li><strong>Higher values:</strong> Allows for bigger volume spikes. Use for volatile markets with frequent high-volume bars.</li>
          </ul>

          <h4>Result Cap (Default: 1.0)</h4>
          <p><strong>Range:</strong> 0.1–5.0</p>
          <p>The ATR multiple that maps to 100 on the result scale. When price moves 1× ATR, result reads 100.</p>
          <ul>
            <li><strong>Lower values:</strong> Smaller moves register as significant. Use for range-bound markets.</li>
            <li><strong>Higher values:</strong> Only large moves register high. Use for trending markets with extended runs.</li>
          </ul>

          <h3>Divergence Detection</h3>

          <h4>Z-Score Lookback (Default: 100)</h4>
          <p><strong>Range:</strong> 20–500 bars</p>
          <p>Lookback for calculating ERD mean and standard deviation for z-score analysis.</p>
          <ul>
            <li><strong>Lower values (20-50):</strong> More frequent divergence signals, adapts faster to regime changes.</li>
            <li><strong>Default (100):</strong> Balanced statistical significance.</li>
            <li><strong>Higher values (200+):</strong> Fewer, more significant divergence signals. Better for identifying major institutional events.</li>
          </ul>

          <h4>Z-Score Threshold (Default: 2.0)</h4>
          <p><strong>Range:</strong> 1.0–4.0</p>
          <p>Standard deviations required to flag a divergence event.</p>
          <ul>
            <li><strong>1.0-1.5:</strong> More signals, but many may be noise.</li>
            <li><strong>2.0:</strong> Statistically significant (~5% occurrence rate).</li>
            <li><strong>2.5-3.0:</strong> High confidence signals only (~1-2% occurrence rate).</li>
          </ul>

          <h3>Visual Settings</h3>

          <h4>Show ERD Histogram (Default: On)</h4>
          <p>Display the main ERD histogram. Teal bars for positive (vacuum), magenta for negative (absorption).</p>

          <h4>Show Zero Line (Default: On)</h4>
          <p>Display horizontal reference line at zero.</p>

          <h4>Show Divergence Markers (Default: On)</h4>
          <p>Display circle markers when absorption or vacuum events are detected based on z-score threshold.</p>

          <h4>Show Effort/Result Lines (Default: Off)</h4>
          <p>Display separate Effort (orange) and Result (blue) lines. Useful for understanding which component is driving ERD.</p>
        `,
      },
      {
        id: 'interpretation',
        title: 'Reading the Indicator',
        icon: 'usage',
        content: `
          <h3>Histogram Color Coding</h3>
          <ul>
            <li><strong>Teal Bars (Positive ERD):</strong> Result exceeds effort. Price moved easily — vacuum/thin liquidity.</li>
            <li><strong>Magenta Bars (Negative ERD):</strong> Effort exceeds result. Volume failed to move price — absorption.</li>
          </ul>

          <h3>Understanding Absorption (Negative ERD)</h3>
          <p>When you see large magenta bars or absorption event markers:</p>

          <h4>At Support Levels</h4>
          <ul>
            <li>Heavy selling volume, but price doesn't drop</li>
            <li>Suggests buying absorption — institutions accumulating</li>
            <li>Potential bullish reversal signal</li>
          </ul>

          <h4>At Resistance Levels</h4>
          <ul>
            <li>Heavy buying volume, but price doesn't rise</li>
            <li>Suggests selling absorption — institutions distributing</li>
            <li>Potential bearish reversal signal</li>
          </ul>

          <h3>Understanding Vacuum (Positive ERD)</h3>
          <p>When you see large teal bars or vacuum event markers:</p>

          <h4>During Breakouts</h4>
          <ul>
            <li>Price moves easily on relatively light volume</li>
            <li>Suggests thin liquidity in the direction of movement</li>
            <li>Breakout may extend further or reverse quickly (no support)</li>
          </ul>

          <h4>During Trends</h4>
          <ul>
            <li>Efficient price movement — trend has room to run</li>
            <li>Low resistance to price advancement</li>
          </ul>

          <h3>Divergence Event Markers</h3>

          <h4>Absorption Event (Magenta Circle)</h4>
          <p>Statistically significant effort > result divergence. High confidence institutional absorption detected.</p>

          <h4>Vacuum Event (Teal Circle)</h4>
          <p>Statistically significant result > effort divergence. Market moved on air — thin liquidity zone.</p>

          <h3>Component Lines Analysis</h3>
          <p>When "Show Effort/Result Lines" is enabled:</p>
          <ul>
            <li><strong>Orange line (Effort) above Blue line (Result):</strong> Absorption conditions</li>
            <li><strong>Blue line (Result) above Orange line (Effort):</strong> Vacuum conditions</li>
            <li><strong>Lines crossing:</strong> Transition between regimes</li>
          </ul>
        `,
      },
      {
        id: 'trading',
        title: 'Trading Applications',
        icon: 'tips',
        content: `
          <h3>Reversal Detection at Key Levels</h3>
          <p>The most powerful ERD application is identifying institutional absorption at support/resistance:</p>

          <h4>Bullish Absorption Setup</h4>
          <ul>
            <li>Price at or near support level</li>
            <li>ERD showing strong negative readings (magenta bars)</li>
            <li>Absorption event marker appears</li>
            <li><strong>Interpretation:</strong> Heavy selling being absorbed. Look for bullish reversal.</li>
          </ul>

          <h4>Bearish Absorption Setup</h4>
          <ul>
            <li>Price at or near resistance level</li>
            <li>ERD showing strong negative readings</li>
            <li>Absorption event marker appears</li>
            <li><strong>Interpretation:</strong> Heavy buying being absorbed. Look for bearish reversal.</li>
          </ul>

          <h3>Breakout Confirmation</h3>
          <ul>
            <li><strong>Healthy Breakout:</strong> Moderate positive ERD — price moving with some volume support</li>
            <li><strong>Unsustained Breakout Warning:</strong> Extreme positive ERD (vacuum) — price moving on air, may reverse</li>
            <li><strong>Breakout Failure Warning:</strong> Breakout attempt with negative ERD — effort not producing result</li>
          </ul>

          <h3>Trend Quality Assessment</h3>
          <ul>
            <li><strong>Healthy Trend:</strong> ERD fluctuates around zero or slightly positive. Balanced effort and result.</li>
            <li><strong>Climax Warning:</strong> Extreme positive ERD during trend. Price moving too easily — potential exhaustion.</li>
            <li><strong>Accumulation in Trend:</strong> Negative ERD pullbacks during uptrend may indicate accumulation.</li>
          </ul>

          <h3>Combining with Other Indicators</h3>
          <p>ERD works best when combined with:</p>
          <ul>
            <li><strong>Market Acceptance Zones:</strong> Identify key levels, then use ERD to detect absorption at those levels</li>
            <li><strong>Market Efficiency Ratio:</strong> MER shows trend quality, ERD shows institutional activity</li>
            <li><strong>Volume Profile:</strong> High volume nodes + ERD absorption = strong institutional interest</li>
          </ul>

          <h3>Position Management</h3>
          <ul>
            <li><strong>Entry:</strong> Look for absorption events at key support/resistance for reversal entries</li>
            <li><strong>Exit:</strong> Watch for absorption against your position (e.g., selling absorption during longs)</li>
            <li><strong>Stop Placement:</strong> Absorption zones often become support/resistance — place stops beyond them</li>
          </ul>
        `,
      },
      {
        id: 'datawindow',
        title: 'Data Window Values',
        icon: 'settings',
        content: `
          <p>When "Show Data Window Values" is enabled, access these metrics by hovering over any bar:</p>

          <h3>Effort (0-100)</h3>
          <p>Normalized volume effort score. Shows how much volume is being expended relative to the average.</p>
          <ul>
            <li><strong>0-30:</strong> Below-average volume</li>
            <li><strong>30-70:</strong> Normal volume range</li>
            <li><strong>70-100:</strong> High volume (approaching or at effort cap)</li>
          </ul>

          <h3>Result (0-100)</h3>
          <p>Normalized price movement score. Shows how much price moved relative to ATR.</p>
          <ul>
            <li><strong>0-30:</strong> Small price movement (less than 0.3× ATR with default settings)</li>
            <li><strong>30-70:</strong> Moderate price movement</li>
            <li><strong>70-100:</strong> Large price movement (approaching or at result cap)</li>
          </ul>

          <h3>ERD Score</h3>
          <p>The difference between Result and Effort. Range is theoretically -100 to +100.</p>
          <ul>
            <li><strong>Positive:</strong> Result exceeds effort (vacuum)</li>
            <li><strong>Negative:</strong> Effort exceeds result (absorption)</li>
            <li><strong>Near zero:</strong> Balanced conditions</li>
          </ul>

          <h3>Z-Score</h3>
          <p>Statistical measure of how unusual the current ERD reading is relative to recent history.</p>
          <ul>
            <li><strong>±1:</strong> Within normal range</li>
            <li><strong>±2:</strong> Unusual (default threshold for events)</li>
            <li><strong>±3:</strong> Very unusual</li>
          </ul>

          <h3>Absorption Event</h3>
          <p>Binary value: 1 = absorption event triggered, 0 = no event.</p>
          <p>Use for scanning or alerts when significant effort > result divergence occurs.</p>

          <h3>Vacuum Event</h3>
          <p>Binary value: 1 = vacuum event triggered, 0 = no event.</p>
          <p>Use for scanning or alerts when significant result > effort divergence occurs.</p>
        `,
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        icon: 'warning',
        content: `
          <h3>Mistake #1: Ignoring Context</h3>
          <p><strong>Problem:</strong> Trading absorption signals without considering price location.</p>
          <p><strong>Result:</strong> Absorption in the middle of nowhere may just be consolidation, not reversal.</p>
          <p><strong>Solution:</strong> Only act on absorption signals at significant support/resistance levels, trend lines, or volume nodes.</p>

          <h3>Mistake #2: Confusing Direction</h3>
          <p><strong>Problem:</strong> Assuming negative ERD (absorption) is bearish.</p>
          <p><strong>Result:</strong> Missing that absorption at support is actually bullish.</p>
          <p><strong>Solution:</strong> Remember — ERD measures effort vs result, not direction. Context determines bullish/bearish implications.</p>

          <h3>Mistake #3: Wrong Cap Settings</h3>
          <p><strong>Problem:</strong> Using default effort/result caps on markets with different characteristics.</p>
          <p><strong>Result:</strong> ERD readings are always skewed one direction.</p>
          <p><strong>Solution:</strong> Observe your market. If effort rarely exceeds 50, lower the effort cap. If result regularly hits 100, raise the result cap.</p>

          <h3>Mistake #4: Over-Relying on Event Markers</h3>
          <p><strong>Problem:</strong> Only looking for absorption/vacuum events, ignoring regular ERD readings.</p>
          <p><strong>Result:</strong> Missing gradual absorption patterns that don't trigger event thresholds.</p>
          <p><strong>Solution:</strong> Use event markers as confirmation, but watch the histogram for persistent patterns.</p>

          <h3>Mistake #5: Ignoring Volume Quality</h3>
          <p><strong>Problem:</strong> Using ERD on assets with unreliable volume data (forex pairs on retail platforms, some CFDs).</p>
          <p><strong>Result:</strong> Effort calculation is based on tick volume, not actual volume, reducing reliability.</p>
          <p><strong>Solution:</strong> ERD works best on assets with real volume data: stocks, futures, crypto on major exchanges.</p>

          <h3>Mistake #6: Too Short Z-Score Lookback</h3>
          <p><strong>Problem:</strong> Using z-score lookback of 20-30, generating frequent event signals.</p>
          <p><strong>Result:</strong> Events lose statistical significance; too many false positives.</p>
          <p><strong>Solution:</strong> Keep z-score lookback at 100+ for meaningful statistical signals. Lower only if you understand the trade-off.</p>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip #1: Look for Absorption Clusters</h3>
          <p>Single absorption bars can be noise. Multiple consecutive or clustered absorption readings at a level indicate genuine institutional activity.</p>

          <h3>Tip #2: Wyckoff Phases</h3>
          <p>ERD is particularly powerful during Wyckoff accumulation/distribution phases:</p>
          <ul>
            <li><strong>Accumulation:</strong> Look for absorption during selling climax and tests</li>
            <li><strong>Distribution:</strong> Look for absorption during buying climax and upthrusts</li>
          </ul>

          <h3>Tip #3: Use Component Lines for Analysis</h3>
          <p>Enable "Show Effort/Result Lines" to see exactly what's driving ERD. Sometimes result dropping causes positive ERD (low volatility), not volume dropping.</p>

          <h3>Tip #4: Vacuum After Absorption</h3>
          <p>A powerful pattern: Absorption at a level followed by vacuum in the breakout direction. This suggests institutions accumulated/distributed, then price moves easily once they're done.</p>

          <h3>Tip #5: Calibrate to Your Market</h3>
          <p>Spend time observing ERD on your specific market before trading it. Note:</p>
          <ul>
            <li>What effort/result readings are normal?</li>
            <li>What readings precede significant moves?</li>
            <li>How often do event markers occur?</li>
          </ul>

          <h3>Tip #6: Multi-Timeframe Confirmation</h3>
          <p>Absorption on a higher timeframe is more significant than on lower timeframes. Check for absorption on daily before trading reversals on hourly.</p>

          <h3>Tip #7: News and Events</h3>
          <p>ERD readings during major news can be distorted. High volume + high movement = balanced ERD, even though the move is significant. Consider the event context.</p>

          <h3>Tip #8: Divergence from Price</h3>
          <p>Watch for persistent absorption during price advances — institutions may be distributing into strength. This is a classic Wyckoff warning sign.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'volatility-state-index', title: 'Volatility State Index' },
    nextIndicator: { slug: 'market-efficiency-ratio', title: 'Market Efficiency Ratio' },
  },

  'market-efficiency-ratio': {
    title: 'Market Efficiency Ratio',
    subtitle: 'Decomposes price movement into directional progress versus wasted oscillatory movement.',
    tradingViewUrl: 'https://www.tradingview.com/script/e1LSxUSp-Market-Efficiency-Ratio-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p>The <strong>Market Efficiency Ratio (MER)</strong> is a diagnostic tool that answers a fundamental question: <em>"How much of price's total movement actually contributed to directional progress?"</em></p>

          <p>Think of it like measuring a journey. If you walk 100 meters but only end up 20 meters from where you started (because you zigzagged), your efficiency is 20%. The MER applies this concept to price action.</p>

          <h3>Core Concept</h3>
          <p>The indicator compares two measurements:</p>
          <ul>
            <li><strong>Net Displacement</strong> — The straight-line distance from Point A to Point B (absolute price change over N bars)</li>
            <li><strong>Path Length</strong> — The total distance traveled, including all the ups and downs along the way</li>
          </ul>

          <p><strong>Efficiency Ratio = Net Displacement ÷ Path Length</strong></p>

          <h3>What It Tells You</h3>
          <ul>
            <li><strong>High Efficiency (≥70%)</strong> — Price is moving cleanly in one direction with minimal chop. Trending conditions.</li>
            <li><strong>Medium Efficiency (30-70%)</strong> — Mixed movement. Some directional progress but also noise.</li>
            <li><strong>Low Efficiency (&lt;30%)</strong> — Most movement is wasted oscillation. Choppy, ranging, or consolidating conditions.</li>
          </ul>

          <h3>Why This Matters</h3>
          <p>Many traders lose money not because they're wrong about direction, but because they trade in choppy conditions where even correct directional bias gets stopped out by noise. The MER helps you:</p>
          <ul>
            <li>Identify when trend-following strategies have an edge (high efficiency)</li>
            <li>Recognize when mean-reversion or range strategies are more appropriate (low efficiency)</li>
            <li>Avoid taking trades in "no-man's land" where neither approach works well</li>
          </ul>
        `,
      },
      {
        id: 'calculation',
        title: 'How It\'s Calculated',
        icon: 'concept',
        content: `
          <p>Understanding the math helps you interpret the indicator correctly and adjust settings appropriately.</p>

          <h3>Step 1: Calculate Net Displacement</h3>
          <p>This is the absolute difference between the current close and the close N bars ago:</p>
          <pre>Net Displacement = |Close[current] - Close[N bars ago]|</pre>
          <p>For example, if price was at $100 fourteen bars ago and is now at $105, the net displacement is $5.</p>

          <h3>Step 2: Calculate Path Length</h3>
          <p>This sums up every bar-to-bar price change over the lookback period:</p>
          <pre>Path Length = Σ |Close[i] - Close[i+1]| for i = 0 to N-1</pre>
          <p>If price moved: $100 → $102 → $101 → $103 → $105, the path length is:</p>
          <pre>|102-100| + |101-102| + |103-101| + |105-103| = 2 + 1 + 2 + 2 = $7</pre>

          <h3>Step 3: Calculate Efficiency Ratio</h3>
          <pre>Efficiency Ratio = Net Displacement ÷ Path Length</pre>
          <p>Using the example above: $5 ÷ $7 = 0.714 or 71.4%</p>

          <h3>Step 4: Calculate Chop Cost</h3>
          <p>The "wasted" movement that didn't contribute to directional progress:</p>
          <pre>Chop Cost = Path Length - Net Displacement</pre>
          <p>In our example: $7 - $5 = $2 of wasted movement</p>

          <h3>Step 5: Optional Smoothing</h3>
          <p>By default, an EMA smoothing is applied to reduce noise in the efficiency reading itself:</p>
          <pre>Smoothed Efficiency = EMA(Efficiency, Smoothing Length)</pre>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Main Settings</h3>

          <h4>Lookback Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–200 bars</p>
          <p>The number of bars used to measure efficiency. This is your "measurement window."</p>
          <ul>
            <li><strong>Lower values (5-10):</strong> More responsive, captures short-term efficiency changes. Better for scalping or identifying quick regime shifts. More noise.</li>
            <li><strong>Default (14):</strong> Balanced responsiveness. Good for swing trading timeframes.</li>
            <li><strong>Higher values (20-50+):</strong> Smoother, shows broader efficiency trends. Better for position trading or filtering out short-term noise. Slower to react.</li>
          </ul>
          <p><strong>Tip:</strong> Match this to your trading timeframe. Day traders on 5-minute charts might use 14-20. Swing traders on daily charts might use 10-14.</p>

          <h4>Smoothing Length (Default: 5)</h4>
          <p><strong>Range:</strong> 1–100 bars</p>
          <p>EMA smoothing applied to the final efficiency reading to reduce jitter.</p>
          <ul>
            <li><strong>Lower values (1-3):</strong> Minimal smoothing, more reactive but choppier line.</li>
            <li><strong>Default (5):</strong> Good balance between responsiveness and smoothness.</li>
            <li><strong>Higher values (10+):</strong> Very smooth line, but lags behind actual efficiency changes.</li>
          </ul>

          <h4>Apply Smoothing (Default: On)</h4>
          <p>Toggle EMA smoothing on/off. Turn off if you want raw efficiency values without any smoothing delay.</p>

          <h4>Scale Mode (Default: 0–100)</h4>
          <p>Choose how efficiency is displayed:</p>
          <ul>
            <li><strong>0–100:</strong> Percentage format (e.g., 71.4%). Easier to read and compare.</li>
            <li><strong>0–1:</strong> Ratio format (e.g., 0.714). Useful if you're exporting data for calculations.</li>
          </ul>

          <h3>Visual Settings</h3>

          <h4>Show Reference Bands (Default: On)</h4>
          <p>Displays horizontal lines at the low and high efficiency thresholds, plus colored zones.</p>

          <h4>Low Efficiency Level (Default: 30)</h4>
          <p>Below this level, conditions are considered choppy/inefficient. The indicator line turns red and the zone below is shaded.</p>

          <h4>High Efficiency Level (Default: 70)</h4>
          <p>Above this level, conditions are considered efficient/trending. The indicator line turns teal/green and the zone above is shaded.</p>

          <h3>Data Window</h3>

          <h4>Show Data Window Values (Default: On)</h4>
          <p>Exports additional metrics to TradingView's Data Window:</p>
          <ul>
            <li><strong>Net Displacement:</strong> Raw directional price change</li>
            <li><strong>Path Length:</strong> Total distance traveled</li>
            <li><strong>Efficiency Ratio (0–1):</strong> Raw ratio</li>
            <li><strong>Efficiency (0–100):</strong> Percentage</li>
            <li><strong>Chop Cost:</strong> Wasted movement in price units</li>
            <li><strong>Chop % (0–1):</strong> Percentage of movement that was wasted</li>
          </ul>
        `,
      },
      {
        id: 'interpretation',
        title: 'Reading the Indicator',
        icon: 'usage',
        content: `
          <h3>Color Coding</h3>
          <ul>
            <li><strong>Teal/Green Line (≥70):</strong> High efficiency zone. Price is trending cleanly.</li>
            <li><strong>Grey Line (30-70):</strong> Neutral efficiency. Mixed conditions.</li>
            <li><strong>Red Line (&lt;30):</strong> Low efficiency zone. Choppy, consolidating conditions.</li>
          </ul>

          <h3>Zone Interpretation</h3>

          <h4>High Efficiency Zone (Above 70)</h4>
          <p><strong>What it means:</strong> 70%+ of price movement is productive directional progress.</p>
          <p><strong>Market character:</strong> Clean trends, momentum moves, breakouts establishing new ranges.</p>
          <p><strong>Strategy implication:</strong> Trend-following approaches have an edge. Trail stops, let winners run.</p>

          <h4>Neutral Zone (30-70)</h4>
          <p><strong>What it means:</strong> Mixed efficiency. Some trend, some chop.</p>
          <p><strong>Market character:</strong> Transitional phases, weak trends, early reversals.</p>
          <p><strong>Strategy implication:</strong> Be selective. Tighter targets, smaller position sizes.</p>

          <h4>Low Efficiency Zone (Below 30)</h4>
          <p><strong>What it means:</strong> 70%+ of movement is wasted oscillation.</p>
          <p><strong>Market character:</strong> Ranging, consolidation, chop, indecision.</p>
          <p><strong>Strategy implication:</strong> Mean-reversion at extremes may work. Avoid trend-following. Or simply stay out.</p>

          <h3>Pattern Recognition</h3>

          <h4>Rising Efficiency</h4>
          <p>Movement efficiency is improving. Could signal:</p>
          <ul>
            <li>A trend is developing or strengthening</li>
            <li>Breakout from consolidation</li>
            <li>Momentum entering the market</li>
          </ul>

          <h4>Falling Efficiency</h4>
          <p>Movement is becoming less productive. Could signal:</p>
          <ul>
            <li>Trend exhaustion approaching</li>
            <li>Transition to consolidation</li>
            <li>Increased uncertainty/indecision</li>
          </ul>

          <h4>Efficiency Spikes</h4>
          <p>Sudden jumps often occur during:</p>
          <ul>
            <li>News-driven moves</li>
            <li>Breakouts with follow-through</li>
            <li>Panic moves (crashes or squeezes)</li>
          </ul>
        `,
      },
      {
        id: 'trading',
        title: 'Trading Applications',
        icon: 'tips',
        content: `
          <h3>Strategy Selection Filter</h3>
          <p>Use MER to choose which strategy to deploy:</p>
          <ul>
            <li><strong>MER &gt; 70:</strong> Employ trend-following systems, momentum strategies, breakout trading</li>
            <li><strong>MER &lt; 30:</strong> Consider mean-reversion at support/resistance, range trading, or no trading</li>
            <li><strong>MER 30-70:</strong> Be selective or reduce position size</li>
          </ul>

          <h3>Trade Filtering</h3>
          <p>Add MER as a filter to existing strategies:</p>
          <ul>
            <li>Only take trend signals when MER &gt; 50 (confirms directional market)</li>
            <li>Avoid breakout trades when MER is falling (momentum fading)</li>
            <li>Prefer mean-reversion when MER &lt; 30 (range conditions)</li>
          </ul>

          <h3>Position Sizing</h3>
          <p>Adjust size based on efficiency:</p>
          <ul>
            <li><strong>High MER:</strong> Full position size — favorable trending conditions</li>
            <li><strong>Low MER:</strong> Reduced size — higher chop risk means more stop-outs</li>
          </ul>

          <h3>Stop Loss Adjustment</h3>
          <ul>
            <li><strong>High MER:</strong> Tighter stops acceptable — less random noise to worry about</li>
            <li><strong>Low MER:</strong> Wider stops needed — more noise means more whipsaws</li>
          </ul>

          <h3>Confluence with Other Indicators</h3>
          <p>MER works well combined with:</p>
          <ul>
            <li><strong>Volatility State Index:</strong> Understand both efficiency AND volatility regime</li>
            <li><strong>Market State Intelligence:</strong> Complete picture of market conditions</li>
            <li><strong>ADX:</strong> MER often leads ADX — efficiency drops before trend strength fades</li>
          </ul>

          <h3>Timeframe Considerations</h3>
          <ul>
            <li>Higher timeframes generally show more stable efficiency readings</li>
            <li>Lower timeframes can have rapid efficiency shifts during sessions</li>
            <li>Consider using higher timeframe MER to filter lower timeframe trades</li>
          </ul>
        `,
      },
      {
        id: 'datawindow',
        title: 'Data Window Values',
        icon: 'settings',
        content: `
          <p>When "Show Data Window Values" is enabled, you can access additional metrics by hovering over any bar:</p>

          <h3>Net Displacement</h3>
          <p>The absolute price change from N bars ago to now. Shows how far price actually traveled in a straight line.</p>
          <p><strong>Use:</strong> Compare to Path Length to understand efficiency at a glance.</p>

          <h3>Path Length</h3>
          <p>Total distance price traveled, counting every up and down move.</p>
          <p><strong>Use:</strong> Higher path length with low net displacement = lots of wasted movement.</p>

          <h3>Efficiency Ratio (0–1)</h3>
          <p>The raw efficiency ratio as a decimal.</p>
          <p><strong>Use:</strong> Useful for calculations or if you prefer decimal format.</p>

          <h3>Efficiency (0–100)</h3>
          <p>The efficiency as a percentage.</p>
          <p><strong>Use:</strong> Easy to read and compare. "75% efficient" is intuitive.</p>

          <h3>Chop Cost</h3>
          <p>The amount of price movement that was "wasted" (Path Length minus Net Displacement).</p>
          <p><strong>Use:</strong> In absolute terms, shows how much movement didn't contribute to progress. Useful for assessing trading costs.</p>

          <h3>Chop % (0–1)</h3>
          <p>The percentage of movement that was wasted.</p>
          <p><strong>Use:</strong> Chop % + Efficiency Ratio = 1.0 (100%). If efficiency is 0.7, chop is 0.3.</p>
        `,
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        icon: 'warning',
        content: `
          <h3>Mistake #1: Trading Trends in Low Efficiency</h3>
          <p><strong>Problem:</strong> Taking trend-following signals when MER is below 30.</p>
          <p><strong>Result:</strong> Getting stopped out repeatedly by chop even when your directional bias is correct.</p>
          <p><strong>Solution:</strong> Wait for MER to rise above 50 before trend trading, or switch to range strategies.</p>

          <h3>Mistake #2: Ignoring Falling Efficiency</h3>
          <p><strong>Problem:</strong> Staying in trend trades as efficiency drops from 80 to 40.</p>
          <p><strong>Result:</strong> Giving back profits as the trend transitions to consolidation.</p>
          <p><strong>Solution:</strong> Take partial profits or tighten stops when efficiency starts falling.</p>

          <h3>Mistake #3: Using Wrong Lookback</h3>
          <p><strong>Problem:</strong> Using default 14 on all timeframes without consideration.</p>
          <p><strong>Result:</strong> Readings don't match your trading horizon.</p>
          <p><strong>Solution:</strong> Adjust lookback to match your intended holding period. Scalpers might use 8-10, swing traders 14-20.</p>

          <h3>Mistake #4: Over-Smoothing</h3>
          <p><strong>Problem:</strong> Setting smoothing too high (15+) for faster timeframes.</p>
          <p><strong>Result:</strong> Indicator lags too much, missing regime changes.</p>
          <p><strong>Solution:</strong> Keep smoothing at 3-7 for most applications. Only increase for very noisy assets.</p>

          <h3>Mistake #5: Treating Thresholds as Absolute</h3>
          <p><strong>Problem:</strong> Assuming 70 and 30 are perfect levels for all markets.</p>
          <p><strong>Result:</strong> Some markets rarely reach 70, others rarely dip below 30.</p>
          <p><strong>Solution:</strong> Observe your specific market's efficiency distribution and adjust thresholds accordingly.</p>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip #1: Use Chop Cost for Risk Assessment</h3>
          <p>High chop cost means more slippage and more stop-outs. Factor this into position sizing and stop placement.</p>

          <h3>Tip #2: Watch for Efficiency Compression</h3>
          <p>When efficiency slowly rises from very low levels (sub-20), it often precedes a breakout. The market is "coiling."</p>

          <h3>Tip #3: Efficiency Leads Price</h3>
          <p>Efficiency often changes before price does. Rising efficiency in a range suggests breakout is coming. Falling efficiency in a trend suggests reversal or consolidation ahead.</p>

          <h3>Tip #4: Combine with Volume</h3>
          <p>High efficiency + high volume = strong conviction move. High efficiency + low volume = potential false move.</p>

          <h3>Tip #5: Multi-Timeframe Confirmation</h3>
          <p>Check efficiency on a higher timeframe before trading on lower timeframe. If daily MER is 80 and hourly MER is 60, the trend is still healthy despite lower timeframe chop.</p>

          <h3>Tip #6: No Indicator is Perfect</h3>
          <p>MER measures efficiency of past movement. It doesn't predict — it describes. Use it as one tool among many in your decision-making process.</p>

          <h3>Tip #7: Journal Your Observations</h3>
          <p>Note what efficiency levels worked best for your strategies on your specific instruments. Build personal reference points over time.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'effort-result-divergence', title: 'Effort-Result Divergence' },
  },
};
