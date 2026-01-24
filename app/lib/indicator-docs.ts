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
    subtitle: 'Tracks the intensity and quality of market participation through efficiency and activity analysis.',
    tradingViewUrl: 'https://www.tradingview.com/script/CxnjSZB9-Market-Participation-Gradient-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p>The <strong>Market Participation Gradient (MPG)</strong> is a diagnostic tool that answers: <em>"How much quality participation exists in this market right now?"</em></p>

          <p>Not all market activity is equal. High volume with no directional progress is different from clean, efficient movement. MPG synthesizes both dimensions — efficiency and activity — into a single participation quality score.</p>

          <h3>What MPG Measures</h3>
          <ul>
            <li><strong>Efficiency</strong> — How direct is price movement? (Displacement vs. total path traveled)</li>
            <li><strong>Activity</strong> — Is volume confirming the move? (Current volume vs. average)</li>
          </ul>

          <h3>The Oscillator Shows</h3>
          <ul>
            <li><strong>Level (0-100)</strong> — How much participation exists</li>
            <li><strong>Color</strong> — Quality of that participation:
              <ul>
                <li><strong>Teal</strong> = Clean participation (efficient moves with volume confirmation)</li>
                <li><strong>Magenta</strong> = Absorbed participation (high volume, low efficiency — trapped)</li>
                <li><strong>Amber</strong> = Building participation (transitional)</li>
                <li><strong>Grey</strong> = Thin/Neutral (low participation)</li>
              </ul>
            </li>
          </ul>

          <h3>Four Participation Tiers</h3>
          <ul>
            <li><strong>Thin (0-20)</strong> — Low participation. Market drifting, no conviction.</li>
            <li><strong>Building (20-40)</strong> — Participation emerging. Transitional phase.</li>
            <li><strong>Strong (40-65)</strong> — Solid participation. Healthy activity.</li>
            <li><strong>Extreme (65+)</strong> — Climactic participation. Potential exhaustion warning.</li>
          </ul>

          <h3>Why This Matters</h3>
          <ul>
            <li><strong>Thin markets:</strong> Avoid trend trading — market is drifting without conviction</li>
            <li><strong>Building markets:</strong> Watch for breakout — participation is gathering</li>
            <li><strong>Strong + Clean:</strong> Best conditions for trend-following</li>
            <li><strong>Extreme:</strong> Climactic moves often precede reversals or pauses</li>
            <li><strong>High participation + Absorbed:</strong> Trap conditions — volume failing to produce result</li>
          </ul>

          <p><em>Note: MPG is a diagnostic primitive, not a signal generator. It tells you about market conditions to inform your strategy selection.</em></p>
        `,
      },
      {
        id: 'calculation',
        title: 'How It\'s Calculated',
        icon: 'concept',
        content: `
          <p>MPG synthesizes efficiency and activity into a single quality-weighted participation score.</p>

          <h3>Step 1: Calculate Efficiency (0-1)</h3>
          <p>Measures how direct price movement is over the lookback period:</p>
          <pre>Displacement = |Close - Close[N bars ago]|
Path Length = Sum of |Close - Previous Close| over N bars
Efficiency = Displacement ÷ Path Length</pre>
          <p><strong>Example:</strong> If price traveled $10 in total bar-to-bar moves but only ended up $7 from where it started, efficiency = 0.70 (70%).</p>
          <p>This is similar to Market Efficiency Ratio logic.</p>

          <h3>Step 2: Calculate Activity (centered at 1.0)</h3>
          <p>Measures volume relative to its average:</p>
          <pre>Activity = Current Volume ÷ Average Volume</pre>
          <ul>
            <li><strong>Activity = 1.0:</strong> Normal volume</li>
            <li><strong>Activity = 2.0:</strong> Double normal volume</li>
            <li><strong>Activity = 0.5:</strong> Half normal volume</li>
          </ul>
          <p><strong>FX Fallback:</strong> If volume data is unreliable, uses range/ATR as activity proxy.</p>

          <h3>Step 3: Calculate Participation Score (0-100)</h3>
          <pre>Activity Factor = √(Activity)  // Diminishing returns on volume
