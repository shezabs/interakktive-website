// app/academy/lesson/cipher-signal-philosophy/page.tsx
// ATLAS Academy — Lesson 11.8: The Signal Philosophy [PRO]
// Gold standard — 8 deep animations, AnimScene + IntersectionObserver
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ── GAME ROUNDS ──────────────────────────────────────────────
const gameRounds = [
  {
    id: 'gr-118-01',
    scenario: "Signal Engine = Trend, Direction = Long Only, Strong Only = ON. A PX long fires — conviction 2/4 (ribbon + ADX pass, volume 0.7× fails, health 44% fails). What happens?",
    options: [
      { id: 'a', text: "Signal fires as 'Long' — 2/4 passes when Strong Only is OFF by default.", correct: false, explain: "Strong Only is ON in this scenario. min_conviction = 3. A 2/4 score is blocked at the Strong Only gate regardless." },
      { id: 'b', text: "Signal fires as 'Long +' — ribbon and ADX passing is enough for strong.", correct: false, explain: "Strong requires 3+/4 factors, not 2. The + marker only appears at conviction 3 or 4." },
      { id: 'c', text: "Signal is blocked at the Strong Only gate — 2/4 does not meet the 3+ threshold.", correct: true, explain: "Correct. Strong Only ON sets min_conviction = 3. Ribbon and ADX pass (2 factors) but volume 0.7× and health 44% fail. Score 2/4. Blocked." },
      { id: 'd', text: "Signal is blocked at the Direction gate — Long Only rejects this.", correct: false, explain: "The candidate is a long, Direction = Long Only — direction gate passes. Block happens at Strong Only." },
    ],
  },
  {
    id: 'gr-118-02',
    scenario: "Command Center Last Signal row: ▲ Long  22 bars → ACTIVE. A new short setup is forming. Is the long signal still relevant?",
    options: [
      { id: 'a', text: "Yes — ACTIVE means the signal is still fully valid and overrides the short.", correct: false, explain: "ACTIVE (11–30b) means weakening context, not full validity. It does not override a new setup forming in the opposite direction." },
      { id: 'b', text: "No — 22 bars is too old, discard entirely and treat the chart as clean.", correct: false, explain: "ACTIVE is not AGING. At 22 bars it hasn't crossed 30 bars. Discarding entirely misses the freshness nuance." },
      { id: 'c', text: "Treat it as weakening context — ACTIVE signals are aging. Let the short qualify through the pipeline on its own merits.", correct: true, explain: "Correct. ACTIVE (11–30b) means the prior signal context is present but diminishing. At 22 bars let the short setup qualify independently." },
      { id: 'd', text: "Yes — a long 22 bars ago means bias is still long, skip the short.", correct: false, explain: "The Last Signal row tracks what fired through your filters, not a permanent bias. A 22-bar-old signal doesn't lock direction." },
    ],
  },
  {
    id: 'gr-118-03',
    scenario: "Two signals: Signal A — teal label, smaller, reads 'Long'. Signal B — teal label, larger, reads 'Long +'. Both fired 4 bars apart. What does the size/+ difference mean?",
    options: [
      { id: 'a', text: "Signal B fired on a higher timeframe — the + means HTF confirmation.", correct: false, explain: "The + marker is about conviction, not timeframe. It indicates 3+/4 factors aligned on that specific bar." },
      { id: 'b', text: "Signal A has 0–2/4 conviction. Signal B has 3–4/4. Both passed the pipeline but B had more market alignment.", correct: true, explain: "Correct. Both cleared all gates. Signal A scored 0–2/4 (standard). Signal B scored 3–4/4 (larger + marker). More factors aligned behind B." },
      { id: 'c', text: "Signal A is TS, Signal B is PX — the + indicates origin type.", correct: false, explain: "The + marker indicates conviction strength, not origin type. Both PX and TS can produce standard or strong labels." },
      { id: 'd', text: "Both are identical — size difference is a rendering artifact.", correct: false, explain: "Label size difference is intentional. Strong signals (3+/4) render larger with + suffix. Hardcoded in CIPHER's label rendering." },
    ],
  },
  {
    id: 'gr-118-04',
    scenario: "A TS short fires with context tag 'Sweep + FVG'. Engine = All Signals, Direction = Both, Strong Only = OFF. Conviction = 3/4. Regime = TREND INTACT. Should you take it?",
    options: [
      { id: 'a', text: "Yes — 'Sweep + FVG' is the highest priority tag and 3/4 is strong. Take it.", correct: false, explain: "Pipeline qualification and context tag are not sufficient alone. A TS short in TREND INTACT is counter-trend. Regime context still applies." },
      { id: 'b', text: "No — TS signals are always lower quality than PX signals.", correct: false, explain: "There is no quality hierarchy between PX and TS. Both are valid engines. The question is whether regime supports a reversal." },
      { id: 'c', text: "Evaluate carefully — it passed the pipeline but a short in TREND INTACT is counter-trend. Regime and HTF bias must validate.", correct: true, explain: "Correct. Pipeline passed it. But a short in TREND INTACT is counter-trend. 'Sweep + FVG' is high-quality structural context but doesn't override trend." },
      { id: 'd', text: "Yes — Strong Only is OFF so all valid signals should be taken.", correct: false, explain: "Strong Only OFF means no minimum conviction threshold — not that every signal should be executed. Operator judgment still applies." },
    ],
  },
  {
    id: 'gr-118-05',
    scenario: "You switch Signal Engine from 'All Signals' to 'Reversal'. CIPHER goes quiet — no signals for 6 bars even though PX signals were firing before. What happened?",
    options: [
      { id: 'a', text: "The indicator has a bug — switching modes shouldn't affect new signals.", correct: false, explain: "CIPHER recalculates based on current settings every bar. Reversal mode blocks all PX at Gate 1. No bug." },
      { id: 'b', text: "Correct — Reversal mode blocks PX at Gate 1. If no TS conditions met in 6 bars, silence is expected.", correct: true, explain: "Correct. Switching to Reversal sets Gate 1 to block all PX candidates. Only TS can pass. If no tension snap in 6 bars, CIPHER correctly shows nothing." },
      { id: 'c', text: "Correct — but 6 bars of silence means something is wrong. Switch back.", correct: false, explain: "Six bars of silence in Reversal mode is not a malfunction. TS signals require four simultaneous conditions. In a trending market they will be infrequent." },
      { id: 'd', text: "Signal Engine only affects historical display, not new signals.", correct: false, explain: "Signal Engine mode directly controls which origin types are permitted going forward from that bar." },
    ],
  },
];

// ── QUIZ QUESTIONS ───────────────────────────────────────────
const quizQuestions = [
  { id: 'qq-118-01', question: "Which Signal Engine mode shows both PX and TS signals simultaneously?", options: [{id:'a',text:'Trend',correct:false},{id:'b',text:'Reversal',correct:false},{id:'c',text:'All Signals',correct:true},{id:'d',text:'Visuals Only',correct:false}], explain: "All Signals enables both PX (Pulse Cross) and TS (Tension Snap) simultaneously. Trend = PX only. Reversal = TS only. Visuals Only = no labels." },
  { id: 'qq-118-02', question: "What is the minimum conviction score required when Strong Only is ON?", options: [{id:'a',text:'2 out of 4',correct:false},{id:'b',text:'4 out of 4',correct:false},{id:'c',text:'1 out of 4',correct:false},{id:'d',text:'3 out of 4',correct:true}], explain: "Strong Only ON sets min_conviction = 3. Signals with fewer than 3 of the 4 factors are blocked. At 3/4 or 4/4, signal fires as 'Long +' or 'Short +'." },
  { id: 'qq-118-03', question: "A PX long signal fires but Direction = Short Only. At which gate is it blocked?", options: [{id:'a',text:'The Final Gate',correct:false},{id:'b',text:'The Strong Only gate',correct:false},{id:'c',text:'The Direction Filter gate',correct:true},{id:'d',text:'The Signal Origin gate',correct:false}], explain: "Direction Filter is Gate 2. Short Only rejects all long candidates here. The signal never reaches conviction scoring or the final gate." },
  { id: 'qq-118-04', question: "Which of the 4 conviction factors checks whether the trend engine supports the signal direction?", options: [{id:'a',text:'ADX > 20',correct:false},{id:'b',text:'Volume > 1.0×',correct:false},{id:'c',text:'Health > 50%',correct:false},{id:'d',text:'Ribbon Stacked',correct:true}], explain: "Ribbon Stacked checks whether the Cipher Ribbon is stacked in the direction of the signal. Bull stack for longs earns this conviction point." },
  { id: 'qq-118-05', question: "The Last Signal row shows '▲ Long  35 bars → AGING'. What does this mean?", options: [{id:'a',text:'The signal is still valid — primary direction bias.',correct:false},{id:'b',text:'Signal fired 35 bars ago. Stale — wait for fresh confirmation.',correct:true},{id:'c',text:'AGING means reversal is forming — take the opposite trade.',correct:false},{id:'d',text:'AGING only applies after 50 bars.',correct:false}], explain: "AGING fires at 30+ bars. At 35 bars the signal context is stale. Wait for a new signal before committing to direction bias from this one." },
  { id: 'qq-118-06', question: "What does the context tag 'Sweep + FVG' indicate on a CIPHER signal?", options: [{id:'a',text:'Signal fired after TS snap with 4/4 conviction.',correct:false},{id:'b',text:'Liquidity sweep occurred and Fair Value Gap was present — highest-priority structural context.',correct:true},{id:'c',text:'Signal fired in VOLATILE regime with elevated volume.',correct:false},{id:'d',text:'Price swept a level then crossed the Cipher Pulse line.',correct:false}], explain: "'Sweep + FVG' is Priority 1 in CIPHER's 13-level context waterfall — liquidity sweep plus FVG confluence. ICT's highest-conviction reversal condition." },
  { id: 'qq-118-07', question: "For buy_signal to resolve TRUE, what must be true?", options: [{id:'a',text:'Both buy_px AND buy_ts must be TRUE.',correct:false},{id:'b',text:'buy_px OR buy_ts must be TRUE, AND bull_conviction >= min_conviction.',correct:true},{id:'c',text:'buy_px must be TRUE AND conviction must be 4/4.',correct:false},{id:'d',text:'buy_ts must be TRUE AND regime must be VOLATILE.',correct:false}], explain: "buy_signal = (buy_px OR buy_ts) AND bull_conviction >= min_conviction. Only one origin type needs to fire. Conviction must meet or exceed min_conviction." },
  { id: 'qq-118-08', question: "Which TS condition prevents repeated signals in the same direction during choppy reversals?", options: [{id:'a',text:'Prior stretch threshold',correct:false},{id:'b',text:'Snap candle body requirement',correct:false},{id:'c',text:'Velocity shift confirmation',correct:false},{id:'d',text:'Cooldown bar gate',correct:true}], explain: "The cooldown gate prevents a TS signal from firing in the same direction within a set number of bars of the previous TS — explicitly designed to suppress choppy repeated signals." },
];

