'use client';

import { useState, useRef, useEffect } from 'react';

// ═══ 14 SPECIALIST AGENTS ═══
const AGENTS = [
  // ── TECHNICAL SPECIALISTS (Original 8) ──
  { id: 'fvg', name: 'FVG Specialist', icon: '◇', role: 'Fair Value Gap & Imbalance', color: '#00E5FF', group: 'Technical', expertise: 'PhD-level FVG specialist. Understand institutional order flow, FVG formation, mitigation patterns, volume imbalances, consequent encroachment vs full mitigation, FVG inversion. Evaluate which FVGs will hold, fill, or get swept.' },
  { id: 'structure', name: 'Structure Analyst', icon: '△', role: 'Market Structure & BOS/CHoCH', color: '#AB47BC', group: 'Technical', expertise: 'PhD-level structure specialist. Understand BOS, CHoCH, swing highs/lows, HH/HL vs LH/LL, premium/discount zones. Evaluate impulsive vs corrective phases, genuine breaks vs liquidity grabs, HTF alignment.' },
  { id: 'momentum', name: 'Momentum Expert', icon: '◎', role: 'Momentum & Oscillators', color: '#26A69A', group: 'Technical', expertise: 'PhD-level momentum specialist. Understand RSI divergences (regular/hidden/exaggerated), MACD dynamics, exhaustion vs acceleration, OB/OS in trending vs ranging. Evaluate continuation vs reversal signals.' },
  { id: 'liquidity', name: 'Liquidity Hunter', icon: '◈', role: 'Liquidity Pools & Stop Hunts', color: '#FF6F00', group: 'Technical', expertise: 'PhD-level liquidity specialist. Understand buy/sell-side pools, equal highs/lows as targets, stop hunts, inducement, institutional sweep engineering. Identify stop clusters and assess hunt probability.' },
  { id: 'volume', name: 'Volume Profiler', icon: '▥', role: 'Volume & Order Flow', color: '#66BB6A', group: 'Technical', expertise: 'PhD-level volume specialist. Understand volume profile (POC, value area, HVN/LVN), delta, cumulative delta divergence, absorption. Evaluate move quality — genuine participation vs hollow fakeouts.' },
  { id: 'divergence', name: 'Divergence Detective', icon: '⟁', role: 'Multi-Indicator Divergence', color: '#EC407A', group: 'Technical', expertise: 'PhD-level divergence specialist. Understand regular/hidden/exaggerated divergence across RSI, MACD, OBV simultaneously. Evaluate significance by TF, confirming indicators, and whether active or spent.' },
  { id: 'pattern', name: 'Pattern Scanner', icon: '⬡', role: 'Chart & Harmonic Patterns', color: '#7E57C2', group: 'Technical', expertise: 'PhD-level pattern specialist. Identify harmonic patterns (Gartley, Bat, Crab, Butterfly), chart patterns (H&S, triangles, wedges, flags, channels), and candlestick patterns (engulfings, pin bars, inside bars, morning/evening stars). Evaluate completion probability and measured move targets.' },
  { id: 'mtf', name: 'MTF Analyst', icon: '◉', role: 'Multi-Timeframe Alignment', color: '#4FC3F7', group: 'Technical', expertise: 'PhD-level MTF specialist. Evaluate whether the setup on the analysis TF aligns with 1 TF above and 2 TFs above. Check if trading with or against the higher timeframe trend. A 15m long is worthless if the 4H is bearish. Rate alignment strength and flag conflicts.' },

  // ── MACRO & CONTEXT SPECIALISTS (New 6) ──
  { id: 'session', name: 'Session Strategist', icon: '◔', role: 'Session & Kill Zone Timing', color: '#29B6F6', group: 'Context', expertise: 'PhD-level session specialist. Understand Asian/London/NY behaviour, session opens as key levels, LDN-NY overlap, day-of-week tendencies, kill zones. Evaluate whether now is the right time to trade this asset.' },
  { id: 'correlation', name: 'Correlation Analyst', icon: '⊗', role: 'Inter-Market Correlation', color: '#FF8A65', group: 'Context', expertise: 'PhD-level correlation specialist. Track DXY vs forex pairs, BTC/ETH correlation, S&P/Nasdaq correlation, bond yields vs equities, gold vs USD. Identify when correlated markets confirm or contradict the thesis. Flag hidden exposure from correlated positions.' },
  { id: 'sentiment', name: 'Sentiment Scanner', icon: '☍', role: 'Crowd & Funding Sentiment', color: '#AED581', group: 'Context', expertise: 'PhD-level sentiment specialist. Evaluate Fear & Greed index, funding rates (crypto), open interest changes, social sentiment (extreme euphoria/fear), put/call ratios. Contrarian when crowd is extreme. Identify when positioning is stretched and a squeeze is likely.' },
  { id: 'macro', name: 'Macro Economist', icon: '⊕', role: 'Macro & Central Bank Intelligence', color: '#FFD54F', group: 'Context', expertise: 'PhD-level macro specialist. Evaluate interest rate cycle, CPI/NFP/GDP impact, central bank positioning (Fed/ECB/BOJ/BOE), yield curve signals, QT/QE effects. For crypto: on-chain metrics, whale movements, exchange flows. How does the macro backdrop support or threaten this trade?' },
  { id: 'news', name: 'News Analyst', icon: '⊙', role: 'Breaking News & Events', color: '#4DD0E1', group: 'Context', expertise: 'PhD-level news specialist. Evaluate breaking news impact, scheduled economic events today/this week, geopolitical risks, earnings dates (stocks), regulatory developments (crypto). Flag any upcoming catalysts that could invalidate the setup within the trade horizon.' },
  { id: 'fundamentals', name: 'Fundamentals Analyst', icon: '⊞', role: 'Fundamental Valuation', color: '#81C784', group: 'Context', expertise: 'PhD-level fundamentals specialist. For stocks: PE ratio, revenue growth, earnings surprises, sector rotation. For crypto: on-chain activity, TVL, active addresses, NVT ratio, exchange reserves. For forex: interest rate differentials, trade balances, economic strength. Is the asset fundamentally over/undervalued?' },

  // ── RISK & PSYCHOLOGY ──
  { id: 'risk', name: 'Risk Controller', icon: '▣', role: 'Risk & Position Sizing', color: '#EF5350', group: 'Risk', expertise: 'PhD-level risk specialist focused on prop firm survival. Daily drawdown (4-5%), max drawdown (8-10%), consistency rules, trailing drawdown, position sizing. Evaluate R:R, lot sizing within limits, and whether to trade today. You are the voice of survival.' },
  { id: 'psych', name: 'Trade Psychologist', icon: '◐', role: 'Behavioural Quality Check', color: '#CE93D8', group: 'Risk', expertise: 'PhD-level trading psychologist. Evaluate setup quality from a behavioural lens: Is this FOMO? Revenge trading? Is the market too choppy for clean execution? Is the trader likely to manage this trade well or panic? Rate the "tradability" of this setup — not just whether it\'s technically valid, but whether a real trader will successfully execute it. Recommend sitting out if the setup demands perfect execution in difficult conditions.' },
];

