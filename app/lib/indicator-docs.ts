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
          <p><strong>Documentation coming soon.</strong></p>
          <p>This section will contain a comprehensive overview of the Market Efficiency Ratio indicator.</p>
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
    prevIndicator: { slug: 'effort-result-divergence', title: 'Effort-Result Divergence' },
  },
};