Participation Raw = Efficiency × Activity Factor
Participation = Clamp(Participation Raw, 0, 1) × 100</pre>
          <p>The square root on activity creates diminishing returns — doubling volume doesn't double participation. Efficiency is the primary driver.</p>

          <h3>Step 4: Apply Smoothing</h3>
          <pre>MPG = EMA(Participation, Smoothing Length)</pre>
          <p>Smoothing reduces noise while maintaining responsiveness.</p>

          <h3>Step 5: Quality Assessment</h3>
          <p>Color is determined by participation quality:</p>
          <ul>
            <li><strong>Absorbed (Magenta):</strong> Activity > 1.5 AND Efficiency < 0.30 (high volume, low progress)</li>
            <li><strong>Clean (Teal):</strong> Efficiency > 0.55 (good directional progress)</li>
            <li><strong>Neutral (Grey):</strong> Moderate efficiency</li>
          </ul>

          <h3>Step 6: Tier Classification</h3>
          <ul>
            <li><strong>Tier 0 (Thin):</strong> MPG < 20</li>
            <li><strong>Tier 1 (Building):</strong> 20 ≤ MPG < 40</li>
            <li><strong>Tier 2 (Strong):</strong> 40 ≤ MPG < 65</li>
            <li><strong>Tier 3 (Extreme):</strong> MPG ≥ 65</li>
          </ul>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Core Settings</h3>

          <h4>ATR Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–50 bars</p>
          <p>Period for ATR calculation used in normalization (mainly for FX fallback).</p>

          <h4>Efficiency Lookback (Default: 10)</h4>
          <p><strong>Range:</strong> 5–50 bars</p>
          <p>Bars used to calculate directional efficiency.</p>
          <ul>
            <li><strong>Lower values (5-7):</strong> More responsive, captures short-term efficiency changes.</li>
            <li><strong>Default (10):</strong> Balanced for swing trading.</li>
            <li><strong>Higher values (15-25):</strong> Smoother, captures broader efficiency trends.</li>
          </ul>

          <h4>Volume Average Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–50 bars</p>
          <p>Period for volume baseline calculation.</p>
          <ul>
            <li><strong>Lower values:</strong> More reactive to recent volume changes.</li>
            <li><strong>Default (14):</strong> Standard baseline.</li>
            <li><strong>Higher values:</strong> Smoother volume baseline.</li>
          </ul>

          <h4>Smoothing Length (Default: 5)</h4>
          <p><strong>Range:</strong> 1–20 bars</p>
          <p>EMA smoothing applied to the final MPG value.</p>
          <ul>
            <li><strong>1:</strong> No smoothing — raw values.</li>
            <li><strong>Default (5):</strong> Balanced smoothness.</li>
            <li><strong>Higher (10+):</strong> Very smooth but lags.</li>
          </ul>

          <h3>Visual Settings</h3>

          <h4>Show Histogram (Default: On)</h4>
          <p>Display the participation histogram colored by quality.</p>

          <h4>Show Trend Line (Default: On)</h4>
          <p>Display smoothed MPG line overlay on histogram.</p>

          <h4>Show Tier Bands (Default: On)</h4>
          <p>Display horizontal reference lines at tier boundaries (20, 40, 65).</p>

          <h4>Show Pane Background (Default: Off)</h4>
          <p>Subtle background tint matching current quality state.</p>

          <h4>Theme (Default: Cinematic)</h4>
          <p>Color intensity:</p>
          <ul>
            <li><strong>Cinematic:</strong> Subtle, professional appearance.</li>
            <li><strong>Vivid:</strong> Brighter, more visible colors.</li>
          </ul>

          <h3>HUD Settings</h3>

          <h4>Show Status Line HUD (Default: On)</h4>
          <p>Display MPG values in TradingView's status line (top bar).</p>

          <h4>HUD Detail (Default: Minimal)</h4>
          <ul>
            <li><strong>Minimal:</strong> Shows MPG level and tier only.</li>
            <li><strong>Full:</strong> Adds direction and quality indicators.</li>
          </ul>
        `,
      },
      {
        id: 'interpretation',
        title: 'Reading the Indicator',
        icon: 'usage',
        content: `
          <h3>Color Interpretation</h3>
          <ul>
            <li><strong>Teal:</strong> Clean participation — efficient directional movement. Good quality.</li>
            <li><strong>Magenta:</strong> Absorbed participation — high effort, low result. Trap/absorption.</li>
            <li><strong>Amber:</strong> Building participation — transitional, emerging activity.</li>
            <li><strong>Grey:</strong> Thin/Neutral — low participation, market drifting.</li>
          </ul>

          <h3>Tier Interpretation</h3>

          <h4>Thin (0-20) — Grey</h4>
          <p><strong>What it means:</strong> Very low participation. Market lacks conviction.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Drifting, low-volume moves</li>
            <li>No clear direction or commitment</li>
            <li>Holiday/overnight sessions often show this</li>
          </ul>
          <p><strong>Strategy implication:</strong> Avoid trend trading. Wait for participation to build.</p>

          <h4>Building (20-40) — Amber</h4>
          <p><strong>What it means:</strong> Participation is emerging but not yet strong.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Activity starting to pick up</li>
            <li>Often seen at start of sessions or before breakouts</li>
            <li>Transitional phase</li>
          </ul>
          <p><strong>Strategy implication:</strong> Watch for breakout. Prepare entries but wait for Strong tier.</p>

          <h4>Strong (40-65) — Quality-Colored</h4>
          <p><strong>What it means:</strong> Solid participation. Healthy market activity.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Good volume and efficiency</li>
            <li>Trends have conviction</li>
            <li>Best conditions for directional trading</li>
          </ul>
          <p><strong>Strategy implication:</strong> Trend-following works. Pay attention to quality color (Teal = clean, Magenta = absorbed).</p>

          <h4>Extreme (65+) — Quality-Colored</h4>
          <p><strong>What it means:</strong> Climactic participation. High activity levels.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Surge in volume and/or efficiency</li>
            <li>Often seen at climactic moves</li>
            <li>Can precede reversals or pauses</li>
          </ul>
          <p><strong>Strategy implication:</strong> Potential exhaustion. Consider taking profits. If Magenta (absorbed), reversal more likely.</p>

          <h3>Quality in Strong/Extreme Tiers</h3>
          <ul>
            <li><strong>Teal (Clean):</strong> Participation is producing directional progress. Trend is healthy.</li>
            <li><strong>Magenta (Absorbed):</strong> High volume but low efficiency. Effort isn't producing result — potential trap.</li>
            <li><strong>Grey (Neutral):</strong> Moderate quality — watch for shift.</li>
          </ul>
        `,
      },
      {
        id: 'trading',
        title: 'Trading Applications',
        icon: 'tips',
        content: `
          <h3>Trend Quality Filter</h3>
          <p>Use MPG to validate trend conditions:</p>
          <ul>
            <li><strong>Best trends:</strong> Strong tier (40-65) + Teal color = clean directional participation</li>
            <li><strong>Weak trends:</strong> Thin or Building tier = lack of conviction</li>
            <li><strong>Exhausting trends:</strong> Extreme tier, especially with Magenta = climax</li>
          </ul>

          <h3>Entry Timing</h3>
          <ul>
            <li><strong>Wait for Building → Strong:</strong> Enter when participation confirms breakout</li>
            <li><strong>Avoid Thin:</strong> Low participation = low conviction = higher failure rate</li>
            <li><strong>Be cautious in Extreme:</strong> Entry at climax often leads to reversal</li>
          </ul>

          <h3>Exit Timing</h3>
          <ul>
            <li><strong>Strong → Thin:</strong> Participation fading, consider exit</li>
            <li><strong>Extreme + Magenta:</strong> Climactic absorption, take profits</li>
            <li><strong>Color shift Teal → Magenta:</strong> Quality deteriorating, tighten stops</li>
          </ul>

          <h3>Breakout Validation</h3>
          <ul>
            <li><strong>Valid breakout:</strong> Building → Strong with Teal color</li>
            <li><strong>Suspicious breakout:</strong> Breakout on Thin or Magenta = lack of conviction or absorption</li>
            <li><strong>Best breakouts:</strong> Extended Building phase followed by jump to Strong</li>
          </ul>

          <h3>Trap Detection</h3>
          <p>Magenta color in Strong/Extreme tiers signals absorption:</p>
          <ul>
            <li>High volume failing to produce directional progress</li>
            <li>Classic trap pattern — retail pushing, institutions absorbing</li>
            <li>Often precedes reversal, especially at extremes</li>
          </ul>

          <h3>Combining with Other Indicators</h3>
          <ul>
            <li><strong>Market Efficiency Ratio:</strong> MPG efficiency component is similar — use for confirmation</li>
            <li><strong>Effort-Result Divergence:</strong> MPG "absorbed" aligns with ERD absorption signals</li>
            <li><strong>Volatility State Index:</strong> VSI Expansion + MPG Strong = high-conviction move</li>
            <li><strong>Support/Resistance:</strong> Magenta at key levels = absorption/reversal zone</li>
          </ul>

          <h3>Timeframe Considerations</h3>
          <ul>
            <li>Higher timeframe MPG shows broader participation context</li>
            <li>Lower timeframe catches intraday participation shifts</li>
            <li>Use higher TF for regime, lower TF for entry timing</li>
          </ul>
        `,
      },
      {
        id: 'datawindow',
        title: 'Data Window Values',
        icon: 'settings',
        content: `
          <p>When "Show Data Window Values" is enabled, access these metrics by hovering over any bar:</p>

          <h3>MPG Level (0-100)</h3>
          <p>The main smoothed participation score.</p>
          <ul>
            <li><strong>0-20:</strong> Thin participation</li>
            <li><strong>20-40:</strong> Building participation</li>
            <li><strong>40-65:</strong> Strong participation</li>
            <li><strong>65+:</strong> Extreme participation</li>
          </ul>

          <h3>Efficiency %</h3>
          <p>How direct price movement has been (0-100%).</p>
          <ul>
            <li><strong>70%+:</strong> Very efficient — clean directional progress</li>
            <li><strong>40-70%:</strong> Moderate efficiency</li>
            <li><strong>Below 40%:</strong> Low efficiency — oscillating, going nowhere</li>
          </ul>

          <h3>Activity Ratio</h3>
          <p>Current volume relative to average (centered at 1.0).</p>
          <ul>
            <li><strong>Above 1.5:</strong> High activity — above-average volume</li>
            <li><strong>0.7-1.3:</strong> Normal activity range</li>
            <li><strong>Below 0.7:</strong> Low activity — quiet market</li>
          </ul>

          <h3>Momentum</h3>
          <p>Rate of change in MPG level.</p>
          <ul>
            <li><strong>Positive:</strong> Participation increasing</li>
            <li><strong>Negative:</strong> Participation decreasing</li>
            <li><strong>Near zero:</strong> Stable participation</li>
          </ul>

          <h3>Quality (-1/0/1)</h3>
          <p>Quality classification:</p>
          <ul>
            <li><strong>1:</strong> Clean (Teal) — efficient participation</li>
            <li><strong>0:</strong> Neutral (Grey) — moderate quality</li>
            <li><strong>-1:</strong> Absorbed (Magenta) — trapped participation</li>
          </ul>

          <h3>Tier (0-3)</h3>
          <p>Current participation tier:</p>
          <ul>
            <li><strong>0:</strong> Thin</li>
            <li><strong>1:</strong> Building</li>
            <li><strong>2:</strong> Strong</li>
            <li><strong>3:</strong> Extreme</li>
          </ul>
        `,
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        icon: 'warning',
        content: `
          <h3>Mistake #1: Trading Thin Markets</h3>
          <p><strong>Problem:</strong> Taking directional trades when MPG is in Thin tier.</p>
          <p><strong>Result:</strong> Market drifts without conviction, stops get hit by noise.</p>
          <p><strong>Solution:</strong> Wait for at least Building tier before taking directional positions.</p>

          <h3>Mistake #2: Ignoring Quality Color</h3>
          <p><strong>Problem:</strong> Only watching MPG level, ignoring whether it's Teal or Magenta.</p>
          <p><strong>Result:</strong> Trading into absorption zones, getting trapped.</p>
          <p><strong>Solution:</strong> Strong/Extreme with Magenta is a warning, not a green light.</p>

          <h3>Mistake #3: Chasing Extreme</h3>
          <p><strong>Problem:</strong> Entering new positions when MPG hits Extreme tier.</p>
          <p><strong>Result:</strong> Entering at climax, reversal follows.</p>
          <p><strong>Solution:</strong> Extreme is for profit-taking, not new entries. Best entries are Building → Strong.</p>

          <h3>Mistake #4: Confusing Participation with Direction</h3>
          <p><strong>Problem:</strong> Assuming high MPG = bullish or low MPG = bearish.</p>
          <p><strong>Result:</strong> Wrong directional assumptions.</p>
          <p><strong>Solution:</strong> MPG measures participation quality, not direction. Use price or other indicators for direction.</p>

          <h3>Mistake #5: Over-Smoothing</h3>
          <p><strong>Problem:</strong> Setting smoothing length too high (15+).</p>
          <p><strong>Result:</strong> MPG lags significantly, missing tier transitions.</p>
          <p><strong>Solution:</strong> Keep smoothing at 3-7 for most applications.</p>

          <h3>Mistake #6: Using on Low-Volume Assets</h3>
          <p><strong>Problem:</strong> Relying on MPG for assets with unreliable volume (some forex, CFDs).</p>
          <p><strong>Result:</strong> Activity component is based on range proxy, less reliable.</p>
          <p><strong>Solution:</strong> MPG works best on assets with real volume data. On FX, weight efficiency more heavily.</p>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip #1: Building Phase is Key</h3>
          <p>The Building tier (20-40) is where opportunities develop. Extended Building followed by jump to Strong often produces the best moves.</p>

          <h3>Tip #2: Watch for Color Transitions</h3>
          <p>Color shifts are significant:</p>
          <ul>
            <li><strong>Grey → Teal:</strong> Quality improving, trend strengthening</li>
            <li><strong>Teal → Magenta:</strong> Quality deteriorating, absorption starting</li>
            <li><strong>Magenta → Teal:</strong> Absorption resolving, direction resuming</li>
          </ul>

          <h3>Tip #3: Extreme + Teal is Powerful</h3>
          <p>When Extreme tier shows Teal (clean), the move has strong conviction. But watch for any color shift — it often precedes reversal.</p>

          <h3>Tip #4: Thin Markets Have Their Uses</h3>
          <p>While trend trading fails in Thin, range-bound strategies may work. Thin often occurs in overnight sessions — range trade until activity picks up.</p>

          <h3>Tip #5: Use Efficiency Component Directly</h3>
          <p>The Efficiency % in data window is essentially a real-time MER reading. If efficiency is high but overall MPG is low, volume is the issue, not directional quality.</p>

          <h3>Tip #6: Session Transitions</h3>
          <p>Watch MPG during session transitions (Asia → London → NY). Rising from Thin to Building often signals session kickoff — prepare for moves.</p>

          <h3>Tip #7: Combine with Volume Profile</h3>
          <p>MPG Absorbed (Magenta) at high-volume nodes in profile = strong institutional activity. These levels often become significant support/resistance.</p>

          <h3>Tip #8: MPG Divergence</h3>
          <p>If price makes new high/low but MPG fails to reach Strong tier, participation is lacking. Classic divergence warning that move may fail.</p>
        `,
      },
    ],
    prevIndicator: { slug: 'market-acceptance-zones', title: 'Market Acceptance Zones' },
    nextIndicator: { slug: 'market-pressure-regime', title: 'Market Pressure Regime' },
  },

  'market-pressure-regime': {
    title: 'Market Pressure Regime',
    subtitle: 'Multi-dimensional pressure state classifier identifying release, suppression, trap, or transition conditions.',
    tradingViewUrl: 'https://www.tradingview.com/script/V3jfGrc1-Market-Pressure-Regime-Interakktive/',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'overview',
        content: `
          <p>The <strong>Market Pressure Regime (MPR)</strong> is a multi-dimensional state classifier that answers: <em>"What type of pressure is the market experiencing right now?"</em></p>

          <p>Markets don't just trend or range — they experience different types of pressure. Price can be compressed and ready to spring, releasing energy in a directional move, trapped in absorption, or flickering between states. MPR identifies which regime you're in.</p>

          <h3>Four Pressure States</h3>
          <ul>
            <li><strong>Release (Teal)</strong> — Directional pressure is dominant. Price has follow-through, moving efficiently in a direction. Trends are healthy.</li>
            <li><strong>Suppressed (Grey)</strong> — Price is compressed/pinned. Ranges are tight, volatility is low. Potential energy building.</li>
            <li><strong>Trap (Magenta)</strong> — High effort with low result. Volume or range expansion fails to produce directional movement. Classic absorption/trap pattern.</li>
            <li><strong>Transition (Amber)</strong> — Pressure is unclear or unstable. Market is between regimes or flickering. Caution zone.</li>
          </ul>

          <h3>Core Components</h3>
          <p>MPR synthesizes three dimensions of market behavior:</p>
          <ul>
            <li><strong>Compression</strong> — How tight is price action relative to normal? (Pinning proxy)</li>
            <li><strong>Follow-Through</strong> — How efficiently does price travel? (Release proxy, similar to MER)</li>
            <li><strong>Stress</strong> — Is effort producing result? (Trap proxy, similar to ERD)</li>
          </ul>

          <h3>Why This Matters</h3>
          <ul>
            <li><strong>Release:</strong> Trend-following strategies have an edge. Let winners run.</li>
            <li><strong>Suppressed:</strong> Energy building — prepare for breakout. Range-bound until release.</li>
            <li><strong>Trap:</strong> Dangerous for directional trades. Absorption is occurring — potential reversal zone.</li>
            <li><strong>Transition:</strong> Reduce exposure. Wait for clarity.</li>
          </ul>

          <p>MPR combines concepts from Market Efficiency Ratio (follow-through), Effort-Result Divergence (stress), and volatility compression into a single unified state classifier.</p>
        `,
      },
      {
        id: 'calculation',
        title: 'How It\'s Calculated',
        icon: 'concept',
        content: `
          <p>MPR uses a six-stage process combining multiple analytical dimensions.</p>

          <h3>Stage 1: Compression Score (Pinning Proxy)</h3>
          <p>Measures how tight price action is relative to ATR:</p>
          <pre>Range Ratio = Candle Range ÷ ATR
