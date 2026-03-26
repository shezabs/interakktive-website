'use client';

import { useState, useRef, useEffect } from 'react';

const AGENTS = [
  { id: 'fvg', name: 'FVG Specialist', icon: '◇', role: 'Fair Value Gap & Imbalance Intelligence', color: '#00E5FF', expertise: 'You are a PhD-level Fair Value Gap and price imbalance specialist. You understand institutional order flow, FVG formation mechanics, mitigation patterns, volume imbalances (VI), and how unfilled gaps act as price magnets. You know the difference between consequent encroachment (50% fill) and full mitigation, and when FVGs invert from support to resistance. Evaluate whether existing FVGs are likely to hold, fill, or be swept.' },
  { id: 'structure', name: 'Structure Analyst', icon: '△', role: 'Market Structure & BOS/CHoCH', color: '#AB47BC', expertise: 'You are a PhD-level market structure specialist. You understand Break of Structure (BOS), Change of Character (CHoCH), swing highs/lows, HH/HL vs LH/LL, and premium/discount zones. Evaluate whether price is impulsive or corrective, whether structure breaks are genuine or liquidity grabs, and how current structure aligns with higher timeframe context.' },
  { id: 'momentum', name: 'Momentum Expert', icon: '◎', role: 'Momentum & Oscillator Intelligence', color: '#26A69A', expertise: 'You are a PhD-level momentum specialist. You understand RSI divergences (regular, hidden, exaggerated), MACD histogram dynamics, exhaustion vs acceleration, OB/OS in trending vs ranging markets. Evaluate whether momentum supports continuation or reversal, whether it is building or fading.' },
  { id: 'liquidity', name: 'Liquidity Hunter', icon: '◈', role: 'Liquidity Pool & Stop Hunt Intelligence', color: '#FF6F00', expertise: 'You are a PhD-level liquidity specialist. You understand buy-side and sell-side liquidity pools, equal highs/lows as targets, stop hunts, inducement levels, and how institutions engineer sweeps before reversals. Identify where stops are clustering and assess whether price is hunting liquidity or has already swept it.' },
  { id: 'volume', name: 'Volume Profiler', icon: '▥', role: 'Volume & Order Flow Intelligence', color: '#66BB6A', expertise: 'You are a PhD-level volume specialist. You understand volume profile (POC, value area, HVN/LVN), volume delta, cumulative delta divergence, absorption. Evaluate whether moves are supported by genuine participation or are hollow low-volume fakeouts.' },
  { id: 'session', name: 'Session Strategist', icon: '◔', role: 'Session & Macro Timing Intelligence', color: '#29B6F6', expertise: 'You are a PhD-level session timing specialist. You understand Asian/London/NY behaviour, session opens as key levels, LDN-NY overlap as highest probability, day-of-week tendencies, news-driven displacement, and kill zone timing. Evaluate whether the current session supports the trade thesis.' },
  { id: 'divergence', name: 'Divergence Detective', icon: '⟁', role: 'Multi-Indicator Divergence Intelligence', color: '#EC407A', expertise: 'You are a PhD-level divergence specialist. You understand regular divergence (reversal), hidden divergence (continuation), and exaggerated divergence across RSI, MACD, OBV simultaneously. Evaluate significance based on timeframe, number of confirming indicators, and whether the divergence is active or spent.' },
  { id: 'risk', name: 'Risk Controller', icon: '▣', role: 'Risk Management & Position Sizing', color: '#EF5350', expertise: 'You are a PhD-level risk specialist focused on prop firm survival. You understand daily drawdown (4-5%), max drawdown (8-10%), consistency rules, trailing drawdown, position sizing. Evaluate every idea through risk/reward, lot sizing within limits, and whether to be aggressive or conservative. You are the voice of survival.' },
];

const CEO_SYSTEM = 'You are the CEO of ATLAS Trading Intelligence. You receive assessments from 8 PhD-level specialist agents. Synthesise into a decisive verdict: STRONG BUY, BUY, HOLD, SELL, or STRONG SELL. Include entry zone, stop loss, TP1/TP2/TP3, primary risk, position size guidance. The Risk Controller carries extra weight. Be a leader, not a committee.';

const S_IDLE = 0, S_WAITING = 1, S_RUNNING = 2, S_DONE = 3, S_FAILED = 4;

