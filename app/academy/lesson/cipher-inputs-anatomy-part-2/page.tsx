// app/academy/lesson/cipher-inputs-anatomy-part-2/page.tsx
// ATLAS Academy — Lesson 11.3b: CIPHER Inputs Anatomy — Part 2 (Behavioral Layer) [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Covers 3 behavioral-layer input groups: SIGNAL ENGINE (4), CIPHER RISK MAP (10),
// COMMAND CENTER row toggles (19 = master+pos+size+16 rows). 33 inputs total.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT (identical to 11.1/11.2/11.3a)
// ============================================================
function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawFn(ctx, rect.width, rect.height, frameRef.current);
      frameRef.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

// ============================================================
// BRAND COLORS
// ============================================================
const TEAL = 'rgba(38,166,154,1)';
const MAGENTA = 'rgba(239,83,80,1)';
const AMBER = 'rgba(255,179,0,1)';
const RED_BRIGHT = 'rgba(255,23,68,1)';
const WHITE_DIM = 'rgba(255,255,255,0.4)';
const WHITE_LBL = 'rgba(136,136,136,1)';

// ============================================================
// ANIMATION 1: The Arrow Tally (Groundbreaking Concept)
// Four upstream votes feed a tally bar — Ribbon · ADX · Volume · Momentum.
// Each vote lights up (teal) or stays dark. A dial on the right counts
// "YES" votes. An arrow is DRAWN only when 3+ of the 4 agree with the
// signal direction. This is the literal mechanic of Strong Signals Only.
// Teaches: every arrow on your chart is a TALLY, not a trigger.
// ============================================================
function ArrowTallyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE ARROW IS A TALLY — FOUR UPSTREAM VOTES DECIDE', w / 2, 16);

    // Layout
    const padL = 30;
    const padR = 30;
    const padT = 32;
    const padB = 24;
    const areaW = w - padL - padR;
    const areaH = h - padT - padB;

    // 3 columns: votes (left), tally gauge (middle), arrow outcome (right)
    const colGap = 14;
    const col1W = areaW * 0.42;
    const col2W = areaW * 0.18;
    const col3W = areaW * 0.35;
    const col1X = padL;
    const col2X = padL + col1W + colGap;
    const col3X = col2X + col2W + colGap;

    // Cycle — generate 4 different scenarios:
    //  Scenario 0: 4/4 agree → STRONG arrow
    //  Scenario 1: 3/4 agree → Barely-passing arrow
    //  Scenario 2: 2/4 agree → NO arrow (filtered out)
    //  Scenario 3: 1/4 agree → NO arrow (crushed)
    const scenarioDwell = 90; // frames per scenario
    const scenarioIdx = Math.floor(f / scenarioDwell) % 4;
    const localF = f % scenarioDwell;
    const localProgress = Math.min(1, localF / 30);

    // Vote table — row-major: [RibbonAligned, ADXStrong, VolumeExpanding, MomentumPositive]
    const voteTable = [
      [true, true, true, true],   // 4/4 → strong
      [true, true, true, false],  // 3/4 → barely
      [true, true, false, false], // 2/4 → filtered
      [true, false, false, false],// 1/4 → crushed
    ];
    const votes = voteTable[scenarioIdx];
    const voteCount = votes.filter(Boolean).length;
    const passed = voteCount >= 3;

    // --- COLUMN 1: the 4 voters ---
    const voters = [
      { name: 'RIBBON ALIGNED', detail: 'Core above Flow above Anchor' },
      { name: 'ADX > 20',       detail: 'Trend strength confirmed' },
      { name: 'VOLUME > 1.0×',   detail: 'Above-average participation' },
      { name: 'MOMENTUM > 50%', detail: 'Health score in the green' },
    ];
    const voterH = (areaH - 12) / 4;
    voters.forEach((v, vi) => {
      const ry = padT + vi * voterH;
      const active = votes[vi];
      const revealDelay = vi * 4;
      const voteProgress = Math.min(1, Math.max(0, (localF - revealDelay) / 18));

      // Card background
      const cardAlpha = active ? 0.12 + voteProgress * 0.08 : 0.06;
      ctx.fillStyle = `rgba(${active ? '38,166,154' : '255,255,255'},${cardAlpha})`;
      ctx.strokeStyle = active ? `rgba(38,166,154,${0.3 + voteProgress * 0.4})` : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(col1X, ry + 4, col1W, voterH - 8, 6);
      else ctx.rect(col1X, ry + 4, col1W, voterH - 8);
      ctx.fill();
      ctx.stroke();

      // Vote indicator dot
      const dotX = col1X + 14;
      const dotY = ry + voterH / 2;
      ctx.fillStyle = active ? TEAL : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (active) {
        // Teal ring flash
        const ringP = Math.min(1, voteProgress);
        ctx.strokeStyle = `rgba(38,166,154,${(1 - ringP) * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4.5 + ringP * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Voter name
      ctx.fillStyle = active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(v.name, col1X + 28, ry + voterH / 2 - 2);
      ctx.fillStyle = active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)';
      ctx.font = '8px system-ui';
      ctx.fillText(v.detail, col1X + 28, ry + voterH / 2 + 10);

      // YES / — badge on the right
      const badgeX = col1X + col1W - 36;
      const badgeY = ry + voterH / 2 - 8;
      ctx.fillStyle = 'rgba(11,14,18,0.8)';
      ctx.strokeStyle = active ? TEAL : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.8;
      ctx.fillRect(badgeX, badgeY, 28, 16);
      ctx.strokeRect(badgeX, badgeY, 28, 16);
      ctx.fillStyle = active ? TEAL : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(active ? 'YES' : '—', badgeX + 14, badgeY + 11);
    });

    // --- COLUMN 2: the tally gauge (vertical) ---
    // Mini pane
    ctx.fillStyle = 'rgba(20,24,32,0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col2X, padT + 4, col2W, areaH - 16, 8);
    else ctx.rect(col2X, padT + 4, col2W, areaH - 16);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TALLY', col2X + col2W / 2, padT + 18);

    // Big number
    const gaugeNumY = padT + 50;
    const numColor = voteCount >= 3 ? TEAL : voteCount === 2 ? AMBER : MAGENTA;
    ctx.fillStyle = numColor;
    ctx.font = 'bold 34px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${voteCount}`, col2X + col2W / 2, gaugeNumY);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('of 4', col2X + col2W / 2, gaugeNumY + 14);

    // 4-dot mini indicator
    const dotRowY = gaugeNumY + 38;
    for (let i = 0; i < 4; i++) {
      const dx = col2X + col2W / 2 - 18 + i * 12;
      ctx.fillStyle = votes[i] ? TEAL : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(dx, dotRowY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gate state
    const gateY = dotRowY + 22;
    ctx.fillStyle = passed ? TEAL : 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(passed ? 'PASSED' : 'FILTERED', col2X + col2W / 2, gateY);

    // --- COLUMN 3: the arrow outcome ---
    // Chart snippet showing a signal firing (or not)
    ctx.fillStyle = 'rgba(11,14,18,0.6)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col3X, padT + 4, col3W, areaH - 16, 8);
    else ctx.rect(col3X, padT + 4, col3W, areaH - 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CHART', col3X + col3W / 2, padT + 18);

    // Mini chart — rising price path
    const miniBars = 20;
    const miniX = col3X + 14;
    const miniY = padT + 32;
    const miniW = col3W - 28;
    const miniH = areaH - 72;
    ctx.strokeStyle = 'rgba(180,190,210,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < miniBars; i++) {
      const x = miniX + (i / (miniBars - 1)) * miniW;
      const norm = i / miniBars;
      const y = miniY + miniH - 8 - norm * (miniH - 16) + Math.sin(i * 0.5) * 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Arrow at the last bar (only if passed)
    if (passed && localProgress > 0.5) {
      const ax = miniX + miniW * 0.85;
      const ay = miniY + miniH - 8 - 0.75 * (miniH - 16) + Math.sin(17 * 0.5) * 3;
      const fireP = Math.min(1, (localProgress - 0.5) / 0.3);
      // Signal dot
      ctx.fillStyle = TEAL;
      ctx.globalAlpha = fireP;
      ctx.beginPath();
      ctx.arc(ax, ay + 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('L', ax, ay + 19);
      ctx.globalAlpha = 1;

      // Arrow callout text
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(voteCount === 4 ? 'STRONG SIGNAL' : 'BARELY PASSED', col3X + col3W / 2, padT + areaH - 24);
    } else if (!passed && localProgress > 0.5) {
      // FILTERED stamp
      const stampP = Math.min(1, (localProgress - 0.5) / 0.3);
      ctx.save();
      ctx.translate(col3X + col3W / 2, miniY + miniH / 2 + 10);
      ctx.rotate(-0.1);
      ctx.fillStyle = `rgba(239,83,80,${stampP * 0.7})`;
      ctx.strokeStyle = `rgba(239,83,80,${stampP})`;
      ctx.lineWidth = 1.5;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NO ARROW', 0, 4);
      ctx.beginPath();
      ctx.rect(-50, -10, 100, 20);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${voteCount}/4 VOTES — FILTERED`, col3X + col3W / 2, padT + areaH - 24);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Strong Signals Only gate = 3+ of 4 votes agreeing. The arrow is the tally, not the trigger.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Signal Engine 4-state switcher
// Cycles through All Signals / Trend / Reversal / Visuals Only, showing
// which signal types appear on a shared price path for each mode.
// Teaches: one dropdown, four completely different signal inventories.
// ============================================================
function SignalEngineSwitcherAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SIGNAL ENGINE — ONE DROPDOWN, FOUR DIFFERENT INVENTORIES', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 30;
    const padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Chart frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Cycle through modes
    const modes = ['All Signals', 'Trend', 'Reversal', 'Visuals Only'];
    const modeColors = [TEAL, 'rgba(38,166,154,0.8)', MAGENTA, 'rgba(255,255,255,0.6)'];
    const dwell = 80;
    const modeIdx = Math.floor(f / dwell) % modes.length;

    // Price path
    const bars = 40;
    const barW = chartW / bars;
    const priceYs: number[] = [];
    for (let i = 0; i < bars; i++) {
      const norm = i / bars;
      const base = chartH * 0.55 - norm * chartH * 0.15;
      const wave = Math.sin(i * 0.32) * 14 + Math.cos(i * 0.18) * 7;
      priceYs.push(padT + base + wave);
    }
    ctx.strokeStyle = 'rgba(200,210,230,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    priceYs.forEach((y, i) => {
      const x = padL + i * barW;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Signal inventory: px = Pulse Cross (trend), ts = Tension Snap (reversal)
    const signals: { bar: number; type: 'px' | 'ts'; dir: 'L' | 'S' }[] = [
      { bar: 5, type: 'px', dir: 'L' },
      { bar: 10, type: 'ts', dir: 'S' },
      { bar: 15, type: 'px', dir: 'L' },
      { bar: 20, type: 'ts', dir: 'L' },
      { bar: 25, type: 'px', dir: 'S' },
      { bar: 30, type: 'ts', dir: 'L' },
      { bar: 35, type: 'px', dir: 'L' },
    ];

    // Which signals show in each mode
    const visibleInMode = (s: { type: string }) => {
      if (modeIdx === 0) return true; // All Signals
      if (modeIdx === 1) return s.type === 'px'; // Trend (PX only)
      if (modeIdx === 2) return s.type === 'ts'; // Reversal (TS only)
      return false; // Visuals Only
    };

    signals.forEach((s) => {
      if (!visibleInMode(s)) return;
      const x = padL + s.bar * barW;
      const y = priceYs[s.bar];
      const offset = s.dir === 'L' ? 14 : -14;
      const color = s.dir === 'L' ? TEAL : MAGENTA;
      // dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y + offset, 4, 0, Math.PI * 2);
      ctx.fill();
      // letter
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.dir, x, y + offset + 3);
      // type label beneath
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(s.type.toUpperCase(), x, y + offset + (s.dir === 'L' ? 14 : -10));
    });

    // Mode badge (top left)
    const badgeX = padL + 10;
    const badgeY = padT + 10;
    ctx.fillStyle = 'rgba(11,14,18,0.85)';
    ctx.strokeStyle = modeColors[modeIdx];
    ctx.lineWidth = 1;
    ctx.fillRect(badgeX, badgeY, 130, 32);
    ctx.strokeRect(badgeX, badgeY, 130, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SIGNAL ENGINE', badgeX + 8, badgeY + 12);
    ctx.fillStyle = modeColors[modeIdx];
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(modes[modeIdx], badgeX + 8, badgeY + 25);

    // Signal count readout (top right)
    const visibleCount = signals.filter(visibleInMode).length;
    const countX = padL + chartW - 80;
    const countY = padT + 10;
    ctx.fillStyle = 'rgba(11,14,18,0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.fillRect(countX, countY, 70, 32);
    ctx.strokeRect(countX, countY, 70, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VISIBLE', countX + 35, countY + 12);
    ctx.fillStyle = modeColors[modeIdx];
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(`${visibleCount}`, countX + 35, countY + 28);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PX = Pulse Cross (trend signal) · TS = Tension Snap (reversal signal) · Visuals Only = no arrows at all.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: Direction Filter Split
// Same signal set, filtered through Both / Long Only / Short Only.
// Shows how a secondary filter further narrows the visible set after
// Signal Engine already did its filtering.
// ============================================================
function DirectionFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DIRECTION FILTER — THE SECOND GATE BEFORE AN ARROW FIRES', w / 2, 16);

    const padL = 20;
    const padR = 20;
    const padT = 30;
    const padB = 24;
    const totalW = w - padL - padR;
    const paneH = h - padT - padB;
    const paneGap = 8;
    const paneW = (totalW - paneGap * 2) / 3;

    const modes = [
      { name: 'BOTH', color: 'rgba(255,255,255,0.8)', filter: (dir: 'L' | 'S') => true },
      { name: 'LONG ONLY', color: TEAL, filter: (dir: 'L' | 'S') => dir === 'L' },
      { name: 'SHORT ONLY', color: MAGENTA, filter: (dir: 'L' | 'S') => dir === 'S' },
    ];

    const signals: { bar: number; dir: 'L' | 'S' }[] = [
      { bar: 4, dir: 'L' },
      { bar: 9, dir: 'S' },
      { bar: 14, dir: 'L' },
      { bar: 19, dir: 'S' },
      { bar: 24, dir: 'L' },
      { bar: 29, dir: 'S' },
    ];
    const bars = 34;

    modes.forEach((mode, mi) => {
      const paneX = padL + mi * (paneW + paneGap);

      // Pane frame
      ctx.fillStyle = 'rgba(11,14,18,0.5)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.6;
      ctx.fillRect(paneX, padT, paneW, paneH);
      ctx.strokeRect(paneX, padT, paneW, paneH);

      // Title
      ctx.fillStyle = mode.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(mode.name, paneX + paneW / 2, padT - 6);

      // Price path (shared shape, replicated in each pane)
      const barW = paneW / bars;
      ctx.strokeStyle = 'rgba(180,190,210,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const ys: number[] = [];
      for (let i = 0; i < bars; i++) {
        const norm = i / bars;
        const base = paneH * 0.55 - norm * paneH * 0.1;
        const wave = Math.sin(i * 0.35) * 12 + Math.cos(i * 0.2) * 5;
        ys.push(padT + base + wave);
        if (i === 0) ctx.moveTo(paneX + i * barW, ys[i]);
        else ctx.lineTo(paneX + i * barW, ys[i]);
      }
      ctx.stroke();

      // Signals filtered
      let visibleCount = 0;
      signals.forEach((s) => {
        if (!mode.filter(s.dir)) return;
        visibleCount++;
        const x = paneX + s.bar * barW;
        const y = ys[s.bar];
        const offset = s.dir === 'L' ? 12 : -12;
        const color = s.dir === 'L' ? TEAL : MAGENTA;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y + offset, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(s.dir, x, y + offset + 2);
      });

      // Count in corner
      ctx.fillStyle = mode.color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${visibleCount}`, paneX + paneW - 8, padT + paneH - 8);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '7px system-ui';
      ctx.fillText('signals', paneX + paneW - 8, padT + paneH - 18);
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Direction filter applied AFTER Signal Engine. Use Long Only in HTF bull, Short Only in HTF bear.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 4: Strong Signals Audit (the 4-factor conviction gauge)
// Four horizontal gauges showing the live values of Ribbon alignment,
// ADX, Volume ratio, Momentum health. A threshold line on each gauge
// marks the pass point. A status indicator shows how many factors pass,
// and whether Strong Signals Only would allow the signal through.
// ============================================================
function StrongSignalsAuditAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STRONG SIGNALS AUDIT — THE 4-FACTOR CONVICTION CHECK', w / 2, 16);

    const padL = 30;
    const padR = 100;
    const padT = 30;
    const padB = 24;
    const gaugesW = w - padL - padR;
    const gaugesH = h - padT - padB;

    // Cycle through 4 scenarios matching the Arrow Tally animation
    const dwell = 90;
    const scenarioIdx = Math.floor(f / dwell) % 4;
    const localF = f % dwell;
    const wiggle = Math.sin(f * 0.08) * 0.04;

    // Each factor: label, current value (0-1), threshold (0-1), suffix
    const scenarios = [
      [
        { name: 'RIBBON STACK', value: 0.85 + wiggle, threshold: 0.5, suffix: 'aligned' },
        { name: 'ADX',          value: 0.78 + wiggle, threshold: 0.50, suffix: '> 20' },
        { name: 'VOLUME',       value: 0.92 + wiggle, threshold: 0.50, suffix: '> 1.0×' },
        { name: 'MOMENTUM',     value: 0.88 + wiggle, threshold: 0.50, suffix: '> 50%' },
      ],
      [
        { name: 'RIBBON STACK', value: 0.72 + wiggle, threshold: 0.5, suffix: 'aligned' },
        { name: 'ADX',          value: 0.65 + wiggle, threshold: 0.50, suffix: '> 20' },
        { name: 'VOLUME',       value: 0.58 + wiggle, threshold: 0.50, suffix: '> 1.0×' },
        { name: 'MOMENTUM',     value: 0.32 + wiggle, threshold: 0.50, suffix: '> 50%' },
      ],
      [
        { name: 'RIBBON STACK', value: 0.68 + wiggle, threshold: 0.5, suffix: 'aligned' },
        { name: 'ADX',          value: 0.55 + wiggle, threshold: 0.50, suffix: '> 20' },
        { name: 'VOLUME',       value: 0.38 + wiggle, threshold: 0.50, suffix: '> 1.0×' },
        { name: 'MOMENTUM',     value: 0.28 + wiggle, threshold: 0.50, suffix: '> 50%' },
      ],
      [
        { name: 'RIBBON STACK', value: 0.55 + wiggle, threshold: 0.5, suffix: 'aligned' },
        { name: 'ADX',          value: 0.25 + wiggle, threshold: 0.50, suffix: '> 20' },
        { name: 'VOLUME',       value: 0.20 + wiggle, threshold: 0.50, suffix: '> 1.0×' },
        { name: 'MOMENTUM',     value: 0.18 + wiggle, threshold: 0.50, suffix: '> 50%' },
      ],
    ];
    const factors = scenarios[scenarioIdx];
    const passCount = factors.filter((fct) => fct.value >= fct.threshold).length;
    const passesFilter = passCount >= 3;

    // Draw 4 horizontal gauges
    const rowH = gaugesH / 4;
    factors.forEach((fct, fi) => {
      const ry = padT + fi * rowH;
      const barY = ry + rowH / 2 - 4;
      const barX = padL + 110;
      const barW = gaugesW - 130;
      const barH = 10;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(fct.name, padL + 100, ry + rowH / 2 + 3);

      // Threshold zone (red background, amber threshold marker)
      ctx.fillStyle = 'rgba(239,83,80,0.1)';
      ctx.fillRect(barX, barY, barW * fct.threshold, barH);
      ctx.fillStyle = 'rgba(38,166,154,0.08)';
      ctx.fillRect(barX + barW * fct.threshold, barY, barW * (1 - fct.threshold), barH);

      // Frame
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(barX, barY, barW, barH);

      // Threshold line
      const thrX = barX + barW * fct.threshold;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(thrX, barY - 2);
      ctx.lineTo(thrX, barY + barH + 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill (current value)
      const passes = fct.value >= fct.threshold;
      const fillColor = passes ? TEAL : MAGENTA;
      ctx.fillStyle = fillColor;
      ctx.fillRect(barX + 1, barY + 1, Math.max(2, (barW - 2) * Math.min(1, fct.value)), barH - 2);

      // Pass/Fail indicator (right side)
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(passes ? '✓' : '✕', barX + barW + 8, barY + 8);
    });

    // Right-hand panel — aggregate verdict
    const panelX = padL + gaugesW + 10;
    const panelY = padT + 4;
    const panelW = w - panelX - 8;
    const panelH = gaugesH - 8;
    ctx.fillStyle = 'rgba(20,24,32,0.9)';
    ctx.strokeStyle = passesFilter ? TEAL : MAGENTA;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VERDICT', panelX + panelW / 2, panelY + 14);

    ctx.fillStyle = passesFilter ? TEAL : MAGENTA;
    ctx.font = 'bold 28px system-ui';
    ctx.fillText(`${passCount}/4`, panelX + panelW / 2, panelY + 44);

    ctx.fillStyle = passesFilter ? TEAL : MAGENTA;
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(passesFilter ? 'PASSES' : 'FAILS', panelX + panelW / 2, panelY + 62);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText(passesFilter ? 'Arrow fires' : 'Signal hidden', panelX + panelW / 2, panelY + 74);

    // Requires 3/4 label at bottom of panel
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.fillText('needs 3/4', panelX + panelW / 2, panelY + panelH - 8);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Amber dashed line = threshold. Teal bar = pass, magenta bar = fail. Strong Signals gate: 3 of 4 minimum.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 5: Cipher Candles Spectrum
// Morphs through the 7 candle modes (Default → Trend → Trend Bold →
// Tension → Tension Bold → Composite → Composite Bold). Each mode
// recolors the same candle sequence to show what the mode encodes:
// velocity (Trend), stretch from Flow (Tension), or both + volume
// (Composite). Bold variants are for dark charts.
// ============================================================
function CipherCandlesSpectrumAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLE MODES — EVERY CANDLE ENCODES A DIMENSION', w / 2, 16);

    const padL = 30;
    const padR = 120;
    const padT = 30;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Chart frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // 7 modes
    const modes = [
      { name: 'Default', bold: false, dim: 'neutral' as const, note: 'Standard teal/magenta' },
      { name: 'Trend', bold: false, dim: 'velocity' as const, note: 'Colored by velocity' },
      { name: 'Trend Bold', bold: true, dim: 'velocity' as const, note: 'Bold for dark charts' },
      { name: 'Tension', bold: false, dim: 'tension' as const, note: 'Colored by stretch from Flow' },
      { name: 'Tension Bold', bold: true, dim: 'tension' as const, note: 'Bold tension gradient' },
      { name: 'Composite', bold: false, dim: 'composite' as const, note: 'Velocity + tension + volume' },
      { name: 'Composite Bold', bold: true, dim: 'composite' as const, note: 'Bold composite — every candle = 3 dimensions' },
    ];
    const dwell = 72;
    const modeIdx = Math.floor(f / dwell) % modes.length;
    const mode = modes[modeIdx];

    // Candle series
    const candleCount = 24;
    const candleW = (chartW - 20) / candleCount;
    const bodyW = Math.max(3, candleW * 0.65);

    // Velocity pattern — rises mid-series, fades at end
    // Tension pattern — stretches mid, reverts end
    // Build candles
    const candles: { o: number; h: number; l: number; c: number; v: number; ten: number }[] = [];
    for (let i = 0; i < candleCount; i++) {
      const norm = i / candleCount;
      const basePrice = chartH * 0.6 - norm * chartH * 0.3;
      const noise = Math.sin(i * 0.8) * 6;
      const openOffset = Math.sin(i * 0.9) * 3;
      const closeOffset = Math.cos(i * 0.7) * 5;
      const o = padT + basePrice + noise + openOffset;
      const c = padT + basePrice + noise + closeOffset - 2;
      const h2 = Math.min(o, c) - (3 + Math.abs(Math.sin(i * 1.1)) * 4);
      const l = Math.max(o, c) + (3 + Math.abs(Math.cos(i * 1.3)) * 4);
      // velocity: high when c-o is large with correct sign
      const velocity = (o - c) / 10; // positive = bullish velocity
      // tension: stretch from flow — peaks mid-series
      const tension = Math.exp(-Math.pow((i - 14) / 6, 2)) * 0.8 + 0.1;
      candles.push({ o, h: h2, l, c, v: velocity, ten: tension });
    }

    // Colour a candle based on mode
    const colorFor = (cd: typeof candles[0]): { stroke: string; fill: string } => {
      const isBull = cd.c < cd.o;
      const baseColor = isBull ? [38, 166, 154] : [239, 83, 80];
      const boldMult = mode.bold ? 1 : 0.75;

      if (mode.dim === 'neutral') {
        const a = 0.75 * boldMult;
        return { stroke: `rgba(${baseColor.join(',')},${a})`, fill: `rgba(${baseColor.join(',')},${a})` };
      }
      if (mode.dim === 'velocity') {
        // Fade by absolute velocity — low velocity = dim
        const intensity = 0.35 + Math.min(1, Math.abs(cd.v) * 1.5) * 0.6;
        const a = intensity * boldMult;
        return { stroke: `rgba(${baseColor.join(',')},${a})`, fill: `rgba(${baseColor.join(',')},${a})` };
      }
      if (mode.dim === 'tension') {
        // High tension = amber tint, low = base color
        if (cd.ten > 0.6) {
          return { stroke: `rgba(255,179,0,${0.8 * boldMult})`, fill: `rgba(255,179,0,${0.8 * boldMult})` };
        }
        const a = 0.4 + cd.ten * 0.4;
        return { stroke: `rgba(${baseColor.join(',')},${a * boldMult})`, fill: `rgba(${baseColor.join(',')},${a * boldMult})` };
      }
      // composite — all three dimensions blended
      const velIntensity = Math.min(1, Math.abs(cd.v) * 1.5);
      const tenIntensity = cd.ten;
      if (tenIntensity > 0.7) {
        return { stroke: `rgba(255,179,0,${0.9 * boldMult})`, fill: `rgba(255,179,0,${0.9 * boldMult})` };
      }
      const a = 0.35 + velIntensity * 0.45;
      return { stroke: `rgba(${baseColor.join(',')},${a * boldMult})`, fill: `rgba(${baseColor.join(',')},${a * boldMult})` };
    };

    candles.forEach((cd, i) => {
      const x = padL + 10 + i * candleW + candleW / 2;
      const { stroke, fill } = colorFor(cd);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, cd.h);
      ctx.lineTo(x, cd.l);
      ctx.stroke();
      ctx.fillStyle = fill;
      ctx.fillRect(x - bodyW / 2, Math.min(cd.o, cd.c), bodyW, Math.abs(cd.c - cd.o));
    });

    // Mode panel (right)
    const panelX = padL + chartW + 10;
    const panelY = padT + 4;
    const panelW = w - panelX - 8;
    const panelH = chartH - 8;
    ctx.fillStyle = 'rgba(20,24,32,0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MODE', panelX + panelW / 2, panelY + 14);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(mode.name, panelX + panelW / 2, panelY + 36);

    // Encodes
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ENCODES', panelX + panelW / 2, panelY + 58);
    const encodings = {
      neutral: ['Direction', 'only'],
      velocity: ['Velocity', 'gradient'],
      tension: ['Stretch', 'from Flow'],
      composite: ['Vel + Ten', '+ Volume'],
    };
    const enc = encodings[mode.dim];
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText(enc[0], panelX + panelW / 2, panelY + 74);
    ctx.fillText(enc[1], panelX + panelW / 2, panelY + 86);

    // Bold indicator
    if (mode.bold) {
      ctx.fillStyle = 'rgba(255,196,61,1)';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('● BOLD', panelX + panelW / 2, panelY + panelH - 16);
    }

    // Dot indicator for mode position (7 dots)
    for (let i = 0; i < 7; i++) {
      const dx = panelX + panelW / 2 - 21 + i * 7;
      ctx.fillStyle = i === modeIdx ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(dx, panelY + panelH - 30, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(mode.note, w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 6: Risk Map Overview
// A signal fires; the full trade plan is drawn:
//   Entry → SL (magenta dotted below) → TP1/TP2/TP3 (teal dotted above)
// Shows how ONE signal produces FIVE price levels automatically. Teaches:
// the Risk Map is the "what happens after the arrow" — entry exit tempos.
// ============================================================
function RiskMapOverviewAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RISK MAP — ONE SIGNAL, FIVE PRICE LEVELS, FULL TRADE PLAN', w / 2, 16);

    const padL = 30;
    const padR = 90;
    const padT = 30;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Price levels
    const entryY = padT + chartH * 0.55;
    const slY = entryY + chartH * 0.15; // below for long
    const tp1Y = entryY - chartH * 0.15; // 1R
    const tp2Y = entryY - chartH * 0.30; // 2R
    const tp3Y = entryY - chartH * 0.42; // 3R
    const entryBar = 0.35; // fraction of chart

    // Reveal cycle — show each level progressively
    const cycle = (t * 0.05) % 1;
    const revealPhase = cycle < 0.15 ? 0 :
                       cycle < 0.30 ? 1 :
                       cycle < 0.45 ? 2 :
                       cycle < 0.60 ? 3 :
                       cycle < 0.75 ? 4 : 5;

    // Price path
    const bars = 30;
    const barW = chartW / bars;
    ctx.strokeStyle = 'rgba(200,210,230,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const norm = i / bars;
      const y = padT + chartH * 0.55 - Math.sin(i * 0.4) * 8 + (norm > entryBar ? -(norm - entryBar) * chartH * 0.5 : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Entry marker (signal arrow)
    const entryX = padL + chartW * entryBar;
    if (revealPhase >= 0) {
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(entryX, entryY + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('L', entryX, entryY + 15);
    }

    // Entry level line (white)
    if (revealPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(padL + chartW, entryY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('ENTRY', padL + chartW + 6, entryY + 3);
    }

    // SL line (magenta dotted)
    if (revealPhase >= 1) {
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, slY);
      ctx.lineTo(padL + chartW, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('SL', padL + chartW + 6, slY + 3);
    }

    // TP1 line
    if (revealPhase >= 2) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, tp1Y);
      ctx.lineTo(padL + chartW, tp1Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('TP1 · 1R', padL + chartW + 6, tp1Y + 3);
    }

    // TP2 line
    if (revealPhase >= 3) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, tp2Y);
      ctx.lineTo(padL + chartW, tp2Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('TP2 · 2R', padL + chartW + 6, tp2Y + 3);
    }

    // TP3 line
    if (revealPhase >= 4) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, tp3Y);
      ctx.lineTo(padL + chartW, tp3Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('TP3 · 3R', padL + chartW + 6, tp3Y + 3);
    }

    // Risk/reward shading
    if (revealPhase >= 4) {
      // red zone (between entry and SL)
      ctx.fillStyle = 'rgba(239,83,80,0.08)';
      ctx.fillRect(entryX, entryY, chartW - (entryX - padL), slY - entryY);
      // green zone (between entry and TP3)
      ctx.fillStyle = 'rgba(38,166,154,0.06)';
      ctx.fillRect(entryX, tp3Y, chartW - (entryX - padL), entryY - tp3Y);
    }

    // Phase label (top right)
    const phaseLabels = ['Entry fires', '+ SL drawn', '+ TP1', '+ TP2', '+ TP3', 'COMPLETE'];
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(phaseLabels[revealPhase], padL + chartW - 6, padT + 14);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('A single signal anchors a full trade plan. Risk Map = the math of what happens after the arrow.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: SL Method Comparison
// 4 panes, same signal + same chart. Each pane shows a different
// Stop Loss method: Auto / Structure / Pulse / ATR. Same entry, four
// different stop placements. Teaches: the method is a philosophy — stop
// close to structure (Structure), stop at the trigger line (Pulse), or
// stop at fixed volatility distance (ATR).
// ============================================================
function SLMethodComparisonAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STOP LOSS METHODS — SAME SIGNAL, FOUR PHILOSOPHIES', w / 2, 16);

    const padL = 16;
    const padR = 16;
    const padT = 28;
    const padB = 22;
    const totalW = w - padL - padR;
    const paneH = h - padT - padB;
    const paneGap = 6;
    const paneW = (totalW - paneGap * 3) / 4;

    const methods = [
      { name: 'AUTO', slFrac: 0.22, color: AMBER, detail: 'Per asset class' },
      { name: 'STRUCTURE', slFrac: 0.18, color: 'rgba(38,166,154,0.85)', detail: 'At swing low' },
      { name: 'PULSE', slFrac: 0.12, color: 'rgba(38,166,154,0.85)', detail: 'At Pulse line' },
      { name: 'ATR', slFrac: 0.14, color: MAGENTA, detail: '1.5× ATR' },
    ];

    const bars = 22;

    methods.forEach((m, mi) => {
      const paneX = padL + mi * (paneW + paneGap);
      const entryY = padT + paneH * 0.5;
      const slY = entryY + paneH * m.slFrac;

      // Pane frame
      ctx.fillStyle = 'rgba(11,14,18,0.5)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.6;
      ctx.fillRect(paneX, padT, paneW, paneH);
      ctx.strokeRect(paneX, padT, paneW, paneH);

      // Title
      ctx.fillStyle = m.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, paneX + paneW / 2, padT - 4);

      // Price path — generic up-trend with pullback
      const barW = paneW / bars;
      ctx.strokeStyle = 'rgba(180,190,210,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const x = paneX + i * barW;
        const norm = i / bars;
        const y = padT + paneH * 0.6 - norm * paneH * 0.25 + Math.sin(i * 0.45) * 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Entry
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(paneX + paneW * 0.35, entryY + 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('L', paneX + paneW * 0.35, entryY + 12);

      // Entry line
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(paneX + 4, entryY);
      ctx.lineTo(paneX + paneW - 4, entryY);
      ctx.stroke();

      // SL line
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(paneX + 4, slY);
      ctx.lineTo(paneX + paneW - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);

      // SL distance indicator (brace)
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(paneX + paneW - 16, entryY);
      ctx.lineTo(paneX + paneW - 16, slY);
      ctx.moveTo(paneX + paneW - 19, entryY);
      ctx.lineTo(paneX + paneW - 13, entryY);
      ctx.moveTo(paneX + paneW - 19, slY);
      ctx.lineTo(paneX + paneW - 13, slY);
      ctx.stroke();

      // Detail
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.detail, paneX + paneW / 2, padT + paneH - 8);

      // Pulse line visualization for PULSE method
      if (m.name === 'PULSE') {
        const pulseLineY = entryY + paneH * 0.10;
        ctx.strokeStyle = 'rgba(38,166,154,0.6)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(paneX + 4, pulseLineY);
        ctx.lineTo(paneX + paneW - 4, pulseLineY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stop position changes with method. Auto = CIPHER decides per asset class. Same entry, different risk.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: Asset-Class Routing
// Shows how "Auto" SL method resolves differently per asset class:
//   Crypto → Structure
//   Forex → Pulse
//   Stocks/Indices → Structure
// Three asset icons on the left, an Auto resolver box in the middle,
// an SL method output on the right. Cycles showing resolution.
// ============================================================
function AssetClassRoutingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('AUTO MODE — THE ASSET-CLASS RESOLVER', w / 2, 16);

    const padL = 30;
    const padR = 30;
    const padT = 36;
    const padB = 24;
    const areaW = w - padL - padR;
    const areaH = h - padT - padB;

    // Cycle through 3 asset classes
    const assets = [
      { name: 'CRYPTO', example: 'BTCUSDT', sl: 'STRUCTURE', tp: 'R-MULTIPLE', color: '#F7931A' },
      { name: 'FOREX', example: 'GBPUSD', sl: 'PULSE', tp: 'ATR TARGETS', color: 'rgba(38,166,154,0.85)' },
      { name: 'STOCKS / INDICES', example: 'SPY', sl: 'STRUCTURE', tp: 'STRUCTURE', color: 'rgba(255,196,61,1)' },
    ];
    const dwell = 84;
    const idx = Math.floor(f / dwell) % assets.length;
    const localF = f % dwell;
    const progress = Math.min(1, localF / 30);
    const current = assets[idx];

    // 3-column layout
    const colGap = 18;
    const colW = (areaW - colGap * 2) / 3;
    const col1X = padL;
    const col2X = col1X + colW + colGap;
    const col3X = col2X + colW + colGap;

    // --- Col 1: asset tag ---
    ctx.fillStyle = 'rgba(20,24,32,0.85)';
    ctx.strokeStyle = current.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col1X, padT + 4, colW, areaH - 24, 10);
    else ctx.rect(col1X, padT + 4, colW, areaH - 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ASSET CLASS', col1X + colW / 2, padT + 22);

    ctx.fillStyle = current.color;
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(current.name, col1X + colW / 2, padT + 48);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'italic 10px system-ui';
    ctx.fillText(`e.g. ${current.example}`, col1X + colW / 2, padT + 66);

    // --- Col 2: the Auto resolver ---
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col2X, padT + 4, colW, areaH - 24, 10);
    else ctx.rect(col2X, padT + 4, colW, areaH - 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('AUTO RESOLVER', col2X + colW / 2, padT + 22);

    // Animated "thinking" dots
    const dotCount = 3;
    for (let i = 0; i < dotCount; i++) {
      const phase = (t * 2 - i * 0.5) % 2;
      const dotAlpha = phase < 1 ? 0.3 + Math.sin(phase * Math.PI) * 0.7 : 0.3;
      ctx.fillStyle = `rgba(255,179,0,${dotAlpha})`;
      ctx.beginPath();
      ctx.arc(col2X + colW / 2 - 14 + i * 14, padT + 46, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arrow from col 1 to col 2
    const arrow1Y = padT + 46;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(col1X + colW + 2, arrow1Y);
    ctx.lineTo(col2X - 2, arrow1Y);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(col2X - 2, arrow1Y);
    ctx.lineTo(col2X - 8, arrow1Y - 3);
    ctx.lineTo(col2X - 8, arrow1Y + 3);
    ctx.closePath();
    ctx.fill();

    // Resolution label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('resolves to', col2X + colW / 2, padT + 74);

    // --- Col 3: resolved SL/TP ---
    ctx.fillStyle = 'rgba(11,14,18,0.7)';
    ctx.strokeStyle = 'rgba(38,166,154,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col3X, padT + 4, colW, areaH - 24, 10);
    else ctx.rect(col3X, padT + 4, colW, areaH - 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RESOLVED', col3X + colW / 2, padT + 22);

    // SL row
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SL METHOD', col3X + 14, padT + 42);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'right';
    ctx.globalAlpha = progress;
    ctx.fillText(current.sl, col3X + colW - 14, padT + 42);
    ctx.globalAlpha = 1;

    // TP row
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TP METHOD', col3X + 14, padT + 64);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'right';
    ctx.globalAlpha = progress;
    ctx.fillText(current.tp, col3X + colW - 14, padT + 64);
    ctx.globalAlpha = 1;

    // Arrow col 2 → col 3
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(col2X + colW + 2, arrow1Y);
    ctx.lineTo(col3X - 2, arrow1Y);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(col3X - 2, arrow1Y);
    ctx.lineTo(col3X - 8, arrow1Y - 3);
    ctx.lineTo(col3X - 8, arrow1Y + 3);
    ctx.closePath();
    ctx.fill();

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Auto is not one method — it is a per-asset ROUTER. Crypto gets structure, Forex gets Pulse, Stocks get Structure.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 9: TP Method Comparison
// 4 panes, same entry + same chart, 4 different Take Profit methods:
//   Auto / R-Multiple / Structure / ATR Targets
// Shows TP1/TP2/TP3 at different price levels for each method.
// Teaches: TP method is the "how far" decision, mirrored to SL's "how close".
// ============================================================
function TPMethodComparisonAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TP METHODS — FOUR WAYS TO PLACE YOUR TARGETS', w / 2, 16);

    const padL = 16;
    const padR = 16;
    const padT = 28;
    const padB = 22;
    const totalW = w - padL - padR;
    const paneH = h - padT - padB;
    const paneGap = 6;
    const paneW = (totalW - paneGap * 3) / 4;

    // Each method: TP1/TP2/TP3 as fractions of pane height above entry
    const methods = [
      { name: 'AUTO', tps: [0.12, 0.24, 0.40], color: AMBER, note: 'Per asset' },
      { name: 'R-MULTIPLE', tps: [0.15, 0.30, 0.45], color: 'rgba(38,166,154,0.85)', note: '1R / 2R / 3R' },
      { name: 'STRUCTURE', tps: [0.14, 0.22, 0.38], color: 'rgba(38,166,154,0.85)', note: 'Next S/R' },
      { name: 'ATR TARGETS', tps: [0.10, 0.20, 0.30], color: MAGENTA, note: 'Fixed ATR' },
    ];

    const bars = 22;

    methods.forEach((m, mi) => {
      const paneX = padL + mi * (paneW + paneGap);
      const entryY = padT + paneH * 0.6;

      ctx.fillStyle = 'rgba(11,14,18,0.5)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.6;
      ctx.fillRect(paneX, padT, paneW, paneH);
      ctx.strokeRect(paneX, padT, paneW, paneH);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, paneX + paneW / 2, padT - 4);

      // Price path
      const barW = paneW / bars;
      ctx.strokeStyle = 'rgba(180,190,210,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const x = paneX + i * barW;
        const norm = i / bars;
        const y = padT + paneH * 0.65 - norm * paneH * 0.25 + Math.sin(i * 0.45) * 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Entry dot and line
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(paneX + paneW * 0.35, entryY + 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('L', paneX + paneW * 0.35, entryY + 12);

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(paneX + 4, entryY);
      ctx.lineTo(paneX + paneW - 4, entryY);
      ctx.stroke();

      // 3 TPs
      m.tps.forEach((tpFrac, ti) => {
        const tpY = entryY - paneH * tpFrac;
        const alpha = 0.4 + ti * 0.2;
        ctx.strokeStyle = `rgba(38,166,154,${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(paneX + 4, tpY);
        ctx.lineTo(paneX + paneW - 4, tpY);
        ctx.stroke();
        ctx.setLineDash([]);
        // TP# label
        ctx.fillStyle = `rgba(38,166,154,${alpha + 0.2})`;
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(`TP${ti + 1}`, paneX + paneW - 6, tpY + 3);
      });

      // Method note
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.note, paneX + paneW / 2, padT + paneH - 8);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same entry, same chart, four different target sets. The method decides the geometry.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 10: TP1 / TP2 / TP3 Scale-Out
// Animated runner showing a trade going from Entry → TP1 (1R) → TP2
// (2R) → TP3 (3R). Position-size bar shrinks at each scale-out (33% off
// at each TP). SL auto-moves to BE after TP1 hits. Teaches: the full
// scale-out discipline baked into CIPHER's Risk Map.
// ============================================================
function TPScaleOutAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TP1 · TP2 · TP3 — THE SCALE-OUT DISCIPLINE', w / 2, 16);

    const padL = 30;
    const padR = 100;
    const padT = 30;
    const padB = 26;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Levels
    const entryY = padT + chartH * 0.75;
    const slY = entryY + chartH * 0.15;
    const slBEy = entryY; // moved to BE after TP1
    const tp1Y = entryY - chartH * 0.18;
    const tp2Y = entryY - chartH * 0.36;
    const tp3Y = entryY - chartH * 0.55;

    // Progression cycle
    const cycle = (t * 0.055) % 1;
    let stage = 0; // 0=entry, 1=TP1 hit, 2=TP2 hit, 3=TP3 hit, 4=reset
    if (cycle < 0.15) stage = 0;
    else if (cycle < 0.38) stage = 1;
    else if (cycle < 0.61) stage = 2;
    else if (cycle < 0.84) stage = 3;
    else stage = 4;

    // Bars and runner position
    const bars = 50;
    const barW = chartW / bars;
    const runnerFrac = cycle < 0.15 ? cycle / 0.15 * 0.1 :
                       cycle < 0.38 ? 0.1 + (cycle - 0.15) / 0.23 * 0.30 :
                       cycle < 0.61 ? 0.40 + (cycle - 0.38) / 0.23 * 0.25 :
                       cycle < 0.84 ? 0.65 + (cycle - 0.61) / 0.23 * 0.25 : 0.90;
    const runnerX = padL + chartW * runnerFrac;

    // Runner Y — rides up the price path
    const runnerY = stage === 0 ? entryY :
                    stage === 1 ? tp1Y :
                    stage === 2 ? tp2Y :
                    stage === 3 ? tp3Y : tp3Y;

    // Entry line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, entryY);
    ctx.lineTo(padL + chartW, entryY);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('ENTRY', padL - 4, entryY + 3);

    // SL line — magenta, moved to BE after TP1
    const currentSL = stage >= 1 ? slBEy : slY;
    ctx.strokeStyle = stage >= 1 ? AMBER : MAGENTA;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, currentSL);
    ctx.lineTo(padL + chartW, currentSL);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = stage >= 1 ? AMBER : MAGENTA;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(stage >= 1 ? 'SL → BE' : 'SL · 1R', padL - 4, currentSL + 3);

    // TP lines — filled as they hit
    const tpLevels = [
      { y: tp1Y, label: 'TP1 · 1R', hit: stage >= 1 },
      { y: tp2Y, label: 'TP2 · 2R', hit: stage >= 2 },
      { y: tp3Y, label: 'TP3 · 3R', hit: stage >= 3 },
    ];
    tpLevels.forEach((lvl) => {
      const alpha = lvl.hit ? 0.35 : 1;
      ctx.strokeStyle = `rgba(38,166,154,${alpha})`;
      ctx.lineWidth = lvl.hit ? 0.8 : 1.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(padL, lvl.y);
      ctx.lineTo(padL + chartW, lvl.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = lvl.hit ? `rgba(38,166,154,${alpha})` : TEAL;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(lvl.hit ? `✓ ${lvl.label}` : lvl.label, padL - 4, lvl.y + 3);
    });

    // Price path (static illustrative rise)
    ctx.strokeStyle = 'rgba(180,190,210,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const norm = i / bars;
      let y;
      if (norm < 0.1) y = entryY + Math.sin(i * 0.6) * 3;
      else if (norm < 0.40) y = entryY - (norm - 0.1) / 0.3 * (entryY - tp1Y) + Math.sin(i * 0.6) * 3;
      else if (norm < 0.65) y = tp1Y - (norm - 0.40) / 0.25 * (tp1Y - tp2Y) + Math.sin(i * 0.5) * 3;
      else if (norm < 0.90) y = tp2Y - (norm - 0.65) / 0.25 * (tp2Y - tp3Y) + Math.sin(i * 0.5) * 3;
      else y = tp3Y + Math.sin(i * 0.7) * 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Runner dot
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(runnerX, runnerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // TP hit flash
    if (cycle > 0.13 && cycle < 0.18) {
      const fp = (cycle - 0.13) / 0.05;
      ctx.strokeStyle = `rgba(38,166,154,${(1 - fp) * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(padL + chartW * 0.4, tp1Y, 5 + fp * 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Position-size panel (right)
    const panelX = padL + chartW + 10;
    const panelY = padT + 4;
    const panelW = w - panelX - 8;
    const panelH = chartH - 8;
    ctx.fillStyle = 'rgba(20,24,32,0.9)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('POSITION', panelX + panelW / 2, panelY + 14);

    // Size bar - shrinks at each TP (33% off per TP)
    const sizeLevels = [1.0, 0.67, 0.33, 0];
    const currentSize = sizeLevels[Math.min(stage, 3)];
    const barTotalH = panelH - 60;
    const barX = panelX + panelW / 2 - 12;
    const barY = panelY + 24;
    // Empty frame
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, 24, barTotalH);
    // Fill (shrinks from top)
    const fillH = barTotalH * currentSize;
    ctx.fillStyle = TEAL;
    ctx.fillRect(barX + 1, barY + barTotalH - fillH + 1, 22, fillH - 2);

    // Size label
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(currentSize * 100)}%`, panelX + panelW / 2, panelY + panelH - 24);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '8px system-ui';
    ctx.fillText('remaining', panelX + panelW / 2, panelY + panelH - 10);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TP1 hits → 33% off + SL to BE. TP2 → 33% off. TP3 → final third. Three exits, one trade.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 11: Panel Positioning
// Shows the 4 Command Center positions (TL/TR/BL/BR) by moving the
// panel block through each corner on a mock chart. Also toggles SIZE
// at each corner showing Small/Normal/Large proportions.
// ============================================================
function PanelPositioningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMMAND CENTER — POSITION × SIZE', w / 2, 16);

    const padL = 20;
    const padR = 20;
    const padT = 30;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Mock chart frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Draw a mock price path + some candles in the background
    const bars = 50;
    const barW = chartW / bars;
    ctx.strokeStyle = 'rgba(180,190,210,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const norm = i / bars;
      const y = padT + chartH * 0.6 - norm * chartH * 0.3 + Math.sin(i * 0.4) * 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Cycle through 4 positions × 3 sizes = 12 configurations
    const positions = [
      { name: 'Top Left', anchor: 'tl' as const },
      { name: 'Top Right', anchor: 'tr' as const },
      { name: 'Bottom Left', anchor: 'bl' as const },
      { name: 'Bottom Right', anchor: 'br' as const },
    ];
    const sizes = [
      { name: 'Small', scale: 0.7 },
      { name: 'Normal', scale: 1.0 },
      { name: 'Large', scale: 1.3 },
    ];

    const dwell = 36;
    const comboIdx = Math.floor(f / dwell) % (positions.length * sizes.length);
    const posIdx = Math.floor(comboIdx / sizes.length);
    const sizeIdx = comboIdx % sizes.length;
    const pos = positions[posIdx];
    const size = sizes[sizeIdx];

    // Panel base dimensions
    const basePanelW = 110 * size.scale;
    const basePanelH = 80 * size.scale;

    // Anchor to corner
    let px = 0, py = 0;
    if (pos.anchor === 'tl') { px = padL + 12; py = padT + 12; }
    if (pos.anchor === 'tr') { px = padL + chartW - basePanelW - 12; py = padT + 12; }
    if (pos.anchor === 'bl') { px = padL + 12; py = padT + chartH - basePanelH - 12; }
    if (pos.anchor === 'br') { px = padL + chartW - basePanelW - 12; py = padT + chartH - basePanelH - 12; }

    // Draw panel with mini fake rows
    ctx.fillStyle = 'rgba(6,10,18,0.9)';
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, basePanelW, basePanelH, 4);
    else ctx.rect(px, py, basePanelW, basePanelH);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = AMBER;
    ctx.font = `bold ${Math.round(7 * size.scale)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER PRO', px + basePanelW / 2, py + 10 * size.scale);

    // Fake rows (5 mini rows with colored dots)
    const rowColors = [TEAL, AMBER, TEAL, 'rgba(255,255,255,0.6)', MAGENTA];
    const rowCount = 5;
    const rowH = (basePanelH - 16 * size.scale) / rowCount;
    for (let ri = 0; ri < rowCount; ri++) {
      const ry = py + 14 * size.scale + ri * rowH;
      ctx.fillStyle = rowColors[ri];
      ctx.beginPath();
      ctx.arc(px + 6 * size.scale, ry + rowH / 2, 1.5 * size.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(px + 12 * size.scale, ry + rowH / 2 - 0.5, basePanelW - 18 * size.scale, 1);
    }

    // Config label at the corner opposite to the panel
    const labelW = 150;
    const labelH = 36;
    let labelX = 0, labelY = 0;
    if (pos.anchor === 'tl' || pos.anchor === 'bl') {
      labelX = padL + chartW - labelW - 12;
      labelY = padT + chartH / 2 - labelH / 2;
    } else {
      labelX = padL + 12;
      labelY = padT + chartH / 2 - labelH / 2;
    }
    ctx.fillStyle = 'rgba(20,24,32,0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.fillRect(labelX, labelY, labelW, labelH);
    ctx.strokeRect(labelX, labelY, labelW, labelH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('POSITION', labelX + 8, labelY + 12);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(pos.name, labelX + 8, labelY + 24);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(size.name, labelX + labelW - 8, labelY + 24);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Position = 4 corners · Size = 3 scales. Pine default: Bottom Right · Small.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 12: Row Family Overview
// Shows the 16 row toggles grouped by family:
//   Trend family: Ribbon, Pulse, Tension, Momentum
//   Energy family: Volatility & Squeeze, Volume
//   Risk family: Risk Envelope
//   Structure family: Structure, Imbalance, Sweeps
//   Context family: Market Bias, Session, Regime, HTF Trend
//   Signal family: Last Signal, Live Conditions
// Family groups cycle highlighting one at a time.
// ============================================================
function RowFamilyOverviewAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 16 ROW TOGGLES — ORGANIZED BY FAMILY', w / 2, 16);

    const padL = 30;
    const padR = 30;
    const padT = 32;
    const padB = 24;
    const areaW = w - padL - padR;
    const areaH = h - padT - padB;

    // Families — 6 groups
    const families = [
      { name: 'TREND', color: TEAL, rows: ['Ribbon', 'Pulse', 'Tension', 'Momentum'] },
      { name: 'ENERGY', color: AMBER, rows: ['Volatility & Squeeze', 'Volume'] },
      { name: 'RISK', color: MAGENTA, rows: ['Risk Envelope'] },
      { name: 'STRUCTURE', color: 'rgba(38,166,154,0.75)', rows: ['Structure', 'Imbalance', 'Sweeps'] },
      { name: 'CONTEXT', color: 'rgba(255,255,255,0.75)', rows: ['Market Bias', 'Session', 'Regime', 'HTF Trend'] },
      { name: 'SIGNAL', color: 'rgba(255,196,61,1)', rows: ['Last Signal', 'Live Conditions'] },
    ];

    const dwell = 60;
    const activeFamily = Math.floor(f / dwell) % families.length;

    // 2-column layout: family list on the left, row list on the right
    const colGap = 16;
    const col1W = areaW * 0.3;
    const col2W = areaW * 0.65;
    const col1X = padL;
    const col2X = padL + col1W + colGap;

    // Column 1 — family labels
    const familyRowH = areaH / families.length;
    families.forEach((fam, fi) => {
      const ry = padT + fi * familyRowH;
      const active = fi === activeFamily;

      if (active) {
        ctx.fillStyle = `rgba(${fam.name === 'TREND' ? '38,166,154' :
                                fam.name === 'ENERGY' ? '255,179,0' :
                                fam.name === 'RISK' ? '239,83,80' :
                                '255,255,255'},0.12)`;
        ctx.fillRect(col1X, ry, col1W, familyRowH);
      }

      // Family color dot
      ctx.fillStyle = fam.color;
      ctx.beginPath();
      ctx.arc(col1X + 8, ry + familyRowH / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = active ? fam.color : 'rgba(255,255,255,0.55)';
      ctx.font = active ? 'bold 11px system-ui' : 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(fam.name, col1X + 18, ry + familyRowH / 2 + 3);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px system-ui';
      ctx.fillText(`${fam.rows.length} row${fam.rows.length > 1 ? 's' : ''}`, col1X + col1W - 36, ry + familyRowH / 2 + 3);
    });

    // Column 2 — rows of the active family
    ctx.fillStyle = 'rgba(20,24,32,0.7)';
    ctx.strokeStyle = families[activeFamily].color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(col2X, padT + 4, col2W, areaH - 8, 8);
    else ctx.rect(col2X, padT + 4, col2W, areaH - 8);
    ctx.fill();
    ctx.stroke();

    // Active family name at top
    ctx.fillStyle = families[activeFamily].color;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(families[activeFamily].name + ' FAMILY', col2X + col2W / 2, padT + 22);

    // Rows
    const rowsStart = padT + 36;
    const rowH = 28;
    families[activeFamily].rows.forEach((rowName, ri) => {
      const ry = rowsStart + ri * rowH;
      const localF = f % dwell;
      const revealP = Math.min(1, Math.max(0, (localF - ri * 3) / 12));
      if (revealP <= 0) return;

      ctx.globalAlpha = revealP;

      // Row card
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(col2X + 10, ry, col2W - 20, 22, 4);
      else ctx.rect(col2X + 10, ry, col2W - 20, 22);
      ctx.fill();
      ctx.stroke();

      // Checkbox (OFF by default per Pine)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(col2X + 16, ry + 6, 10, 10);

      // Row label
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(rowName, col2X + 32, ry + 15);

      // Info icon
      ctx.fillStyle = 'rgba(120,130,145,0.6)';
      ctx.beginPath();
      ctx.arc(col2X + col2W - 22, ry + 11, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(11,14,18,0.9)';
      ctx.font = 'bold 7px serif';
      ctx.textAlign = 'center';
      ctx.fillText('i', col2X + col2W - 22, ry + 13);

      ctx.globalAlpha = 1;
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('16 toggles, 6 families. Pine default: all OFF except Command Center master and Live Conditions.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 13: The Cross-Group Cascade
// Three sliders at the top (Strong Signals Only / Signal Engine / Pulse
// ATR Factor). As each one changes, colored lightning lines zigzag down
// to 8 downstream systems (signal count, candle coloring, Last Signal
// row, Pulse row, tooltip SL, tooltip TP, Live Conditions, chart density).
// Shows the FULL cascade: 3 inputs → 8 downstream effects.
// ============================================================
function CrossGroupCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE CROSS-GROUP CASCADE — 3 INPUTS, 8 DOWNSTREAM SYSTEMS', w / 2, 16);

    const padL = 20;
    const padR = 20;
    const padT = 30;
    const padB = 22;
    const areaW = w - padL - padR;
    const areaH = h - padT - padB;

    // 3 input cards at top, 8 output cards at bottom
    const topY = padT + 4;
    const topH = 42;
    const botY = padT + areaH - 70;
    const botH = 60;

    const inputs = [
      { name: 'Strong Signals', detail: 'ON / OFF', color: AMBER },
      { name: 'Signal Engine', detail: 'All/Trend/Reversal', color: TEAL },
      { name: 'Pulse ATR Factor', detail: '0.8 → 1.5 → 2.0', color: MAGENTA },
    ];
    const inputW = (areaW - 20) / 3;
    inputs.forEach((inp, ii) => {
      const ix = padL + ii * (inputW + 10);
      ctx.fillStyle = `rgba(${inp.color === AMBER ? '255,179,0' : inp.color === TEAL ? '38,166,154' : '239,83,80'},0.12)`;
      ctx.strokeStyle = inp.color;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ix, topY, inputW, topH, 6);
      else ctx.rect(ix, topY, inputW, topH);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = inp.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(inp.name, ix + inputW / 2, topY + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '8px system-ui';
      ctx.fillText(inp.detail, ix + inputW / 2, topY + 32);
    });

    const outputs = [
      'Signal count',
      'Candle coloring',
      'Last Signal row',
      'Pulse row action',
      'Tooltip SL',
      'Tooltip TP',
      'Live Conditions',
      'Chart density',
    ];
    const outCols = 4;
    const outW = (areaW - (outCols - 1) * 6) / outCols;
    const outH = 24;
    const outRows = 2;

    // Mapping of which outputs each input affects
    // Strong Signals Only → 1, 3, 4, 5, 6, 7, 8 (almost everything)
    // Signal Engine → 1, 2, 3, 4, 7 (signal-count + candle + last sig + pulse + live)
    // Pulse ATR Factor → 1, 3, 4, 5, 7 (signal count + last sig + pulse + SL + live)
    const mapping = [
      [0, 2, 3, 4, 5, 6, 7], // Strong Signals
      [0, 1, 2, 3, 6],        // Signal Engine
      [0, 2, 3, 4, 6],        // Pulse ATR Factor
    ];

    // Cycle: 3 phases, one input per phase lights up
    const dwell = 78;
    const activeInput = Math.floor(f / dwell) % 3;
    const localF = f % dwell;
    const pulsePhase = (localF / dwell);

    // Draw output cards
    outputs.forEach((out, oi) => {
      const col = oi % outCols;
      const row = Math.floor(oi / outCols);
      const ox = padL + col * (outW + 6);
      const oy = botY + row * (outH + 4);

      const affected = mapping[activeInput].includes(oi);
      const glow = affected ? Math.sin(pulsePhase * Math.PI * 4) * 0.3 + 0.6 : 0;

      ctx.fillStyle = affected ? `rgba(255,179,0,${0.1 + glow * 0.12})` : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = affected ? `rgba(255,179,0,${0.4 + glow * 0.3})` : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = affected ? 1.1 : 0.6;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ox, oy, outW, outH, 4);
      else ctx.rect(ox, oy, outW, outH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = affected ? AMBER : 'rgba(255,255,255,0.45)';
      ctx.font = affected ? 'bold 9px system-ui' : '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(out, ox + outW / 2, oy + outH / 2 + 3);
    });

    // Lightning lines from active input to affected outputs
    const inputCenterX = padL + activeInput * (inputW + 10) + inputW / 2;
    const inputBottomY = topY + topH;
    mapping[activeInput].forEach((oi) => {
      const col = oi % outCols;
      const row = Math.floor(oi / outCols);
      const ox = padL + col * (outW + 6) + outW / 2;
      const oy = botY + row * (outH + 4);
      const midY = (inputBottomY + oy) / 2;
      const jitterX = Math.sin(pulsePhase * 8 + oi) * 6;
      ctx.strokeStyle = `rgba(255,179,0,${0.35 + Math.sin(pulsePhase * Math.PI * 2) * 0.25})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(inputCenterX, inputBottomY);
      ctx.lineTo(inputCenterX + jitterX, midY);
      ctx.lineTo(ox, oy);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Caption
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${inputs[activeInput].name} affects ${mapping[activeInput].length} systems`, w / 2, padT + areaH - 80);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three of the most cascading settings in CIPHER. Flip one and 5–7 systems shift silently.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 14: Behavioral Playbook Matrix
// 3-column grid showing the three behavioral-layer playbooks with
// their specific Signal Engine / Strong Signals / SL Method / TP Method /
// Candle mode / selected CC rows. Animates through each playbook,
// filling in the settings one by one.
// ============================================================
function BehavioralPlaybookMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THREE BEHAVIORAL PLAYBOOKS — COMPLETE SETTINGS RECIPES', w / 2, 16);

    const padL = 24;
    const padR = 24;
    const padT = 36;
    const padB = 22;
    const areaW = w - padL - padR;
    const areaH = h - padT - padB;
    const colGap = 10;
    const colW = (areaW - colGap * 2) / 3;

    const playbooks = [
      {
        name: 'TREND FOLLOWER',
        color: TEAL,
        settings: [
          { label: 'Signal Engine', value: 'Trend' },
          { label: 'Direction', value: 'Both' },
          { label: 'Strong Signals', value: 'OFF' },
          { label: 'Candles', value: 'Trend Bold' },
          { label: 'SL Method', value: 'Auto' },
          { label: 'TP Method', value: 'R-Multiple' },
          { label: 'CC Rows', value: 'Ribbon, Pulse, HTF' },
        ],
      },
      {
        name: 'MEAN REVERSION',
        color: AMBER,
        settings: [
          { label: 'Signal Engine', value: 'Reversal' },
          { label: 'Direction', value: 'Both' },
          { label: 'Strong Signals', value: 'ON' },
          { label: 'Candles', value: 'Tension' },
          { label: 'SL Method', value: 'ATR' },
          { label: 'TP Method', value: 'Structure' },
          { label: 'CC Rows', value: 'Tension, Risk, Structure' },
        ],
      },
      {
        name: 'STRUCTURE-BASED',
        color: 'rgba(38,166,154,0.7)',
        settings: [
          { label: 'Signal Engine', value: 'All Signals' },
          { label: 'Direction', value: 'Both' },
          { label: 'Strong Signals', value: 'ON' },
          { label: 'Candles', value: 'Default' },
          { label: 'SL Method', value: 'Structure' },
          { label: 'TP Method', value: 'Structure' },
          { label: 'CC Rows', value: 'Structure, Sweeps, Imbalance' },
        ],
      },
    ];

    // Cycle — one playbook active at a time, rest dim
    const dwell = 120;
    const activePlaybook = Math.floor(f / dwell) % playbooks.length;
    const localF = f % dwell;

    playbooks.forEach((pb, pi) => {
      const px = padL + pi * (colW + colGap);
      const active = pi === activePlaybook;
      const rowRevealCount = active ? Math.min(pb.settings.length, Math.floor(localF / 8)) : pb.settings.length;

      // Card
      ctx.fillStyle = active
        ? `rgba(${pb.color === TEAL ? '38,166,154' : pb.color === AMBER ? '255,179,0' : '38,166,154'},0.08)`
        : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = active ? pb.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = active ? 1.4 : 0.6;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, padT, colW, areaH - 6, 8);
      else ctx.rect(px, padT, colW, areaH - 6);
      ctx.fill();
      ctx.stroke();

      // Header
      ctx.fillStyle = active ? pb.color : 'rgba(255,255,255,0.45)';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(pb.name, px + colW / 2, padT + 18);

      // Settings rows
      const rowsStart = padT + 30;
      const rowH = (areaH - 42) / pb.settings.length;
      pb.settings.forEach((s, si) => {
        if (si >= rowRevealCount) return;
        const ry = rowsStart + si * rowH;
        ctx.fillStyle = active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)';
        ctx.font = '8px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(s.label, px + 8, ry + 10);

        ctx.fillStyle = active ? pb.color : 'rgba(255,255,255,0.35)';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'right';
        // truncate if too long
        const maxW = colW - 16;
        ctx.fillText(s.value, px + colW - 8, ry + 10);
      });
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three recipes. Manual — set None in PRESET first, then flip each of these manually.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// CONFETTI (identical pattern to 11.3a / 11.2)
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const colors = [TEAL, AMBER, 'rgba(255,255,255,0.9)', 'rgba(255,196,61,1)', 'rgba(38,166,154,0.8)'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: rect.width / 2 + (Math.random() - 0.5) * 60,
      y: rect.height / 2 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 2,
      size: Math.random() * 6 + 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    let raf = 0;
    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.99;
        p.rot += p.vrot;
        p.life -= 0.006;
        if (p.life <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
      });
      frame++;
      if (frame < 240) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />;
}

// ============================================================
// GAME ROUNDS — 5 scenarios testing behavioral-layer reasoning
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You open CIPHER with PRESET = None. You want to stop ALL signal arrows from appearing on the chart, but you still want the Cipher Pulse line to draw. You turn OFF the Cipher Pulse toggle in the PULSE group.',
    prompt: 'What happens?',
    options: [
      {
        id: 'a',
        text: 'Signals stop firing. The line stays visible.',
        correct: false,
        explain:
          'Wrong direction. You got the inverse. The Cipher Pulse toggle is a DISPLAY toggle — it hides the line but does NOT gate signals. You just hid the line while leaving signals firing.',
      },
      {
        id: 'b',
        text: 'The line disappears. Signals continue firing normally, since Signal Engine is still set to "Trend" by default.',
        correct: true,
        explain:
          'Correct. The Pulse toggle is display-only. To actually silence PX signals, change Signal Engine (in the SIGNAL ENGINE group) from "Trend" to "Visuals Only" or "Reversal".',
      },
      {
        id: 'c',
        text: 'Both the line and the signals disappear, because signals depend on the line being drawn.',
        correct: false,
        explain:
          'The rendering engine does not work this way. The SIGNAL calculation runs on the Pulse DATA, not on the Pulse LINE being visible. Display and calculation are separate.',
      },
      {
        id: 'd',
        text: 'An error message appears because you cannot have signals without a line.',
        correct: false,
        explain:
          'CIPHER does not produce errors like this. It silently continues to fire signals even with the line hidden — which is itself the teachable moment.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You select SL Method = Pulse. The indicator is tracking your entry properly. A few bars later, you hide the Cipher Pulse line (turn off the display toggle). Then a signal fires and you check the tooltip for the SL value.',
    prompt: 'Does the SL still show in the tooltip, and if so, where?',
    options: [
      {
        id: 'a',
        text: 'SL disappears from the tooltip because the Pulse line is hidden.',
        correct: false,
        explain:
          'The Pulse CALCULATION continues even when the display is hidden. The SL is anchored to the calculated Pulse price, not to the drawn line.',
      },
      {
        id: 'b',
        text: 'SL still shows in the tooltip. It is anchored at the underlying Pulse price minus SL Buffer.',
        correct: true,
        explain:
          'Correct. Hiding a visual never disables an underlying calculation. The Pulse CALCULATION continues, and the SL references that calculated price + the buffer value. You just will not see the Pulse line drawn on the chart.',
      },
      {
        id: 'c',
        text: 'The tooltip falls back to ATR-based SL automatically.',
        correct: false,
        explain:
          'There is no automatic fallback. Your chosen SL Method stays in effect regardless of display toggles.',
      },
      {
        id: 'd',
        text: 'SL shows but with a "VISUAL HIDDEN" warning next to it.',
        correct: false,
        explain:
          'No warning is emitted. Silent cascades are silent — which is the entire teachable pattern of this lesson.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You are trading two instruments in separate charts: BTCUSDT and GBPUSD. Both have SL Method = Auto. A signal fires on each chart at the same time.',
    prompt: 'Which SL method does CIPHER use on each?',
    options: [
      {
        id: 'a',
        text: 'Both use Structure (it is the safest default).',
        correct: false,
        explain:
          'Auto is not a single method — it is a ROUTER. Different asset classes get different resolutions.',
      },
      {
        id: 'b',
        text: 'Both use ATR because Auto is equivalent to ATR.',
        correct: false,
        explain:
          'Auto does not equal ATR. Auto resolves per asset class: Crypto and Stocks/Indices get Structure, Forex gets Pulse.',
      },
      {
        id: 'c',
        text: 'BTCUSDT uses Structure. GBPUSD uses Pulse. Different asset classes, different routings.',
        correct: true,
        explain:
          'Correct. Auto routes by asset class: Crypto → Structure, Forex → Pulse, Stocks/Indices → Structure. This is based on which method empirically performs best per asset class.',
      },
      {
        id: 'd',
        text: 'BTCUSDT uses ATR. GBPUSD uses Structure. Crypto gets fixed volatility stops.',
        correct: false,
        explain:
          'Crypto gets Structure. Forex gets Pulse. You inverted the routing.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'A signal fires on your chart. Your Risk Map is configured with default TP Method = Auto, TP1 = 1R. Price hits TP1 cleanly. According to CIPHER doctrine, what should happen to your stop?',
    prompt: 'What is the canonical move?',
    options: [
      {
        id: 'a',
        text: 'Stop stays where it is — TP1 is just a scale-out, not a stop event.',
        correct: false,
        explain:
          'This misses half the doctrine. TP1 is scale-out AND a stop event. The risk-reward profile of the remaining position demands a BE stop — otherwise you are risking your realized 1R on the runners.',
      },
      {
        id: 'b',
        text: 'Scale out 33% at TP1 AND move the stop to break-even. You have now locked in a risk-free trade with 67% of the position running toward TP2/TP3.',
        correct: true,
        explain:
          'Correct. The full doctrine: TP1 hit → scale out 33% → move SL to entry (BE). This is baked into the CIPHER Risk Map philosophy. The remaining 67% is now risk-free; your worst case becomes scratch.',
      },
      {
        id: 'c',
        text: 'Close the entire position at TP1 and wait for a new signal.',
        correct: false,
        explain:
          'Taking full profit at 1R leaves the runners on the table. CIPHER is designed for a scale-out model, not a single-target model. If you are a single-target trader, set TP1 = TP2 = TP3 manually — but the default is scale-out.',
      },
      {
        id: 'd',
        text: 'Move the stop to TP1 so you lock in 1R minimum.',
        correct: false,
        explain:
          'This would trail on the next bar and likely stop you out of the runner on normal pullback. BE is the canonical move after TP1. Aggressive trails come after TP2.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You turn ON all 16 Command Center row toggles. The panel expands to show every row. You have been using CIPHER for two weeks. What is the problem?',
    prompt: 'What is the operator mistake here?',
    options: [
      {
        id: 'a',
        text: 'The panel now blocks too much of the chart visually.',
        correct: false,
        explain:
          'The chart real estate is a secondary concern. The primary problem is cognitive — too many rows means you cannot read the panel in 10 seconds, which means you cannot actually use it in-trade.',
      },
      {
        id: 'b',
        text: 'You cannot read 16 rows in under 10 seconds. Row-selection is about curation — pick the 5–8 that speak to YOUR style, hide the rest. More rows = more information; more information is not always better.',
        correct: true,
        explain:
          'Correct. The Command Center is an in-trade decision tool, not an encyclopedia. Your eye must scan it in seconds. Expert operators use 5–8 rows tuned to their style. All-16 is a beginner signal — you have not yet decided what you care about.',
      },
      {
        id: 'c',
        text: 'There is no problem. More rows = more information.',
        correct: false,
        explain:
          'Common belief, empirically wrong. Decision latency scales with information density. A 16-row panel is slower to read than an 8-row panel, and slower reading equals worse decisions in live markets.',
      },
      {
        id: 'd',
        text: 'The indicator slows down because too many rows are calculating at once.',
        correct: false,
        explain:
          'Performance is not the issue — Pine computes all row states regardless of which are shown. The problem is entirely in your head, not the chart.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 8 questions · 66% pass threshold
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'The default value of Signal Engine when you first install CIPHER PRO is:',
    options: [
      { id: 'a', text: 'All Signals', correct: false },
      { id: 'b', text: 'Trend', correct: true },
      { id: 'c', text: 'Reversal', correct: false },
      { id: 'd', text: 'Visuals Only', correct: false },
    ],
    explain:
      'Default is Trend — CIPHER ships with trend-follow as its primary mode. All Signals fires both PX (trend) and TS (reversal), Reversal fires only TS, Visuals Only suppresses all arrows.',
  },
  {
    id: 'q2',
    question:
      'Strong Signals Only requires how many of 4 conviction factors to agree before an arrow fires?',
    options: [
      { id: 'a', text: '2 of 4', correct: false },
      { id: 'b', text: '3 of 4', correct: true },
      { id: 'c', text: 'All 4', correct: false },
      { id: 'd', text: '1 of 4', correct: false },
    ],
    explain:
      '3 of 4 minimum: Ribbon stacked + ADX > 20 + Volume > 1.0× average + Momentum health > 50%. 3 of these 4 must align with the signal direction.',
  },
  {
    id: 'q3',
    question:
      'In the Cipher Candles dropdown, the "Composite" mode encodes how many dimensions into each candle color?',
    options: [
      { id: 'a', text: '1 dimension — just direction', correct: false },
      { id: 'b', text: '2 dimensions — velocity + tension', correct: false },
      { id: 'c', text: '3 dimensions — velocity + tension + volume', correct: true },
      { id: 'd', text: 'Depends on the asset class', correct: false },
    ],
    explain:
      'Composite blends velocity (how fast price is moving), tension (how stretched it is from Flow), and volume (participation strength) into one color per candle. Composite Bold is the same logic with higher saturation.',
  },
  {
    id: 'q4',
    question:
      'The "SL Buffer" input (default 0.3) controls what?',
    options: [
      { id: 'a', text: 'How many bars of price history CIPHER uses to calculate the SL.', correct: false },
      {
        id: 'b',
        text: 'Extra breathing room added below/above the SL level, measured in ATR multiples. Prevents wick clips.',
        correct: true,
      },
      { id: 'c', text: 'Delay in bars before CIPHER re-evaluates the SL.', correct: false },
      { id: 'd', text: 'Percentage of position size to liquidate at SL.', correct: false },
    ],
    explain:
      'SL Buffer is an ATR multiplier for the extra padding below (long) or above (short) the computed SL level. 0.2 tight, 0.3 standard, 0.5 wide. Prevents wick clips on volatile bars.',
  },
  {
    id: 'q5',
    question:
      'If SL Method = Auto and you are trading GBPUSD, which underlying method does CIPHER actually use?',
    options: [
      { id: 'a', text: 'Structure', correct: false },
      { id: 'b', text: 'Pulse', correct: true },
      { id: 'c', text: 'ATR', correct: false },
      { id: 'd', text: 'R-Multiple', correct: false },
    ],
    explain:
      'Auto is a router per asset class: Crypto → Structure, Forex → Pulse, Stocks/Indices → Structure. GBPUSD is Forex, so Auto resolves to Pulse.',
  },
  {
    id: 'q6',
    question:
      'In the Risk Map group, which of these inputs are DISPLAY-only toggles (no effect on calculations)?',
    options: [
      { id: 'a', text: 'Stop Loss Method and Take Profit Method', correct: false },
      { id: 'b', text: 'TP1 Target, TP2 Target, TP3 Target', correct: false },
      {
        id: 'c',
        text: 'TP/SL in Tooltip, TP Lines on Chart, and SL Line on Chart',
        correct: true,
      },
      { id: 'd', text: 'All of them are display-only', correct: false },
    ],
    explain:
      'Tooltip display + chart-line displays are cosmetic. The Method dropdowns and TP targets are CALCULATION inputs — they change what CIPHER actually computes. Confusing the two is the canonical Silent Cascade mistake.',
  },
  {
    id: 'q7',
    question:
      'What is the maximum practical number of Command Center row toggles you should enable at once?',
    options: [
      { id: 'a', text: 'All 16 — more information is always better', correct: false },
      {
        id: 'b',
        text: 'Around 5–8, curated to your trading style. You need to be able to scan the panel in under 10 seconds.',
        correct: true,
      },
      { id: 'c', text: 'Exactly 3 — same as the visual-layer rule', correct: false },
      { id: 'd', text: 'There is a hard limit of 12 built into Pine', correct: false },
    ],
    explain:
      'There is no hard Pine limit, but there IS a cognitive limit. 5–8 rows is the operator sweet spot. All-16 is a beginner configuration. The 3-visual rule is for the CHART (visual layer), not the panel.',
  },
  {
    id: 'q8',
    question:
      'Which 3 inputs are the MOST cascading in CIPHER — meaning one change in any of them affects 5+ downstream systems?',
    options: [
      {
        id: 'a',
        text: 'Signal Engine · Strong Signals Only · Pulse ATR Factor',
        correct: true,
      },
      { id: 'b', text: 'Cipher Ribbon · Intensity · Position', correct: false },
      { id: 'c', text: 'TP1 Target · TP2 Target · TP3 Target', correct: false },
      { id: 'd', text: 'PRESET · Direction · SL Buffer', correct: false },
    ],
    explain:
      'Signal Engine decides WHAT fires. Strong Signals Only decides WHICH of those fires survive filtering. Pulse ATR Factor decides at what PRICE the signals fire. Any change to any of these three ripples through signal count, candle coloring, Last Signal row, Pulse row, tooltip SL/TP, and Live Conditions.',
  },
];

// ============================================================
// MAIN COMPONENT — Phase 3B-1
// Hero + sections S00–S08
// Component intentionally UNCLOSED — Phase 3B-2 appends S09–S15 + game/quiz/cert + closing tags
// ============================================================
export default function CipherInputsAnatomyPart2() {
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.3B-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const quizScore = quizAnswers.filter((ans, i) => {
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = Math.round((quizScore / quizQuestions.length) * 100);
  const quizPassed = quizPercent >= 66;

  useEffect(() => {
    if (quizPassed && quizSubmitted && !certRevealed) {
      const timer = setTimeout(() => { setCertRevealed(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 600);
      return () => clearTimeout(timer);
    }
  }, [quizPassed, quizSubmitted, certRevealed]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 3b</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">CIPHER Inputs Anatomy<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Part 2 &mdash; The Behavioral Layer</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Three groups. Thirty-three inputs. Where CIPHER stops reporting and starts <em>deciding</em>.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* ================ SECTION S00 — Bridge ================ */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">From drawings to decisions.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Part 1 taught you what CIPHER <strong className="text-white">draws</strong> on your chart. Twenty-six inputs across nine visual groups. The Ribbon, the Spine, the Imbalance boxes, the Sweeps diamonds. Every one of those is a <strong className="text-white">reading</strong> &mdash; CIPHER reporting on the market honestly across many layers.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Part 2 teaches what CIPHER <strong className="text-white">does</strong> with those readings. Thirty-three inputs across three behavioral groups: <strong className="text-amber-400">SIGNAL ENGINE</strong> (4 inputs that decide what fires), <strong className="text-amber-400">CIPHER RISK MAP</strong> (10 inputs that decide the trade plan), and the <strong className="text-amber-400">COMMAND CENTER row toggles</strong> (19 inputs that configure the panel you read in real time).</p>
            <p className="text-gray-400 leading-relaxed">The visual layer is CIPHER <em>reporting</em>. The behavioral layer is CIPHER <em>deciding</em>. Together they are 59 inputs across 12 groups &mdash; and once you finish this lesson, you will know every single one.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE COMPLETION MILESTONE</p>
            <p className="text-sm text-gray-400 leading-relaxed">This is the final lesson in the <strong className="text-white">CIPHER Inputs Anatomy</strong> arc. When you finish, you have walked every input in the PRO indicator &mdash; visual and behavioral. Every checkbox, dropdown, and slider. You will never open CIPHER settings again and wonder what a toggle does. The arc closes here.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S01 — The Arrow Is the Last Word (Groundbreaking) ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Arrow Is the Last Word</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every arrow on your chart is a <strong className="text-amber-400">tally</strong>, not a trigger. Four upstream votes decide whether the arrow fires: <strong className="text-white">Ribbon alignment</strong>, <strong className="text-white">ADX strength</strong>, <strong className="text-white">Volume</strong>, and <strong className="text-white">Momentum health</strong>. Three of four must agree. The arrow is the outcome of a vote, never the command.</p>
          <ArrowTallyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through four scenarios. In the first, all four voters agree &mdash; the arrow fires as a STRONG signal. In the second, three agree &mdash; barely passing, the arrow still fires but with lower conviction. In the third, only two agree &mdash; the arrow is <strong className="text-white">filtered out entirely</strong>. In the fourth, only one agrees &mdash; crushed, no arrow at all. This is the literal mechanic behind the <strong className="text-amber-400">Strong Signals Only</strong> toggle in SIGNAL ENGINE (section 03). When ON, every would-be signal runs through this 4-factor audit and only 3-of-4 survivors get arrows. When OFF, all signals pass through and your chart floods with marginal setups.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S RULE &mdash; PART 2</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every arrow has already been through a vote. Your job is not to trust the arrow blindly &mdash; it is to know <strong className="text-white">which votes passed</strong>. When an arrow fires, glance at the Command Center: check Trend, Pulse, Volume, Momentum. If the vote breakdown agrees, execute. If they fight each other, wait for the next one.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S02 — SIGNAL ENGINE overview ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; SIGNAL ENGINE</p>
          <h2 className="text-2xl font-extrabold mb-4">The most behaviorally consequential group in CIPHER</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The SIGNAL ENGINE group decides EVERYTHING about what arrows appear on your chart and how candles are colored. <strong className="text-amber-400">Four inputs</strong>: <strong className="text-white">Signal Engine</strong> (the master mode), <strong className="text-white">Direction</strong> (directional filter), <strong className="text-white">Strong Signals Only</strong> (the conviction gate), and <strong className="text-white">Cipher Candles</strong> (the color-coding mode). These four settings interact. Signal Engine decides WHAT fires. Direction filters that output by long/short. Strong Signals Only gates what remains through the 4-factor audit. Cipher Candles recolors every candle in a language that matches your style.</p>
          <SignalEngineSwitcherAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through the 4 Signal Engine modes. <strong className="text-white">All Signals</strong> fires both PX (Pulse Cross &mdash; trend signals) and TS (Tension Snap &mdash; reversal signals). <strong className="text-white">Trend</strong> fires only PX. <strong className="text-white">Reversal</strong> fires only TS. <strong className="text-white">Visuals Only</strong> fires neither &mdash; the indicator draws every visual from Part 1 but emits zero arrows. Visuals Only is for operators who want CIPHER&apos;s complete diagnostic readout but prefer to make their own entry decisions without arrow temptation.</p>
        </motion.div>
      </section>

      {/* ================ SECTION S03 — The 4 SIGNAL ENGINE inputs ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 SIGNAL ENGINE Inputs</p>
          <h2 className="text-2xl font-extrabold mb-4">Master mode &middot; Direction filter &middot; Conviction gate &middot; Candles</h2>
          <DirectionFilterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The Direction filter is a <strong className="text-white">second gate</strong> that runs AFTER Signal Engine. It narrows whatever Signal Engine produced by long/short. The animation shows the same signal set through all three filter modes &mdash; signal counts differ dramatically, but underlying signal logic is unchanged.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL ENGINE &middot; dropdown &middot; default Trend &middot; &#9889; master mode</p>
              <p className="text-sm text-gray-400 leading-relaxed">The master switch for what arrow types appear. <strong className="text-white">All Signals</strong> = both PX + TS. <strong className="text-white">Trend</strong> = PX only (best for breakouts and continuations). <strong className="text-white">Reversal</strong> = TS only (best for pullbacks and V-bottoms). <strong className="text-white">Visuals Only</strong> = no arrows at all, visuals stay live. <strong className="text-amber-400">The single most consequential setting in the lesson.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION &middot; dropdown &middot; default Both &middot; Both / Long Only / Short Only</p>
              <p className="text-sm text-gray-400 leading-relaxed">Filter signals by direction. Use <strong className="text-white">Long Only</strong> when your HTF bias is bullish and you want CIPHER to stop offering countertrend shorts. Use <strong className="text-white">Short Only</strong> when HTF bias is bearish. Keep <strong className="text-white">Both</strong> if you trade equally in both directions. <strong className="text-amber-400">This is a discipline dial</strong> &mdash; it physically prevents you from taking trades that fight your bias.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRONG SIGNALS ONLY &middot; checkbox &middot; default OFF &middot; &#9733; the filter</p>
              <p className="text-sm text-gray-400 leading-relaxed">When ON, every signal must pass a 4-factor audit before its arrow appears: <strong className="text-white">Ribbon stacked</strong>, <strong className="text-white">ADX &gt; 20</strong>, <strong className="text-white">Volume &gt; 1.0&times; average</strong>, and <strong className="text-white">Momentum health &gt; 50%</strong>. Three of four must agree. Turn this on when your chart floods with marginal setups. Note: Swing Trader and Sniper presets force this ON.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER CANDLES &middot; dropdown &middot; default Default &middot; 7 options</p>
              <p className="text-sm text-gray-400 leading-relaxed">Repaints every candle using CIPHER&apos;s proprietary color logic (not RSI). <strong className="text-white">Default</strong> = standard direction. <strong className="text-white">Trend / Trend Bold</strong> = velocity gradient. <strong className="text-white">Tension / Tension Bold</strong> = stretch from Flow. <strong className="text-white">Composite / Composite Bold</strong> = blends velocity + tension + volume into every candle. Full breakdown in section 05.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S04 — The 4-factor conviction audit ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 4-Factor Conviction Audit</p>
          <h2 className="text-2xl font-extrabold mb-4">Strong Signals Only, under the hood</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When Strong Signals Only is ON, CIPHER runs <strong className="text-white">every</strong> would-be signal through a 4-factor audit. Each factor is a live market measurement that either agrees with the signal direction or doesn&apos;t. Three of four must agree for the arrow to fire.</p>
          <StrongSignalsAuditAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the gauges. The amber dashed line is the threshold. When the current value (teal or magenta fill) passes the threshold, that factor votes YES. The verdict panel on the right tallies the votes. Over the 4 scenarios, the system cycles through 4/4 PASSES, 3/4 PASSES (barely), 2/4 FAILS, 1/4 FAILS.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 &middot; RIBBON STACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Cipher Ribbon (Core/Flow/Anchor) must be stacked in signal direction. For a long signal: Core above Flow above Anchor. For a short: inverted. <strong className="text-white">The structural alignment vote.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 &middot; ADX &gt; 20</p>
              <p className="text-sm text-gray-400 leading-relaxed">Average Directional Index above 20. This is the &ldquo;is there a trend at all&rdquo; vote. Below 20 = chop, no directional edge. Above 20 = a trend exists in some direction; whether it aligns with your signal is factor 1&apos;s job.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 &middot; VOLUME &gt; 1.0&times;</p>
              <p className="text-sm text-gray-400 leading-relaxed">Current bar volume above the 20-bar average. <strong className="text-white">The participation vote.</strong> Signals that fire on dead-volume bars are high whipsaw risk. Above-average volume = there are actual buyers/sellers at this level.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 &middot; MOMENTUM &gt; 50%</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s internal momentum health score above 50%. <strong className="text-white">The &ldquo;is momentum fresh or dying&rdquo; vote.</strong> Above 50% = momentum has room. Below 50% = momentum is exhausted &mdash; any signal firing here is leaning into a dying trend.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE GATE IS 3 OF 4, NOT 4 OF 4</p>
            <p className="text-sm text-gray-400 leading-relaxed">Requiring all 4 factors to align would reject too many valid signals &mdash; real markets don&apos;t produce 4-factor alignment often. <strong className="text-white">3 of 4 is the sweet spot</strong>: enough conviction to filter junk, permissive enough to let real setups through. The 4th factor is allowed to disagree &mdash; which factor disagrees is useful information. Glance at the Command Center to see which one.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S05 — The 7 Cipher Candle modes ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The 7 Cipher Candle Modes</p>
          <h2 className="text-2xl font-extrabold mb-4">Proprietary color logic &mdash; velocity, tension, volume</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER does not use RSI to color candles. It uses proprietary dimensions: <strong className="text-white">velocity</strong> (how fast price moved), <strong className="text-white">tension</strong> (how stretched from Flow), and for Composite modes, <strong className="text-white">volume</strong>. Every mode picks a different dimension to emphasize, and the Bold variants boost saturation for operators on dark charts.</p>
          <CipherCandlesSpectrumAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 mb-6 space-y-3">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Standard teal (bull) / magenta (bear) direction coloring. No additional dimension encoded. Use when you want traditional visuals and rely on the Ribbon or Pulse line for nuance.</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Velocity gradient. Fast-moving candles are vivid; slow candles fade. You instantly see where momentum is strongest on the chart.</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TREND BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same velocity logic, higher saturation. For dark-theme charts where the Normal variant fades into the background.</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TENSION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stretch-from-Flow gradient. Candles glow amber when price is stretched far from the Cipher Flow &mdash; a visual version of the Mean Reversion Score.</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TENSION BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same tension logic, higher saturation. Makes the stretch zones unmistakable even at small zoom.</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMPOSITE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every candle encodes three dimensions &mdash; velocity + tension + volume &mdash; blended into one color. <strong className="text-white">The operator&apos;s color language.</strong></p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMPOSITE BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">The top-tier mode. Same 3-dimension blend at bold saturation. If you trade from candles rather than indicator lines, this is where you eventually end up. <strong className="text-white">Used by Scalper preset by default.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY 7 MODES AND NOT ONE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Different trading styles value different signals. A trend trader cares about velocity. A mean-reversion trader cares about tension. A composite trader cares about both plus volume. Rather than forcing one mode, CIPHER ships seven so you pick the language that matches how you actually make decisions. <strong className="text-white">Start with Default, experiment with Trend and Composite, find what makes you read the chart faster.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S06 — Risk Map overview ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; CIPHER RISK MAP</p>
          <h2 className="text-2xl font-extrabold mb-4">The trade-plan engine &mdash; entry, SL, TP1/TP2/TP3</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When a signal arrow fires, the Risk Map activates. It calculates five price levels automatically: <strong className="text-white">ENTRY</strong> (where the arrow fired), <strong className="text-white">STOP LOSS</strong> (below for longs, above for shorts), and three <strong className="text-white">TAKE PROFITS</strong> at 1R / 2R / 3R (or whatever you&apos;ve configured). The entire trade plan is drawn or reported in the tooltip &mdash; <strong className="text-amber-400">every arrow comes with its math already done</strong>. 10 inputs across three subsections: <strong className="text-white">display toggles</strong> (3), <strong className="text-white">Stop Loss method + tuning</strong> (3), and <strong className="text-white">Take Profit method + targets</strong> (4).</p>
          <RiskMapOverviewAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation reveal each price level in sequence: Entry fires → SL drawn → TP1 → TP2 → TP3 → complete trade plan with red and green risk-reward zones. This is what you see (in some form) every time a CIPHER arrow fires. What changes between operators is <strong className="text-white">which lines show on the chart</strong> and <strong className="text-white">how the numbers are calculated</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TP/SL IN TOOLTIP &middot; checkbox &middot; default ON &middot; display only</p>
              <p className="text-sm text-gray-400 leading-relaxed">When ON, every signal&apos;s tooltip includes the full trade plan &mdash; entry, SL, TP1, TP2, TP3 &mdash; when you hover on the signal marker. Most operators leave this ON because the tooltip is the primary way to read a signal&apos;s plan without cluttering the chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP LINES ON CHART &middot; checkbox &middot; default OFF &middot; display only</p>
              <p className="text-sm text-gray-400 leading-relaxed">When ON, TP1 / TP2 / TP3 are drawn as dotted horizontal lines on the chart when a signal fires. Auto-clears when the next signal fires. Use if you prefer visual targets over tooltip reads. Adds chart clutter &mdash; off by default for chart-minimalists.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL LINE ON CHART &middot; checkbox &middot; default OFF &middot; display only</p>
              <p className="text-sm text-gray-400 leading-relaxed">When ON, the SL line draws as a dotted magenta horizontal line on the chart. Same auto-clear behavior as TP lines. <strong className="text-white">Pairs well with TP Lines on Chart</strong> &mdash; together they give you the whole trade plan visible at a glance.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#9888; DISPLAY TOGGLES ARE NOT CALCULATION TOGGLES</p>
            <p className="text-sm text-gray-400 leading-relaxed">These three toggles control what you SEE. They do not affect what CIPHER CALCULATES. The SL and TP prices are <strong className="text-white">always computed</strong> whenever a signal fires, regardless of whether these toggles are on. Turning them all OFF does not disable the Risk Map &mdash; it just hides the visual output. Your broker-execution workflow still has access to the numbers via the tooltip or your own alerts.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S07 — The 4 Stop Loss methods ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The 4 Stop Loss Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">Four philosophies, one dropdown</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER offers <strong className="text-white">four distinct philosophies</strong> for stop placement. The SL Method input selects which philosophy applies. Each has a different trade-off between whipsaw protection and loss size.</p>
          <SLMethodComparisonAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO &middot; default &middot; &#9733; asset-class router &middot; RECOMMENDED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Not a single method &mdash; a <strong className="text-white">router</strong>. Auto selects the best method per asset class: <strong className="text-white">Crypto → Structure</strong> (swings dominate), <strong className="text-white">Forex → Pulse</strong> (pulse-based stops fit intraday forex rhythm), <strong className="text-white">Stocks / Indices → Structure</strong> (institutional levels dominate). The default because it works well across asset classes without requiring you to know which method fits which market.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE &middot; stop at recent swing</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL is placed just beyond the most recent swing low (long) or swing high (short) detected by CIPHER Structure &mdash; minus an ATR buffer. <strong className="text-white">Logic:</strong> if price takes out that swing, the setup is invalidated. The classical &ldquo;technical stop&rdquo; philosophy. Works well when the chart has clear structure; can produce very wide stops when structure is loose.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PULSE &middot; stop at Cipher Pulse line</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL is placed just beyond the current Cipher Pulse line value, minus an ATR buffer. <strong className="text-white">Logic:</strong> the Pulse line is the signal trigger &mdash; if price crosses back through it, the signal is invalidated. Tight stops, fast invalidation, more whipsaw. Best when you trust CIPHER&apos;s Pulse as your trigger discipline.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ATR &middot; fixed volatility distance</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL is placed at a fixed multiple of ATR away from entry. The multiplier is controlled by the ATR Multiplier input below (default 1.5). <strong className="text-white">Predictable, uniform stops</strong> regardless of structure. Best when structure is noisy or when you want statistical consistency across many trades.</p>
            </div>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Auto asset-class resolver</p>
          <AssetClassRoutingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows how Auto resolves to different underlying methods depending on which asset class your chart is on. CIPHER detects the asset class automatically &mdash; you don&apos;t configure it. BTCUSDT is crypto, GBPUSD is forex, SPY is a stock/index ETF. If you want to override the routing for a specific chart (say, ATR stops on crypto), just change SL Method from Auto to your preferred method directly.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ATR MULTIPLIER &middot; float &middot; default 1.5 &middot; range 0.3&ndash;5.0 &middot; step 0.1</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL distance in ATR multiples, used <strong className="text-white">ONLY when SL Method = ATR</strong>. 0.5 is tight (scalping). 1.0 is standard. 1.5 is the default &mdash; wide enough to avoid most whipsaw on 15m+ charts. 2.0+ is for swing trades on higher timeframes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL BUFFER &middot; float &middot; default 0.3 &middot; range 0.1&ndash;1.0 &middot; step 0.1</p>
              <p className="text-sm text-gray-400 leading-relaxed">Extra breathing room below the SL level (above for shorts), measured in ATR multiples. Used by <strong className="text-white">ALL SL methods</strong> to prevent wick-clipping &mdash; a 0.3 buffer places the stop slightly beyond the raw structural/Pulse/ATR level. 0.2 is tight. 0.3 is standard. 0.5 is wide. <strong className="text-amber-400">The unsung hero of the Risk Map</strong> &mdash; it is the difference between &ldquo;stopped out on a 1-tick wick&rdquo; and &ldquo;the trade runs to target.&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S08 — The 4 Take Profit methods ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The 4 Take Profit Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">Symmetric with SL &mdash; four philosophies</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Take Profit has its own method dropdown, symmetric with Stop Loss. Four options, four philosophies. The method determines the <strong className="text-white">geometry</strong> of where TP1, TP2, and TP3 land relative to your entry.</p>
          <TPMethodComparisonAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO &middot; default &middot; &#9733; asset-class router &middot; RECOMMENDED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same router logic as Auto SL. <strong className="text-white">Crypto → R-Multiple</strong> (works well in trend-heavy, volatile markets). <strong className="text-white">Forex → ATR Targets</strong> (tight, consistent across sessions). <strong className="text-white">Stocks / Indices → Structure</strong> (price respects structural levels). What Scalper, Trend Trader, and Swing Trader presets inherit by default.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">R-MULTIPLE &middot; 1R / 2R / 3R targets</p>
              <p className="text-sm text-gray-400 leading-relaxed">TP1 = entry + 1&times; risk, TP2 = entry + 2&times; risk, TP3 = entry + 3&times; risk (for longs; inverted for shorts). <strong className="text-white">Pure risk-reward geometry.</strong> Targets scale with your SL distance &mdash; wide SL means wide TPs. Best for trend-follow systems where the exit is about R:R, not a specific price level.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE &middot; targets at next S/R levels</p>
              <p className="text-sm text-gray-400 leading-relaxed">TPs placed at the nearest S/R levels from CIPHER Structure. TP1 = closest level in the signal direction. TP2 = the level after that. TP3 = the level after that. <strong className="text-white">Targets are WHERE PRICE TENDS TO PAUSE</strong>, not where risk math says. Best when structure is clean and price respects levels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ATR TARGETS &middot; fixed ATR-based targets</p>
              <p className="text-sm text-gray-400 leading-relaxed">TP1 / TP2 / TP3 at fixed ATR multiples from entry (controlled by the TP1/TP2/TP3 Target inputs in section 09). Like ATR stop &mdash; predictable, uniform targets regardless of structure. <strong className="text-white">Pairs naturally with ATR SL method</strong> for a fully volatility-based trade plan.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">CAN YOU MIX SL AND TP METHODS?</p>
            <p className="text-sm text-gray-400 leading-relaxed">Yes &mdash; SL Method and TP Method are <strong className="text-white">independent</strong>. You can use Structure SL with R-Multiple TPs, or Pulse SL with Structure TPs, any combination. The most common mixes: <strong className="text-white">Structure SL + R-Multiple TP</strong> (structural invalidation, clean R:R targets) and <strong className="text-white">Pulse SL + ATR TPs</strong> (tight trigger stop, consistent scalp targets). Experiment &mdash; there&apos;s no wrong combination if it matches your style.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S09 — TP1/TP2/TP3 Scale-out Mechanics ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; TP1 / TP2 / TP3 Scale-Out</p>
          <h2 className="text-2xl font-extrabold mb-4">Three exits, one trade</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER ships with <strong className="text-white">three</strong> take-profit levels by default, not one. This is deliberate &mdash; most operators benefit from a scale-out model where they take partial profits progressively rather than trying to nail a single perfect exit. Each TP level serves a different purpose.</p>
          <TPScaleOutAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the runner walk from ENTRY to TP1, then TP2, then TP3. The position-size bar on the right shrinks at each TP &mdash; 100% at entry, 67% after TP1, 33% after TP2, 0% at TP3. Also watch the SL line: at TP1 it moves to <strong className="text-amber-400">break-even (BE)</strong>. This is the canonical scale-out playbook baked into CIPHER&apos;s philosophy.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TP1 TARGET &middot; float &middot; default 1.0 &middot; range 0.5&ndash;5.0 &middot; step 0.5</p>
              <p className="text-sm text-gray-400 leading-relaxed">The first scale-out target. Units depend on TP Method: in R-Multiple mode, 1.0 = 1R (entry + risk). In ATR Targets mode, 1.0 = 1&times; ATR. In Structure mode, the input is ignored and TP1 sits at the nearest S/R level. <strong className="text-amber-400">Default 1.0 is the sweet spot</strong> &mdash; a 1:1 R:R exit is high-probability and triggers the BE stop move, which locks in a risk-free trade for the remaining 67%.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP2 TARGET &middot; float &middot; default 2.0 &middot; range 1.0&ndash;10.0 &middot; step 0.5</p>
              <p className="text-sm text-gray-400 leading-relaxed">Second scale-out. Default 2.0 = 2R (or 2&times; ATR). Where you take another 33% off. After TP2 hits, you are holding 33% of the original position and your SL is at BE &mdash; <strong className="text-white">worst case is scratch, runner is on for TP3 or trail</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP3 TARGET &middot; float &middot; default 3.0 &middot; range 1.5&ndash;15.0 &middot; step 0.5</p>
              <p className="text-sm text-gray-400 leading-relaxed">Final target for the runner. Default 3.0 = 3R. Most operators tighten SL to lock in gains as price approaches TP3 rather than letting TP3 fill as a hard limit &mdash; but the level is there as a reference for how far you expect the move to go.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CANONICAL SCALE-OUT SEQUENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2">When TP1 hits: <strong className="text-white">scale out 33% + move SL to break-even</strong>. This is the key step &mdash; the remainder is risk-free. When TP2 hits: scale out another 33%. Your worst case is now &ldquo;scratch on the runner,&rdquo; your profit is locked. When TP3 hits (or you trail the final third): you&apos;re out completely.</p>
            <p className="text-sm text-gray-400 leading-relaxed">This is <strong className="text-amber-400">NOT enforced by the indicator</strong>. CIPHER draws the levels; you execute the discipline. Pick a prop-firm dashboard or a broker that supports TIF orders, or set manual alerts and move stops at TP1 as soon as the alert fires.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S10 — Command Center Panel Master ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; COMMAND CENTER &mdash; master, position, size</p>
          <h2 className="text-2xl font-extrabold mb-4">The panel config &mdash; 3 top-level inputs</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The COMMAND CENTER group is the <strong className="text-white">largest in CIPHER</strong> &mdash; 19 inputs. Three top-level inputs configure the panel itself: a master on/off, a Position dropdown for which corner of the chart it sits in, and a Size dropdown for how much space it takes. The remaining 16 are individual row toggles, which we cover in section 11.</p>
          <PanelPositioningAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through all 12 combinations &mdash; 4 positions &times; 3 sizes. The panel occupies different chart real estate at each scale. <strong className="text-white">Bottom Right at Small</strong> (the Pine default) is the minimal footprint; <strong className="text-white">Top Left at Large</strong> is the most dominating configuration.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER &middot; checkbox &middot; default ON &middot; master toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Master on/off for the entire panel. When OFF, no rows display regardless of individual row toggles. When ON, the panel shows all rows that have their individual toggle checked. <strong className="text-white">One of only two COMMAND CENTER inputs that default ON</strong> (the other is Live Conditions).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">POSITION &middot; dropdown &middot; default Bottom Right &middot; Top Left / Top Right / Bottom Left / Bottom Right</p>
              <p className="text-sm text-gray-400 leading-relaxed">Which corner of the chart the panel anchors to. <strong className="text-white">Bottom Right</strong> is default because it keeps the panel out of the way of most price action (price tends to be on the right). <strong className="text-white">Top Left</strong> works if you prefer to reference the panel first before scanning price. <strong className="text-white">Top Right</strong> and <strong className="text-white">Bottom Left</strong> are alternatives based on which other tools you have on your chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE &middot; dropdown &middot; default Small &middot; Small / Normal / Large</p>
              <p className="text-sm text-gray-400 leading-relaxed">Panel scale. <strong className="text-white">Small</strong> is default &mdash; dense, minimal chart footprint, best for operators with sharp vision and multi-monitor setups. <strong className="text-white">Normal</strong> is the comfortable read for most screens. <strong className="text-white">Large</strong> is for presentation, streaming, or older eyes. Note: size does not change information density, only visual scale.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">CHOOSING POSITION BY MONITOR SETUP</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you trade on a single monitor, Bottom Right stays out of the way. If you trade on two monitors with the chart full-screen on one, <strong className="text-white">Top Left or Bottom Left</strong> frees the right side where live price action happens. If you have the Command Center on a separate monitor via a mirrored instance, position on each chart matters less &mdash; you&apos;re reading from the dedicated screen.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S11 — The 16 Row Toggles ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The 16 Row Toggles</p>
          <h2 className="text-2xl font-extrabold mb-4">Organized by family &mdash; TREND, ENERGY, RISK, STRUCTURE, CONTEXT, SIGNAL</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After the 3 panel-config inputs come 16 individual row toggles. Each one controls whether a specific Command Center row appears. Per Pine default, <strong className="text-amber-400">15 of these 16 default OFF</strong>, with only <strong className="text-white">Live Conditions</strong> defaulting ON. The intent is clear: <strong className="text-white">start empty, turn on only what you actually read</strong>.</p>
          <RowFamilyOverviewAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation groups the 16 rows into six families. Family grouping helps you decide which rows matter for your trading style: trend traders need TREND + CONTEXT; mean-reversion traders need RISK + ENERGY; structure readers need STRUCTURE + CONTEXT.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TREND FAMILY &middot; 4 rows</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Ribbon</strong> (7-state priority cascade) &middot; <strong className="text-white">Pulse</strong> (HOLDING → CLOSE → VERY CLOSE → FLIP WARNING) &middot; <strong className="text-white">Tension</strong> (RELAXED → BUILDING → STRETCHED → SNAPPING) &middot; <strong className="text-white">Momentum</strong> (NOW state + NEXT prediction).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ENERGY FAMILY &middot; 2 rows</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Volatility &amp; Squeeze</strong> (dual-mode, normal + squeeze-aware) &middot; <strong className="text-white">Volume</strong> (EMPTY → THIN → NORMAL → STRONG → EXTREME).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RISK FAMILY &middot; 1 row</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Risk Envelope</strong> (SAFE → NORMAL → CAUTION → DANGER).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE FAMILY &middot; 3 rows</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Structure</strong> (nearest S/R + proximity) &middot; <strong className="text-white">Imbalance</strong> (nearest FVG + proximity) &middot; <strong className="text-white">Sweeps</strong> (HOT / COOLING / COLD / NONE).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONTEXT FAMILY &middot; 4 rows</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Market Bias</strong> (asset-class aware) &middot; <strong className="text-white">Session</strong> (PRIME / HIGH VOL / NORMAL / LOW VOL) &middot; <strong className="text-white">Regime</strong> (TREND / RANGE / VOLATILE + transitions) &middot; <strong className="text-white">HTF Trend</strong> (dual-HTF with alignment verdict).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL FAMILY &middot; 2 rows</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Last Signal</strong> (most recent arrow + freshness) &middot; <strong className="text-white">Live Conditions</strong> (4 histogram gauges &mdash; the only row defaulting ON).</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">ROW-SELECTION RECOMMENDATIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Trend follower:</strong> Ribbon &middot; Pulse &middot; Momentum &middot; HTF Trend &middot; Live Conditions (5 rows)</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Mean reversion:</strong> Tension &middot; Risk Envelope &middot; Volume &middot; Regime &middot; Live Conditions (5 rows)</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Structure reader:</strong> Structure &middot; Imbalance &middot; Sweeps &middot; Market Bias &middot; Session &middot; Live Conditions (6 rows)</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">All-rounder:</strong> Ribbon &middot; Pulse &middot; Risk Envelope &middot; Structure &middot; HTF Trend &middot; Last Signal &middot; Live Conditions (7 rows)</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S12 — The Cross-Group Cascade ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Cross-Group Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">The dangerous version &mdash; one input, eight downstream systems</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In Part 1 you learned the <strong className="text-white">Silent Cascade</strong> within a single group. Part 2 introduces the more dangerous version: the <strong className="text-amber-400">Cross-Group Cascade</strong>, where settings in one group silently affect systems in OTHER groups. Three settings are particularly cascading &mdash; changing any one of them reshapes 5+ downstream systems across multiple groups.</p>
          <CrossGroupCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Three input cards at the top: <strong className="text-white">Strong Signals Only, Signal Engine, Pulse ATR Factor</strong>. Eight output cards at the bottom: Signal count, Candle coloring, Last Signal row, Pulse row action, Tooltip SL, Tooltip TP, Live Conditions, Chart density. Amber lightning lines connect each input to the outputs it affects. <strong className="text-amber-400">Strong Signals Only affects 7 of 8. Signal Engine affects 5. Pulse ATR Factor affects 5.</strong> These three settings are the most cascading in all of CIPHER.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE #1 &mdash; STRONG SIGNALS ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Flipping this toggle rewrites the entire signal distribution. Fewer signals = newer &ldquo;most recent&rdquo; signal = different Last Signal freshness = different Pulse row action = different tooltip values. <strong className="text-white">Seven downstream shifts from one checkbox.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE #2 &mdash; SIGNAL ENGINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Switching from Trend to Reversal changes WHICH signals exist. Candle coloring interacts (Composite candles encode different dimensions for reversal setups). Last Signal updates. Live Conditions shifts. <strong className="text-white">Five systems.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE #3 &mdash; PULSE ATR FACTOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Moving the slider by 0.1 shifts every Pulse line pixel. Signal count changes. If SL Method = Pulse, the tooltip SL value changes. Last Signal changes. Pulse row action changes. Live Conditions shifts. <strong className="text-white">Five systems &mdash; across both the visual layer (Part 1) and behavioral layer (Part 2).</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CROSS-GROUP RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Before changing any of these three settings <strong className="text-white">mid-session</strong>, close any open positions. The cascade recalculates live &mdash; if you have an open trade with SL Method = Pulse and you move Pulse ATR Factor, your displayed SL price shifts. Your actual broker stop does not &mdash; but the chart tooltip will now disagree with your real trade. <strong className="text-amber-400">Stop drift in chart-vs-broker is the most common way operators get confused</strong> about whether they&apos;re in a winning or losing position. Don&apos;t introduce it unnecessarily.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S13 — Three Behavioral Playbooks ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Three Behavioral Playbooks</p>
          <h2 className="text-2xl font-extrabold mb-4">Ready-to-steal configs for three operator profiles</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Mirroring the visual-layer playbooks in Part 1, here are three behavioral-layer configurations tuned for different operator profiles. Set PRESET = <strong className="text-white">None</strong> first, then manually configure the SIGNAL ENGINE, RISK MAP, and COMMAND CENTER rows below.</p>
          <BehavioralPlaybookMatrixAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 mb-4">
            <p className="text-xs font-bold text-amber-400 mb-2">PLAYBOOK 1 &mdash; THE TREND FOLLOWER</p>
            <p className="text-xs text-gray-500 mb-3 italic">15m&ndash;1H &middot; ride the wave &middot; HTF aligned</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Signal Engine:</strong> Trend &middot; <strong className="text-white">Direction:</strong> Both &middot; <strong className="text-white">Strong Signals:</strong> OFF &middot; <strong className="text-white">Candles:</strong> Trend Bold</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">SL Method:</strong> Auto &middot; <strong className="text-white">TP Method:</strong> R-Multiple</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-3"><strong className="text-white">CC Rows:</strong> Ribbon &middot; Pulse &middot; HTF</p>
            <p className="text-xs text-gray-500 leading-relaxed italic">Strong Signals OFF because you want to catch more signals in the direction of a clean trend. R-Multiple targets scale with volatility. HTF row keeps you aligned with the bigger trend.</p>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-4">
            <p className="text-xs font-bold text-amber-400 mb-2">PLAYBOOK 2 &mdash; MEAN REVERSION</p>
            <p className="text-xs text-gray-500 mb-3 italic">5m&ndash;15m &middot; catch the snap &middot; tight filter</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Signal Engine:</strong> Reversal &middot; <strong className="text-white">Direction:</strong> Both &middot; <strong className="text-white">Strong Signals:</strong> ON &middot; <strong className="text-white">Candles:</strong> Tension</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">SL Method:</strong> ATR &middot; <strong className="text-white">TP Method:</strong> Structure</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-3"><strong className="text-white">CC Rows:</strong> Tension &middot; Risk Envelope &middot; Structure</p>
            <p className="text-xs text-gray-500 leading-relaxed italic">Tension candles glow amber when price is stretched far from Flow &mdash; the setup signal. Strong Signals ON because reversal trades need conviction. Structure TPs because you&apos;re targeting the nearest institutional level.</p>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6">
            <p className="text-xs font-bold text-amber-400 mb-2">PLAYBOOK 3 &mdash; STRUCTURE-BASED</p>
            <p className="text-xs text-gray-500 mb-3 italic">15m&ndash;1H &middot; levels drive everything &middot; elite filter</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Signal Engine:</strong> All Signals &middot; <strong className="text-white">Direction:</strong> Both &middot; <strong className="text-white">Strong Signals:</strong> ON &middot; <strong className="text-white">Candles:</strong> Default</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">SL Method:</strong> Structure &middot; <strong className="text-white">TP Method:</strong> Structure</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-3"><strong className="text-white">CC Rows:</strong> Structure &middot; Sweeps &middot; Imbalance</p>
            <p className="text-xs text-gray-500 leading-relaxed italic">Everything revolves around levels. Structure SL + Structure TP + Default candles = pure chart-reading. Strong Signals ON to filter noise &mdash; you only want high-conviction trades around levels.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">RUN ONE PLAYBOOK AT A TIME</p>
            <p className="text-sm text-gray-400 leading-relaxed">Don&apos;t mix playbooks across symbols. Pick one, run it for at least <strong className="text-white">20 trades</strong>, measure the result, adjust ONE thing at a time. Switching between playbooks mid-session is how operators convince themselves that &ldquo;nothing works&rdquo; &mdash; what&apos;s actually happening is that they never gave any single configuration enough runway.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S14 — Common Behavioral Mistakes ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Behavioral Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Six ways the behavioral layer gets misconfigured</h2>
          <p className="text-gray-400 leading-relaxed mb-6">These are the six most common behavioral-layer errors operators make in live trading. Each is listed with its consequence and the fix. For each, ask honestly: have I done this?</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 1 &mdash; Turning OFF the Pulse display and expecting signals to stop</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The Pulse toggle is in the PULSE group of the visual layer (Part 1) &mdash; it hides the LINE, not the signals. <strong className="text-white">THE FIX:</strong> to actually silence PX arrows, change <strong className="text-white">Signal Engine</strong> to Reversal or Visuals Only. This mistake is so common it appears as Game R1.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 2 &mdash; Assuming Auto SL is a single method</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Auto is a <strong className="text-white">router</strong>. It resolves to different methods per asset class. A trader who runs Auto on crypto and expects it to behave like a forex trader&apos;s Auto is comparing different underlying methods. <strong className="text-white">THE FIX:</strong> know your asset class, know the resolution.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 3 &mdash; Leaving Strong Signals Only OFF on a signal-flooded chart</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">If you&apos;re getting 10+ arrows per hour on a 15m chart, your signal distribution is too permissive for actual execution. <strong className="text-white">THE FIX:</strong> turn Strong Signals ON &mdash; you&apos;ll drop 50&ndash;70% of signals but the survivors will be the 3-of-4-factor plays. Fewer trades, higher conviction.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 4 &mdash; Enabling all 16 Command Center row toggles</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The Pine default is 15 of 16 OFF for a reason &mdash; <strong className="text-white">information density kills decision latency</strong>. Most expert operators run 5&ndash;8 rows. <strong className="text-white">THE FIX:</strong> All-16 is a beginner configuration; the cognitive load makes you slower, not better-informed. Pick 5&ndash;7 rows that match your style (see section 11).</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 5 &mdash; Changing Cipher Candles mid-session</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The candle mode is a <strong className="text-white">semantic choice</strong>, not a cosmetic one. Composite Bold encodes different information than Tension. Switching mid-session means you&apos;re reading a different signal from the exact same bars &mdash; which causes misreads. <strong className="text-white">THE FIX:</strong> pick a mode, run it for a full session at minimum.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 6 &mdash; Mixing SL Method and TP Method without thinking about it</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">SL Structure + TP Structure is coherent (both level-based). SL ATR + TP R-Multiple is coherent (both volatility-based). SL Pulse + TP Structure is mixing philosophies. <strong className="text-white">THE FIX:</strong> not wrong, but you should be ABLE to articulate why. If you can&apos;t explain why SL Pulse feels right but TP Structure feels right, go back to Auto for both until you can.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S15 — Behavioral Layer Cheat Sheet ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Behavioral Layer Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Screenshot This. Pin It.</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The 3 Behavioral Groups (33 inputs total)</p>
                <p className="text-sm text-gray-300"><strong className="text-white">SIGNAL ENGINE</strong> 4 &middot; <strong className="text-white">CIPHER RISK MAP</strong> 10 &middot; <strong className="text-white">COMMAND CENTER</strong> 19 (3 panel + 16 row toggles).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Arrow Is the Last Word</p>
                <p className="text-sm text-gray-300">Every arrow passes a 4-factor vote: <strong className="text-white">Ribbon stacked &middot; ADX &gt; 20 &middot; Volume &gt; 1.0&times; &middot; Momentum &gt; 50%</strong>. Three of four must agree. Strong Signals Only enforces this filter.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Signal Engine Modes</p>
                <p className="text-sm text-gray-300"><strong className="text-white">All Signals</strong> = PX + TS &middot; <strong className="text-white">Trend</strong> = PX only (continuations) &middot; <strong className="text-white">Reversal</strong> = TS only (pullbacks/V-bottoms) &middot; <strong className="text-white">Visuals Only</strong> = no arrows, visuals live.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Auto SL Router (per asset class)</p>
                <p className="text-sm text-gray-300"><strong className="text-white">Crypto → Structure</strong> &middot; <strong className="text-white">Forex → Pulse</strong> &middot; <strong className="text-white">Stocks/Indices → Structure</strong>. Auto TP: <strong className="text-white">Crypto → R-Multiple &middot; Forex → ATR Targets &middot; Stocks/Indices → Structure</strong>. Override by setting the dropdown to a specific method.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Scale-Out Discipline</p>
                <p className="text-sm text-gray-300"><strong className="text-white">TP1 (1R) = scale out 33% + move SL to BE</strong>. TP2 (2R) = scale out another 33%. TP3 (3R) = runner close or trail. CIPHER draws the levels, you execute the discipline.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The 6 Row Families</p>
                <p className="text-sm text-gray-300"><strong className="text-white">TREND</strong> (Ribbon/Pulse/Tension/Momentum) &middot; <strong className="text-white">ENERGY</strong> (Volatility/Volume) &middot; <strong className="text-white">RISK</strong> (Envelope) &middot; <strong className="text-white">STRUCTURE</strong> (Structure/Imbalance/Sweeps) &middot; <strong className="text-white">CONTEXT</strong> (Bias/Session/Regime/HTF) &middot; <strong className="text-white">SIGNAL</strong> (Last Signal/Live Conditions).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Cross-Group Cascade &mdash; the Big 3</p>
                <p className="text-sm text-gray-300"><strong className="text-white">Strong Signals Only</strong> (7 downstream) &middot; <strong className="text-white">Signal Engine</strong> (5) &middot; <strong className="text-white">Pulse ATR Factor</strong> (5 across visual+behavioral). Don&apos;t change these mid-session with open positions.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three Playbooks</p>
                <p className="text-sm text-gray-300"><strong className="text-white">Trend Follower:</strong> Signal=Trend, SL=Auto, TP=R-Multiple, Candles=Trend Bold. <strong className="text-white">Mean Reversion:</strong> Signal=Reversal, Strong ON, SL=ATR, TP=Structure, Candles=Tension. <strong className="text-white">Structure-Based:</strong> Signal=All, Strong ON, SL=Structure, TP=Structure, Candles=Default.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 mb-1">Mistakes to Avoid</p>
                <p className="text-sm text-gray-300">&#10060; Pulse OFF expecting signals to stop &middot; &#10060; Auto SL assumed to be one method &middot; &#10060; Strong Signals OFF on flooded charts &middot; &#10060; All 16 CC rows enabled &middot; &#10060; Changing Candles mid-session &middot; &#10060; Mixing SL/TP methods blindly.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">The Behavioral Gauntlet</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing your grasp of the behavioral layer &mdash; Signal Engine behavior, Strong Signals, SL/TP method choice, scale-out discipline. Pick the right answer. Explanations appear after every answer &mdash; including for the wrong ones.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{gameRounds[gameRound].scenario}</p>
            <p className="text-sm font-semibold text-white mb-4">{gameRounds[gameRound].prompt}</p>
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt) => {
                const answered = gameSelections[gameRound] !== null;
                const selected = gameSelections[gameRound] === opt.id;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={opt.id}>
                    <button
                      onClick={() => {
                        if (gameSelections[gameRound] !== null) return;
                        const next = [...gameSelections];
                        next[gameRound] = opt.id;
                        setGameSelections(next);
                      }}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}
                    >
                      <span className="text-gray-200">{opt.text}</span>
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '✓' : '✗'} {opt.explain}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameSelections[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(gameRound + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameSelections[gameRound] !== null && gameRound === gameRounds.length - 1 && (() => {
              const finalScore = gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-lg font-extrabold text-amber-400">{finalScore}/{gameRounds.length} Correct</p>
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Behavioral-layer instinct installed. You understand every dropdown, every cascade, every scale-out.' : finalScore >= 3 ? 'Solid grasp. Re-read the Cross-Group Cascade (12) and the Signal Engine modes (02) before the quiz.' : 'Re-study The Arrow Is the Last Word (01), the 4-factor audit (04), and the Cross-Group Cascade (12) before the quiz.'}</p>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* === S17 — Final Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === opt.id;
                    const isCorrect = opt.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (quizAnswers[qi] !== null) return;
                          const next = [...quizAnswers];
                          next[qi] = opt.id;
                          setQuizAnswers(next);
                          if (next.every(a => a !== null)) setQuizSubmitted(true);
                        }}
                        disabled={answered}
                        className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400"><span className="font-bold">&#9989;</span> {q.explain}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {quizSubmitted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizPercent}%</p>
              <p className="text-sm text-gray-400">{quizPassed ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}
          {certRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9636;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.3b: CIPHER Inputs Anatomy &mdash; Part 2 (The Behavioral Layer)</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; CIPHER Behavioral-Layer Operator &mdash;</p>
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
