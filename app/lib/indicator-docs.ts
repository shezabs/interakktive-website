export interface DocSection {
  id: string;
  title: string;
  icon: 'overview' | 'settings' | 'concept' | 'usage' | 'warning' | 'tips';
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
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Effort-Result Divergence indicator.</p>
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