// ── CANVAS ANIMATION PRIMITIVE ────────────────────────────────
function AnimScene({draw,aspectRatio=16/9,className=''}:{draw:(ctx:CanvasRenderingContext2D,t:number,w:number,h:number)=>void;aspectRatio?:number;className?:string;}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number|null>(null);
  const startRef=useRef<number|null>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const parent=canvas.parentElement;if(!parent)return;
    const resize=()=>{const w=Math.min(parent.clientWidth,720);const h=w/aspectRatio;canvas.width=w*window.devicePixelRatio;canvas.height=h*window.devicePixelRatio;canvas.style.width=w+'px';canvas.style.height=h+'px';const ctx=canvas.getContext('2d');if(ctx)ctx.scale(window.devicePixelRatio,window.devicePixelRatio);};
    resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);
  },[aspectRatio]);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const obs=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:0.1});obs.observe(canvas);return()=>obs.disconnect();},[]);
  useEffect(()=>{
    if(!visible){if(rafRef.current)cancelAnimationFrame(rafRef.current);startRef.current=null;return;}
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    const loop=(now:number)=>{if(startRef.current===null)startRef.current=now;const t=(now-startRef.current)/1000;const w=canvas.width/window.devicePixelRatio;const h=canvas.height/window.devicePixelRatio;ctx.clearRect(0,0,w,h);draw(ctx,t,w,h);rafRef.current=requestAnimationFrame(loop);};
    rafRef.current=requestAnimationFrame(loop);return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[visible,draw]);
  return(<div className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 ${className}`}><canvas ref={canvasRef} className="block mx-auto"/></div>);
}

// ── CONFETTI ─────────────────────────────────────────────────
function Confetti({active}:{active:boolean}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!active)return;
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    const colors=['#26A69A','#FFB300','#EF5350','#FFFFFF','#FBBF24'];
    type P={x:number;y:number;vx:number;vy:number;c:string;s:number;r:number;vr:number};
    const particles:P[]=Array.from({length:120},()=>({x:Math.random()*canvas.width,y:-20,vx:(Math.random()-0.5)*6,vy:Math.random()*3+2,c:colors[Math.floor(Math.random()*colors.length)],s:Math.random()*6+4,r:Math.random()*Math.PI*2,vr:(Math.random()-0.5)*0.2}));
    let rafId=0;
    const draw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s);ctx.restore();});rafId=requestAnimationFrame(draw);};
    draw();return()=>cancelAnimationFrame(rafId);
  },[active]);
  if(!active)return null;
  return<canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" style={{width:'100vw',height:'100vh'}}/>;
}

// ============================================================
// ANIMATION 1 — PipelineAnim (GC — S01)
// 5-gate pipeline with live controls
// Signal travels left→right, blocked at whichever gate fails
// Right outcome panel: PASS fires a labeled signal, BLOCK shows reason
// ============================================================
function PipelineAnim() {
  const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
  const [engine,setEngine]=useState<'all'|'trend'|'reversal'|'visuals'>('all');
  const [dir,setDir]=useState<'both'|'long'|'short'>('both');
  const [strongOnly,setStrongOnly]=useState(false);
  const [animT,setAnimT]=useState(1);
  const rafRef=useRef<number>(0);
  const startRef=useRef<number>(0);

  const CONV={ribbon:true,adx:true,vol:true,health:false};
  const convScore=Object.values(CONV).filter(Boolean).length;

  function getGates(eng:string,d:string,str:boolean){
    const g0=eng!=='visuals';
    const g1=g0&&(d==='both'||d==='long');
    const g2=g1;
    const g3=g2&&(!str||convScore>=3);
    const g4=g3;
    return[
      {label:'SIGNAL\nORIGIN',sub:eng==='visuals'?'No signals':eng==='trend'?'PX only':eng==='reversal'?'TS only':'PX + TS',pass:g0,blockReason:eng==='visuals'?'Engine = VISUALS ONLY':''},
      {label:'DIRECTION\nFILTER',sub:d==='both'?'Both dirs':d==='long'?'Long Only':'Short Only',pass:g1,blockReason:d==='short'?'Direction = SHORT ONLY. Long blocked.':''},
      {label:'CONVICTION\nSCORE',sub:`${convScore}/4 factors`,pass:g2,blockReason:''},
      {label:str?'STRONG\nONLY ✓':'STRONG\nONLY (off)',sub:str?`Need 3+, got ${convScore}`:'Gate inactive',pass:g3,blockReason:str&&convScore<3?`Strong Only: needs 3+, got ${convScore}.`:''},
      {label:'FINAL\nGATE',sub:g4?'buy_signal ✓':'buy_signal ✗',pass:g4,blockReason:''},
    ];
  }

  function runAnim(){
    cancelAnimationFrame(rafRef.current);
    startRef.current=0;setAnimT(0);
    const dur=2400;
    const step=(ts:number)=>{if(!startRef.current)startRef.current=ts;const p=Math.min(1,(ts-startRef.current)/dur);setAnimT(p);if(p<1)rafRef.current=requestAnimationFrame(step);};
    rafRef.current=requestAnimationFrame(step);
  }
  useEffect(()=>()=>cancelAnimationFrame(rafRef.current),[]);

  const gates=getGates(engine,dir,strongOnly);
  const passed=gates[4].pass;
  const blockIdx=gates.findIndex(g=>!g.pass);
  const blockGate=blockIdx!==-1?gates[blockIdx]:null;
  const easeOut=(t:number)=>1-Math.pow(1-t,3);

  const draw=useCallback((ctx:CanvasRenderingContext2D,w:number,h:number)=>{
    const N=5;const padX=16;
    const gW=Math.min(74,(w-padX*2-(N-1)*12)/N);const gH=60;const gY=h/2-gH/2;
    const step2=(w-padX*2)/(N-1);const midY=h/2;

    for(let i=0;i<N-1;i++){
      const x1=padX+i*step2+gW/2;const x2=padX+(i+1)*step2-gW/2;
      const lp=easeOut(Math.min(1,Math.max(0,animT*N-i)));
      const isBlock=blockIdx!==-1&&i>=blockIdx;
      ctx.save();ctx.strokeStyle=isBlock?'rgba(239,83,80,0.18)':'rgba(38,166,154,0.30)';ctx.lineWidth=2;
      if(isBlock)ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(x1,midY);ctx.lineTo(x1+(x2-x1)*lp,midY);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      if(lp>0&&lp<1&&!isBlock){ctx.save();ctx.shadowColor=TEAL;ctx.shadowBlur=12;ctx.fillStyle=TEAL;ctx.beginPath();ctx.arc(x1+(x2-x1)*lp,midY,5,0,Math.PI*2);ctx.fill();ctx.restore();}
    }

    gates.forEach((gate,i)=>{
      const cx=padX+i*step2;const boxX=cx-gW/2;
      const gp=easeOut(Math.min(1,Math.max(0,animT*N-i+0.6)));
      if(gp<=0)return;
      const dimmed=blockIdx!==-1&&i>blockIdx;const isFail=!gate.pass&&i===blockIdx;
      ctx.save();ctx.globalAlpha=gp;
      ctx.fillStyle=gate.pass?'rgba(38,166,154,0.09)':isFail?'rgba(239,83,80,0.12)':'rgba(255,255,255,0.02)';
      ctx.beginPath();ctx.roundRect(boxX,gY,gW,gH,7);ctx.fill();
      ctx.strokeStyle=gate.pass?'rgba(38,166,154,0.5)':isFail?'rgba(239,83,80,0.6)':'rgba(255,255,255,0.06)';ctx.lineWidth=isFail?1.5:1;ctx.stroke();
      ctx.fillStyle=dimmed?'rgba(255,255,255,0.18)':(gate.pass?TEAL:isFail?MAGENTA:'rgba(255,255,255,0.18)');
      ctx.font='bold 8px Inter, sans-serif';ctx.textAlign='center';
      gate.label.split('\n').forEach((line,li)=>ctx.fillText(line,cx,gY+11+li*10));
      ctx.font='bold 12px "SF Mono", monospace';ctx.fillStyle=gate.pass?TEAL:isFail?MAGENTA:'rgba(255,255,255,0.12)';
      ctx.fillText(gate.pass?'✓':isFail?'✗':'—',cx,gY+gH/2+5);
      ctx.font='8px "SF Mono", monospace';ctx.fillStyle=dimmed?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.45)';
      ctx.fillText(gate.sub,cx,gY+gH-8);ctx.restore();
    });

    if(animT>0.88){
      const finalCX=padX+4*step2;const outX=finalCX+gW/2+8;
      const fade=easeOut((animT-0.88)/0.12);const bW=62;
      if(outX+bW<=w-4){
        ctx.save();ctx.globalAlpha=fade;
        if(passed){ctx.fillStyle='rgba(38,166,154,0.88)';ctx.beginPath();ctx.roundRect(outX,midY-18,bW,34,6);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 10px "SF Mono", monospace';ctx.textAlign='center';ctx.fillText('▲',outX+bW/2,midY-5);ctx.fillText(convScore>=3?'Long +':'Long',outX+bW/2,midY+8);}
        else{ctx.fillStyle='rgba(239,83,80,0.07)';ctx.strokeStyle='rgba(239,83,80,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(outX,midY-13,bW,26,6);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(239,83,80,0.65)';ctx.font='bold 9px "SF Mono", monospace';ctx.textAlign='center';ctx.fillText('BLOCKED',outX+bW/2,midY+4);}
        ctx.restore();
      }
    }
  },[gates,blockIdx,animT,passed,convScore]);

  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;
    const parent=c.parentElement;if(!parent)return;
    const dpr=window.devicePixelRatio||1;const w=parent.clientWidth;const h=180;
    c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';
    const ctx=c.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);draw(ctx,w,h);
  },[draw]);

  return(
    <div className="rounded-2xl glass-card overflow-hidden">
      <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/6">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-1.5">Signal Engine</p>
          <div className="flex flex-col gap-1">
            {(['all','trend','reversal','visuals'] as const).map(v=>(
              <button key={v} onClick={()=>setEngine(v)} className={`py-1 rounded text-[10px] font-bold font-mono tracking-wider border transition-all ${engine===v?'bg-teal-500/15 border-teal-500/40 text-teal-400':'bg-transparent border-white/8 text-white/30'}`}>
                {v==='all'?'ALL':v==='trend'?'TREND':v==='reversal'?'REVERSAL':'VISUALS ONLY'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-1.5">Direction</p>
          <div className="flex flex-col gap-1">
            {(['both','long','short'] as const).map(v=>(
              <button key={v} onClick={()=>setDir(v)} className={`py-1 rounded text-[10px] font-bold font-mono tracking-wider border transition-all ${dir===v?'bg-teal-500/15 border-teal-500/40 text-teal-400':'bg-transparent border-white/8 text-white/30'}`}>
                {v==='both'?'BOTH':v==='long'?'LONG ONLY':'SHORT ONLY'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-1.5">Strong Only</p>
          <div className="flex flex-col gap-1 mb-2">
            {([false,true]).map(v=>(
              <button key={String(v)} onClick={()=>setStrongOnly(v)} className={`py-1 rounded text-[10px] font-bold font-mono tracking-wider border transition-all ${strongOnly===v?(v?'bg-amber-400/15 border-amber-400/40 text-amber-400':'bg-teal-500/15 border-teal-500/40 text-teal-400'):'bg-transparent border-white/8 text-white/30'}`}>
                {v?'ON (3+/4)':'OFF'}
              </button>
            ))}
          </div>
          <div className="rounded border border-white/6 bg-white/2 p-1.5 space-y-0.5 text-[10px] font-mono">
            {[{k:'Ribbon',pass:CONV.ribbon,v:'✓'},{k:'ADX',pass:CONV.adx,v:'ADX 34'},{k:'Volume',pass:CONV.vol,v:'1.4×'},{k:'Health',pass:CONV.health,v:'42%'}].map(f=>(
              <div key={f.k} className="flex items-center justify-between">
                <span className="text-white/35">{f.k}</span>
                <span style={{color:f.pass?TEAL:'rgba(255,255,255,0.2)'}}>{f.pass?'✓':'✗'} {f.v}</span>
              </div>
            ))}
            <div className="border-t border-white/6 pt-0.5 flex justify-between">
              <span className="text-white/35">Score</span>
              <span className="font-bold" style={{color:convScore>=3?TEAL:AMBER}}>{convScore}/4</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#080d18] px-3 py-2">
        <canvas ref={canvasRef} style={{width:'100%',height:180}}/>
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-t border-white/6 min-h-[52px]">
        <span className="text-[10px] font-mono text-white/25 w-14 shrink-0">RESULT</span>
        {passed?(
          <><span className="font-mono font-bold text-sm" style={{color:TEAL}}>▲ {convScore>=3?'Long +':'Long'}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(38,166,154,0.12)',color:TEAL}}>Trend (PX)</span>
          <span className="text-xs text-gray-400 ml-1">{convScore>=3?`Passed all gates. Strong (${convScore}/4). + marker fires.`:`Passed all gates. Standard (${convScore}/4).`}</span></>
        ):(
          <><span className="font-mono font-bold text-sm text-red-400/60">— BLOCKED</span>
          <span className="text-xs text-gray-400 ml-1">{blockGate?.blockReason}</span></>
        )}
        <button onClick={runAnim} className="ml-auto shrink-0 px-4 py-1.5 rounded text-[11px] font-bold font-mono tracking-widest hover:opacity-80 transition-opacity" style={{background:AMBER,color:'#060a12'}}>▶ RUN</button>
      </div>
    </div>
  );
}

// ============================================================
// ANIMATION 2 — PXvsTSAnim (S02)
// Side-by-side: PX candle chart (pulse cross) vs TS tension snap
// PX panel: price crossing dashed pulse line, teal bar, label
// TS panel: tension buildup wave, snap candle, label
// ============================================================
function PXvsTSAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('TWO SIGNAL ORIGINS — PX (PULSE CROSS) vs TS (TENSION SNAP)', w/2, 22);

    const padX=20; const gap=16; const panelW=(w-padX*2-gap)/2; const panelH=h-46; const padTop=38;

    // ── PX PANEL ──
    const pxX=padX;
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(pxX, padTop, panelW, panelH);
    ctx.strokeStyle='rgba(38,166,154,0.4)'; ctx.lineWidth=1; ctx.strokeRect(pxX, padTop, panelW, panelH);

    // Pill
    ctx.fillStyle='rgba(38,166,154,0.18)'; ctx.strokeStyle='rgba(38,166,154,0.7)';
    ctx.beginPath(); ctx.roundRect(pxX+(panelW-80)/2, padTop+8, 80, 18, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle=TEAL; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('PX — PULSE CROSS', pxX+panelW/2, padTop+20);

    // Price bars trending up, pulse line below
    const cX=pxX+12; const cY=padTop+36; const cW=panelW-24; const cH=panelH-52;
    const midY=cY+cH*0.55; const barCount=18; const bW2=Math.floor(cW/barCount);

    // Rising price path
    const prices=Array.from({length:barCount},(_,i)=>0.3+i*0.022+Math.sin(i*0.8)*0.04);
    const pyF=(n:number)=>cY+cH*(1-n*0.85);
    prices.forEach((p,i)=>{
      const bull=i===0||p>=prices[i-1];const bH=Math.max(3,8+Math.abs(p-(prices[i-1]??p))*40);
      const bY=pyF(p); const bx=cX+i*bW2+bW2/2;
      ctx.strokeStyle=bull?`${TEAL}88`:`${MAGENTA}77`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(bx,bY-bH*0.4); ctx.lineTo(bx,bY+bH*0.6); ctx.stroke();
      ctx.fillStyle=bull?`${TEAL}77`:`${MAGENTA}66`; ctx.fillRect(bx-bW2*0.4,bY-bH*0.25,bW2*0.8,bH*0.5);
    });

    // Animated pulse line (oscillates below price)
    const pulseCycle=(t*0.6)%1; const crossIdx=Math.floor(pulseCycle*barCount);
    ctx.save(); ctx.strokeStyle=TEAL; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.beginPath();
    for(let i=0;i<barCount;i++){
      const bx=cX+i*bW2; const pulseY=pyF(prices[i]-0.05);
      if(i===0)ctx.moveTo(bx,pulseY); else ctx.lineTo(bx,pulseY);
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // Signal at crossover
    if(crossIdx>0&&crossIdx<barCount-1){
      const sigX=cX+crossIdx*bW2+bW2/2;
      const sigY=pyF(prices[crossIdx])-16;
      ctx.shadowBlur=12; ctx.shadowColor=TEAL;
      ctx.fillStyle=TEAL; ctx.font='bold 11px "SF Mono", monospace'; ctx.textAlign='center';
      ctx.fillText('▲ Long', sigX, sigY);
      ctx.shadowBlur=0;
    }

    // 'Pulse Line' label
    ctx.fillStyle='rgba(38,166,154,0.8)'; ctx.font='9px "SF Mono", monospace'; ctx.textAlign='left';
    ctx.fillText('← Pulse Line', cX+2, pyF(prices[3]-0.05)-4);

    // Description
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Price crosses pulse → trend', pxX+panelW/2, padTop+panelH-10);

    // ── TS PANEL ──
    const tsX=padX+panelW+gap;
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(tsX, padTop, panelW, panelH);
    ctx.strokeStyle='rgba(239,83,80,0.4)'; ctx.lineWidth=1; ctx.strokeRect(tsX, padTop, panelW, panelH);

    ctx.fillStyle='rgba(239,83,80,0.18)'; ctx.strokeStyle='rgba(239,83,80,0.7)';
    ctx.beginPath(); ctx.roundRect(tsX+(panelW-80)/2, padTop+8, 80, 18, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle=MAGENTA; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('TS — TENSION SNAP', tsX+panelW/2, padTop+20);

    // Tension oscillator building up then snapping
    const tsCY=padTop+36; const tsCH=panelH-52; const tsmid=tsCY+tsCH*0.45;
    const tensionCycle=(t*0.35)%1; const snapBarIdx=Math.floor(barCount*0.75);

    ctx.save();
    // Tension fill (builds up)
    const tensionPts=Array.from({length:barCount},(_,i)=>{
      const buildPhase=Math.min(1,i/snapBarIdx);
      return Math.sin(i*0.4+t*0.5)*6*(1-buildPhase*0.3)+tsmid-buildPhase*tsCH*0.3;
    });
    ctx.fillStyle='rgba(239,83,80,0.06)';
    ctx.beginPath(); ctx.moveTo(cX, tsmid);
    tensionPts.forEach((y,i)=>ctx.lineTo(cX+i*(cW/barCount),y));
    ctx.lineTo(cX+(barCount-1)*(cW/barCount), tsmid); ctx.closePath(); ctx.fill();

    // Tension line
    ctx.strokeStyle=MAGENTA; ctx.lineWidth=1.5;
    ctx.beginPath(); tensionPts.forEach((y,i)=>{if(i===0)ctx.moveTo(cX,y);else ctx.lineTo(cX+i*(cW/barCount),y);});
    ctx.stroke(); ctx.restore();

    // Snap candle at 3/4 mark
    const snapX=cX+(snapBarIdx)*(cW/barCount)+cW/barCount/2;
    const snapTop=tsCY+tsCH*0.15; const snapBtm=tsCY+tsCH*0.45;
    ctx.shadowBlur=12; ctx.shadowColor=TEAL;
    ctx.fillStyle=`${TEAL}cc`; ctx.fillRect(snapX-bW2*0.5, snapTop, bW2, snapBtm-snapTop);
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(snapX-bW2*0.5, snapTop, bW2, snapBtm-snapTop);
    ctx.shadowBlur=0;

    // TS signal label
    ctx.shadowBlur=10; ctx.shadowColor=TEAL;
    ctx.fillStyle=TEAL; ctx.font='bold 11px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('▲ Long', snapX, snapTop-10);
    ctx.shadowBlur=0;

    // Threshold line
    const threshY=tsCY+tsCH*0.18;
    ctx.save(); ctx.strokeStyle=`${AMBER}77`; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(cX,threshY); ctx.lineTo(cX+cW,threshY); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    ctx.fillStyle=AMBER+'88'; ctx.font='8px "SF Mono", monospace'; ctx.textAlign='left'; ctx.fillText('stretch threshold', cX+2, threshY-3);

    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Tension buildup → snap reversal', tsX+panelW/2, padTop+panelH-10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 3 — SignalModesAnim (S03)
// 4 signal engine modes cycling — PX / TS columns lit or greyed
// Live signal label showing what fires in each mode
// ============================================================
function SignalModesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
    const cycleT=t%16; const sceneIdx=Math.floor(cycleT/4); const sceneT=(cycleT%4)/4;
    const fadeIn=Math.min(1,sceneT*4);

    const modes=[
      {label:'ALL SIGNALS', pxOn:true, tsOn:true, desc:'Both PX and TS active. Full signal coverage.', fire:'▲ Long (or) ▲ Long +'},
      {label:'TREND',       pxOn:true, tsOn:false,desc:'PX only — trend continuation entries.', fire:'▲ Long'},
      {label:'REVERSAL',    pxOn:false,tsOn:true, desc:'TS only — tension snap reversals.', fire:'▲ Long + (snap)'},
      {label:'VISUALS ONLY',pxOn:false,tsOn:false,desc:'No signal labels. Ribbon/pulse/tension still active.', fire:'(no signals)'},
    ];
    const m=modes[sceneIdx];

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('SIGNAL ENGINE — GATE 1: WHICH ORIGINS ARE PERMITTED', w/2, 22);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='right';
    ctx.fillText(`${String(sceneIdx+1).padStart(2,'0')} / 04`, w-20, 22);

    // Mode tabs
    const tabW=(w-40)/4;
    modes.forEach((md,i)=>{
      const tx=20+i*tabW; const isActive=i===sceneIdx;
      const mc=i===3?AMBER:i===2?MAGENTA:TEAL;
      ctx.fillStyle=isActive?mc+'22':'rgba(255,255,255,0.02)'; ctx.fillRect(tx+2,36,tabW-4,28);
      ctx.strokeStyle=isActive?mc+'88':'rgba(255,255,255,0.05)'; ctx.lineWidth=isActive?1.5:1; ctx.strokeRect(tx+2,36,tabW-4,28);
      ctx.fillStyle=isActive?mc:'rgba(255,255,255,0.3)'; ctx.font=`${isActive?'bold ':''}9px Inter, sans-serif`; ctx.textAlign='center';
      ctx.fillText(md.label, tx+tabW/2, 36+18);
    });

    // PX and TS origin columns
    const colY=80; const colH=(h-colY-60)/1; const colW2=(w-60)/2; const col1X=20; const col2X=col1X+colW2+20;

    const drawOriginCol=(x:number,label:string,active:boolean,color:string,bullets:string[])=>{
      ctx.fillStyle=active?color+'15':'rgba(255,255,255,0.02)'; ctx.fillRect(x,colY,colW2,colH);
      ctx.strokeStyle=active?color+'66':'rgba(255,255,255,0.05)'; ctx.lineWidth=active?1.5:1; ctx.strokeRect(x,colY,colW2,colH);
      ctx.globalAlpha=active?1:0.25;
      ctx.fillStyle=color; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(label, x+colW2/2, colY+20);
      if(active){ctx.shadowBlur=8;ctx.shadowColor=color;ctx.font='bold 14px "SF Mono", monospace';ctx.fillText('✓',x+colW2/2,colY+38);ctx.shadowBlur=0;}
      else{ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='14px "SF Mono", monospace';ctx.fillText('—',x+colW2/2,colY+38);}
      ctx.font='9px Inter, sans-serif'; ctx.textAlign='left';
      bullets.forEach((b,i)=>{ctx.fillStyle=active?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.2)';ctx.fillText('· '+b,x+10,colY+54+i*12);});
      ctx.globalAlpha=1;
    };

    drawOriginCol(col1X,'PX — Pulse Cross',m.pxOn,TEAL,['Body + distance check','No rapid-flip','Trend continuation']);
    drawOriginCol(col2X,'TS — Tension Snap',m.tsOn,MAGENTA,['Stretch + snap','Velocity shift','Cooldown gate']);

    // Bottom — what fires
    ctx.globalAlpha=fadeIn;
    ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(m.desc, w/2, h-30);
    const fireColor=m.label==='VISUALS ONLY'?'rgba(255,255,255,0.3)':TEAL;
    ctx.fillStyle=fireColor; ctx.font='bold 12px "SF Mono", monospace';
    ctx.fillText(m.fire, w/2, h-12);
    ctx.globalAlpha=1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 4 — ConvictionScoringAnim (S05)
// 4 factor tiles lighting up with oscillating values
// Score counter 0→4; standard vs strong label difference
// ============================================================
function ConvictionScoringAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
    // Cycle: light up factors one by one then reset, 8s
    const cycleT=t%8; const lit=Math.min(4,Math.floor(cycleT/1.8)); const litT=(cycleT%1.8)/1.8; const fadeIn=Math.min(1,litT*5);

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('4-FACTOR CONVICTION SCORING — STANDARD vs STRONG SIGNAL', w/2, 22);

    const factors=[
      {name:'Ribbon Stacked',key:'conv_ribbon',val:'Bull stack',pass:true,color:TEAL},
      {name:'ADX > 20',key:'conv_adx',val:'ADX 34',pass:true,color:TEAL},
      {name:'Volume > 1.0×',key:'conv_vol',val:'1.4×',pass:true,color:TEAL},
      {name:'Health > 50%',key:'conv_health',val:'42%',pass:false,color:MAGENTA},
    ];

    const padX=20; const tileGap=14; const tileW=(w-padX*2-tileGap*3)/4; const tileH=h*0.46; const tilesY=40;

    factors.forEach((f,i)=>{
      const tx=padX+i*(tileW+tileGap); const isLit=i<lit; const isFail=!f.pass;
      ctx.fillStyle=isLit?(isFail?'rgba(239,83,80,0.12)':'rgba(38,166,154,0.10)'):'rgba(255,255,255,0.02)';
      ctx.fillRect(tx,tilesY,tileW,tileH);
      ctx.strokeStyle=isLit?(isFail?MAGENTA+'88':TEAL+'77'):'rgba(255,255,255,0.06)';
      ctx.lineWidth=isLit?1.5:1; ctx.strokeRect(tx,tilesY,tileW,tileH);
      if(isLit){ctx.shadowBlur=isLit?10:0;ctx.shadowColor=isFail?MAGENTA:TEAL;}
      const fc=isLit?(isFail?MAGENTA:TEAL):'rgba(255,255,255,0.25)';
      ctx.fillStyle=fc; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(f.name, tx+tileW/2, tilesY+18);
      ctx.font='bold 18px "SF Mono", monospace'; ctx.fillText(isLit?(isFail?'✗':'✓'):'—', tx+tileW/2, tilesY+tileH/2+6);
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px "SF Mono", monospace'; ctx.fillText(f.val, tx+tileW/2, tilesY+tileH-14);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px Inter, sans-serif'; ctx.fillText(f.key, tx+tileW/2, tilesY+tileH-4);
    });

    // Score counter
    const scoreY=tilesY+tileH+20; const score=Math.min(lit,4);
    const isStrong=score>=3;
    const scoreC=isStrong?TEAL:score>=2?AMBER:MAGENTA;
    ctx.fillStyle=scoreC; ctx.font='bold 28px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText(`${score}/4`, w/2, scoreY+28);
    ctx.fillStyle=scoreC; ctx.font='bold 13px Inter, sans-serif';
    ctx.fillText(isStrong?'STRONG CONVICTION':'STANDARD CONVICTION', w/2, scoreY+48);

    // Label comparison
    const lblY=scoreY+64; const lblSep=90;
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px Inter, sans-serif';
    ctx.textAlign='center'; ctx.fillText('0–2/4 = standard', w/2-lblSep, lblY);
    ctx.fillText('3–4/4 = strong (+)', w/2+lblSep, lblY);
    ctx.fillStyle=isStrong?AMBER:'rgba(255,255,255,0.2)'; ctx.font='bold 11px "SF Mono", monospace';
    ctx.fillText(isStrong?'▲ Long +':'▲ Long', w/2, lblY+14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 5 — ContextTagWaterfallAnim (S07)
// 13-level waterfall sweeping highlight down
// Active tag name + brief description at bottom
// ============================================================
function ContextTagWaterfallAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
    const tags=[
      {p:'01',label:'Sweep + FVG',     color:MAGENTA, desc:'Liquidity sweep + Fair Value Gap. Highest priority.'},
      {p:'02',label:'Sweep',           color:MAGENTA, desc:'Liquidity sweep without FVG.'},
      {p:'03',label:'Breakout',        color:TEAL,    desc:'Confirmed structure breakout.'},
      {p:'04',label:'Snap',            color:TEAL,    desc:'TS snap from extreme tension.'},
      {p:'05',label:'Exhaustion',      color:AMBER,   desc:'Momentum exhaustion signal.'},
      {p:'06',label:'S/R Break',       color:TEAL,    desc:'Support or resistance break.'},
      {p:'07',label:'At Support',      color:TEAL,    desc:'Price at key support zone.'},
      {p:'08',label:'At Resistance',   color:AMBER,   desc:'Price at key resistance zone.'},
      {p:'09',label:'At Spine',        color:AMBER,   desc:'At the spine (central) level.'},
      {p:'10',label:'At FVG',          color:AMBER,   desc:'Within a Fair Value Gap.'},
      {p:'11',label:'Overextended',    color:MAGENTA, desc:'MR score overextended zone.'},
      {p:'12',label:'Fade',            color:AMBER,   desc:'Counter-trend fade setup.'},
      {p:'13',label:'Trend',           color:TEAL,    desc:'Trend continuation context.'},
    ];
    const n=tags.length;
    const cycleT=t%(n*0.9); const activeIdx=Math.floor(cycleT/0.9); const tagT=(cycleT%0.9)/0.9; const fadeIn=Math.min(1,tagT*6);

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('CONTEXT TAG WATERFALL — 13 PRIORITIES (P01 = HIGHEST)', w/2, 22);

    // Waterfall rows
    const rowH=(h-80)/(n/2); const col1End=Math.ceil(n/2); const colW3=(w-50)/2;

    tags.forEach((tag,i)=>{
      const isCol2=i>=col1End;
      const col=isCol2?1:0;
      const ri=isCol2?i-col1End:i;
      const rx=20+col*(colW3+10); const ry=36+ri*rowH;
      const isActive=i===activeIdx;
      ctx.fillStyle=isActive?tag.color+'20':'rgba(255,255,255,0.02)'; ctx.fillRect(rx,ry,colW3,rowH-3);
      ctx.strokeStyle=isActive?tag.color+'77':'rgba(255,255,255,0.04)'; ctx.lineWidth=isActive?1.5:1; ctx.strokeRect(rx,ry,colW3,rowH-3);
      ctx.fillStyle=isActive?tag.color:'rgba(255,255,255,0.3)'; ctx.font=`${isActive?'bold ':''}9px "SF Mono", monospace`; ctx.textAlign='left';
      ctx.fillText(`P${tag.p}`, rx+6, ry+rowH/2+3);
      ctx.fillStyle=isActive?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.4)'; ctx.font=`${isActive?'bold ':''}9px Inter, sans-serif`;
      ctx.fillText(tag.label, rx+32, ry+rowH/2+3);
    });

    // Active tag description
    const descY=h-28;
    ctx.globalAlpha=fadeIn;
    const at=tags[activeIdx];
    ctx.fillStyle=at.color; ctx.font='bold 10px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText(`P${at.p} — ${at.label}`, w/2, descY);
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px Inter, sans-serif';
    ctx.fillText(at.desc, w/2, descY+14);
    ctx.globalAlpha=1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 6 — FreshnessGaugeAnim (S08)
// Animated bar counter climbing from 0 to 40+
// Freshness label cycling: JUST FIRED → FRESH → ACTIVE → AGING
// ============================================================
function FreshnessGaugeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
    // Oscillate bars elapsed 0→40→0
    const barsElapsed=Math.round(Math.abs(Math.sin(t*0.25)*42));
    const state=barsElapsed<=3?'JUST FIRED':barsElapsed<=10?'FRESH':barsElapsed<=30?'ACTIVE':'AGING';
    const stateC=state==='JUST FIRED'?TEAL:state==='FRESH'?TEAL:state==='ACTIVE'?AMBER:MAGENTA;

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('LAST SIGNAL ROW — FRESHNESS INDICATOR', w/2, 22);

    // Command Center row mockup
    const ccX=40; const ccW=w-80; const ccY=40; const ccH=44;
    ctx.fillStyle=stateC+'18'; ctx.fillRect(ccX,ccY,ccW,ccH);
    ctx.strokeStyle=stateC+'88'; ctx.lineWidth=1.5; ctx.strokeRect(ccX,ccY,ccW,ccH);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 11px "SF Mono", monospace'; ctx.textAlign='left';
    ctx.fillText('Last Signal', ccX+16, ccY+ccH/2+4);
    ctx.fillStyle=TEAL; ctx.font='bold 12px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('▲ Long', ccX+ccW*0.42, ccY+ccH/2+4);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='11px "SF Mono", monospace';
    ctx.fillText(`${barsElapsed} bars`, ccX+ccW*0.6, ccY+ccH/2+4);
    ctx.shadowBlur=8; ctx.shadowColor=stateC;
    ctx.fillStyle=stateC; ctx.font='bold 12px "SF Mono", monospace';
    ctx.fillText('→ '+state, ccX+ccW*0.78, ccY+ccH/2+4);
    ctx.shadowBlur=0;

    // Progress bar
    const barX=ccX; const barY=ccY+ccH+14; const barW=ccW; const barH=20;
    const phases=[{l:'JUST FIRED',max:3,c:TEAL},{l:'FRESH',max:10,c:TEAL},{l:'ACTIVE',max:30,c:AMBER},{l:'AGING',max:50,c:MAGENTA}];
    let runX=barX;
    phases.forEach(ph=>{
      const phW=(ph.max/50)*barW; const phFill=Math.min(ph.max,barsElapsed);
      const fillFraction=Math.max(0,phFill-(!phases.indexOf(ph)?0:phases.slice(0,phases.indexOf(ph)).reduce((a,p)=>a+p.max,0)))/ph.max;
      ctx.fillStyle=ph.c+'22'; ctx.fillRect(runX,barY,phW,barH);
      ctx.fillStyle=ph.c+'88'; ctx.fillRect(runX,barY,phW*fillFraction,barH);
      ctx.strokeStyle=ph.c+'44'; ctx.lineWidth=1; ctx.strokeRect(runX,barY,phW,barH);
      ctx.fillStyle=ph.c; ctx.font='bold 8px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(ph.l, runX+phW/2, barY+13);
      runX+=phW;
    });

    // Gauge needle (bar counter on arc)
    const gCX=w/2; const gCY=barY+barH+80; const gR=55;
    ctx.save(); ctx.translate(gCX,gCY);
    const sToA=(v:number)=>Math.PI+(v/50)*Math.PI;
    ctx.strokeStyle=stateC+'44'; ctx.lineWidth=20; ctx.beginPath(); ctx.arc(0,0,gR,Math.PI,2*Math.PI); ctx.stroke();
    ctx.strokeStyle=stateC; ctx.lineWidth=20; ctx.beginPath(); ctx.arc(0,0,gR,Math.PI,sToA(Math.min(50,barsElapsed))); ctx.stroke();
    const nA=sToA(Math.min(50,barsElapsed));
    ctx.shadowBlur=10; ctx.shadowColor=stateC; ctx.strokeStyle=stateC; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(nA)*(gR-12),Math.sin(nA)*(gR-12)); ctx.stroke();
    ctx.shadowBlur=0; ctx.fillStyle=stateC; ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=stateC; ctx.font='bold 22px "SF Mono", monospace'; ctx.textAlign='center'; ctx.fillText(String(barsElapsed), 0, 8);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px Inter, sans-serif'; ctx.fillText('bars elapsed', 0, 22);
    ctx.restore();

    // State description
    const stateDescs={
      'JUST FIRED':'Maximum freshness. Signal fired within the last 3 bars.',
      'FRESH':'Still actionable. Within the last 10 bars.',
      'ACTIVE':'Aging context. Use with caution. 11–30 bars.',
      'AGING':'Stale signal. 30+ bars — wait for fresh confirmation.',
    };
    ctx.fillStyle=stateC; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(stateDescs[state as keyof typeof stateDescs], w/2, h-10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 7 — FinalGateAnim (S06)
// OR-logic visualization: buy_px OR buy_ts + conviction check
// Two input lanes merging at final gate; output fires or blocks
// ============================================================
function FinalGateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300',MAGENTA='#EF5350';
    // 4 scenes: PX fires / TS fires / both fire / neither
    const cycleT=t%16; const sceneIdx=Math.floor(cycleT/4); const sceneT=(cycleT%4)/4;
    const fadeIn=Math.min(1,sceneT*4);
    const scenes=[
      {pxFire:true, tsFire:false, conv:3, label:'PX long fires, TS quiet. Conviction 3/4. buy_signal = TRUE.', result:true},
      {pxFire:false,tsFire:true,  conv:3, label:'TS snap fires, PX quiet. Conviction 3/4. buy_signal = TRUE.', result:true},
      {pxFire:true, tsFire:true,  conv:4, label:'Both origins trigger on same bar. OR resolves TRUE. Conviction 4/4.', result:true},
      {pxFire:false,tsFire:false, conv:2, label:'Neither origin triggers. OR resolves FALSE. Signal blocked at the OR gate.', result:false},
    ];
    const s=scenes[sceneIdx];

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('FINAL GATE — OR LOGIC + CONVICTION CHECK', w/2, 22);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='right';
    ctx.fillText(`${String(sceneIdx+1).padStart(2,'0')} / 04`, w-20, 22);

    const midX=w*0.5; const gateY=h*0.5; const laneSpacing=h*0.2;
    const nodeR=18;

    // PX lane
    const pxY=gateY-laneSpacing; const pxColor=s.pxFire?TEAL:'rgba(255,255,255,0.15)';
    ctx.save(); if(s.pxFire){ctx.shadowBlur=12;ctx.shadowColor=TEAL;}
    ctx.fillStyle=s.pxFire?TEAL+'22':'rgba(255,255,255,0.04)'; ctx.strokeStyle=pxColor; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(w*0.2,pxY,nodeR,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=pxColor; ctx.font='bold 10px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('PX', w*0.2, pxY+3); ctx.fillText(s.pxFire?'FIRED':'quiet', w*0.2, pxY+15);

    // TS lane
    const tsY=gateY+laneSpacing; const tsColor=s.tsFire?MAGENTA:'rgba(255,255,255,0.15)';
    ctx.save(); if(s.tsFire){ctx.shadowBlur=12;ctx.shadowColor=MAGENTA;}
    ctx.fillStyle=s.tsFire?MAGENTA+'22':'rgba(255,255,255,0.04)'; ctx.strokeStyle=tsColor; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(w*0.2,tsY,nodeR,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=tsColor; ctx.font='bold 10px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('TS', w*0.2, tsY+3); ctx.fillText(s.tsFire?'FIRED':'quiet', w*0.2, tsY+15);

    // Converging lines to OR gate
    const orX=midX-60;
    ctx.strokeStyle=s.pxFire?TEAL+'88':'rgba(255,255,255,0.1)'; ctx.lineWidth=s.pxFire?2:1;
    ctx.beginPath(); ctx.moveTo(w*0.2+nodeR,pxY); ctx.bezierCurveTo(orX-30,pxY,orX-30,gateY,orX,gateY); ctx.stroke();
    ctx.strokeStyle=s.tsFire?MAGENTA+'88':'rgba(255,255,255,0.1)'; ctx.lineWidth=s.tsFire?2:1;
    ctx.beginPath(); ctx.moveTo(w*0.2+nodeR,tsY); ctx.bezierCurveTo(orX-30,tsY,orX-30,gateY,orX,gateY); ctx.stroke();

    // OR gate diamond
    const orFired=s.pxFire||s.tsFire;
    const orC=orFired?TEAL:'rgba(255,255,255,0.15)';
    ctx.save(); if(orFired){ctx.shadowBlur=12;ctx.shadowColor=TEAL;}
    ctx.fillStyle=orFired?TEAL+'22':'rgba(255,255,255,0.04)'; ctx.strokeStyle=orC; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(orX,gateY-24); ctx.lineTo(orX+24,gateY); ctx.lineTo(orX,gateY+24); ctx.lineTo(orX-24,gateY); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=orC; ctx.font='bold 8px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('OR', orX, gateY+3);

    // Conviction check box
    const ccX=midX+10; const ccW2=80; const ccH2=44;
    const convPasses=s.conv>=3;
    const convC=convPasses?TEAL:MAGENTA;
    ctx.fillStyle=convC+'15'; ctx.fillRect(ccX-ccW2/2,gateY-ccH2/2,ccW2,ccH2);
    ctx.strokeStyle=convC+'77'; ctx.lineWidth=1.5; ctx.strokeRect(ccX-ccW2/2,gateY-ccH2/2,ccW2,ccH2);
    ctx.fillStyle=convC; ctx.font='bold 9px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('CONVICTION', ccX, gateY-8);
    ctx.font='bold 14px "SF Mono", monospace'; ctx.fillText(`${s.conv}/4`, ccX, gateY+8);

    // Line from OR to conviction
    ctx.strokeStyle=orFired?TEAL+'88':'rgba(255,255,255,0.1)'; ctx.lineWidth=orFired?2:1;
    ctx.beginPath(); ctx.moveTo(orX+24,gateY); ctx.lineTo(ccX-ccW2/2,gateY); ctx.stroke();

    // Output
    const outX=w*0.85;
    ctx.globalAlpha=fadeIn;
    const resC=s.result?TEAL:MAGENTA;
    ctx.save(); if(s.result){ctx.shadowBlur=16;ctx.shadowColor=TEAL;}
    ctx.fillStyle=resC+'22'; ctx.strokeStyle=resC+'99'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(outX,gateY,nodeR+6,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=resC; ctx.font='bold 11px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText(s.result?'▲ Long +':'BLOCK', outX, gateY+4);

    ctx.strokeStyle=convC+'66'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(ccX+ccW2/2,gateY); ctx.lineTo(outX-nodeR-6,gateY); ctx.stroke();

    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(s.label, w/2, h-10);
    ctx.globalAlpha=1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 8 — StandardVsStrongAnim (S06 supplement)
// Two signal labels side by side — Standard vs Strong
// Larger label, + marker, conviction score comparison
// ============================================================
function StandardVsStrongAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL='#26A69A',AMBER='#FFB300';
    const pulse=Math.sin(t*1.2)*0.5+0.5;

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('STANDARD (0–2/4) vs STRONG (3–4/4) — SAME PIPELINE, MORE ALIGNMENT', w/2, 22);

    const col1X=w*0.18; const col2X=w*0.65; const colY=h*0.22;

    // Standard label (small)
    ctx.save();
    ctx.fillStyle='rgba(38,166,154,0.12)'; ctx.strokeStyle='rgba(38,166,154,0.5)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(col1X-42,colY-14,84,28,5); ctx.fill(); ctx.stroke();
    ctx.fillStyle=TEAL; ctx.font='bold 12px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('▲ Long', col1X, colY+5);
    ctx.restore();

    // Standard score indicators
    const stdScore=2;
    Array.from({length:4}).forEach((_,i)=>{
      const dotX=col1X-22+i*14; const dotY=colY+26;
      ctx.fillStyle=i<stdScore?TEAL+'cc':'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(dotX,dotY,5,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(`${stdScore}/4 conviction`, col1X, colY+42);
    ctx.fillText('Standard label', col1X, colY+54);

    // Standard factors lit
    const stdFactors=['Ribbon','ADX'];
    const allFactors=['Ribbon','ADX','Volume','Health'];
    allFactors.forEach((f,i)=>{
      const fy=colY+72+i*18;
      const isLit=stdFactors.includes(f);
      ctx.fillStyle=isLit?TEAL:'rgba(255,255,255,0.2)'; ctx.font=`${isLit?'bold ':''}9px Inter, sans-serif`; ctx.textAlign='center';
      ctx.fillText((isLit?'✓ ':'✗ ')+f, col1X, fy);
    });

    // Strong label (bigger, + marker)
    ctx.save();
    ctx.shadowBlur=14+pulse*4; ctx.shadowColor=AMBER;
    ctx.fillStyle='rgba(255,179,0,0.18)'; ctx.strokeStyle=AMBER; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(col2X-54,colY-20,108,36,7); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=TEAL; ctx.font='bold 16px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText('▲ Long +', col2X, colY+7);

    // Strong score indicators
    const strScore=3;
    Array.from({length:4}).forEach((_,i)=>{
      const dotX=col2X-26+i*18; const dotY=colY+28;
      ctx.fillStyle=i<strScore?AMBER+'cc':'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(dotX,dotY,6,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle=AMBER; ctx.font='bold 9px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(`${strScore}/4 conviction`, col2X, colY+44);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px Inter, sans-serif';
    ctx.fillText('Strong label (+)', col2X, colY+56);

    const strFactors=['Ribbon','ADX','Volume'];
    allFactors.forEach((f,i)=>{
      const fy=colY+72+i*18; const isLit=strFactors.includes(f);
      ctx.fillStyle=isLit?AMBER:'rgba(255,255,255,0.2)'; ctx.font=`${isLit?'bold ':''}9px Inter, sans-serif`; ctx.textAlign='center';
      ctx.fillText((isLit?'✓ ':'✗ ')+f, col2X, fy);
    });

    // VS divider
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='bold 16px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('vs', w*0.455, h*0.42);

    // Bottom note
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Both signals cleared all pipeline gates. The + marker shows more market factors aligned.', w/2, h-12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 9 — PXMechanicsAnim
// PX signal 3-check breakdown: body size, pre-cross distance,
// rapid-flip suppression. Tile cycles through 4 scenarios.
// ============================================================
function PXMechanicsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t % 16; const sceneIdx = Math.floor(cycleT / 4); const sceneT = (cycleT % 4) / 4;
    const fadeIn = Math.min(1, sceneT * 4);

    // Each scene shows a different pass/fail combination
    const scenes = [
      { body: true,  dist: true,  flip: true,  fires: true,  label: 'All 3 checks pass. PX long fires.' },
      { body: false, dist: true,  flip: true,  fires: false, label: 'Body too small. Blocked before conviction scoring.' },
      { body: true,  dist: false, flip: true,  fires: false, label: 'Too close to last cross. Distance filter blocks.' },
      { body: true,  dist: true,  flip: false, fires: false, label: 'Long just followed a short — rapid flip suppressed.' },
    ];
    const s = scenes[sceneIdx];

    ctx.fillStyle = 'rgba(245,158,11,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PX MECHANICS — THREE CHECKS BEFORE ORIGIN QUALIFIES', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${String(sceneIdx + 1).padStart(2, '0')} / 04`, w - 20, 22);

    // Three check tiles (body / distance / rapid-flip)
    const checks = [
      { label: 'BODY SIZE',     sub: s.body ? 'candle body > min_body' : 'candle body too small',     pass: s.body, icon: '▮' },
      { label: 'PRE-CROSS DIST',sub: s.dist ? 'distance > threshold'  : 'too close to last flip',    pass: s.dist, icon: '↔' },
      { label: 'RAPID FLIP',    sub: s.flip ? 'no opposite signal recently' : 'opposite signal within window', pass: s.flip, icon: '⟳' },
    ];
    const cW = (w - 60) / 3; const cY = 48; const cH = h * 0.38;
    checks.forEach((c, i) => {
      const x = 20 + i * (cW + 10);
      const col = c.pass ? TEAL : MAGENTA;
      ctx.save();
      if (c.pass) { ctx.shadowBlur = 12; ctx.shadowColor = col; }
      ctx.fillStyle = c.pass ? col + '18' : 'rgba(239,83,80,0.08)';
      ctx.fillRect(x, cY, cW, cH);
      ctx.strokeStyle = c.pass ? col + 'aa' : MAGENTA + '77';
      ctx.lineWidth = 1.5; ctx.strokeRect(x, cY, cW, cH);
      ctx.restore();

      ctx.fillStyle = col; ctx.font = 'bold 24px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.icon, x + cW / 2, cY + 32);

      ctx.fillStyle = col; ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(c.label, x + cW / 2, cY + 56);

      ctx.fillStyle = c.pass ? 'rgba(255,255,255,0.55)' : 'rgba(239,83,80,0.7)';
      ctx.font = '9px Inter, sans-serif';
      // wrap sub if long
      const words = c.sub.split(' ');
      let line1 = ''; let line2 = '';
      for (const w2 of words) {
        if ((line1 + ' ' + w2).trim().length < 20) line1 = (line1 + ' ' + w2).trim();
        else line2 = (line2 + ' ' + w2).trim();
      }
      ctx.fillText(line1, x + cW / 2, cY + 74);
      if (line2) ctx.fillText(line2, x + cW / 2, cY + 86);

      // Pass/fail mark
      ctx.fillStyle = col; ctx.font = 'bold 16px "SF Mono", monospace';
      ctx.fillText(c.pass ? '✓' : '✗', x + cW / 2, cY + cH - 10);
    });

    // Output verdict
    const vY = cY + cH + 18; const vH = h - vY - 26;
    const vC = s.fires ? TEAL : MAGENTA;
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = vC + '20'; ctx.fillRect(20, vY, w - 40, vH);
    ctx.strokeStyle = vC + 'aa'; ctx.lineWidth = 1.5; ctx.strokeRect(20, vY, w - 40, vH);
    ctx.fillStyle = vC; ctx.font = 'bold 14px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(s.fires ? 'px_long = TRUE — origin qualifies' : 'px_long = FALSE — origin blocked', w / 2, vY + vH / 2 + 5);
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter, sans-serif';
    ctx.fillText(s.label, w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — TSConditionsAnim
// TS 4-condition checklist: Stretch → Snap candle → Velocity
// → Cooldown gate. Steps light up in sequence.
// ============================================================
function TSConditionsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t % 10; const step = Math.min(4, Math.floor(cycleT / 2)); const stepT = (cycleT % 2) / 2;
    const fadeIn = Math.min(1, stepT * 4);

    ctx.fillStyle = 'rgba(245,158,11,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TS — FOUR CONDITIONS ALL REQUIRED', w / 2, 22);

    const conditions = [
      { label: 'PRIOR STRETCH',    sub: 'Price was stretched in the opposite direction', icon: '◢' },
      { label: 'SNAP CANDLE',      sub: 'Candle body closes against the stretch',       icon: '▶' },
      { label: 'VELOCITY SHIFT',   sub: 'Momentum flips direction',                     icon: '⇌' },
      { label: 'COOLDOWN GATE',    sub: 'No same-direction TS in recent bars',          icon: '⏱' },
    ];
    // Vertical checklist
    const rowY0 = 44; const rowGap = 4; const rowH = (h - rowY0 - 34 - rowGap * 3) / 4;
    conditions.forEach((c, i) => {
      const rY = rowY0 + i * (rowH + rowGap);
      const lit = i < step;
      const col = lit ? TEAL : 'rgba(255,255,255,0.2)';
      // Row bg
      ctx.save();
      if (lit) { ctx.shadowBlur = 8; ctx.shadowColor = TEAL; }
      ctx.fillStyle = lit ? 'rgba(38,166,154,0.10)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(20, rY, w - 40, rowH);
      ctx.strokeStyle = lit ? TEAL + '66' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = lit ? 1.5 : 1;
      ctx.strokeRect(20, rY, w - 40, rowH);
      ctx.restore();

      // Step number
      ctx.fillStyle = lit ? TEAL : 'rgba(255,255,255,0.25)';
      ctx.font = 'bold 11px "SF Mono", monospace'; ctx.textAlign = 'left';
      ctx.fillText(`0${i + 1}`, 34, rY + rowH / 2 + 4);

      // Icon
      ctx.fillStyle = col; ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.icon, 78, rY + rowH / 2 + 8);

      // Label
      ctx.fillStyle = col; ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(c.label, 110, rY + rowH / 2 - 1);
      ctx.fillStyle = lit ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)'; ctx.font = '10px Inter, sans-serif';
      ctx.fillText(c.sub, 110, rY + rowH / 2 + 14);

      // Pass mark
      ctx.fillStyle = col; ctx.font = 'bold 14px "SF Mono", monospace'; ctx.textAlign = 'right';
      ctx.fillText(lit ? '✓' : '—', w - 30, rY + rowH / 2 + 5);
    });

    // Output row
    const outY = h - 28;
    const allPass = step >= 4;
    ctx.fillStyle = allPass ? TEAL : 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(allPass ? 'ALL FOUR CONDITIONS MET — ts_long = TRUE' : `Building conditions... ${step}/4`, w / 2, outY);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — DirectionFilterAnim