export default function WarRoomPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [storedPwd, setStoredPwd] = useState('');

  const [ticker, setTicker] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('4H');
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

  const callAPI = async (system: string, message: string, useSearch: boolean, isCeo: boolean = false) => {
    const res = await fetch('/api/war-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, message, useSearch, password: storedPwd, isCeo }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'API call failed');
    return data.text;
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    // Test the password by making a lightweight call
    try {
      const res = await fetch('/api/war-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: 'Reply with OK', message: 'test', useSearch: false, password: pwd }),
      });
      if (res.status === 401) {
        setPwdError('Wrong password');
        return;
      }
      setStoredPwd(pwd);
      setAuthed(true);
    } catch {
      setPwdError('Connection error');
    }
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
        'You are a financial market data aggregator. Search the web for comprehensive, current data on the requested asset. Return ALL relevant data points.',
        `Get the latest comprehensive data for ${ticker} on the ${timeframe} timeframe. Current price, 24h high/low, key support/resistance, recent news, volume, chart patterns, RSI/MACD if available, market sentiment. Be thorough and factual.`,
        true
      );
      setSearchStatus('Market data received ✓');
      setPhase('analyzing');

      // Phase 2: 8 specialists (no web search, with delay to avoid rate limits)
      const results: any[] = [];
      for (let i = 0; i < AGENTS.length; i++) {
        const agent = AGENTS[i];
        setAgentStatus(i, S_RUNNING);
        setAgentMsg(i, 'Analysing...');
        try {
          // 4-second delay between agents to stay under rate limits
          if (i > 0) await delay(4000);
          const system = `You are ${agent.name} — ${agent.role}.\n\n${agent.expertise}\n\nYou will receive live market data gathered moments ago. Analyse it through YOUR specialist lens only. Be decisive and specific with actual price levels. Keep your response concise — under 200 words.`;
          const user = `ASSET: ${ticker} | TIMEFRAME: ${timeframe}\n\nLIVE MARKET DATA:\n${marketData}\n\nProvide your assessment in this EXACT format:\nBIAS: [BULLISH / BEARISH / NEUTRAL]\nCONVICTION: [1-10]\nKEY FINDINGS:\n- [Finding 1 with specific price levels]\n- [Finding 2]\n- [Finding 3]\nRISK FLAG: [Any concern, or "None"]\nRECOMMENDATION: [1-2 sentence actionable recommendation]`;
          const response = await callAPI(system, user, false);
          results.push({ ...agent, response });
          setAgentResults(p => [...p, { ...agent, response }]);
          setAgentStatus(i, S_DONE);
          setAgentMsg(i, 'Complete');
        } catch (err: any) {
          setAgentStatus(i, S_FAILED);
          setAgentMsg(i, `Failed`);
          results.push({ ...agent, response: `⚠ Analysis failed: ${err.message}` });
          setAgentResults(p => [...p, { ...agent, response: `⚠ Analysis failed: ${err.message}` }]);
        }
      }

      // Phase 3: CEO (uses Sonnet for better synthesis)
      setPhase('synthesizing');
      setCeoStatus(S_RUNNING);
      await delay(5000); // Extra pause before CEO to let rate limit recover
      const assessments = results.map(r => `── ${r.name} ──\n${r.response}`).join('\n\n');
      const verdict = await callAPI(
        CEO_SYSTEM,
        `ASSET: ${ticker} | TIMEFRAME: ${timeframe}\n\nMARKET DATA:\n${marketData}\n\nSPECIALIST ASSESSMENTS:\n${assessments}\n\nDeliver your FINAL VERDICT:\n\n═══════════════════════════════\nVERDICT: [STRONG BUY / BUY / HOLD / SELL / STRONG SELL]\nCONFIDENCE: [1-10]\n═══════════════════════════════\n\nCONSENSUS SUMMARY: [Who agrees, who disagrees, why]\nENTRY ZONE: [Price range]\nSTOP LOSS: [Level + reasoning]\nTP1: [Level]\nTP2: [Level]\nTP3: [Level]\nPRIMARY RISK: [Biggest threat]\nPOSITION SIZE: [Guidance]\nFINAL NOTE: [Your conviction as CEO]`,
        false,
        true
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
  const totalSteps = AGENTS.length + 2;
  const currentStep = phase === 'idle' ? 0 : phase === 'searching' ? 0.5 : doneCount + 1 + (ceoStatus === S_DONE ? 1 : ceoStatus === S_RUNNING ? 0.5 : 0);
  const progressPct = Math.min(100, (currentStep / totalSteps) * 100);

  const bs: any = { bull: { bg: '#26A69A20', bdr: '#26A69A40', txt: '#26A69A', lbl: '▲ BULLISH' }, bear: { bg: '#EF535020', bdr: '#EF535040', txt: '#EF5350', lbl: '▼ BEARISH' }, neutral: { bg: '#FFB30020', bdr: '#FFB30040', txt: '#FFB300', lbl: '— NEUTRAL' } };
  const vc: any = { strongbuy: { bg: '#0D3B2E', bdr: '#26A69A' }, buy: { bg: '#0D3B2E', bdr: '#26A69A99' }, hold: { bg: '#3B2E0D', bdr: '#FFB30099' }, sell: { bg: '#3B0D0D', bdr: '#EF535099' }, strongsell: { bg: '#3B0D0D', bdr: '#EF5350' } };

  // ═══ PASSWORD GATE ═══
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08090E' }}>
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <span className="text-4xl" style={{ color: '#26A69A' }}>★</span>
            <h1 className="text-2xl font-bold mt-3" style={{ color: '#E0E0E0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>ATLAS WAR ROOM</h1>
            <p className="text-xs mt-2" style={{ color: '#555', letterSpacing: '0.15em' }}>RESTRICTED ACCESS</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 rounded-lg text-white text-center outline-none mb-3"
              style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: '0.2em' }}
            />
            {pwdError && <p className="text-center text-sm mb-3" style={{ color: '#EF5350' }}>{pwdError}</p>}
            <button type="submit" className="w-full py-3 rounded-lg font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #26A69A, #1E8C82)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
              ACCESS WAR ROOM
            </button>
          </form>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');`}</style>
      </div>
    );
  }

  // ═══ MAIN WAR ROOM UI ═══
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
            </div>
            <p className="text-xs" style={{ color: '#555', letterSpacing: '0.15em' }}>MULTI-AGENT TRADING INTELLIGENCE · 8 SPECIALISTS + CEO</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="TICKER" disabled={running} className="px-3 py-2.5 rounded-lg text-white text-sm outline-none w-36" style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: 'inherit' }} />
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} disabled={running} className="px-3 py-2.5 rounded-lg text-white text-sm outline-none" style={{ background: '#0D0F14', border: '1px solid #1E2028', fontFamily: 'inherit' }}>
              {['1m','5m','15m','30m','1H','4H','D','W','M'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            <button onClick={runAnalysis} disabled={running || !ticker.trim()} className="px-6 py-2.5 rounded-lg text-white text-sm font-bold disabled:opacity-50" style={{ background: running ? '#1E2028' : 'linear-gradient(135deg, #26A69A, #1E8C82)', border: 'none', fontFamily: 'inherit', letterSpacing: '0.1em', cursor: running ? 'not-allowed' : 'pointer' }}>
              {running ? 'ANALYSING...' : '▶ DEPLOY AGENTS'}
            </button>
          </div>
        </div>

        {/* Progress */}
        {phase !== 'idle' && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5 text-xs">
              <span style={{ color: '#888' }}>
                {phase === 'searching' && `⟐ ${searchStatus}`}
                {phase === 'analyzing' && `◎ ${AGENTS[agentStatuses.findIndex(s => s === S_RUNNING)]?.name || 'Processing'}...`}
                {phase === 'synthesizing' && '★ CEO synthesising verdict...'}
                {phase === 'complete' && '✓ Analysis complete'}
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

        {/* Agent roster */}
        <div className="grid grid-cols-9 gap-1.5 mb-6">
          {AGENTS.map((agent, i) => {
            const st = agentStatuses[i];
            const res = agentResults.find((r: any) => r.id === agent.id);
            const bias = res ? getBias(res.response) : null;
            const conv = res ? getConviction(res.response) : null;
            const b = bias ? bs[bias] : null;
            const failed = res?.response?.startsWith('⚠');
            return (
              <div key={agent.id} onClick={() => res && !failed && setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                className="flex flex-col items-center gap-1 rounded-lg p-2.5 transition-all"
                style={{
                  background: st === S_RUNNING ? `${agent.color}10` : st === S_DONE ? '#0D0F14' : st === S_FAILED ? '#1A0A0A' : '#0A0B10',
                  border: `1px solid ${st === S_RUNNING ? agent.color : st === S_DONE ? `${agent.color}40` : st === S_FAILED ? '#EF535040' : '#12141A'}`,
                  cursor: res && !failed ? 'pointer' : 'default',
                  boxShadow: st === S_RUNNING ? `0 0 20px ${agent.color}15` : 'none',
                }}>
                <span className="text-lg" style={{ color: failed ? '#EF5350' : agent.color }}>{agent.icon}</span>
                <span className="text-center leading-tight" style={{ fontSize: 8, color: st === S_DONE ? '#AAA' : '#555' }}>{agent.name.split(' ')[0]}</span>
                {st === S_WAITING && <span style={{ fontSize: 7, color: '#333', letterSpacing: '0.1em' }}>QUEUED</span>}
                {st === S_RUNNING && <div className="w-4/5 h-0.5 rounded-full overflow-hidden" style={{ background: '#1E2028' }}><div className="h-full rounded-full" style={{ background: agent.color, animation: 'barPulse 1.2s ease-in-out infinite' }} /></div>}
                {st === S_DONE && !failed && b && <span className="font-bold rounded" style={{ fontSize: 8, padding: '1px 5px', background: b.bg, color: b.txt }}>{conv !== null ? `${conv}/10` : bias?.toUpperCase().slice(0,4)}</span>}
                {st === S_FAILED && <span style={{ fontSize: 7, color: '#EF5350' }}>FAILED</span>}
              </div>
            );
          })}
          {/* CEO */}
          <div className="flex flex-col items-center gap-1 rounded-lg p-2.5 transition-all" style={{
            background: ceoStatus === S_RUNNING ? '#FFD70010' : ceoStatus === S_DONE ? '#0D0F14' : '#0A0B10',
            border: `1px solid ${ceoStatus === S_RUNNING ? '#FFD700' : ceoStatus === S_DONE ? '#FFD70066' : '#12141A'}`,
          }}>
            <span className="text-lg" style={{ color: '#FFD700' }}>★</span>
            <span style={{ fontSize: 8, color: ceoStatus === S_DONE ? '#FFD700' : '#555' }}>CEO</span>
            {ceoStatus === S_WAITING && <span style={{ fontSize: 7, color: '#333', letterSpacing: '0.1em' }}>QUEUED</span>}
            {ceoStatus === S_RUNNING && <div className="w-4/5 h-0.5 rounded-full overflow-hidden" style={{ background: '#1E2028' }}><div className="h-full rounded-full" style={{ background: '#FFD700', animation: 'barPulse 1.2s ease-in-out infinite' }} /></div>}
            {ceoStatus === S_DONE && <span className="font-bold rounded" style={{ fontSize: 8, padding: '1px 5px', background: '#FFD70020', color: '#FFD700' }}>VERDICT</span>}
          </div>
        </div>

        {error && <div className="p-3 mb-5 rounded-lg text-sm" style={{ background: '#3B0D0D', border: '1px solid #EF535050', color: '#EF5350' }}>{error}</div>}

        {/* Results */}
        <div ref={resultsRef} className="flex flex-col gap-2.5">
          {agentResults.map((result: any) => {
            const bias = getBias(result.response);
            const conv = getConviction(result.response);
            const b = bs[bias];
            const open = expandedAgent === result.id;
            const failed = result.response?.startsWith('⚠');
            return (
              <div key={result.id} className="rounded-xl overflow-hidden" style={{ background: '#0D0F14', border: `1px solid ${failed ? '#EF535025' : `${result.color}25`}`, animation: 'fadeIn 0.4s ease-out' }}>
                <div onClick={() => !failed && setExpandedAgent(open ? null : result.id)} className="flex items-center gap-2.5 px-4 py-3" style={{ background: `${result.color}06`, cursor: failed ? 'default' : 'pointer', borderBottom: open ? `1px solid ${result.color}15` : 'none' }}>
                  <span className="text-lg" style={{ color: failed ? '#EF5350' : result.color }}>{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: failed ? '#EF5350' : result.color }}>{result.name}{failed ? ' (failed)' : ''}</div>
                    <div className="text-xs truncate" style={{ color: '#555' }}>{result.role}</div>
                  </div>
                  {!failed && <>
                    <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: b.bg, color: b.txt, border: `1px solid ${b.bdr}` }}>{b.lbl}</span>
                    {conv !== null && <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: '#888', background: '#ffffff06' }}>{conv}/10</span>}
                    <span className="text-xs flex-shrink-0 transition-transform" style={{ color: '#444', transform: open ? 'rotate(180deg)' : '' }}>▾</span>
                  </>}
                </div>
                {open && <div className="px-4 py-3 text-xs whitespace-pre-wrap" style={{ lineHeight: 1.75, color: '#B0B0B0', animation: 'fadeIn 0.25s ease-out' }}>{result.response}</div>}
              </div>
            );
          })}

          {ceoVerdict && (() => {
            const vt = getVerdictType(ceoVerdict);
            const v = vc[vt] || vc.hold;
            return (
              <div className="rounded-xl overflow-hidden" style={{ background: v.bg, border: `2px solid ${v.bdr}`, animation: 'fadeIn 0.6s ease-out', boxShadow: `0 0 40px ${v.bdr}25` }}>
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${v.bdr}40` }}>
                  <span className="text-2xl" style={{ color: '#FFD700' }}>★</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#FFD700', letterSpacing: '0.08em' }}>ATLAS CEO — FINAL VERDICT</div>
                    <div className="text-xs" style={{ color: '#777' }}>8 specialists · {fmtTime(elapsed)} total</div>
                  </div>
                </div>
                <div className="p-5 text-xs whitespace-pre-wrap" style={{ lineHeight: 1.8, color: '#E0E0E0' }}>{ceoVerdict}</div>
              </div>
            );
          })()}

          {phase === 'idle' && agentResults.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4" style={{ color: '#1A1C22' }}>★</div>
              <div className="text-sm" style={{ color: '#333' }}>Enter a ticker and timeframe, then deploy agents</div>
              <div className="text-xs mt-1" style={{ color: '#222' }}>1 web search + 8 fast analyses + CEO verdict · ~90 seconds</div>
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