Compression Raw = 1 - Range Ratio
Compression Score = normalized to 0-1</pre>
          <p><strong>Interpretation:</strong> High compression (score near 1) = tight ranges, price is pinned. Low compression (score near 0) = wide ranges, price is expanding.</p>

          <h3>Stage 2: Follow-Through Score (Release Proxy)</h3>
          <p>Measures directional efficiency over the lookback period (similar to MER):</p>
          <pre>Net Displacement = |Close - Close[N bars ago]|
Path Length = Sum of |Close - Previous Close| over N bars
Follow-Through = Net Displacement ÷ Path Length</pre>
          <p><strong>Interpretation:</strong> High follow-through (near 1) = price is moving efficiently in one direction. Low follow-through (near 0) = price is oscillating, going nowhere.</p>

          <h3>Stage 3: Stress Score (Trap Proxy)</h3>
          <p>Measures effort vs. result (similar to ERD):</p>
          <pre>Effort = Volume ÷ Average Volume (or Range Ratio if volume unavailable)
Result = Price Move ÷ ATR
Stress = (Effort - Result) × 100</pre>
          <p><strong>Interpretation:</strong> High stress = lots of effort, little result. This is the absorption/trap signal.</p>

          <h3>Stage 4: Composite Pressure Score</h3>
          <p>The main output value:</p>
          <pre>Pressure Score = Follow-Through Component - Compression Component</pre>
          <ul>
            <li><strong>Positive pressure:</strong> Follow-through dominates — release conditions</li>
            <li><strong>Negative pressure:</strong> Compression dominates — suppressed conditions</li>
          </ul>

          <h3>Stage 5: Stability Filter</h3>
          <p>Measures how consistently pressure maintains direction:</p>
          <pre>Flip Rate = How often pressure changes sign