// Three modes cycle: BOTH / LONG ONLY / SHORT ONLY
// Shows a stream of candidate signals passing or blocked
// ============================================================
function DirectionFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t % 12; const modeIdx = Math.floor(cycleT / 4); const modeT = (cycleT % 4) / 4;
    const fadeIn = Math.min(1, modeT * 4);

    const modes = [
      { label: 'BOTH',       allowLong: true,  allowShort: true,  desc: 'Both directions permitted. No directional bias applied.' },
      { label: 'LONG ONLY',  allowLong: true,  allowShort: false, desc: 'Long candidates pass. Short candidates blocked at this gate.' },
      { label: 'SHORT ONLY', allowLong: false, allowShort: true,  desc: 'Short candidates pass. Long candidates blocked at this gate.' },
    ];
    const m = modes[modeIdx];

    ctx.fillStyle = 'rgba(245,158,11,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('DIRECTION FILTER — GATE 2 IN THE PIPELINE', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${String(modeIdx + 1).padStart(2, '0')} / 03`, w - 20, 22);

    // Mode tabs
    const tabW = (w - 40) / 3;
    modes.forEach((mm, i) => {
      const tx = 20 + i * tabW; const isActive = i === modeIdx;
      ctx.fillStyle = isActive ? TEAL + '22' : 'rgba(255,255,255,0.02)'; ctx.fillRect(tx + 2, 38, tabW - 4, 26);
      ctx.strokeStyle = isActive ? TEAL + '88' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isActive ? 1.5 : 1; ctx.strokeRect(tx + 2, 38, tabW - 4, 26);
      ctx.fillStyle = isActive ? TEAL : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold ' : ''}10px Inter, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(mm.label, tx + tabW / 2, 38 + 17);
    });

    // Candidates flowing in (longs above, shorts below)
    const laneY = [h * 0.42, h * 0.68];
    const laneLabels = ['LONG CANDIDATES', 'SHORT CANDIDATES'];
    const laneColors = [TEAL, MAGENTA];
    const laneAllow = [m.allowLong, m.allowShort];

    laneLabels.forEach((ll, li) => {
      const ly = laneY[li]; const lc = laneColors[li]; const allow = laneAllow[li];

      // Label on left
      ctx.fillStyle = allow ? lc : 'rgba(255,255,255,0.25)';
      ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(ll, 22, ly - 22);

      // Gate barrier in middle
      const gateX = w * 0.55;
      ctx.save();
      if (!allow) {
        ctx.strokeStyle = MAGENTA; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(gateX, ly - 24); ctx.lineTo(gateX, ly + 24); ctx.stroke();
        // X marker
        ctx.fillStyle = MAGENTA; ctx.font = 'bold 18px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('✗', gateX, ly + 6);
      } else {
        ctx.strokeStyle = TEAL + '66'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(gateX, ly - 16); ctx.lineTo(gateX, ly + 16); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // Travelling candidate dots (3 dots flowing left-to-right)
      for (let d = 0; d < 3; d++) {
        const phase = ((t * 0.3 + d * 0.33) % 1);
        const xStart = 20; const xEnd = allow ? w - 40 : gateX - 8;
        const px = xStart + (xEnd - xStart) * phase;
        const alpha = allow ? 1 : (phase < 1 ? 1 : 0);
        ctx.save();
        if (alpha > 0) {
          ctx.shadowBlur = 8; ctx.shadowColor = lc;
          ctx.fillStyle = lc + 'cc'; ctx.beginPath();
          ctx.arc(px, ly, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // After-gate output area
      if (allow) {
        ctx.fillStyle = lc; ctx.font = 'bold 10px "SF Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('→ continue', w - 78, ly + 4);
      } else {
        ctx.fillStyle = MAGENTA; ctx.font = 'bold 10px "SF Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('→ blocked', w - 76, ly + 4);
      }
    });

    // Caption
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(m.desc, w / 2, h - 10);
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — StrongThresholdAnim
// Threshold slider on conviction score, 0 → 4
// At each value, show which of a set of sample signals fire
// ============================================================
function StrongThresholdAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    // Threshold oscillates 0 → 4 → 0
    const thresh = Math.max(0, Math.min(4, Math.round(2 + Math.sin(t * 0.35) * 2.4)));
    const strongOnly = thresh >= 3;

    // Sample signals with different conviction scores
    const samples = [
      { id: 'A', conv: 4, dir: '▲', color: TEAL },
      { id: 'B', conv: 3, dir: '▲', color: TEAL },
      { id: 'C', conv: 2, dir: '▼', color: MAGENTA },
      { id: 'D', conv: 2, dir: '▲', color: TEAL },
      { id: 'E', conv: 1, dir: '▼', color: MAGENTA },
      { id: 'F', conv: 0, dir: '▲', color: TEAL },
    ];

    ctx.fillStyle = 'rgba(245,158,11,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('STRONG ONLY — THRESHOLD GATE IN ACTION', w / 2, 22);

    // Threshold slider at top
    const sliderY = 48; const sliderX1 = 40; const sliderX2 = w - 40;
    const sliderW = sliderX2 - sliderX1;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sliderX1, sliderY); ctx.lineTo(sliderX2, sliderY); ctx.stroke();
    // Tick marks 0..4
    for (let i = 0; i <= 4; i++) {
      const x = sliderX1 + (sliderW / 4) * i;
      ctx.fillStyle = i <= thresh ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(x, sliderY, i === thresh ? 7 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 9px "SF Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(String(i), x, sliderY + 18);
    }
    // Threshold label
    ctx.fillStyle = AMBER; ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('min_conviction = ' + thresh + (strongOnly ? '  (Strong Only ON)' : '  (standard)'), w / 2, sliderY - 10);

    // Signal row (6 candidates)
    const rowY = sliderY + 50; const sW = (w - 60) / samples.length; const sH = h - rowY - 34;
    samples.forEach((s, i) => {
      const sx = 30 + i * sW; const passes = s.conv >= thresh;
      const outCol = passes ? s.color : 'rgba(239,83,80,0.4)';

      // Background
      ctx.save();
      if (passes) { ctx.shadowBlur = 10; ctx.shadowColor = s.color; }
      ctx.fillStyle = passes ? s.color + '18' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(sx + 4, rowY, sW - 8, sH);
      ctx.strokeStyle = passes ? s.color + 'aa' : 'rgba(239,83,80,0.3)';
      ctx.lineWidth = passes ? 1.5 : 1; ctx.strokeRect(sx + 4, rowY, sW - 8, sH);
      ctx.restore();

      // ID
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'bold 9px "SF Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(s.id, sx + sW / 2, rowY + 16);

      // Big signal label or blocked marker
      if (passes) {
        ctx.fillStyle = s.color; ctx.font = 'bold 16px "SF Mono", monospace';
        const txt = s.conv >= 3 ? s.dir + ' +' : s.dir;
        ctx.fillText(txt, sx + sW / 2, rowY + sH / 2 + 4);
      } else {
        ctx.fillStyle = 'rgba(239,83,80,0.6)'; ctx.font = 'bold 12px "SF Mono", monospace';
        ctx.fillText('BLOCK', sx + sW / 2, rowY + sH / 2 + 4);
      }

      // Conviction dots at bottom
      const dotY = rowY + sH - 12;
      for (let d = 0; d < 4; d++) {
        const dotX = sx + sW / 2 - 12 + d * 8;
        ctx.fillStyle = d < s.conv ? (passes ? s.color : 'rgba(239,83,80,0.5)') : 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px "SF Mono", monospace';
      ctx.fillText(s.conv + '/4', sx + sW / 2, rowY + sH - 2);
    });

    // Caption
    const passed = samples.filter(s => s.conv >= thresh).length;
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${passed} of ${samples.length} candidates pass at this threshold.`, w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — LabelAnatomyAnim
// Pull apart a signal label: arrow + direction word + marker
// Shows what each element communicates to the operator
// ============================================================
function LabelAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const explodeT = Math.abs(Math.sin(t * 0.35)); // 0 = compact, 1 = exploded

    ctx.fillStyle = 'rgba(245,158,11,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SIGNAL LABEL ANATOMY — WHAT EACH ELEMENT TELLS YOU', w / 2, 22);

    // Main label at center, explodes apart into 3 pieces
    const cx = w / 2; const cy = h * 0.38;
    const gap = 60 * explodeT;

    // Piece 1: Arrow
    const p1x = cx - 62 - gap;
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = TEAL;
    ctx.fillStyle = TEAL + '22'; ctx.fillRect(p1x - 16, cy - 18, 32, 36);
    ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.strokeRect(p1x - 16, cy - 18, 32, 36);
    ctx.restore();
    ctx.fillStyle = TEAL; ctx.font = 'bold 22px "SF Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('▲', p1x, cy + 8);
    // Annotation line
    if (explodeT > 0.1) {
      ctx.save(); ctx.globalAlpha = explodeT;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(p1x, cy + 22); ctx.lineTo(p1x, cy + 50); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = TEAL; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('DIRECTION', p1x, cy + 64);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '9px Inter, sans-serif';
      ctx.fillText('▲ = Long', p1x, cy + 78);
      ctx.fillText('▼ = Short', p1x, cy + 90);
      ctx.restore();
    }

    // Piece 2: Direction word "Long"
    const p2x = cx;
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = TEAL;
    ctx.fillStyle = TEAL + '22'; ctx.fillRect(p2x - 28, cy - 18, 56, 36);
    ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.strokeRect(p2x - 28, cy - 18, 56, 36);
    ctx.restore();
    ctx.fillStyle = TEAL; ctx.font = 'bold 16px "SF Mono", monospace';
    ctx.fillText('Long', p2x, cy + 6);
    if (explodeT > 0.1) {
      ctx.save(); ctx.globalAlpha = explodeT;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(p2x, cy + 22); ctx.lineTo(p2x, cy + 50); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = TEAL; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('ENTRY TYPE', p2x, cy + 64);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '9px Inter, sans-serif';
      ctx.fillText('Long / Short', p2x, cy + 78);
      ctx.fillText('(after filters pass)', p2x, cy + 90);
      ctx.restore();
    }

    // Piece 3: "+" marker
    const p3x = cx + 62 + gap;
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = AMBER;
    ctx.fillStyle = AMBER + '22'; ctx.fillRect(p3x - 16, cy - 18, 32, 36);
    ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5; ctx.strokeRect(p3x - 16, cy - 18, 32, 36);
    ctx.restore();
    ctx.fillStyle = AMBER; ctx.font = 'bold 24px "SF Mono", monospace';
    ctx.fillText('+', p3x, cy + 8);
    if (explodeT > 0.1) {
      ctx.save(); ctx.globalAlpha = explodeT;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(p3x, cy + 22); ctx.lineTo(p3x, cy + 50); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = AMBER; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('STRENGTH', p3x, cy + 64);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '9px Inter, sans-serif';
      ctx.fillText('3+ / 4 factors', p3x, cy + 78);
      ctx.fillText('aligned', p3x, cy + 90);
      ctx.restore();
    }

    // Context tag below the whole label (separate element)
    const tagY = cy + 120;
    ctx.save();
    ctx.fillStyle = MAGENTA + '18'; ctx.fillRect(cx - 68, tagY - 12, 136, 22);
    ctx.strokeStyle = MAGENTA + '77'; ctx.lineWidth = 1; ctx.strokeRect(cx - 68, tagY - 12, 136, 22);
    ctx.fillStyle = MAGENTA; ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.fillText('Sweep + FVG', cx, tagY + 3);
    ctx.restore();

    if (explodeT > 0.1) {
      ctx.save(); ctx.globalAlpha = explodeT;
      ctx.fillStyle = MAGENTA; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('CONTEXT TAG — WHY THIS SIGNAL FIRED', cx, tagY + 26);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px Inter, sans-serif';
      ctx.fillText('Top of the 13-level priority waterfall.', cx, tagY + 38);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('A complete signal label has three parts plus a context tag. Read all four.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function CipherSignalPhilosophyLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string|null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string|null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(()=>`PRO-CERT-L11.8-${Math.random().toString(36).substring(2,8).toUpperCase()}`);

  useEffect(()=>{const h=()=>setScrollY(window.scrollY);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[]);
  const quizScore=quizAnswers.filter((ans,i)=>{const c=quizQuestions[i].options.find(o=>o.correct)?.id;return ans===c;}).length;
  const quizPercent=Math.round((quizScore/quizQuestions.length)*100);
  const quizPassed=quizPercent>=66;
  useEffect(()=>{if(quizPassed&&quizSubmitted&&!certRevealed){const timer=setTimeout(()=>{setCertRevealed(true);setShowConfetti(true);setTimeout(()=>setShowConfetti(false),5000);},600);return()=>clearTimeout(timer);}},[quizPassed,quizSubmitted,certRevealed]);
  const fadeUp={hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.7}}};

  return (
    <div className="min-h-screen text-white" style={{background:'linear-gradient(to bottom, #060a12, #0a0f1a)'}}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{width:`${Math.min((scrollY/(typeof document!=='undefined'?document.body.scrollHeight-window.innerHeight:1))*100,100)}%`}}/>
      </div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{WebkitTransform:'translateZ(0)'}}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400"/><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span></div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none"/>
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none"/>
        <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.15}}}} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
            The Signal<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{WebkitTransform:'translateZ(0)'}}>Philosophy</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Every signal on your chart survived a five-gate qualification pipeline. Most candidates never made it. Understanding why separates operators from observers.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce"/>
          </motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why Signal Quality Beats Signal Quantity</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">More Signals Is Not Better</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most indicators fire signals freely. Price touches a level — signal fires. RSI crosses a threshold — signal fires. The result is a chart full of arrows and a trader who learns nothing about which signals actually matter.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER was designed around the opposite philosophy. A signal that has not passed through origin validation, direction gating, conviction scoring, and a final qualification check does not appear on your chart at all. What you see is what survived.</p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches you the architecture of that pipeline — so you understand not just what CIPHER signals look like, but why they fire when they do and why they stay silent when conditions are not right.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE SIGNAL ARCHITECT PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">The absence of a signal is itself information. If CIPHER is quiet, it means the pipeline found something that disqualified the candidate. <strong className="text-white">Silence is not a malfunction — it is the filter working.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S01 GC */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; CIPHER Doesn&apos;t Fire — It Qualifies</p>
          <h2 className="text-2xl font-extrabold mb-4">The Five-Gate Pipeline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Configure the three filters — Signal Engine, Direction, and Strong Only — and press RUN to watch a Long candidate travel through each gate. Change any filter and see exactly where it gets blocked and why.</p>
          <PipelineAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Every time you see a signal on your chart, it cleared all five gates. Every time CIPHER is silent, at least one gate rejected the candidate. The filters are not limitations — they are what makes the signals trustworthy. <strong className="text-white">The filter is the feature.</strong></p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE FIVE GATES</p>
            <div className="font-mono text-xs text-gray-400 space-y-0.5">
              <p>Gate 1: Signal Engine (All / Trend / Reversal / Visuals Only)</p>
              <p>Gate 2: Direction Filter (Both / Long Only / Short Only)</p>
              <p>Gate 3: Conviction Score (0–4 factors)</p>
              <p>Gate 4: Strong Only (blocks score &lt; 3 when ON)</p>
              <p>Gate 5: Final Gate (buy_px OR buy_ts) AND conviction &gt;= min</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Two Signal Origins</p>
          <h2 className="text-2xl font-extrabold mb-4">PX vs TS — Two Engines, One Chart</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER has two independent signal engines. PX fires on trend continuation when price crosses the Cipher Pulse line. TS fires on mean reversion when a tension extreme snaps. They are not the same signal with different names — they have completely different trigger logic and market conditions.</p>
          <PXvsTSAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
              <p className="text-xs font-bold text-teal-400 mb-1">PX — Pulse Cross (Trend)</p>
              <p className="text-sm text-gray-400">Price crosses the Cipher Pulse line. Three validation checks: body size, distance from pulse, no rapid-flip within cooldown window. Trend continuation signal.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-xs font-bold text-red-400 mb-1">TS — Tension Snap (Reversal)</p>
              <p className="text-sm text-gray-400">Four simultaneous conditions: prior tension stretched past threshold, snap candle with directional body, velocity shift confirmation, cooldown bar since last TS. Mean-reversion signal.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S03 PX Mechanics */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; PX Mechanics</p>
          <h2 className="text-2xl font-extrabold mb-4">Pulse Cross — Three Checks Before It Qualifies</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A raw pulse cross is not enough. Every PX candidate passes through three separate validation checks before it is even allowed to enter the pipeline as an origin. Watch the tiles cycle through the four possible outcomes — pass, body-too-small, distance-too-close, and rapid-flip-blocked.</p>
          <PXMechanicsAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">BODY SIZE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The signal bar must have a body larger than the minimum body threshold. This filters out doji-style crosses and wick-only crosses where price briefly pokes through the Pulse line and closes back. Weak-bodied crossovers are noise — CIPHER silently rejects them.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-teal-400 mb-1">PRE-CROSS DISTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before the cross, price must have been some minimum distance away from the Pulse line. This filters out signals that fire immediately after another cross when price has been hugging the line. A PX with zero pre-cross distance is a chop signal, not a trend signal.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-teal-400 mb-1">RAPID-FLIP SUPPRESSION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A long PX cannot fire immediately after a recent short signal was issued, and vice versa. The suppression window prevents the indicator from flipping direction on consecutive bars during genuine chop. If a rapid flip does happen, the secondary signal is blocked at origin.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mt-4">
            <p className="text-xs font-bold text-amber-400 mb-1">THE WHY</p>
            <p className="text-sm text-gray-400 leading-relaxed">These three checks exist because a naive pulse cross on its own is one of the noisiest signal types in technical analysis. Every trader who has ever used a moving-average cross has seen this pattern: price flips back and forth across the line, producing rapid long-short-long-short sequences. PX mechanics exist to kill that pattern before it reaches you.</p>
          </div>
        </motion.div>
      </section>

      {/* S04 TS Conditions */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; TS Conditions</p>
          <h2 className="text-2xl font-extrabold mb-4">Tension Snap — Four Conditions, All Required</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A Tension Snap signal requires four separate conditions to be true simultaneously. Any single one missing and the signal does not fire. Watch the checklist light up top-to-bottom — the output only triggers when all four are green.</p>
          <TSConditionsAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">01 — PRIOR STRETCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before the snap, price must have been stretched past the tension threshold in the opposite direction. A long TS requires price was recently stretched bearish. Without prior stretch, the "snap" is just a directional candle, not a mean reversion.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-red-400 mb-1">02 — SNAP CANDLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The signal bar itself must be a directional candle closing against the stretch. For a long TS, a bullish-body candle is required. The body size carries conviction — a tiny snap candle does not qualify even if everything else is aligned.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-red-400 mb-1">03 — VELOCITY SHIFT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Momentum must flip direction in alignment with the snap candle. This confirms the reversal is structural, not just a single counter-trend bar. Without velocity shift, you get snap candles that get immediately overwhelmed by continuation.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-red-400 mb-1">04 — COOLDOWN GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A TS in the same direction cannot fire within the cooldown window of the previous same-direction TS. This prevents a single extended reversal from producing a cluster of TS signals on every snap candle. One reversal, one TS.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mt-4">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY FOUR CONDITIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Mean reversion is the hardest trade to time. The market tells you a reversal is near by pushing tension to an extreme, but the exact bar it snaps is stochastic. The four conditions together ensure the signal only fires at a specific pattern: stretched → snap candle → momentum confirms → not already signalled. Each condition eliminates a common false-positive case.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 Signal Modes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Signal Engine — Gate 1</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Modes — Which Origins Are Permitted</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Signal Engine input is Gate 1. Before any signal can fire, it must first pass this filter. Watch all four modes cycle and see which origin columns light up or go dark.</p>
          <SignalModesAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-2">
            {[{m:'All Signals',px:true,ts:true,d:'Full coverage. Default for most operators.'},{m:'Trend',px:true,ts:false,d:'PX only. Use when HTF is clearly trending.'},{m:'Reversal',px:false,ts:true,d:'TS only. Use when fading tension extremes.'},{m:'Visuals Only',px:false,ts:false,d:'No signal labels. Manual reading mode.'}].map(x=>(
              <div key={x.m} className="flex items-start gap-3 text-sm">
                <span className="font-mono font-bold text-xs text-teal-400 shrink-0 w-28">{x.m}</span>
                <span className="text-gray-500 text-xs w-20 shrink-0">{x.px?'PX':'—'} / {x.ts?'TS':'—'}</span>
                <p className="text-gray-400 text-xs">{x.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 Direction */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Direction Filter — Gate 2</p>
          <h2 className="text-2xl font-extrabold mb-4">Aligning Signals with HTF Bias</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Direction filter is Gate 2. It lets you restrict signals to one side of the market. If your HTF analysis says bearish, set Short Only — every long candidate is blocked here regardless of conviction or origin type.</p>
          <div className="p-5 rounded-2xl glass-card space-y-3">
            {[{d:'Both',c:'text-teal-400',desc:'Long and short candidates pass. Full coverage.'},{d:'Long Only',c:'text-teal-400',desc:'All short candidates blocked. Use when HTF bias is bullish.'},{d:'Short Only',c:'text-red-400',desc:'All long candidates blocked. Use when HTF bias is bearish.'}].map(x=>(
              <div key={x.d} className="flex items-start gap-3">
                <span className={`font-mono font-bold text-xs shrink-0 w-24 ${x.c}`}>{x.d}</span>
                <p className="text-gray-400 text-sm">{x.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 Direction Filter Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Direction Filter in Action</p>
          <h2 className="text-2xl font-extrabold mb-4">Two Candidate Streams, One Gate</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Visualising Gate 2 directly — two candidate streams (longs above, shorts below) flow toward the gate. The gate barrier opens or closes depending on the current Direction setting. Watch the three modes cycle and see exactly which streams pass through.</p>
          <DirectionFilterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">The filter is not an override — it is a gate. A long candidate that fails Direction is not converted to a short. It is simply removed. This is why Direction is best treated as a committed alignment tool, not a dynamic filter. If you are going to trade both directions, set it to Both and use your own judgment on each signal.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE DISCIPLINE POINT</p>
            <p className="text-sm text-gray-400 leading-relaxed">Direction exists to protect operators from themselves during clear HTF bias windows. If you know the daily chart is bullish, Short Only off and Long Only on stops you from taking counter-trend TS shorts on impulse. The filter is a commitment mechanism — use it to enforce a plan, not to second-guess one.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 Conviction */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Conviction Scoring — Gate 3</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Market Factors, 0–4 Score</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every signal that passes Gates 1 and 2 is scored against four market factors. Watch the tiles light up as the score builds from 0 to 4 — and see exactly when the signal switches from standard to strong.</p>
          <ConvictionScoringAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-3">
            {[{f:'Ribbon Stacked',t:'Cipher Ribbon stacked in signal direction. Bull stack for longs.'},{f:'ADX > 20',t:'Trend has minimum strength — market is not drifting.'},{f:'Volume > 1.0×',t:'Above-average volume — institutional footprint on signal bar.'},{f:'Health > 50%',t:'Momentum health above midpoint — trend engine is healthy.'}].map(x=>(
              <div key={x.f} className="flex items-start gap-3"><span className="font-mono text-xs font-bold text-teal-400 shrink-0 w-28">{x.f}</span><p className="text-gray-400 text-sm">{x.t}</p></div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 Strong Threshold */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Strong Only &mdash; The 3+ Threshold</p>
          <h2 className="text-2xl font-extrabold mb-4">Raising the Minimum Required Alignment</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Strong Only is a toggle that raises the minimum conviction required from 0 to 3. When ON, signals that scored 0, 1, or 2 of 4 factors are blocked at this gate. Watch the slider move from 0 to 4 and see which of six sample signals pass at each threshold.</p>
          <StrongThresholdAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">At threshold 0, all six signals pass — that is the default behaviour with Strong Only OFF. At threshold 3 (Strong Only ON), only the 3/4 and 4/4 scores survive. The rest are blocked. This is the trade-off: fewer signals, but every surviving one has meaningful market alignment.</p>
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">WHEN TO KEEP IT OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Active intraday trading where you want maximum opportunity count and are willing to filter with your own judgment. Chop markets where 2/4 scores are common but still tradable if the context tag is strong.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN TO TURN IT ON</p>
              <p className="text-sm text-gray-400 leading-relaxed">Swing setups where you want fewer but higher-quality entries. Prop challenge accounts where drawdown control matters more than signal frequency. Any time you want the indicator to do more of the filtering for you.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-red-400 mb-1">COMMON MISTAKE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Turning Strong Only ON and then complaining that the indicator is quiet. The quiet is the filter working. If you are getting fewer signals, it is because fewer signals have 3+ factors aligned right now — that is a real signal about market conditions, not an indicator problem.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S10 Final Gate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Final Gate &amp; Standard vs Strong</p>
          <h2 className="text-2xl font-extrabold mb-4">OR Logic + Conviction Check</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Final Gate resolves whether the signal fires. PX OR TS firing plus conviction meeting the minimum threshold = buy_signal TRUE. Watch all four scenarios: PX only, TS only, both, and neither.</p>
          <FinalGateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">The formula: <strong className="text-white font-mono">buy_signal = (buy_px OR buy_ts) AND bull_conviction &gt;= min_conviction</strong>. With Strong Only OFF, min_conviction = 0. With Strong Only ON, min_conviction = 3. The label size difference tells you which you got.</p>
          <StandardVsStrongAnim />
        </motion.div>
      </section>

      {/* S11 Label Anatomy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Signal Label Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">What Every Element on a Label Means</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every signal label on your chart is a compact readout with three internal pieces plus an external context tag. Each piece tells you something specific. Watch the label explode apart into its components and read what each one communicates.</p>
          <LabelAnatomyAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">ARROW — DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">▲ = long entry. ▼ = short entry. The arrow is the fastest read and should be the first thing you check. If the arrow does not match your plan before you even look at the rest of the label, skip the signal.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-teal-400 mb-1">WORD — ENTRY TYPE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The word "Long" or "Short" confirms the direction after the filters. This part is redundant with the arrow but forces a double-read — useful in fast markets where you might glance and misread an arrow.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-amber-400 mb-1">PLUS MARKER — STRENGTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">"+" appended means conviction is 3 of 4 or higher. The label itself is also larger. No + marker means the signal passed the pipeline but at least two of the four conviction factors were missing.</p>
            </div>
            <div className="border-t border-white/8 pt-3">
              <p className="text-xs font-bold text-red-400 mb-1">CONTEXT TAG — WHY IT FIRED</p>
              <p className="text-sm text-gray-400 leading-relaxed">The small tag below the label names the top priority structural condition at the moment of signal. "Sweep + FVG" is Priority 1 in the waterfall. "Momentum" is the fallback at Priority 13. Two signals with identical conviction can have very different tags — the tag tells you why CIPHER fired at this specific bar.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mt-4">
            <p className="text-xs font-bold text-amber-400 mb-1">READING ORDER</p>
            <p className="text-sm text-gray-400 leading-relaxed">Arrow first (does direction match your plan?). Plus marker second (is this a strong or standard signal?). Context tag third (why here specifically?). Word is visual confirmation only. Reading all four takes under a second once trained.</p>
          </div>
        </motion.div>
      </section>

      {/* S12 Context Tags */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The 13 Context Tags</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Did This Signal Fire Here?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every signal that passes the pipeline carries a context tag. CIPHER evaluates 13 possible states and selects the most specific one via a priority waterfall. Watch the sweep cycle through all 13 — P01 (Sweep + FVG) is the highest priority.</p>
          <ContextTagWaterfallAnim />
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mt-4">
            <p className="text-sm text-gray-400">The context tag is not a signal quality indicator. It describes the <strong className="text-white">specific structural condition</strong> present at the bar the signal fired. Two signals with the same conviction can have very different context tags — both are valid, but they tell you different things about why CIPHER fired at that bar.</p>
          </div>
        </motion.div>
      </section>

      {/* S13 Freshness */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Last Signal Freshness</p>
          <h2 className="text-2xl font-extrabold mb-4">How Old Is the Most Recent Signal?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Last Signal row in the Command Center tracks the most recent signal that passed your active filters. It shows direction, bars elapsed, and a freshness label. Watch the bar counter climb and the label change as the signal ages.</p>
          <FreshnessGaugeAnim />
        </motion.div>
      </section>

      {/* S14 Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-6">Signal Philosophy at a Glance</h2>
          <div className="p-5 rounded-2xl glass-card space-y-5">
            <div><p className="text-xs font-bold text-amber-400 mb-2">SIGNAL ORIGINS</p><div className="space-y-1 text-xs font-mono"><div className="flex gap-3"><span className="text-teal-400 font-bold w-24">PX</span><span className="text-gray-400">Pulse Cross — trend continuation. Body + distance + no rapid flip.</span></div><div className="flex gap-3"><span className="text-red-400 font-bold w-24">TS</span><span className="text-gray-400">Tension Snap — mean reversion. Stretch + snap + body + velocity + cooldown.</span></div></div></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">PIPELINE GATES</p><div className="space-y-1 text-xs font-mono">{[['1','Signal Engine','All / Trend / Reversal / Visuals Only'],['2','Direction','Both / Long Only / Short Only'],['3','Conviction','0–4 factors (ribbon, ADX, vol, health)'],['4','Strong Only','Gate at 3+/4 when ON'],['5','Final Gate','(PX OR TS) AND conviction >= min']].map(([n,g,r])=>(<div key={n} className="flex gap-3"><span className="text-gray-600">{n}</span><span className="text-white/70 w-28">{g}</span><span className="text-gray-500">{r}</span></div>))}</div></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">SIGNAL LABELS</p><div className="space-y-1 text-xs font-mono"><div className="flex gap-3"><span className="text-teal-400 font-bold">Long / Short</span><span className="text-gray-400">0–2/4 conviction — standard label</span></div><div className="flex gap-3"><span className="text-amber-400 font-bold">Long + / Short +</span><span className="text-gray-400">3–4/4 conviction — larger label with + marker</span></div></div></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">FRESHNESS</p><p className="text-xs font-mono text-gray-400">JUST FIRED (≤3b) &middot; FRESH (≤10b) &middot; ACTIVE (≤30b) &middot; AGING (30b+)</p></div>
          </div>
        </motion.div>
      </section>

      {/* S15 Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Signal Philosophy Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">What Operators Get Wrong</h2>
          <div className="space-y-3">
            {[
              {n:'01',t:'Treating silence as malfunction',b:'When CIPHER shows no signal, many assume the indicator is broken. Silence means the pipeline found a reason to block. Silence is the filter working correctly.'},
              {n:'02',t:'Using All Signals mode without HTF context',b:'All Signals enables both PX and TS simultaneously. Without a clear HTF bias, you will take trend signals in ranges and reversal signals in trends.'},
              {n:'03',t:'Ignoring the context tag',b:'Two signals with the same conviction can have very different structural context. Sweep+FVG and Momentum are not equivalent situations.'},
              {n:'04',t:'Chasing AGING signals',b:'When Last Signal shows AGING, the setup is 30+ bars in the past. Taking action on an AGING signal without a new setup forming is trading on stale information.'},
              {n:'05',t:'Enabling Strong Only to reduce losses, not improve quality',b:'Strong Only is a quality filter, not a loss prevention tool. It means 3+ market factors aligned. You still need confluence, structure, and timing.'},
              {n:'06',t:'Treating 2/4 and 4/4 signals identically',b:'Both passed the pipeline. But 4/4 has all four market dimensions aligned. 2/4 has two. That difference matters for position sizing and conviction.'},
            ].map(m=>(
              <div key={m.n} className="p-4 rounded-xl border border-red-500/25 bg-red-500/6">
                <div className="flex items-start gap-3"><span className="font-mono text-xs font-bold text-red-400/60 mt-0.5 shrink-0">{m.n}</span><div><p className="text-sm font-bold text-red-400 mb-1">{m.t}</p><p className="text-xs text-gray-400 leading-relaxed">{m.b}</p></div></div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S16 Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-6">Signal Architect &mdash; 5 Live Scenarios</h2>
          <div className="p-5 rounded-2xl glass-card">
            {(()=>{
              if(gameRound>=gameRounds.length){
                const fs=gameSelections.filter((s,i)=>s===gameRounds[i].options.find(o=>o.correct)?.id).length;
                return(<div className="text-center py-8"><p className="text-4xl font-extrabold text-amber-400 mb-2">{fs}/{gameRounds.length}</p><p className="text-gray-400 text-sm mt-1">{fs===5?'Perfect. You understand exactly how CIPHER qualifies signals.':fs>=3?'Solid. Review the rounds you missed.':'Study the pipeline sections above before the quiz.'}</p></div>);
              }
              const round=gameRounds[gameRound];const sel=gameSelections[gameRound];const answered=sel!==null;
              return(
                <div>
                  <div className="flex items-center justify-between mb-4"><p className="text-xs font-semibold text-amber-400 tracking-widest">ROUND {gameRound+1} OF {gameRounds.length}</p><div className="flex gap-1">{gameRounds.map((_,i)=><div key={i} className={`w-2 h-2 rounded-full ${i<gameRound?'bg-teal-400':i===gameRound?'bg-amber-400':'bg-gray-700'}`}/>)}</div></div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">{round.scenario}</p>
                  <div className="space-y-2 mb-4">
                    {round.options.map(opt=>{
                      const isSel=sel===opt.id;let cls='bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                      if(answered&&isSel&&opt.correct)cls='bg-green-500/10 border border-green-500/30';
                      if(answered&&isSel&&!opt.correct)cls='bg-red-500/10 border border-red-500/30';
                      if(answered&&!isSel&&opt.correct)cls='bg-green-500/5 border border-green-500/20';
                      return<button key={opt.id} onClick={()=>{if(answered)return;const n=[...gameSelections];n[gameRound]=opt.id;setGameSelections(n);}} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt.text}</button>;
                    })}
                  </div>
                  {answered&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-3 rounded-lg bg-white/[0.02] mb-4"><p className="text-xs text-amber-400">&#9989; {round.options.find(o=>o.id===sel)?.explain}</p></motion.div>}
                  {answered&&gameRound<gameRounds.length-1&&<button onClick={()=>setGameRound(r=>r+1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>}
                  {answered&&gameRound===gameRounds.length-1&&<button onClick={()=>setGameRound(gameRounds.length)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">See Results &rarr;</button>}
                </div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* S17 Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q,qi)=>{
              const answered=quizAnswers[qi]!==null;const sel=quizAnswers[qi];
              return(
                <div key={qi} className="p-5 rounded-2xl glass-card">
                  <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi+1} of {quizQuestions.length}</p>
                  <p className="text-sm font-semibold text-white mb-4">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map(opt=>{
                      const isSel=sel===opt.id;const isCorrect=opt.correct;
                      let cls='bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                      if(answered&&isSel&&isCorrect)cls='bg-green-500/10 border border-green-500/30';
                      if(answered&&isSel&&!isCorrect)cls='bg-red-500/10 border border-red-500/30';
                      if(answered&&!isSel&&isCorrect)cls='bg-green-500/5 border border-green-500/20';
                      return<button key={opt.id} onClick={()=>{if(quizAnswers[qi]!==null)return;const n=[...quizAnswers];n[qi]=opt.id;setQuizAnswers(n);if(n.every(a=>a!==null))setQuizSubmitted(true);}} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt.text}</button>;
                    })}
                  </div>
                  {answered&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400">&#9989; {q.explain}</p></motion.div>}
                </div>
              );
            })}
          </div>
          {quizSubmitted&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizPercent}%</p><p className="text-sm text-gray-400">{quizPassed?'You passed! Certificate unlocked below.':'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certRevealed&&(
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8}} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{background:'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))'}}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{animationDuration:'12s'}}/>
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9636;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.8: The Signal Philosophy</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{WebkitTransform:'translateZ(0)'}}>&mdash; Signal Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">{certId}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>
    </div>
  );
}