const CEO_SYSTEM = `You are the CEO of ATLAS Trading Intelligence. You receive assessments from 14 PhD-level specialist agents across Technical Analysis, Market Context, and Risk Management. 

Synthesise into a DAILY BRIEFING with a decisive verdict: STRONG BUY, BUY, HOLD/WAIT, SELL, or STRONG SELL.

Include: Entry zone, Stop loss, TP1/TP2/TP3, Primary risk, Position size, Time horizon.
The Risk Controller and Trade Psychologist carry extra weight — if they say no, you need an overwhelming reason to override.
Format with clear sections. This briefing should give the trader everything they need for the day.`;

const S_IDLE = 0, S_WAITING = 1, S_RUNNING = 2, S_DONE = 3, S_FAILED = 4;

// Simple markdown renderer
const renderMd = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/## (.*?)(\n|$)/g, '<h3 style="color:#FFD700;font-size:14px;margin:16px 0 8px;font-weight:700;letter-spacing:0.05em">$1</h3>')
    .replace(/# (.*?)(\n|$)/g, '<h2 style="color:#FFD700;font-size:16px;margin:20px 0 10px;font-weight:700;letter-spacing:0.08em">$1</h2>')
    .replace(/- (.*?)(\n|$)/g, '<div style="padding-left:12px;margin:2px 0">• $1</div>')
    .replace(/═+/g, '<hr style="border:none;border-top:1px solid #333;margin:12px 0"/>')
    .replace(/\n/g, '<br/>');
};