Stability Score = 1 - Flip Rate</pre>
          <p>Low stability triggers Transition state regardless of pressure score.</p>

          <h3>Stage 6: State Classification</h3>
          <p>Final state determined by:</p>
          <ul>
            <li><strong>Trap:</strong> Stress ≥ Trap Threshold AND Follow-Through < 0.3</li>
            <li><strong>Release:</strong> Pressure Score ≥ Release Threshold</li>
            <li><strong>Suppressed:</strong> Pressure Score ≤ Suppress Threshold</li>
            <li><strong>Transition:</strong> Between thresholds OR unstable</li>
          </ul>
          <p>Persistence filter requires state to hold for N bars before confirming.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Core Settings</h3>

          <h4>ATR Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Period for ATR calculation used in normalization throughout the indicator.</p>
          <ul>
            <li><strong>Lower values:</strong> More responsive to recent volatility.</li>
            <li><strong>Default (14):</strong> Industry standard.</li>
            <li><strong>Higher values:</strong> Smoother baseline.</li>
          </ul>

          <h4>Baseline Lookback (Default: 20)</h4>
          <p><strong>Range:</strong> 10–100 bars</p>
          <p>Period for measuring compression and follow-through efficiency.</p>
          <ul>
            <li><strong>Lower values (10-15):</strong> More responsive, captures shorter-term regimes.</li>
            <li><strong>Default (20):</strong> Balanced for swing trading.</li>
            <li><strong>Higher values (30-50):</strong> Captures longer-term pressure regimes.</li>
          </ul>

          <h4>Volume Average Length (Default: 20)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Period for volume baseline in stress calculation.</p>
          <ul>
            <li>Match to your typical trading horizon</li>
            <li>If volume data is unreliable, stress will use range expansion instead</li>
          </ul>

          <h3>State Classification</h3>

          <h4>Release Threshold (Default: 5.0)</h4>
          <p><strong>Range:</strong> 1–50</p>
          <p>Pressure score must exceed this to trigger Release state.</p>
          <ul>
            <li><strong>Lower values (1-3):</strong> More Release signals, lower bar for directional moves.</li>
            <li><strong>Default (5):</strong> Balanced — requires meaningful directional pressure.</li>
            <li><strong>Higher values (10+):</strong> Only strong directional pressure qualifies.</li>
          </ul>

          <h4>Suppressed Threshold (Default: -5.0)</h4>
          <p><strong>Range:</strong> -50 to -1</p>
          <p>Pressure score must fall below this to trigger Suppressed state.</p>
          <ul>
            <li><strong>Values closer to 0:</strong> More Suppressed signals.</li>
            <li><strong>Default (-5):</strong> Balanced — requires meaningful compression.</li>
            <li><strong>More negative:</strong> Only strong compression qualifies.</li>
          </ul>

          <h4>Trap Threshold (Default: 30.0)</h4>
          <p><strong>Range:</strong> 10–50</p>
          <p>Stress score must exceed this (with low follow-through) to trigger Trap state.</p>
          <ul>
            <li><strong>Lower values (15-20):</strong> More trap signals, catches subtle absorption.</li>
            <li><strong>Default (30):</strong> High-conviction trap detection.</li>
            <li><strong>Higher values (40+):</strong> Only extreme absorption events qualify.</li>
          </ul>

          <h4>Persistence Bars (Default: 3)</h4>
          <p><strong>Range:</strong> 1–10 bars</p>
          <p>Number of consecutive bars a state must hold before confirmation.</p>
          <ul>
            <li><strong>1:</strong> Immediate changes (may flicker).</li>
            <li><strong>Default (3):</strong> Filters noise while staying responsive.</li>
            <li><strong>Higher (5+):</strong> Very stable but slower to react.</li>
          </ul>

          <h4>Stability Lookback (Default: 20)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Period for measuring pressure direction consistency.</p>

          <h4>Stability Threshold (Default: 0.5)</h4>
          <p><strong>Range:</strong> 0.1–1.0</p>
          <p>Below this, Transition state triggers regardless of pressure level.</p>

          <h3>Visual Settings</h3>

          <h4>Show Pressure Histogram (Default: On)</h4>
          <p>Display the pressure score histogram colored by state.</p>

          <h4>Show Zero Line (Default: On)</h4>
          <p>Display horizontal reference at zero.</p>

          <h4>Show Background Tint (Default: Off)</h4>
          <p>Subtle background during Release (teal), Trap (magenta), or Transition (amber).</p>
        `,
      },
      {
        id: 'interpretation',
        title: 'Reading the Indicator',
        icon: 'usage',
        content: `
          <h3>Histogram Color Coding</h3>
          <ul>
            <li><strong>Teal Bars:</strong> Release state — directional pressure, healthy trend.</li>
            <li><strong>Grey Bars:</strong> Suppressed state — compressed, energy building.</li>
            <li><strong>Magenta Bars:</strong> Trap state — absorption, effort without result.</li>
            <li><strong>Amber Bars:</strong> Transition state — unclear, unstable.</li>
          </ul>

          <h3>Understanding Release (Teal)</h3>
          <p><strong>What it means:</strong> Follow-through dominates compression. Price is moving efficiently.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Trends are developing or continuing</li>
            <li>Breakouts have follow-through</li>
            <li>Momentum is clean</li>
          </ul>
          <p><strong>Strategy implication:</strong> Trend-following works. Let winners run. Trail stops.</p>

          <h3>Understanding Suppressed (Grey)</h3>
          <p><strong>What it means:</strong> Compression dominates. Price is tight, ranges are narrow.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Consolidation or balance</li>
            <li>Potential energy building</li>
            <li>Breakout setup forming</li>
          </ul>
          <p><strong>Strategy implication:</strong> Wait for release. Prepare breakout entries. Range trading viable until break.</p>

          <h3>Understanding Trap (Magenta)</h3>
          <p><strong>What it means:</strong> High stress with low follow-through. Effort isn't producing result.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Volume/range expansion without price progress</li>
            <li>Absorption occurring — institutions accumulating or distributing</li>
            <li>Potential reversal zone</li>
          </ul>
          <p><strong>Strategy implication:</strong> Dangerous for trend trades. Look for reversals. Trap often precedes significant direction change.</p>

          <h3>Understanding Transition (Amber)</h3>
          <p><strong>What it means:</strong> Pressure is unclear or flickering unstably.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Market between regimes</li>
            <li>No dominant pressure</li>
            <li>Higher uncertainty</li>
          </ul>
          <p><strong>Strategy implication:</strong> Reduce size or stand aside. Wait for clearer state.</p>

          <h3>Histogram Height</h3>
          <ul>
            <li><strong>Tall positive bars:</strong> Strong release pressure — robust directional move</li>
            <li><strong>Tall negative bars:</strong> Strong suppression — highly compressed</li>
            <li><strong>Bars near zero:</strong> Balanced pressure — watch for regime shift</li>
          </ul>

          <h3>State Sequence Patterns</h3>
          <ul>
            <li><strong>Suppressed → Release:</strong> Classic coil-and-spring breakout.</li>
            <li><strong>Release → Suppressed:</strong> Trend exhaustion, consolidation beginning.</li>
            <li><strong>Trap → Release:</strong> Absorption complete, directional move starting.</li>
            <li><strong>Any → Transition:</strong> Uncertainty — be cautious.</li>
          </ul>
        `,
      },
      {
        id: 'trading',
        title: 'Trading Applications',
        icon: 'tips',
        content: `
          <h3>Strategy Selection by State</h3>
          <ul>
            <li><strong>Release:</strong> Trend-following, momentum, breakout continuation</li>
            <li><strong>Suppressed:</strong> Range trading, breakout preparation, mean-reversion</li>
            <li><strong>Trap:</strong> Reversal setups, fade momentum, wait for direction</li>
            <li><strong>Transition:</strong> Reduce exposure, neutral strategies</li>
          </ul>

          <h3>Breakout Trading</h3>
          <p>MPR excels at breakout timing:</p>
          <ul>
            <li><strong>Best setup:</strong> Extended Suppressed state (4+ bars) followed by first Release bar</li>
            <li><strong>Confirmation:</strong> Positive pressure score increasing</li>
            <li><strong>Warning:</strong> If Trap appears during breakout attempt, breakout may fail</li>
          </ul>

          <h3>Reversal Detection</h3>
          <p>Trap state is the key reversal signal:</p>
          <ul>
            <li><strong>At highs:</strong> Trap = buying absorption = potential top forming</li>
            <li><strong>At lows:</strong> Trap = selling absorption = potential bottom forming</li>
            <li><strong>Confirmation:</strong> Watch for Trap → Release in opposite direction</li>
          </ul>

          <h3>Trend Quality Assessment</h3>
          <ul>
            <li><strong>Healthy trend:</strong> Sustained Release state with consistent positive pressure</li>
            <li><strong>Weakening trend:</strong> Release declining or shifting to Transition</li>
            <li><strong>Trend exhaustion:</strong> Trap appearing after extended Release</li>
          </ul>

          <h3>Position Sizing</h3>
          <ul>
            <li><strong>Release:</strong> Full position — high-conviction directional</li>
            <li><strong>Suppressed:</strong> Standard position — breakout potential</li>
            <li><strong>Trap:</strong> Reduced or reversed position — absorption in progress</li>
            <li><strong>Transition:</strong> Minimal position — uncertainty</li>
          </ul>

          <h3>Stop Placement</h3>
          <ul>
            <li><strong>Release:</strong> Trail stops with trend</li>
            <li><strong>Suppressed:</strong> Place stops outside compression zone</li>
            <li><strong>Trap:</strong> Tight stops or reversal-style entries</li>
          </ul>

          <h3>Combining with Other Indicators</h3>
          <ul>
            <li><strong>Market Efficiency Ratio:</strong> Validates Release — both should agree on trend quality</li>
            <li><strong>Effort-Result Divergence:</strong> Validates Trap — both should show absorption</li>
            <li><strong>Volatility State Index:</strong> Suppressed often aligns with VSI Decay</li>
            <li><strong>Support/Resistance:</strong> Trap at key levels is high-probability reversal</li>
          </ul>
        `,
      },
      {
        id: 'datawindow',
        title: 'Data Window Values',
        icon: 'settings',
        content: `
          <p>When "Show Data Window Values" is enabled, access these metrics by hovering over any bar:</p>

          <h3>Compression Score (0-1)</h3>
          <p>How tight is current price action relative to ATR baseline?</p>
          <ul>
            <li><strong>0.7-1.0:</strong> Highly compressed — tight ranges, pinned price</li>
            <li><strong>0.3-0.7:</strong> Normal compression</li>
            <li><strong>0.0-0.3:</strong> Low compression — expanded ranges</li>
          </ul>

          <h3>Follow-Through Score (0-1)</h3>
          <p>How efficiently has price traveled over the lookback?</p>
          <ul>
            <li><strong>0.7-1.0:</strong> High efficiency — directional progress</li>
            <li><strong>0.3-0.7:</strong> Moderate efficiency</li>
            <li><strong>0.0-0.3:</strong> Low efficiency — oscillating, going nowhere</li>
          </ul>

          <h3>Stress Score</h3>
          <p>Effort minus result, scaled to ±100. Measures absorption/trap potential.</p>
          <ul>
            <li><strong>Positive (high):</strong> Effort exceeding result — absorption</li>
            <li><strong>Near zero:</strong> Balanced effort and result</li>
            <li><strong>Negative:</strong> Result exceeding effort — efficient movement</li>
          </ul>

          <h3>Stability Score (0-1)</h3>
          <p>How consistently has pressure maintained direction?</p>
          <ul>
            <li><strong>0.7-1.0:</strong> Very stable — consistent pressure direction</li>
            <li><strong>0.5-0.7:</strong> Moderate stability</li>
            <li><strong>Below 0.5:</strong> Unstable — triggers Transition</li>
          </ul>

          <h3>Pressure Score</h3>
          <p>The composite output: Follow-Through minus Compression, scaled.</p>
          <ul>
            <li><strong>Positive:</strong> Release pressure dominates</li>
            <li><strong>Negative:</strong> Suppression pressure dominates</li>
            <li><strong>Near zero:</strong> Balanced</li>
          </ul>

          <h3>State (-1/0/1/2)</h3>
          <p>Numeric state identifier:</p>
          <ul>
            <li><strong>1:</strong> Release</li>
            <li><strong>-1:</strong> Suppressed</li>
            <li><strong>0:</strong> Transition</li>
            <li><strong>2:</strong> Trap</li>
          </ul>

          <h3>Is Release / Is Suppressed / Is Transition / Is Trap</h3>
          <p>Binary flags (1 = true, 0 = false) for each state. Useful for alerts and automation.</p>
        `,
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        icon: 'warning',
        content: `
          <h3>Mistake #1: Ignoring Trap Signals</h3>
          <p><strong>Problem:</strong> Holding trend positions through Trap state.</p>
          <p><strong>Result:</strong> Absorption completes and price reverses against you.</p>
          <p><strong>Solution:</strong> Trap is a warning. At minimum, tighten stops. Better: take profits or hedge.</p>

          <h3>Mistake #2: Trading Breakouts in Transition</h3>
          <p><strong>Problem:</strong> Taking breakout signals when MPR shows Transition.</p>
          <p><strong>Result:</strong> False breakouts and whipsaws.</p>
          <p><strong>Solution:</strong> Wait for Suppressed → Release transition, not Transition → anything.</p>

          <h3>Mistake #3: Misinterpreting Suppressed as Bearish</h3>
          <p><strong>Problem:</strong> Assuming Suppressed (grey) means negative/bearish.</p>
          <p><strong>Result:</strong> Missing that compression is neutral — just energy building.</p>
          <p><strong>Solution:</strong> Suppressed is not directional. It means price is coiled. The next state determines direction.</p>

          <h3>Mistake #4: Chasing Extended Release</h3>
          <p><strong>Problem:</strong> Entering trend trades after 10+ bars of Release.</p>
          <p><strong>Result:</strong> Entering at the tail end of a move.</p>
          <p><strong>Solution:</strong> Best entries are early Release, especially after Suppressed. Late Release is for trailing, not entering.</p>

          <h3>Mistake #5: Wrong Trap Threshold</h3>
          <p><strong>Problem:</strong> Trap threshold too low, seeing Trap signals constantly.</p>
          <p><strong>Result:</strong> Oversensitive, too many false traps.</p>
          <p><strong>Solution:</strong> Keep trap threshold at 25-35. Lower only for specific high-volume markets.</p>

          <h3>Mistake #6: Ignoring Context for Trap</h3>
          <p><strong>Problem:</strong> Trading Trap signals without considering price location.</p>
          <p><strong>Result:</strong> Trap in the middle of a trend may just be a pause, not reversal.</p>
          <p><strong>Solution:</strong> Trap is most significant at extremes, support/resistance, or after extended moves.</p>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip #1: Suppressed → Release is Gold</h3>
          <p>The most reliable setup: Extended Suppressed (compression building) followed by Release (breakout). This is the "coil and spring" pattern with MPR confirmation.</p>

          <h3>Tip #2: Trap at Extremes is High-Probability</h3>
          <p>Trap state at obvious support/resistance or after extended trends has high reversal probability. Combine with price action for entries.</p>

          <h3>Tip #3: Watch Stress Score in Release</h3>
          <p>Even during Release, monitor stress score in data window. Rising stress warns that Release may be ending — absorption beginning.</p>

          <h3>Tip #4: Use Compression Score for Range Trading</h3>
          <p>High compression score (>0.7) during Suppressed state means range is tight. Good for range-bound strategies until Release occurs.</p>

          <h3>Tip #5: Multi-Timeframe Confluence</h3>
          <p>Higher timeframe in Release + lower timeframe Suppressed = pullback in trend. Look for lower timeframe Release for continuation entry.</p>

          <h3>Tip #6: Trap Often Precedes Significant Moves</h3>
          <p>Absorption (Trap) is institutions positioning. After Trap resolves, the next Release often produces a significant move. Watch for Trap → Release transitions.</p>

          <h3>Tip #7: State Persistence Indicates Conviction</h3>
          <p>A state holding for many bars (especially Release or Suppressed) indicates strong regime. Single-bar states are less reliable.</p>

          <h3>Tip #8: Combine with Volume Analysis</h3>
          <p>MPR uses volume for stress calculation, but also watch raw volume. High volume + Release = strong conviction. High volume + Trap = significant absorption.</p>
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
          <p>The <strong>Volatility State Index (VSI)</strong> is a regime detection tool that answers a fundamental question: <em>"Is volatility expanding, contracting, or in transition?"</em></p>

          <p>Understanding volatility state is crucial because different market conditions require different trading approaches. A breakout strategy that works in expanding volatility will fail in decaying volatility. The VSI tells you which regime you're in.</p>

          <h3>Core Concept</h3>
          <p>The indicator tracks <strong>volatility momentum</strong> — not just how volatile the market is, but whether volatility is increasing or decreasing and how stable that trend is.</p>

          <h3>Three Volatility States</h3>
          <ul>
            <li><strong>Expansion (Teal)</strong> — Volatility is increasing. Bars are getting larger, ranges are widening. Markets are waking up.</li>
            <li><strong>Decay (Grey)</strong> — Volatility is contracting. Bars are getting smaller, ranges are narrowing. Markets are quieting down.</li>
            <li><strong>Transition (Amber)</strong> — Volatility momentum is unclear or unstable. The market is between regimes or flickering erratically.</li>
          </ul>

          <h3>Why This Matters</h3>
          <ul>
            <li><strong>Strategy Selection:</strong> Breakout strategies work best in expansion. Mean-reversion works best in decay. Transition is danger zone.</li>
            <li><strong>Position Sizing:</strong> Larger positions in stable regimes, smaller in transition.</li>
            <li><strong>Stop Placement:</strong> Tighter stops in decay (less noise), wider in expansion (more movement).</li>
            <li><strong>Entry Timing:</strong> Expansion often follows prolonged decay. Decay often follows climactic expansion.</li>
          </ul>

          <h3>Key Innovation: Stability Filter</h3>
          <p>Unlike simple volatility momentum indicators, VSI includes a stability filter that detects when volatility momentum is flickering — changing direction too rapidly to be reliable. This triggers the Transition state, warning you that the market hasn't committed to a regime.</p>
        `,
      },
      {
        id: 'calculation',
        title: 'How It\'s Calculated',
        icon: 'concept',
        content: `
          <p>VSI uses a five-stage process to produce clean, actionable volatility state readings.</p>

          <h3>Stage 1: Base Volatility</h3>
          <p>Starts with Average True Range (ATR) as the foundation:</p>
          <pre>Base Volatility = ATR(Length)</pre>
          <p>ATR captures the average bar range, accounting for gaps.</p>

          <h3>Stage 2: Smoothed Volatility</h3>
          <p>Apply EMA smoothing to reduce noise:</p>
          <pre>Smoothed Volatility = EMA(Base Volatility, Smoothing Length)</pre>
          <p>This creates a cleaner volatility series for momentum calculation.</p>

          <h3>Stage 3: Volatility Momentum</h3>
          <p>Calculate rate of change in smoothed volatility:</p>
          <pre>Volatility Momentum = (Current Smoothed - Previous Smoothed) ÷ Previous Smoothed
Volatility Momentum (%) = Volatility Momentum × 100</pre>
          <p><strong>Example:</strong> If smoothed ATR was 2.0 ten bars ago and is now 2.2, momentum = (2.2 - 2.0) / 2.0 = 0.10 or +10%.</p>

          <h3>Stage 4: Stability Filter</h3>
          <p>Measures how often volatility momentum changes direction:</p>
          <pre>Momentum Sign = +1 if momentum ≥ 0, else -1
Flip = 1 if sign changed from previous bar, else 0
Flip Rate = SMA(Flip, Stability Lookback)
Stability Score = 1 - Flip Rate</pre>
          <p><strong>Interpretation:</strong> Stability of 0.9 means momentum only flipped 10% of the time — very stable. Stability of 0.4 means it flipped 60% of the time — very unstable.</p>

          <h3>Stage 5: State Classification with Persistence</h3>
          <p>Raw state is determined by momentum thresholds:</p>
          <ul>
            <li><strong>Expansion:</strong> Volatility Momentum % ≥ Expansion Threshold</li>
            <li><strong>Decay:</strong> Volatility Momentum % ≤ Decay Threshold</li>
            <li><strong>Transition:</strong> Between thresholds OR Stability Score < Stability Threshold</li>
          </ul>
          <p>Persistence filter requires a state to hold for N consecutive bars before confirming, preventing flickering on the output.</p>
        `,
      },
      {
        id: 'settings',
        title: 'Input Settings',
        icon: 'settings',
        content: `
          <h3>Core Settings</h3>

          <h4>ATR Length (Default: 14)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Base volatility measurement period. Standard ATR lookback.</p>
          <ul>
            <li><strong>Lower values (5-10):</strong> More responsive to recent volatility changes.</li>
            <li><strong>Default (14):</strong> Industry standard, balanced responsiveness.</li>
            <li><strong>Higher values (20-50):</strong> Smoother base volatility, less reactive to short-term spikes.</li>
          </ul>

          <h4>Smoothing Length (Default: 10)</h4>
          <p><strong>Range:</strong> 3–50 bars</p>
          <p>EMA smoothing applied to the ATR before momentum calculation.</p>
          <ul>
            <li><strong>Lower values (3-5):</strong> Minimal smoothing, more reactive momentum readings.</li>
            <li><strong>Default (10):</strong> Good balance between responsiveness and noise reduction.</li>
            <li><strong>Higher values (15-30):</strong> Very smooth, but lags behind actual volatility changes.</li>
          </ul>

          <h4>Momentum Length (Default: 10)</h4>
          <p><strong>Range:</strong> 3–50 bars</p>
          <p>Period for comparing current vs. past smoothed volatility.</p>
          <ul>
            <li><strong>Lower values:</strong> Faster detection of volatility changes, but noisier.</li>
            <li><strong>Default (10):</strong> Captures meaningful volatility momentum without excessive noise.</li>
            <li><strong>Higher values:</strong> Slower, smoother momentum — good for longer-term regime detection.</li>
          </ul>

          <h3>State Classification</h3>

          <h4>Expansion Threshold (Default: 5%)</h4>
          <p><strong>Range:</strong> 0.1–50%</p>
          <p>Volatility momentum must exceed this percentage to trigger Expansion state.</p>
          <ul>
            <li><strong>Lower values (1-3%):</strong> More sensitive, more expansion signals.</li>
            <li><strong>Default (5%):</strong> Balanced — requires meaningful volatility increase.</li>
            <li><strong>Higher values (8-15%):</strong> Only significant volatility expansions qualify.</li>
          </ul>

          <h4>Decay Threshold (Default: -5%)</h4>
          <p><strong>Range:</strong> -50% to -0.1%</p>
          <p>Volatility momentum must fall below this percentage to trigger Decay state.</p>
          <ul>
            <li><strong>Values closer to 0:</strong> More sensitive to volatility contraction.</li>
            <li><strong>Default (-5%):</strong> Balanced — requires meaningful volatility decrease.</li>
            <li><strong>More negative values:</strong> Only significant volatility contractions qualify.</li>
          </ul>

          <h4>Persistence Bars (Default: 3)</h4>
          <p><strong>Range:</strong> 1–10 bars</p>
          <p>Number of consecutive bars a raw state must hold before becoming confirmed.</p>
          <ul>
            <li><strong>1:</strong> No persistence filter — immediate state changes (may flicker).</li>
            <li><strong>Default (3):</strong> Requires state to hold 3 bars — filters most noise.</li>
            <li><strong>Higher values (5-7):</strong> Very stable output, but slower to react.</li>
          </ul>

          <h4>Stability Lookback (Default: 20)</h4>
          <p><strong>Range:</strong> 5–100 bars</p>
          <p>Period for measuring how often volatility momentum changes direction.</p>

          <h4>Stability Threshold (Default: 0.5)</h4>
          <p><strong>Range:</strong> 0.1–1.0</p>
          <p>Below this stability score, Transition state is triggered regardless of momentum level.</p>
          <ul>
            <li><strong>Lower values (0.3):</strong> Only trigger Transition on very unstable conditions.</li>
            <li><strong>Default (0.5):</strong> Balanced — catches meaningfully unstable regimes.</li>
            <li><strong>Higher values (0.7):</strong> Stricter — requires high stability to avoid Transition.</li>
          </ul>

          <h3>Visual Settings</h3>

          <h4>Show State Histogram (Default: On)</h4>
          <p>Display the main volatility momentum histogram colored by state.</p>

          <h4>Show Momentum Line (Default: Off)</h4>
          <p>Display a line plot of volatility momentum for additional visual reference.</p>

          <h4>Show Zero Line (Default: On)</h4>
          <p>Display horizontal reference at zero.</p>

          <h4>Show Background Tint (Default: Off)</h4>
          <p>Subtle background color during Expansion (teal) and Transition (amber) states.</p>
        `,
      },
      {
        id: 'interpretation',
        title: 'Reading the Indicator',
        icon: 'usage',
        content: `
          <h3>Histogram Color Coding</h3>
          <ul>
            <li><strong>Teal Bars:</strong> Expansion state — volatility is increasing.</li>
            <li><strong>Grey Bars:</strong> Decay state — volatility is decreasing.</li>
            <li><strong>Amber Bars:</strong> Transition state — momentum unclear or unstable.</li>
          </ul>

          <h3>Understanding Expansion (Teal)</h3>
          <p><strong>What it means:</strong> Volatility momentum is above the expansion threshold and stable.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Bars are getting larger</li>
            <li>Ranges are widening</li>
            <li>Breakouts more likely to follow through</li>
            <li>Trends tend to accelerate</li>
          </ul>
          <p><strong>Strategy implication:</strong> Favor breakout and momentum strategies. Use trend-following approaches. Allow positions room to run.</p>

          <h3>Understanding Decay (Grey)</h3>
          <p><strong>What it means:</strong> Volatility momentum is below the decay threshold and stable.</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Bars are getting smaller</li>
            <li>Ranges are narrowing</li>
            <li>Consolidation forming</li>
            <li>Breakouts more likely to fail</li>
          </ul>
          <p><strong>Strategy implication:</strong> Favor mean-reversion and range strategies. Tighten profit targets. Consider reducing position size (less movement to capture).</p>

          <h3>Understanding Transition (Amber)</h3>
          <p><strong>What it means:</strong> Either volatility momentum is in the neutral zone (between thresholds) OR the stability filter triggered (momentum is flickering).</p>
          <p><strong>Market character:</strong></p>
          <ul>
            <li>Volatility direction is unclear</li>
            <li>Market may be shifting between regimes</li>
            <li>Higher uncertainty</li>
          </ul>
          <p><strong>Strategy implication:</strong> Reduce position size or stand aside. Wait for clearer regime before committing. Transition often precedes significant regime change.</p>

          <h3>Histogram Height</h3>
          <p>The histogram shows volatility momentum as a percentage:</p>
          <ul>
            <li><strong>Tall positive bars:</strong> Strong volatility expansion (e.g., +15% momentum)</li>
            <li><strong>Tall negative bars:</strong> Strong volatility decay (e.g., -12% momentum)</li>
            <li><strong>Short bars near zero:</strong> Minimal volatility change</li>
          </ul>

          <h3>State Transitions to Watch</h3>
          <ul>
            <li><strong>Decay → Expansion:</strong> Often precedes breakout moves. "Coil and release" pattern.</li>
            <li><strong>Expansion → Decay:</strong> Often follows climactic moves. Time to take profits.</li>
            <li><strong>Any state → Transition:</strong> Caution — regime is uncertain.</li>
            <li><strong>Prolonged Decay:</strong> Building energy — significant move often follows.</li>
          </ul>
        `,
      },
      {
        id: 'trading',
        title: 'Trading Applications',
        icon: 'tips',
        content: `
          <h3>Strategy Selection Filter</h3>
          <p>Use VSI to choose which strategy to deploy:</p>
          <ul>
            <li><strong>Expansion (Teal):</strong> Breakout strategies, momentum trading, trend following</li>
            <li><strong>Decay (Grey):</strong> Mean reversion, range trading, option selling strategies</li>
            <li><strong>Transition (Amber):</strong> Reduce exposure, wait for clarity, or use market-neutral approaches</li>
          </ul>

          <h3>Position Sizing</h3>
          <ul>
            <li><strong>Expansion:</strong> Full position size — volatility supports larger moves</li>
            <li><strong>Decay:</strong> Reduced size — less movement means smaller profit potential</li>
            <li><strong>Transition:</strong> Minimal size — uncertainty warrants caution</li>
          </ul>

          <h3>Stop Loss Adjustment</h3>
          <ul>
            <li><strong>Expansion:</strong> Wider stops — expect larger swings, avoid getting stopped by noise</li>
            <li><strong>Decay:</strong> Tighter stops — smaller ranges mean stops can be closer</li>
            <li><strong>Transition:</strong> Consider time-based exits rather than price-based</li>
          </ul>

          <h3>Breakout Trading Filter</h3>
          <p>For breakout strategies:</p>
          <ul>
            <li><strong>Take breakouts:</strong> When VSI is in Decay transitioning to Expansion (coil releasing)</li>
            <li><strong>Avoid breakouts:</strong> When VSI is in late Expansion (move already extended) or Transition</li>
            <li><strong>Best setup:</strong> Prolonged Decay (4+ bars) followed by first teal bar = volatility expanding from compressed state</li>
          </ul>

          <h3>Mean Reversion Filter</h3>
          <p>For mean reversion strategies:</p>
          <ul>
            <li><strong>Best conditions:</strong> Stable Decay state — price oscillates in narrowing range</li>
            <li><strong>Avoid:</strong> Expansion state — fade trades get run over by momentum</li>
          </ul>

          <h3>Combining with Other Indicators</h3>
          <p>VSI works well with:</p>
          <ul>
            <li><strong>Market Efficiency Ratio:</strong> VSI shows volatility regime, MER shows trend efficiency</li>
            <li><strong>Market State Intelligence:</strong> Complete picture — volatility + trend + momentum</li>
            <li><strong>Bollinger Band Width:</strong> Similar concept — VSI adds state classification</li>
          </ul>

          <h3>Timeframe Considerations</h3>
          <ul>
            <li>Higher timeframe VSI shows broader volatility regime</li>
            <li>Lower timeframe shows intraday volatility cycles</li>
            <li>Consider using higher TF regime to filter lower TF trades</li>
          </ul>
        `,
      },
      {
        id: 'datawindow',
        title: 'Data Window Values',
        icon: 'settings',
        content: `
          <p>When "Show Data Window Values" is enabled, access these metrics by hovering over any bar:</p>

          <h3>ATR (Raw)</h3>
          <p>The unsmoothed Average True Range value. Shows base volatility in price units.</p>
          <p><strong>Use:</strong> Compare to historical ATR to understand absolute volatility level.</p>

          <h3>ATR (Smoothed)</h3>
          <p>The EMA-smoothed ATR used for momentum calculation.</p>
          <p><strong>Use:</strong> Watch for divergence between raw and smoothed — indicates short-term volatility spike or dip.</p>

          <h3>Volatility Momentum (%)</h3>
          <p>Rate of change in smoothed volatility, expressed as percentage.</p>
          <ul>
            <li><strong>Positive:</strong> Volatility is expanding</li>
            <li><strong>Negative:</strong> Volatility is contracting</li>
            <li><strong>Near zero:</strong> Volatility is stable</li>
          </ul>

          <h3>Stability Score</h3>
          <p>Measures consistency of volatility momentum direction (0 to 1).</p>
          <ul>
            <li><strong>0.8-1.0:</strong> Very stable — momentum direction is consistent</li>
            <li><strong>0.5-0.8:</strong> Moderate stability</li>
            <li><strong>Below 0.5:</strong> Unstable — triggers Transition state</li>
          </ul>

          <h3>State (-1/0/1)</h3>
          <p>Numeric state identifier:</p>
          <ul>
            <li><strong>1:</strong> Expansion</li>
            <li><strong>0:</strong> Transition</li>
            <li><strong>-1:</strong> Decay</li>
          </ul>

          <h3>Is Expansion / Is Decay / Is Transition</h3>
          <p>Binary flags (1 = true, 0 = false) for each state.</p>
          <p><strong>Use:</strong> Useful for alerting or strategy automation — check specific state conditions.</p>
        `,
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        icon: 'warning',
        content: `
          <h3>Mistake #1: Breakout Trading in Late Expansion</h3>
          <p><strong>Problem:</strong> Taking breakout trades when VSI has been in Expansion for many bars.</p>
          <p><strong>Result:</strong> Entering at the tail end of a volatility expansion cycle — move exhausts.</p>
          <p><strong>Solution:</strong> Best breakouts occur when VSI transitions from Decay to Expansion, not after prolonged Expansion.</p>

          <h3>Mistake #2: Ignoring Transition Warnings</h3>
          <p><strong>Problem:</strong> Trading through Transition state as if it doesn't matter.</p>
          <p><strong>Result:</strong> Whipsawed by unstable volatility conditions.</p>
          <p><strong>Solution:</strong> Respect Transition as a "caution" signal. Reduce size or wait for clarity.</p>

          <h3>Mistake #3: Expecting Immediate State Changes</h3>
          <p><strong>Problem:</strong> Expecting VSI to change state the instant volatility changes.</p>
          <p><strong>Result:</strong> Frustration when persistence filter delays state confirmation.</p>
          <p><strong>Solution:</strong> The delay is intentional — it prevents false signals. Watch the momentum reading for early warning.</p>

          <h3>Mistake #4: Using Same Settings Across All Markets</h3>
          <p><strong>Problem:</strong> Default thresholds may not fit all markets.</p>
          <p><strong>Result:</strong> Some markets never trigger Expansion, others rarely show Decay.</p>
          <p><strong>Solution:</strong> Observe your specific market's volatility momentum distribution. Adjust thresholds so you see balanced state occurrence.</p>

          <h3>Mistake #5: Confusing Volatility with Direction</h3>
          <p><strong>Problem:</strong> Assuming Expansion means bullish and Decay means bearish.</p>
          <p><strong>Result:</strong> Wrong directional assumptions.</p>
          <p><strong>Solution:</strong> VSI measures volatility regime, not direction. Expansion can occur in crashes or rallies. Use directional indicators separately.</p>

          <h3>Mistake #6: Oversmoothing</h3>
          <p><strong>Problem:</strong> Setting smoothing and momentum lengths too high.</p>
          <p><strong>Result:</strong> VSI lags significantly behind actual volatility changes.</p>
          <p><strong>Solution:</strong> Keep settings moderate. If VSI state changes feel consistently late, reduce smoothing/momentum lengths.</p>
        `,
      },
      {
        id: 'tips',
        title: 'Pro Tips',
        icon: 'tips',
        content: `
          <h3>Tip #1: Watch for "Coil and Release"</h3>
          <p>Extended Decay periods build energy. When VSI finally shifts to Expansion after 10+ bars of Decay, the resulting move is often significant. This is volatility "coiling" then "releasing."</p>

          <h3>Tip #2: Use Stability Score Proactively</h3>
          <p>Watch the stability score in the data window even when not in Transition. Falling stability during Expansion warns that the regime may be ending.</p>

          <h3>Tip #3: Volatility Cycles</h3>
          <p>Volatility tends to cycle: Expansion → Decay → Expansion → Decay. Prolonged states in one direction often precede the opposite. Use this for anticipation.</p>

          <h3>Tip #4: Combine with Volatility Products</h3>
          <p>If trading VIX futures, options, or volatility ETFs, VSI provides regime context. Expansion favors long volatility, Decay favors short volatility strategies.</p>

          <h3>Tip #5: News and Events</h3>
          <p>Scheduled events (FOMC, earnings, etc.) often trigger volatility expansion. Use VSI to confirm when the expansion has started and when it's decaying post-event.</p>

          <h3>Tip #6: Multi-Timeframe Context</h3>
          <p>Check higher timeframe VSI for regime context before taking trades on lower timeframe. Daily Expansion with hourly Decay may just be a pullback in a volatile market.</p>

          <h3>Tip #7: Transition as Opportunity</h3>
          <p>While Transition is a caution zone, it also signals potential regime change. Monitor Transition closely — the next confirmed state often presents good opportunities.</p>

          <h3>Tip #8: Options Strategies</h3>
          <p>VSI is particularly useful for options traders:</p>
          <ul>
            <li><strong>Decay:</strong> Sell premium (strangles, iron condors)</li>
            <li><strong>Expansion:</strong> Buy premium or directional plays</li>
            <li><strong>Transition:</strong> Neutral strategies with defined risk</li>
          </ul>
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