export default function WarRoomPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [storedPwd, setStoredPwd] = useState('');

  const [ticker, setTicker] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('4H');
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [chartPreview, setChartPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [searchStatus, setSearchStatus] = useState('');
  const [agentResults, setAgentResults] = useState<any[]>([]);
  const [agentStatuses, setAgentStatuses] = useState(() => AGENTS.map(() => S_IDLE));
  const [agentMessages, setAgentMessages] = useState(() => AGENTS.map(() => ''));
  const [ceoStatus, setCeoStatus] = useState(S_IDLE);
  const [ceoVerdict, setCeoVerdict] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startTime || phase === 'complete' || phase === 'idle') return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250);
    return () => clearInterval(iv);
  }, [startTime, phase]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setChartPreview(result);
      setChartImage(result.split(',')[1]); // Strip data:image/... prefix for API
    };
    reader.readAsDataURL(file);
  };

  const callAPI = async (system: string, message: string, useSearch: boolean, isCeo: boolean = false, sendImage: boolean = false) => {
    const body: any = { system, message, useSearch, password: storedPwd, isCeo };
    if (sendImage && chartImage) body.imageBase64 = chartImage;
    const res = await fetch('/api/war-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'API call failed');
    return data.text;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    try {
      const res = await fetch('/api/war-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: 'Reply OK', message: 'test', useSearch: false, password: pwd }),
      });
      if (res.status === 401) { setPwdError('Wrong password'); return; }
      setStoredPwd(pwd);
      setAuthed(true);
    } catch { setPwdError('Connection error'); }
  };

  const setAgentStatus = (i: number, s: number) => setAgentStatuses(p => { const n = [...p]; n[i] = s; return n; });
  const setAgentMsg = (i: number, m: string) => setAgentMessages(p => { const n = [...p]; n[i] = m; return n; });

  const runAnalysis = async () => {
    if (!ticker.trim()) return;
    setRunning(true); setError(''); setAgentResults([]); setCeoVerdict(null); setExpandedAgent(null);
    setAgentStatuses(AGENTS.map(() => S_WAITING));
    setAgentMessages(AGENTS.map(() => 'Waiting...'));
    setCeoStatus(S_WAITING);
    setStartTime(Date.now()); setElapsed(0); setPhase('searching');
    setSearchStatus('Fetching live market data...');

    try {
      // Phase 1: Web search for market data
      const marketData = await callAPI(
        'You are a financial market data aggregator. Search the web for comprehensive current data. Return ALL relevant data: price, levels, news, patterns, volume, sentiment, macro context.',
        `Get the latest comprehensive data for ${ticker} on ${timeframe}. Include: current price, 24h high/low, key S/R levels, recent news/events, volume trends, chart patterns, RSI/MACD, funding rate (if crypto), DXY correlation, Fear&Greed, macro events today. This is for a daily trading briefing.`,
        true
      );
      setSearchStatus('Market data received ✓');
      setPhase('analyzing');

      // Phase 2: Chart analysis if uploaded (single Sonnet call with image)
      let chartAnalysis = '';
      if (chartImage) {
        setSearchStatus('Analysing uploaded chart...');
        chartAnalysis = await callAPI(
          'You are an expert chart analyst. Describe everything you see on this chart: trend direction, key levels, patterns, indicators visible, support/resistance, recent price action. Be specific with price levels.',
          `Describe this ${ticker} ${timeframe} chart in detail. What patterns, levels, trends, and signals are visible? Be specific.`,
          false, false, true
        );
        await delay(4000);
      }

      const fullContext = chartAnalysis 
        ? `LIVE MARKET DATA:\n${marketData}\n\nCHART ANALYSIS (from uploaded screenshot):\n${chartAnalysis}`
        : `LIVE MARKET DATA:\n${marketData}`;

      // Phase 3: All 14 specialists
      const results: any[] = [];
      for (let i = 0; i < AGENTS.length; i++) {
        const agent = AGENTS[i];
        setAgentStatus(i, S_RUNNING);
        setAgentMsg(i, 'Analysing...');
        try {
          if (i > 0) await delay(4000);
          const system = `You are ${agent.name} — ${agent.role}.\n\n${agent.expertise}\n\nAnalyse through YOUR specialist lens only. Be decisive. Reference specific price levels. Keep response under 200 words.`;
          const user = `ASSET: ${ticker} | TIMEFRAME: ${timeframe}\n\n${fullContext}\n\nFormat:\nBIAS: [BULLISH / BEARISH / NEUTRAL]\nCONVICTION: [1-10]\nKEY FINDINGS:\n- [Finding 1]\n- [Finding 2]\n- [Finding 3]\nRISK FLAG: [Concern or "None"]\nRECOMMENDATION: [1-2 sentences]`;
          const response = await callAPI(system, user, false);
          results.push({ ...agent, response });
          setAgentResults(p => [...p, { ...agent, response }]);
          setAgentStatus(i, S_DONE);
          setAgentMsg(i, 'Complete');
        } catch (err: any) {
          setAgentStatus(i, S_FAILED);
          setAgentMsg(i, 'Failed');
          results.push({ ...agent, response: `⚠ Failed: ${err.message}` });
          setAgentResults(p => [...p, { ...agent, response: `⚠ Failed: ${err.message}` }]);
        }
      }

      // Phase 4: CEO daily briefing
      setPhase('synthesizing');
      setCeoStatus(S_RUNNING);
      await delay(5000);
      const assessments = results.map(r => `── ${r.name} (${r.role}) ──\n${r.response}`).join('\n\n');
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const verdict = await callAPI(
        CEO_SYSTEM,
        `DAILY BRIEFING — ${dateStr}, ${timeStr} UTC\nASSET: ${ticker} | TIMEFRAME: ${timeframe}\n\n${fullContext}\n\n14 SPECIALIST ASSESSMENTS:\n${assessments}\n\nDeliver the ATLAS DAILY BRIEFING:\n\n# ATLAS DAILY BRIEFING — ${ticker}\n## ${dateStr}\n\nVERDICT: [STRONG BUY / BUY / HOLD / SELL / STRONG SELL]\nCONFIDENCE: [1-10]\n\n## CONSENSUS\n[Summarise which specialists agree/disagree and why]\n\n## TRADE SETUP\nEntry Zone:\nStop Loss:\nTP1:\nTP2:\nTP3:\n\n## KEY RISKS\n[Top 2-3 risks]\n\n## POSITION SIZE\n[Guidance]\n\n## EVENTS TO WATCH TODAY\n[Scheduled events, news catalysts]\n\n## EXECUTIVE SUMMARY\n[2-3 sentence conviction statement — the one paragraph a trader reads if they read nothing else]`,
        false, true
      );
      setCeoVerdict(verdict);
      setCeoStatus(S_DONE);
      setPhase('complete');
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
      setPhase('idle');
    } finally { setRunning(false); }
  };

  useEffect(() => { if (resultsRef.current) resultsRef.current.scrollTop = resultsRef.current.scrollHeight; }, [agentResults, ceoVerdict]);

  const getBias = (t: string) => { if (!t) return 'neutral'; const u = t.toUpperCase(); return u.includes('BIAS: BULLISH') || u.includes('BIAS:BULLISH') ? 'bull' : u.includes('BIAS: BEARISH') || u.includes('BIAS:BEARISH') ? 'bear' : 'neutral'; };
  const getConviction = (t: string) => { const m = t?.match(/CONVICTION:\s*(\d+)/i); return m ? parseInt(m[1]) : null; };
  const getVerdictType = (t: string) => { if (!t) return 'hold'; const u = t.toUpperCase(); if (u.includes('STRONG BUY')) return 'strongbuy'; if (u.includes('STRONG SELL')) return 'strongsell'; if (u.includes('VERDICT: BUY')) return 'buy'; if (u.includes('VERDICT: SELL')) return 'sell'; return 'hold'; };

  const doneCount = agentStatuses.filter(s => s === S_DONE || s === S_FAILED).length;
  const totalSteps = AGENTS.length + (chartImage ? 3 : 2); // search + (chart) + agents + CEO
  const currentStep = phase === 'idle' ? 0 : phase === 'searching' ? 0.5 : doneCount + 1 + (ceoStatus === S_DONE ? 1 : ceoStatus === S_RUNNING ? 0.5 : 0);
  const progressPct = Math.min(100, (currentStep / totalSteps) * 100);

  const bs: any = { bull: { bg: '#26A69A20', bdr: '#26A69A40', txt: '#26A69A', lbl: '▲ BULLISH' }, bear: { bg: '#EF535020', bdr: '#EF535040', txt: '#EF5350', lbl: '▼ BEARISH' }, neutral: { bg: '#FFB30020', bdr: '#FFB30040', txt: '#FFB300', lbl: '— NEUTRAL' } };
  const vcols: any = { strongbuy: { bg: '#0D3B2E', bdr: '#26A69A' }, buy: { bg: '#0D3B2E', bdr: '#26A69A99' }, hold: { bg: '#3B2E0D', bdr: '#FFB30099' }, sell: { bg: '#3B0D0D', bdr: '#EF535099' }, strongsell: { bg: '#3B0D0D', bdr: '#EF5350' } };

  const groups = ['Technical', 'Context', 'Risk'];
  const groupLabels: any = { Technical: 'Technical Analysis', Context: 'Market Context', Risk: 'Risk & Psychology' };

  // ═══ PASSWORD GATE ═══
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08090E' }}>
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <span className="text-5xl" style={{ color: '#26A69A' }}>★</span>
            <h1 className="text-2xl font-bold mt-3" style={{ color: '#E0E0E0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>ATLAS WAR ROOM</h1>
            <p className="text-xs mt-2" style={{ color: '#555', letterSpacing: '0.15em' }}>RESTRICTED ACCESS — v2.0</p>
          </div>
          <form onSubmit={handleLogin}>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Enter password" autoFocus className="w-full px-4 py-3 rounded-lg text-white text-center outline-none mb-3" style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: '0.2em' }} />
            {pwdError && <p className="text-center text-sm mb-3" style={{ color: '#EF5350' }}>{pwdError}</p>}
            <button type="submit" className="w-full py-3 rounded-lg font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #26A69A, #1E8C82)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>ACCESS WAR ROOM</button>
          </form>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');`}</style>
      </div>
    );
  }

  // ═══ MAIN WAR ROOM ═══
  return (
    <div className="min-h-screen" style={{ background: '#08090E', color: '#E0E0E0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'relative', zIndex: 1 }} className="max-w-7xl mx-auto px-5 py-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl" style={{ color: '#26A69A' }}>★</span>
              <h1 className="text-2xl font-bold" style={{ letterSpacing: '0.08em', background: 'linear-gradient(135deg, #26A69A, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATLAS WAR ROOM</h1>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#FFD70020', color: '#FFD700', fontSize: 9 }}>v2.0</span>
            </div>
            <p className="text-xs" style={{ color: '#555', letterSpacing: '0.12em' }}>14 SPECIALIST AGENTS + CEO · DAILY TRADING BRIEFING</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="TICKER" disabled={running} className="px-3 py-2.5 rounded-lg text-white text-sm outline-none w-36" style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: 'inherit' }} />
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} disabled={running} className="px-3 py-2.5 rounded-lg text-white text-sm outline-none" style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: 'inherit' }}>
              {['1m','5m','15m','30m','1H','4H','D','W','M'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            {/* Chart upload */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChartUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={running} className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-40" style={{ background: chartPreview ? '#26A69A20' : '#0D0F14', border: `1px solid ${chartPreview ? '#26A69A' : '#1E2028'}`, color: chartPreview ? '#26A69A' : '#888', fontFamily: 'inherit', cursor: running ? 'not-allowed' : 'pointer' }}>
              {chartPreview ? '✓ Chart' : '📷 Chart'}
            </button>
            <button onClick={runAnalysis} disabled={running || !ticker.trim()} className="px-6 py-2.5 rounded-lg text-white text-sm font-bold disabled:opacity-50" style={{ background: running ? '#1E2028' : 'linear-gradient(135deg, #26A69A, #1E8C82)', border: 'none', fontFamily: 'inherit', letterSpacing: '0.1em', cursor: running ? 'not-allowed' : 'pointer' }}>
              {running ? 'ANALYSING...' : '▶ DEPLOY 14 AGENTS'}
            </button>
          </div>
        </div>

        {/* Chart preview */}
        {chartPreview && !running && phase === 'idle' && (
          <div className="mb-4 flex items-center gap-3">
            <img src={chartPreview} alt="Chart" className="h-16 rounded border" style={{ borderColor: '#26A69A40' }} />
            <span className="text-xs" style={{ color: '#888' }}>Chart uploaded — agents will analyse this alongside live data</span>
            <button onClick={() => { setChartImage(null); setChartPreview(null); }} className="text-xs px-2 py-1 rounded" style={{ color: '#EF5350', background: '#EF535015' }}>Remove</button>
          </div>
        )}

        {/* Progress */}
        {phase !== 'idle' && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5 text-xs">
              <span style={{ color: '#888' }}>
                {phase === 'searching' && `⟐ ${searchStatus}`}
                {phase === 'analyzing' && (() => { const idx = agentStatuses.findIndex(s => s === S_RUNNING); return `◎ ${idx >= 0 ? AGENTS[idx].name : 'Processing'}...`; })()}
                {phase === 'synthesizing' && '★ CEO compiling daily briefing...'}
                {phase === 'complete' && '✓ Daily briefing complete — 14 specialists reported'}
              </span>
              <div className="flex gap-4">
                <span style={{ color: '#555' }}>{doneCount}/{AGENTS.length} agents</span>
                <span style={{ color: '#FFB300', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</span>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1E2028' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: phase === 'complete' ? '#4ADE80' : 'linear-gradient(90deg, #26A69A, #FFD700)' }} />
            </div>
          </div>
        )}

        {/* Agent roster — grouped */}
        {groups.map(group => (
          <div key={group} className="mb-3">
            <div className="text-xs mb-1.5 px-1" style={{ color: '#444', letterSpacing: '0.15em' }}>{groupLabels[group]}</div>
            <div className="grid gap-1.5 mb-1" style={{ gridTemplateColumns: `repeat(${AGENTS.filter(a => a.group === group).length}, 1fr)` }}>
              {AGENTS.filter(a => a.group === group).map(agent => {
                const i = AGENTS.findIndex(a => a.id === agent.id);
                const st = agentStatuses[i];
                const res = agentResults.find((r: any) => r.id === agent.id);
                const bias = res ? getBias(res.response) : null;
                const conv = res ? getConviction(res.response) : null;
                const b = bias ? bs[bias] : null;
                const failed = res?.response?.startsWith('⚠');
                return (
                  <div key={agent.id} onClick={() => res && !failed && setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                    className="flex flex-col items-center gap-1 rounded-lg p-2 transition-all"
                    style={{
                      background: st === S_RUNNING ? `${agent.color}10` : st === S_DONE ? '#0D0F14' : st === S_FAILED ? '#1A0A0A' : '#0A0B10',
                      border: `1px solid ${st === S_RUNNING ? agent.color : st === S_DONE ? `${agent.color}40` : st === S_FAILED ? '#EF535040' : '#12141A'}`,
                      cursor: res && !failed ? 'pointer' : 'default',
                      boxShadow: st === S_RUNNING ? `0 0 15px ${agent.color}15` : 'none',
                    }}>
                    <span style={{ fontSize: 16, color: failed ? '#EF5350' : agent.color }}>{agent.icon}</span>
                    <span className="text-center leading-tight" style={{ fontSize: 7, color: st === S_DONE ? '#AAA' : '#555' }}>{agent.name.replace(' Analyst', '').replace(' Expert', '').replace(' Specialist', '').replace(' Detective', '').replace(' Scanner', '').replace(' Hunter', '').replace(' Profiler', '').replace(' Strategist', '').replace(' Controller', '').replace(' Economist', '').replace(' Psychologist', '')}</span>
                    {st === S_WAITING && <span style={{ fontSize: 6, color: '#333', letterSpacing: '0.1em' }}>QUEUED</span>}
                    {st === S_RUNNING && <div className="w-4/5 h-0.5 rounded-full overflow-hidden" style={{ background: '#1E2028' }}><div className="h-full rounded-full" style={{ background: agent.color, animation: 'barPulse 1.2s ease-in-out infinite' }} /></div>}
                    {st === S_DONE && !failed && b && <span className="font-bold rounded" style={{ fontSize: 7, padding: '1px 4px', background: b.bg, color: b.txt }}>{conv !== null ? `${conv}/10` : bias?.toUpperCase().slice(0,4)}</span>}
                    {st === S_FAILED && <span style={{ fontSize: 6, color: '#EF5350' }}>FAIL</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CEO slot */}
        <div className="mb-6">
          <div className="grid grid-cols-1">
            <div className="flex items-center gap-3 rounded-lg p-2.5 transition-all" style={{
              background: ceoStatus === S_RUNNING ? '#FFD70008' : ceoStatus === S_DONE ? '#0D0F14' : '#0A0B10',
              border: `1px solid ${ceoStatus === S_RUNNING ? '#FFD70066' : ceoStatus === S_DONE ? '#FFD70040' : '#12141A'}`,
            }}>
              <span className="text-xl" style={{ color: '#FFD700' }}>★</span>
              <span style={{ fontSize: 10, color: ceoStatus === S_DONE ? '#FFD700' : '#555', fontWeight: 700 }}>ATLAS CEO — DAILY BRIEFING</span>
              {ceoStatus === S_WAITING && <span style={{ fontSize: 8, color: '#333' }}>QUEUED</span>}
              {ceoStatus === S_RUNNING && <div className="w-24 h-0.5 rounded-full overflow-hidden" style={{ background: '#1E2028' }}><div className="h-full rounded-full" style={{ background: '#FFD700', animation: 'barPulse 1.2s ease-in-out infinite' }} /></div>}
              {ceoStatus === S_DONE && <span className="font-bold rounded" style={{ fontSize: 8, padding: '1px 6px', background: '#FFD70020', color: '#FFD700' }}>DELIVERED</span>}
            </div>
          </div>
        </div>

        {error && <div className="p-3 mb-5 rounded-lg text-sm" style={{ background: '#3B0D0D', border: '1px solid #EF535050', color: '#EF5350' }}>{error}</div>}

        {/* Results */}
        <div ref={resultsRef} className="flex flex-col gap-2">
          {agentResults.map((result: any) => {
            const bias = getBias(result.response);
            const conv = getConviction(result.response);
            const b = bs[bias];
            const open = expandedAgent === result.id;
            const failed = result.response?.startsWith('⚠');
            return (
              <div key={result.id} className="rounded-xl overflow-hidden" style={{ background: '#0D0F14', border: `1px solid ${failed ? '#EF535025' : `${result.color}20`}`, animation: 'fadeIn 0.4s ease-out' }}>
                <div onClick={() => !failed && setExpandedAgent(open ? null : result.id)} className="flex items-center gap-2.5 px-4 py-2.5" style={{ background: `${result.color}05`, cursor: failed ? 'default' : 'pointer', borderBottom: open ? `1px solid ${result.color}15` : 'none' }}>
                  <span style={{ fontSize: 16, color: failed ? '#EF5350' : result.color }}>{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: failed ? '#EF5350' : result.color }}>{result.name}{failed ? ' (failed)' : ''}</div>
                    <div className="text-xs truncate" style={{ color: '#444', fontSize: 10 }}>{result.role}</div>
                  </div>
                  <span className="text-xs px-1 rounded" style={{ color: '#333', fontSize: 9 }}>{result.group}</span>
                  {!failed && <>
                    <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: b.bg, color: b.txt, border: `1px solid ${b.bdr}`, fontSize: 10 }}>{b.lbl}</span>
                    {conv !== null && <span className="font-bold flex-shrink-0" style={{ color: '#888', fontSize: 10 }}>{conv}/10</span>}
                    <span className="flex-shrink-0 transition-transform" style={{ color: '#444', fontSize: 10, transform: open ? 'rotate(180deg)' : '' }}>▾</span>
                  </>}
                </div>
                {open && <div className="px-4 py-3 text-xs whitespace-pre-wrap" style={{ lineHeight: 1.7, color: '#B0B0B0', animation: 'fadeIn 0.2s ease-out' }}>{result.response}</div>}
              </div>
            );
          })}

          {/* CEO Verdict / Daily Briefing */}
          {ceoVerdict && (() => {
            const vt = getVerdictType(ceoVerdict);
            const v = vcols[vt] || vcols.hold;
            return (
              <div className="rounded-xl overflow-hidden mt-2" style={{ background: v.bg, border: `2px solid ${v.bdr}`, animation: 'fadeIn 0.6s ease-out', boxShadow: `0 0 40px ${v.bdr}25` }}>
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${v.bdr}40` }}>
                  <span className="text-2xl" style={{ color: '#FFD700' }}>★</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#FFD700', letterSpacing: '0.08em' }}>ATLAS DAILY BRIEFING — {ticker}</div>
                    <div className="text-xs" style={{ color: '#777' }}>14 specialists · {fmtTime(elapsed)} · {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
                <div className="p-5 text-xs" style={{ lineHeight: 1.8, color: '#E0E0E0' }} dangerouslySetInnerHTML={{ __html: renderMd(ceoVerdict) }} />
              </div>
            );
          })()}

          {phase === 'idle' && agentResults.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4" style={{ color: '#1A1C22' }}>★</div>
              <div className="text-sm mb-2" style={{ color: '#444' }}>Enter a ticker and timeframe, then deploy all 14 agents</div>
              <div className="text-xs" style={{ color: '#333' }}>Upload a chart screenshot for visual analysis · ~3 min for full briefing</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes barPulse{0%{width:10%;opacity:.4}50%{width:90%;opacity:1}100%{width:10%;opacity:.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
