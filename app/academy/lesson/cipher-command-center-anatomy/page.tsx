// app/academy/lesson/cipher-command-center-anatomy/page.tsx
// ATLAS Academy — Lesson 11.2: The CIPHER Command Center — Anatomy [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT (consistent with Level 10 + 11.1)
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
// BRAND COLORS (from ATLAS palette — match CIPHER Pine source)
// ============================================================
const TEAL = 'rgba(38,166,154,1)';       // #26A69A — bullish / positive
const MAGENTA = 'rgba(239,83,80,1)';     // #EF5350 — bearish / warning
const AMBER = 'rgba(255,179,0,1)';       // #FFB300 — caution / transition
const RED_BRIGHT = 'rgba(255,23,68,1)';  // #FF1744 — urgent danger
const WHITE_DIM = 'rgba(255,255,255,0.4)';
const WHITE_LBL = 'rgba(136,136,136,1)'; // c_lbl from Pine — row labels

// ============================================================
// ANIMATION 1: The Priority Waterfall (Groundbreaking Concept)
// Shows the Ribbon row's action cell. Reveals the stack of 7 possible
// states CIPHER could surface for this row. Shows the winning state
// rising to the top while others fade. Every cell is a verdict that
// has ALREADY resolved the priority conflict for you.
// ============================================================
function PriorityWaterfallAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE PRIORITY WATERFALL — EVERY CELL IS THE TOP OF A STACK', w / 2, 16);

    // The Ribbon row's Action column has a 7-level priority stack.
    // Priority order (highest to lowest) from Pine code line 3112:
    //   1. DIVERGING    (internal trend deterioration)
    //   2. CURVING      (projection bending back)
    //   3. DOUBLE COIL  (ribbon + BB/KC both compressed)
    //   4. COILED       (ribbon squeeze confirmed)
    //   5. FLIP NEAR    (cross proximity)
    //   6. AGING        (past average stack duration)
    //   7. EXPANDING    (healthy trend — default when nothing else wins)
    const stack = [
      { text: 'DIVERGING',   color: AMBER,    priority: 1, note: 'internal deterioration' },
      { text: 'CURVING',     color: AMBER,    priority: 2, note: 'projection bending back' },
      { text: 'DOUBLE COIL', color: MAGENTA,  priority: 3, note: 'ribbon + BB/KC compressed' },
      { text: 'COILED',      color: AMBER,    priority: 4, note: 'ribbon squeeze confirmed' },
      { text: 'FLIP NEAR',   color: AMBER,    priority: 5, note: 'cross proximity' },
      { text: 'AGING',       color: AMBER,    priority: 6, note: 'past average duration' },
      { text: 'EXPANDING',   color: TEAL,     priority: 7, note: 'healthy trend (default)' },
    ];

    // Cycle through different winning states to show the stack resolving
    // differently depending on current conditions
    const winnerIdx = Math.floor(t * 0.22) % stack.length;

    // Animation timeline within each cycle:
    //   0.00 - 0.30 : stack appears, all dim
    //   0.30 - 0.60 : winner rises/brightens, others fade
    //   0.60 - 1.00 : winner shown as final cell verdict
    const cyclePos = (t * 0.22) % 1;
    const phase = cyclePos < 0.3 ? 0 : cyclePos < 0.6 ? 1 : 2;
    const phaseProgress = phase === 0 ? cyclePos / 0.3 : phase === 1 ? (cyclePos - 0.3) / 0.3 : (cyclePos - 0.6) / 0.4;

    // Stack visualization on the left — all 7 candidates stacked vertically
    const stackX = 30;
    const stackY = 38;
    const stackItemH = 22;
    const stackItemW = 180;

    // Stack label header
    ctx.fillStyle = WHITE_DIM;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRIORITY STACK (7 candidates)', stackX, stackY - 8);

    stack.forEach((item, i) => {
      const y = stackY + i * stackItemH;
      const isWinner = i === winnerIdx;

      // Alpha logic — during phase 1, winner brightens and losers fade
      let alpha = 0.35;
      if (phase === 0) {
        alpha = 0.35 * phaseProgress;
      } else if (phase === 1) {
        alpha = isWinner ? 0.35 + 0.6 * phaseProgress : 0.35 * (1 - phaseProgress * 0.7);
      } else {
        alpha = isWinner ? 0.95 : 0.1;
      }

      // Row background
      ctx.fillStyle = `rgba(0,0,0,${0.4 * alpha})`;
      ctx.fillRect(stackX, y, stackItemW, stackItemH - 2);

      // Winner highlight box
      if (isWinner && phase >= 1) {
        const pulse = 0.6 + 0.4 * Math.sin(f * 0.2);
        ctx.strokeStyle = item.color.replace(/[\d.]+\)$/, `${pulse * (phase === 2 ? 1 : phaseProgress)})`);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(stackX, y, stackItemW, stackItemH - 2);
      }

      // Priority number
      ctx.fillStyle = `rgba(255,255,255,${0.4 * alpha})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.priority}.`, stackX + 6, y + 14);

      // State text
      ctx.fillStyle = item.color.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(item.text, stackX + 22, y + 14);

      // Note (italic, dim)
      ctx.fillStyle = `rgba(255,255,255,${0.4 * alpha})`;
      ctx.font = 'italic 8px system-ui';
      ctx.fillText(item.note, stackX + 96, y + 14);
    });

    // Arrow from stack to cell — only visible in phase 1+
    if (phase >= 1) {
      const arrowAlpha = phase === 1 ? phaseProgress : 1;
      const winnerY = stackY + winnerIdx * stackItemH + stackItemH / 2 - 1;
      const cellX = stackX + stackItemW + 56;
      const cellY = 120;

      ctx.strokeStyle = `rgba(255,179,0,${0.6 * arrowAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(stackX + stackItemW + 4, winnerY);
      ctx.lineTo(cellX - 4, cellY + 14);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = `rgba(255,179,0,${0.8 * arrowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(cellX - 4, cellY + 14);
      ctx.lineTo(cellX - 10, cellY + 10);
      ctx.lineTo(cellX - 10, cellY + 18);
      ctx.closePath();
      ctx.fill();
    }

    // The actual Command Center row on the right — what the trader sees
    const rowX = stackX + stackItemW + 60;
    const rowY = 120;
    const rowH = 28;
    const rowW = w - rowX - 30;

    // Reveal alpha for the output row
    const rowAlpha = phase === 0 ? phaseProgress : 1;

    // Row background
    ctx.fillStyle = `rgba(0,0,0,${0.5 * rowAlpha})`;
    ctx.fillRect(rowX, rowY, rowW, rowH);
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * rowAlpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(rowX, rowY, rowW, rowH);

    // Cell dividers (faint)
    const cell0W = rowW * 0.22;
    const cell1W = rowW * 0.36;
    ctx.strokeStyle = `rgba(255,255,255,${0.08 * rowAlpha})`;
    ctx.beginPath();
    ctx.moveTo(rowX + cell0W, rowY);
    ctx.lineTo(rowX + cell0W, rowY + rowH);
    ctx.moveTo(rowX + cell0W + cell1W, rowY);
    ctx.lineTo(rowX + cell0W + cell1W, rowY + rowH);
    ctx.stroke();

    // Cell 0 — "Ribbon" label
    ctx.fillStyle = WHITE_LBL.replace(/[\d.]+\)$/, `${rowAlpha})`);
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Ribbon', rowX + 10, rowY + 19);

    // Cell 1 — state (direction) — always "▲ BULL" in this example
    ctx.fillStyle = TEAL.replace(/[\d.]+\)$/, `${rowAlpha})`);
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('▲ BULL', rowX + cell0W + cell1W / 2, rowY + 19);

    // Cell 2 — the winning action from the priority stack
    const winner = stack[winnerIdx];
    const winnerAlpha = phase < 2 ? (phase === 1 ? phaseProgress : 0) : 1;
    ctx.fillStyle = winner.color.replace(/[\d.]+\)$/, `${winnerAlpha})`);
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('→ ' + winner.text, rowX + cell0W + cell1W + 10, rowY + 19);

    // Labels for the output row
    ctx.fillStyle = `rgba(255,255,255,${0.35 * rowAlpha})`;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CELL 0 · LABEL', rowX + 10, rowY + rowH + 12);
    ctx.textAlign = 'center';
    ctx.fillText('CELL 1 · STATE', rowX + cell0W + cell1W / 2, rowY + rowH + 12);
    ctx.textAlign = 'left';
    ctx.fillText('CELL 2 · ACTION (from stack)', rowX + cell0W + cell1W + 10, rowY + rowH + 12);

    // Bottom caption
    ctx.fillStyle = WHITE_DIM;
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('You see the verdict. CIPHER already resolved the conflict for you.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 2: Executive Summary Header — The always-on cell
// Shows the 3-column header with its internal priority-waterfall
// action hint cycling through different states
// ============================================================
function ExecutiveHeaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE EXECUTIVE SUMMARY HEADER — ALWAYS ON, ALWAYS READ FIRST', w / 2, 16);

    // Cycle through different market states to show header responding
    const states = [
      { state: '▲ BULL TREND', stateColor: TEAL, action: '→ RIDE IT', actionColor: TEAL, caption: 'Clean trending state · header says GO' },
      { state: '↔ RANGING', stateColor: AMBER, action: '→ SNAP ZONE', actionColor: AMBER, caption: 'Range with stretched tension · watch for reversal' },
      { state: '▼ BEAR TREND', stateColor: MAGENTA, action: '→ BREAKOUT ▼', actionColor: MAGENTA, caption: 'Squeeze resolved bearish · ride the move' },
      { state: '⚡ VOLATILE', stateColor: MAGENTA, action: '→ REDUCE SIZE', actionColor: MAGENTA, caption: 'Chaotic state · smaller positions, tighter stops' },
      { state: '↔ RANGING', stateColor: AMBER, action: '→ FADING', actionColor: RED_BRIGHT, caption: 'Range with fading momentum · trend is dying' },
    ];

    const stateIdx = Math.floor(t * 0.35) % states.length;
    const state = states[stateIdx];

    // The header row — 3 columns
    const headerY = 50;
    const headerH = 40;
    const headerX = 30;
    const headerW = w - 60;

    // Row 0 header styling — darker background like c_bg_hdr in Pine
    ctx.fillStyle = 'rgba(26,26,26,0.75)';
    ctx.fillRect(headerX, headerY, headerW, headerH);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(headerX, headerY, headerW, headerH);

    // Column dividers (subtle)
    const col1W = headerW * 0.3;
    const col2W = headerW * 0.3;
    const col3W = headerW - col1W - col2W;

    // Column 0: CIPHER PRO ⓘ
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER PRO', headerX + 14, headerY + 25);
    ctx.fillStyle = WHITE_DIM;
    ctx.font = '11px system-ui';
    ctx.fillText(' ⓘ', headerX + 14 + ctx.measureText('CIPHER PRO').width, headerY + 25);

    // Column 1: State — centered, colored by state type
    const stateCenterX = headerX + col1W + col2W / 2;
    const statePulse = 0.85 + 0.15 * Math.sin(f * 0.15);
    ctx.fillStyle = state.stateColor.replace(/[\d.]+\)$/, `${statePulse})`);
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.state, stateCenterX, headerY + 26);

    // Column 2: Action hint — left-aligned, colored by action urgency
    const actionX = headerX + col1W + col2W + 14;
    const actionPulse = 0.85 + 0.15 * Math.sin(f * 0.2);
    ctx.fillStyle = state.actionColor.replace(/[\d.]+\)$/, `${actionPulse})`);
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(state.action, actionX, headerY + 26);

    // Labels below the header — what each column represents
    const labelY = headerY + headerH + 18;
    ctx.fillStyle = WHITE_DIM;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('COL 0 · BRAND', headerX + 14, labelY);
    ctx.textAlign = 'center';
    ctx.fillText('COL 1 · STATE', stateCenterX, labelY);
    ctx.textAlign = 'left';
    ctx.fillText('COL 2 · ACTION HINT', actionX, labelY);

    // Descriptions
    ctx.fillStyle = `rgba(255,255,255,0.45)`;
    ctx.font = 'italic 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('tooltip anchor', headerX + 14, labelY + 12);
    ctx.textAlign = 'center';
    ctx.fillText('regime + direction', stateCenterX, labelY + 12);
    ctx.textAlign = 'left';
    ctx.fillText('priority-waterfall verdict', actionX, labelY + 12);

    // Scenario caption
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.caption, w / 2, h - 28);

    // State indicator dots (showing cycle position)
    const dotY = h - 12;
    const dotSpacing = 14;
    const dotStart = w / 2 - ((states.length - 1) * dotSpacing) / 2;
    states.forEach((_, i) => {
      ctx.fillStyle = i === stateIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 3: The 3-Column Grammar
// Shows the universal row pattern — every row is Label + State + Action
// Demonstrates that once you learn the grammar, you can read any row
// ============================================================
function ThreeColumnGrammarAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE UNIVERSAL 3-COLUMN GRAMMAR — EVERY ROW SPEAKS THE SAME LANGUAGE', w / 2, 16);

    // Show 4 different rows to demonstrate the pattern holds
    const rows = [
      { label: 'Ribbon', state: '▲ BULL', stateColor: TEAL, action: '→ EXPANDING', actionColor: TEAL },
      { label: 'Tension', state: '▼ STRETCHED', stateColor: MAGENTA, action: '→ SNAP LIKELY', actionColor: AMBER },
      { label: 'Risk', state: '▼ SAFE', stateColor: TEAL, action: '→ NORMAL SIZE', actionColor: WHITE_DIM },
      { label: 'Session', state: 'NEW YORK', stateColor: 'rgba(255,255,255,0.8)', action: '→ NORMAL', actionColor: WHITE_DIM },
    ];

    const rowStartY = 42;
    const rowH = 26;
    const rowGap = 4;
    const rowX = 30;
    const rowW = w - 60;

    const col1W = rowW * 0.18; // Label
    const col2W = rowW * 0.42; // State
    const col3W = rowW - col1W - col2W; // Action

    rows.forEach((row, i) => {
      const y = rowStartY + i * (rowH + rowGap);
      const reveal = Math.max(0, Math.min(1, t * 0.5 - i * 0.3));
      if (reveal <= 0) return;

      // Row background
      ctx.fillStyle = `rgba(0,0,0,${0.35 * reveal})`;
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = `rgba(255,255,255,${0.08 * reveal})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      // Column separators (visible on first row only to teach the pattern)
      if (i === 0 && reveal > 0.5) {
        const sepAlpha = (reveal - 0.5) * 2 * 0.3;
        ctx.strokeStyle = `rgba(255,179,0,${sepAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rowX + col1W, y);
        ctx.lineTo(rowX + col1W, y + rowH);
        ctx.moveTo(rowX + col1W + col2W, y);
        ctx.lineTo(rowX + col1W + col2W, y + rowH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Column 0: Label (left-aligned, dim gray)
      ctx.fillStyle = WHITE_LBL.replace(/[\d.]+\)$/, `${reveal})`);
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, rowX + 10, y + 17);

      // Column 1: State (centered, colored)
      ctx.fillStyle = row.stateColor.replace(/[\d.]+\)$/, `${reveal})`);
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.state, rowX + col1W + col2W / 2, y + 17);

      // Column 2: Action (left-aligned, colored)
      ctx.fillStyle = row.actionColor.replace(/[\d.]+\)$/, `${reveal})`);
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.action, rowX + col1W + col2W + 10, y + 17);
    });

    // Column headers appear after all rows revealed
    const headerReveal = Math.max(0, Math.min(1, t * 0.5 - rows.length * 0.3));
    if (headerReveal > 0) {
      const hy = rowStartY + rows.length * (rowH + rowGap) + 18;

      ctx.fillStyle = `rgba(255,179,0,${headerReveal})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('COLUMN 0 · LABEL', rowX + 10, hy);
      ctx.textAlign = 'center';
      ctx.fillText('COLUMN 1 · STATE', rowX + col1W + col2W / 2, hy);
      ctx.textAlign = 'left';
      ctx.fillText('COLUMN 2 · ACTION', rowX + col1W + col2W + 10, hy);

      // Descriptions
      ctx.fillStyle = `rgba(255,255,255,${0.5 * headerReveal})`;
      ctx.font = 'italic 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('the row name', rowX + 10, hy + 12);
      ctx.textAlign = 'center';
      ctx.fillText('current state', rowX + col1W + col2W / 2, hy + 12);
      ctx.textAlign = 'left';
      ctx.fillText('what to do about it', rowX + col1W + col2W + 10, hy + 12);
    }

    // Bottom insight
    ctx.fillStyle = WHITE_DIM;
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Learn the grammar once · read every row forever.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: The Trend Family — Ribbon + Pulse + Tension
// Shows how the first three rows (Ribbon, Pulse, Tension) form a
// coordinated "Trend family" that tells the trend story together
// ============================================================
function TrendFamilyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE TREND FAMILY — THREE ROWS, ONE STORY', w / 2, 16);

    // Cycle through 3 trend narratives to show how the family speaks together
    const narratives = [
      {
        label: 'HEALTHY TREND',
        ribbon: { state: '▲ BULL', stateColor: TEAL, action: '→ EXPANDING', actionColor: TEAL },
        pulse: { state: '▲ SUPPORT 15b HOLDING', stateColor: TEAL, action: '→ TREND SAFE', actionColor: TEAL },
        tension: { state: '▲ RELAXED', stateColor: TEAL, action: '→ NO PRESSURE', actionColor: WHITE_DIM },
        story: 'All three rows agree · trend is healthy · ride it',
      },
      {
        label: 'TREND WEAKENING',
        ribbon: { state: '▲ BULL', stateColor: TEAL, action: '→ DIVERGING', actionColor: AMBER },
        pulse: { state: '▲ SUPPORT 45b STRETCHED', stateColor: TEAL, action: '→ OVEREXTENDED MATURE', actionColor: AMBER },
        tension: { state: '▲ BUILDING', stateColor: AMBER, action: '→ WATCH FOR SNAP', actionColor: AMBER },
        story: 'Trend visibly alive but internal warnings · trim into strength',
      },
      {
        label: 'SNAP LIKELY',
        ribbon: { state: '▲ BULL', stateColor: TEAL, action: '→ CURVING', actionColor: AMBER },
        pulse: { state: '▲ SUPPORT 52b STRETCHED', stateColor: TEAL, action: '→ OVEREXTENDED', actionColor: AMBER },
        tension: { state: '▲ STRETCHED', stateColor: MAGENTA, action: '→ SNAP LIKELY', actionColor: AMBER },
        story: 'All three signal different urgency levels · reversal imminent',
      },
    ];

    const narrativeIdx = Math.floor(t * 0.25) % narratives.length;
    const nar = narratives[narrativeIdx];

    // Narrative label at top
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.label, w / 2, 32);

    // Render the 3 rows
    const rowStartY = 46;
    const rowH = 28;
    const rowGap = 3;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.14;
    const col2W = rowW * 0.48;

    const rows = [
      { name: 'Ribbon', data: nar.ribbon },
      { name: 'Pulse', data: nar.pulse },
      { name: 'Tension', data: nar.tension },
    ];

    rows.forEach((row, i) => {
      const y = rowStartY + i * (rowH + rowGap);

      // Row background
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      // Label
      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, rowX + 10, y + 19);

      // State
      ctx.fillStyle = row.data.stateColor;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.data.state, rowX + col1W + col2W / 2, y + 19);

      // Action
      ctx.fillStyle = row.data.actionColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.data.action, rowX + col1W + col2W + 10, y + 19);
    });

    // Family bracket on the left side
    const bracketX = rowX - 16;
    const bracketTop = rowStartY;
    const bracketBot = rowStartY + rows.length * (rowH + rowGap) - rowGap;
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bracketX + 4, bracketTop);
    ctx.lineTo(bracketX, bracketTop);
    ctx.lineTo(bracketX, bracketBot);
    ctx.lineTo(bracketX + 4, bracketBot);
    ctx.stroke();

    // Family label (vertical)
    ctx.save();
    ctx.translate(bracketX - 6, (bracketTop + bracketBot) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TREND FAMILY', 0, 0);
    ctx.restore();

    // Story caption
    const storyY = rowStartY + rows.length * (rowH + rowGap) + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.story, w / 2, storyY);

    // Scenario dots
    const dotY = h - 10;
    const dotSpacing = 18;
    const dotStart = w / 2 - ((narratives.length - 1) * dotSpacing) / 2;
    narratives.forEach((_, i) => {
      ctx.fillStyle = i === narrativeIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 5: The Energy Family — Momentum + Volatility/Squeeze
// Two rows that together tell the "how much fuel, ready to explode?"
// story. Momentum = energy now. Volatility/Squeeze = energy coiled.
// Cycles through 3 narratives showing how the family speaks together.
// ============================================================
function EnergyFamilyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE ENERGY FAMILY — HOW MUCH FUEL, READY TO FIRE?', w / 2, 16);

    // 3 narratives showing how Momentum + Volatility work together
    const narratives = [
      {
        label: 'HEALTHY RIDE',
        momentum: { state: '▲ SURGING 8b 78%▲', stateColor: 'rgba(0,230,118,1)', action: '→ HOLD POSITION', actionColor: 'rgba(0,230,118,1)' },
        volatility: { state: 'EXPANDING', stateColor: TEAL, action: '→ MOVES COMING', actionColor: TEAL },
        story: 'Strong momentum · volatility expanding · trend is alive',
      },
      {
        label: 'LOADED SPRING',
        momentum: { state: '— FLAT', stateColor: 'rgba(255,255,255,0.8)', action: '→ WAIT', actionColor: WHITE_DIM },
        volatility: { state: '⚡ BREAKOUT READY 14b', stateColor: TEAL, action: '→ PREPARE ENTRY 72% energy', actionColor: TEAL },
        story: 'Momentum paused · squeeze coiled · energy about to release',
      },
      {
        label: 'TREND DYING',
        momentum: { state: '▲ FADING 6b 32%▼', stateColor: 'rgba(0,188,212,1)', action: '→ REDUCE SIZE', actionColor: 'rgba(0,188,212,1)' },
        volatility: { state: 'HIGH', stateColor: MAGENTA, action: '→ WIDEN STOPS', actionColor: MAGENTA },
        story: 'Momentum burning out · volatility spiking · exit zone',
      },
    ];

    const narrativeIdx = Math.floor(t * 0.22) % narratives.length;
    const nar = narratives[narrativeIdx];

    // Narrative label at top
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.label, w / 2, 32);

    // Render the 2 rows
    const rowStartY = 48;
    const rowH = 28;
    const rowGap = 3;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.16;
    const col2W = rowW * 0.46;

    const rows = [
      { name: 'Momentum', data: nar.momentum },
      { name: 'Volatility', data: nar.volatility },
    ];

    rows.forEach((row, i) => {
      const y = rowStartY + i * (rowH + rowGap);

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, rowX + 10, y + 19);

      ctx.fillStyle = row.data.stateColor;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.data.state, rowX + col1W + col2W / 2, y + 19);

      ctx.fillStyle = row.data.actionColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.data.action, rowX + col1W + col2W + 10, y + 19);
    });

    // Family bracket
    const bracketX = rowX - 16;
    const bracketTop = rowStartY;
    const bracketBot = rowStartY + rows.length * (rowH + rowGap) - rowGap;
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bracketX + 4, bracketTop);
    ctx.lineTo(bracketX, bracketTop);
    ctx.lineTo(bracketX, bracketBot);
    ctx.lineTo(bracketX + 4, bracketBot);
    ctx.stroke();

    ctx.save();
    ctx.translate(bracketX - 6, (bracketTop + bracketBot) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ENERGY FAMILY', 0, 0);
    ctx.restore();

    // Story caption
    const storyY = rowStartY + rows.length * (rowH + rowGap) + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.story, w / 2, storyY);

    // Dots
    const dotY = h - 10;
    const dotSpacing = 18;
    const dotStart = w / 2 - ((narratives.length - 1) * dotSpacing) / 2;
    narratives.forEach((_, i) => {
      ctx.fillStyle = i === narrativeIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={160} />;
}

// ============================================================
// ANIMATION 6: The Participation Row — Volume
// A single-row deep-dive. Shows how Volume's state cascades through
// 5 levels (CLIMAX / STRONG / NORMAL / THIN / EMPTY) and what each
// means for conviction. Volume is "who actually showed up."
// ============================================================
function VolumeRowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE PARTICIPATION ROW — VOLUME = WHO ACTUALLY SHOWED UP', w / 2, 16);

    // Volume's 5 states from Pine line 3234
    const states = [
      { state: 'EXTREME', stateColor: MAGENTA, action: '→ EXHAUSTION RISK', actionColor: MAGENTA, caption: '2.0x+ avg · climax bar · someone is trapped' },
      { state: 'STRONG',  stateColor: TEAL,    action: '→ CONVICTION MOVE', actionColor: TEAL,    caption: '1.3x+ avg · institutions are present · trust the move' },
      { state: 'NORMAL',  stateColor: 'rgba(204,204,204,1)', action: '→ HEALTHY',         actionColor: WHITE_DIM, caption: 'baseline participation · no bias either way' },
      { state: 'THIN',    stateColor: AMBER,   action: '→ LOW CONVICTION', actionColor: AMBER,   caption: '0.5-0.8x avg · weak hands only · moves may not hold' },
      { state: 'EMPTY',   stateColor: AMBER,   action: '→ IGNORE MOVES',   actionColor: AMBER,   caption: 'under 0.5x avg · nobody cares · whatever happens is noise' },
    ];

    const stateIdx = Math.floor(t * 0.28) % states.length;
    const state = states[stateIdx];

    // The row
    const rowY = 48;
    const rowH = 32;
    const rowX = 40;
    const rowW = w - 80;
    const col1W = rowW * 0.14;
    const col2W = rowW * 0.36;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(rowX, rowY, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rowX, rowY, rowW, rowH);

    // Cell dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(rowX + col1W, rowY);
    ctx.lineTo(rowX + col1W, rowY + rowH);
    ctx.moveTo(rowX + col1W + col2W, rowY);
    ctx.lineTo(rowX + col1W + col2W, rowY + rowH);
    ctx.stroke();

    // Label
    ctx.fillStyle = WHITE_LBL;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Volume', rowX + 12, rowY + 21);

    // State (center)
    const statePulse = 0.85 + 0.15 * Math.sin(f * 0.18);
    ctx.fillStyle = state.stateColor.replace(/[\d.]+\)$/, `${statePulse})`);
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.state, rowX + col1W + col2W / 2, rowY + 21);

    // Action (left-aligned in cell 3)
    ctx.fillStyle = state.actionColor.replace(/[\d.]+\)$/, `${statePulse})`);
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(state.action, rowX + col1W + col2W + 12, rowY + 21);

    // Bar chart underneath showing the 5 states with current position highlighted
    const chartY = rowY + rowH + 24;
    const chartH = 38;
    const chartStartX = rowX;
    const chartW = rowW;
    const barW = chartW / states.length;

    states.forEach((s, i) => {
      const isActive = i === stateIdx;
      const alpha = isActive ? 1 : 0.25;
      const barHeight = chartH * (1 - i * 0.15);
      const bx = chartStartX + i * barW;
      const by = chartY + (chartH - barHeight);

      // Bar fill
      ctx.fillStyle = s.stateColor.replace(/[\d.]+\)$/, `${alpha * 0.7})`);
      ctx.fillRect(bx + 6, by, barW - 12, barHeight);

      // Border if active
      if (isActive) {
        ctx.strokeStyle = s.stateColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 6, by, barW - 12, barHeight);
      }

      // Label beneath bar
      ctx.fillStyle = isActive ? s.stateColor : `rgba(255,255,255,${alpha})`;
      ctx.font = isActive ? 'bold 9px system-ui' : '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.state, bx + barW / 2, chartY + chartH + 12);
    });

    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.caption, w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 7: The Risk Row — Zone cascade
// Shows how price position in the Risk Envelope cascades through
// 4 zones (SAFE / WATCH / CAUTION / DANGER) with transition events
// and dwell-time awareness. Sizing guidance at each zone.
// ============================================================
function RiskRowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE RISK ROW — WHERE ARE YOU IN THE ENVELOPE?', w / 2, 16);

    // 4 zones with risk row display + sizing guidance
    const zones = [
      { state: '▲ SAFE',    stateColor: TEAL,    action: '→ NORMAL SIZE',      actionColor: WHITE_DIM, caption: 'Inside inner band · position normally · no adjustment' },
      { state: '▲ WATCH',   stateColor: AMBER,   action: '→ STAY ALERT 4b',    actionColor: AMBER,     caption: 'Price outside inner band · pay attention · not dangerous yet' },
      { state: '▲ CAUTION', stateColor: AMBER,   action: '→ TIGHTEN STOPS 9b', actionColor: AMBER,     caption: 'Between mid and outer band · extension visible · protect capital' },
      { state: '▲ DANGER',  stateColor: MAGENTA, action: '→ REDUCE SIZE 15b ⚠', actionColor: RED_BRIGHT, caption: 'Beyond outer band · entrenched · cut exposure immediately' },
    ];

    const zoneIdx = Math.floor(t * 0.25) % zones.length;
    const zone = zones[zoneIdx];

    // The Risk row
    const rowY = 46;
    const rowH = 30;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.12;
    const col2W = rowW * 0.38;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(rowX, rowY, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rowX, rowY, rowW, rowH);

    ctx.fillStyle = WHITE_LBL;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Risk', rowX + 10, rowY + 20);

    const pulse = 0.85 + 0.15 * Math.sin(f * 0.18);
    ctx.fillStyle = zone.stateColor.replace(/[\d.]+\)$/, `${pulse})`);
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(zone.state, rowX + col1W + col2W / 2, rowY + 20);

    ctx.fillStyle = zone.actionColor.replace(/[\d.]+\)$/, `${pulse})`);
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(zone.action, rowX + col1W + col2W + 10, rowY + 20);

    // Envelope visualization below — horizontal bands showing zones
    const envY = rowY + rowH + 18;
    const envH = 60;
    const envX = rowX;
    const envW = rowW;

    // Draw the 4 zones as horizontal bands (from center outward, both directions)
    const centerY = envY + envH / 2;
    const zoneHeights = [6, 10, 12, 12]; // SAFE, WATCH, CAUTION, DANGER

    // Draw upper half (SAFE → WATCH → CAUTION → DANGER going outward)
    let cursorY = centerY;
    zones.forEach((z, i) => {
      const bandH = zoneHeights[i];
      ctx.fillStyle = z.stateColor.replace(/[\d.]+\)$/, i === zoneIdx ? '0.35' : '0.12');
      ctx.fillRect(envX, cursorY - bandH, envW, bandH);
      ctx.strokeStyle = z.stateColor.replace(/[\d.]+\)$/, i === zoneIdx ? '0.8' : '0.2');
      ctx.lineWidth = i === zoneIdx ? 1.2 : 0.5;
      ctx.strokeRect(envX, cursorY - bandH, envW, bandH);

      // Zone label on the right
      ctx.fillStyle = i === zoneIdx ? z.stateColor : 'rgba(255,255,255,0.3)';
      ctx.font = i === zoneIdx ? 'bold 8px system-ui' : '8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(z.state.replace('▲ ', ''), envX + envW - 4, cursorY - bandH / 2 + 3);

      cursorY -= bandH;
    });

    // Centerline (fair value)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(envX, centerY);
    ctx.lineTo(envX + envW, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('fair value', envX + 4, centerY - 2);

    // Price marker — positioned based on current zone
    let priceY = centerY;
    if (zoneIdx === 0) priceY = centerY - 3;           // SAFE — inside inner band
    else if (zoneIdx === 1) priceY = centerY - 10;     // WATCH — outside inner
    else if (zoneIdx === 2) priceY = centerY - 22;     // CAUTION — mid
    else priceY = centerY - 35;                         // DANGER — outer

    // Price dot
    ctx.fillStyle = zone.stateColor;
    ctx.beginPath();
    ctx.arc(envX + envW / 2, priceY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Price label
    ctx.fillStyle = zone.stateColor;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('▲ price', envX + envW / 2, priceY - 6);

    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(zone.caption, w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 8: The Structure Family — Structure + Imbalance + Sweep
// Three rows covering static S/R levels, fair value gaps, and
// liquidity sweep events. Together they answer "what price
// levels matter and what just happened at them?"
// ============================================================
function StructureFamilyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE STRUCTURE FAMILY — PRICE LEVELS + WHAT JUST HAPPENED', w / 2, 16);

    const narratives = [
      {
        label: 'QUIET ZONE',
        structure: { state: 'S 2.1 ATR R 1.8 ATR', stateColor: WHITE_DIM, action: '→ BETWEEN LEVELS', actionColor: WHITE_DIM },
        imbalance: { state: '▲ — ▼ —',          stateColor: WHITE_DIM, action: '→ NO ACTIVE GAPS', actionColor: WHITE_DIM },
        sweep:     { state: '— NONE',            stateColor: WHITE_DIM, action: '→ NO SWEEPS',     actionColor: WHITE_DIM },
        story: 'No levels close · no gaps · no recent sweeps · wait for setup',
      },
      {
        label: 'SETUP BREWING',
        structure: { state: 'S 1.2 ATR R 0.3 ATR', stateColor: MAGENTA, action: '→ AT RESISTANCE',    actionColor: MAGENTA },
        imbalance: { state: '▲ — ▼ 0.4 ATR',      stateColor: MAGENTA, action: '→ NEAR BEAR GAP',   actionColor: MAGENTA },
        sweep:     { state: '— NONE',              stateColor: WHITE_DIM, action: '→ NO SWEEPS',     actionColor: WHITE_DIM },
        story: 'Price at resistance · bear gap overhead · rejection likely',
      },
      {
        label: 'HOT REVERSAL',
        structure: { state: 'S 0.4 ATR R 2.1 ATR', stateColor: TEAL,    action: '→ AT SUPPORT',       actionColor: TEAL },
        imbalance: { state: '▲ 0.3 ATR ▼ —',       stateColor: TEAL,    action: '→ AT BULL GAP',      actionColor: TEAL },
        sweep:     { state: '▲ BUY 2b ago STRONG + FVG', stateColor: TEAL, action: '→ HOT + FVG ★',   actionColor: TEAL },
        story: 'Sweep at support INTO a bull gap · ICT highest-conviction setup',
      },
    ];

    const narrativeIdx = Math.floor(t * 0.2) % narratives.length;
    const nar = narratives[narrativeIdx];

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.label, w / 2, 32);

    const rowStartY = 46;
    const rowH = 26;
    const rowGap = 3;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.14;
    const col2W = rowW * 0.44;

    const rows = [
      { name: 'Structure', data: nar.structure },
      { name: 'Imbalance', data: nar.imbalance },
      { name: 'Sweep',     data: nar.sweep },
    ];

    rows.forEach((row, i) => {
      const y = rowStartY + i * (rowH + rowGap);

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, rowX + 10, y + 18);

      ctx.fillStyle = row.data.stateColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.data.state, rowX + col1W + col2W / 2, y + 18);

      ctx.fillStyle = row.data.actionColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.data.action, rowX + col1W + col2W + 10, y + 18);
    });

    // Family bracket
    const bracketX = rowX - 16;
    const bracketTop = rowStartY;
    const bracketBot = rowStartY + rows.length * (rowH + rowGap) - rowGap;
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bracketX + 4, bracketTop);
    ctx.lineTo(bracketX, bracketTop);
    ctx.lineTo(bracketX, bracketBot);
    ctx.lineTo(bracketX + 4, bracketBot);
    ctx.stroke();

    ctx.save();
    ctx.translate(bracketX - 6, (bracketTop + bracketBot) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STRUCTURE FAMILY', 0, 0);
    ctx.restore();

    // Story
    const storyY = rowStartY + rows.length * (rowH + rowGap) + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.story, w / 2, storyY);

    // Dots
    const dotY = h - 10;
    const dotSpacing = 18;
    const dotStart = w / 2 - ((narratives.length - 1) * dotSpacing) / 2;
    narratives.forEach((_, i) => {
      ctx.fillStyle = i === narrativeIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={215} />;
}

// ============================================================
// ANIMATION 9: The Context Family — Bias + Session + Regime + HTF
// Four rows that answer "what's happening in the WORLD around
// this chart?" Macro bias, session quality, regime state, and
// higher timeframe alignment. Context turns a signal into a trade.
// ============================================================
function ContextFamilyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE CONTEXT FAMILY — WHAT\u2019S HAPPENING AROUND THIS CHART?', w / 2, 16);

    const narratives = [
      {
        label: 'FULLY ALIGNED BULL',
        bias:    { state: 'DXY▼ US10Y▼',            stateColor: TEAL,    action: '→ FAVOR LONGS',   actionColor: TEAL },
        session: { state: 'NEW YORK',                stateColor: 'rgba(204,204,204,1)', action: '→ NORMAL', actionColor: WHITE_DIM },
        regime:  { state: 'TREND',                    stateColor: TEAL,    action: '→ TREND INTACT', actionColor: TEAL },
        htf:     { state: '4H▲ STRONG D▲ DOMINANT', stateColor: TEAL,    action: '→ ALIGNED BULL', actionColor: TEAL },
        story: 'Macro, regime, and both HTFs agree · trade long with conviction',
      },
      {
        label: 'MIXED MESSAGES',
        bias:    { state: 'DXY▲ US10Y▼',             stateColor: MAGENTA, action: '→ FAVOR SHORTS',   actionColor: MAGENTA },
        session: { state: 'TOKYO',                    stateColor: AMBER,   action: '→ LOW VOLUME',     actionColor: AMBER },
        regime:  { state: 'RANGE',                    stateColor: AMBER,   action: '→ RANGE HOLDING',  actionColor: AMBER },
        htf:     { state: '4H▼ WEAK D▲ STRONG',     stateColor: MAGENTA, action: '→ CONFLICTING',    actionColor: AMBER },
        story: 'HTFs disagree · low volume session · wait for London',
      },
      {
        label: 'REGIME SHIFTING',
        bias:    { state: 'DXY▲ US10Y▲',             stateColor: AMBER,   action: '→ USD STRONG',     actionColor: AMBER },
        session: { state: 'LDN/NY',                   stateColor: TEAL,    action: '→ HIGH VOLUME',    actionColor: TEAL },
        regime:  { state: 'TREND',                    stateColor: TEAL,    action: '→ VOLATILE FORMING', actionColor: AMBER },
        htf:     { state: '4H▲ MODERATE D▼ WEAK',   stateColor: TEAL,    action: '→ CONFLICTING',    actionColor: AMBER },
        story: 'Trend still intact but transition probability rising · size down',
      },
    ];

    const narrativeIdx = Math.floor(t * 0.18) % narratives.length;
    const nar = narratives[narrativeIdx];

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.label, w / 2, 32);

    const rowStartY = 46;
    const rowH = 24;
    const rowGap = 3;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.13;
    const col2W = rowW * 0.47;

    const rows = [
      { name: 'Bias',    data: nar.bias },
      { name: 'Session', data: nar.session },
      { name: 'Regime',  data: nar.regime },
      { name: 'HTF',     data: nar.htf },
    ];

    rows.forEach((row, i) => {
      const y = rowStartY + i * (rowH + rowGap);

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, rowX + 10, y + 17);

      ctx.fillStyle = row.data.stateColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.data.state, rowX + col1W + col2W / 2, y + 17);

      ctx.fillStyle = row.data.actionColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.data.action, rowX + col1W + col2W + 10, y + 17);
    });

    // Family bracket
    const bracketX = rowX - 16;
    const bracketTop = rowStartY;
    const bracketBot = rowStartY + rows.length * (rowH + rowGap) - rowGap;
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bracketX + 4, bracketTop);
    ctx.lineTo(bracketX, bracketTop);
    ctx.lineTo(bracketX, bracketBot);
    ctx.lineTo(bracketX + 4, bracketBot);
    ctx.stroke();

    ctx.save();
    ctx.translate(bracketX - 6, (bracketTop + bracketBot) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONTEXT FAMILY', 0, 0);
    ctx.restore();

    // Story
    const storyY = rowStartY + rows.length * (rowH + rowGap) + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(nar.story, w / 2, storyY);

    // Dots
    const dotY = h - 10;
    const dotSpacing = 18;
    const dotStart = w / 2 - ((narratives.length - 1) * dotSpacing) / 2;
    narratives.forEach((_, i) => {
      ctx.fillStyle = i === narrativeIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={230} />;
}

// ============================================================
// ANIMATION 10: Last Signal Row — Freshness cascade
// Shows the Last Signal row cycling through freshness states:
// JUST FIRED (<=3b) → FRESH (<=10b) → ACTIVE (<=30b) → AGING.
// Teaches that recency matters: a fresh signal is different from a stale one.
// ============================================================
function LastSignalRowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE LAST SIGNAL ROW — FRESHNESS IS INTELLIGENCE', w / 2, 16);

    // 4 freshness states from Pine line 3384
    const states = [
      { state: '\u25B2 Long  2 bars',  stateColor: TEAL,    action: '\u2192 JUST FIRED', actionColor: TEAL,    caption: 'Signal just fired \u00B7 entry still fresh \u00B7 full confidence',   bars: 2 },
      { state: '\u25B2 Long  7 bars',  stateColor: TEAL,    action: '\u2192 FRESH',      actionColor: TEAL,    caption: 'Signal recent \u00B7 price may still respect entry \u00B7 confirm setup still valid', bars: 7 },
      { state: '\u25B2 Long  22 bars', stateColor: TEAL,    action: '\u2192 ACTIVE',     actionColor: AMBER,   caption: 'Signal older \u00B7 original setup weakening \u00B7 look for fresh re-entry', bars: 22 },
      { state: '\u25B2 Long  48 bars', stateColor: TEAL,    action: '\u2192 AGING',      actionColor: WHITE_DIM, caption: 'Signal stale \u00B7 treat as historical \u00B7 no action value',    bars: 48 },
    ];

    const stateIdx = Math.floor(t * 0.22) % states.length;
    const state = states[stateIdx];

    // The row
    const rowY = 46;
    const rowH = 30;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.15;
    const col2W = rowW * 0.42;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(rowX, rowY, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rowX, rowY, rowW, rowH);

    ctx.fillStyle = WHITE_LBL;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Last Signal', rowX + 10, rowY + 20);

    const pulse = 0.85 + 0.15 * Math.sin(f * 0.18);
    ctx.fillStyle = state.stateColor.replace(/[\d.]+\)$/, `${pulse})`);
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.state, rowX + col1W + col2W / 2, rowY + 20);

    ctx.fillStyle = state.actionColor.replace(/[\d.]+\)$/, `${pulse})`);
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(state.action, rowX + col1W + col2W + 10, rowY + 20);

    // Timeline below showing signal age
    const timelineY = rowY + rowH + 28;
    const timelineX = rowX + 20;
    const timelineW = rowW - 40;

    // Timeline axis
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(timelineX, timelineY);
    ctx.lineTo(timelineX + timelineW, timelineY);
    ctx.stroke();

    // Zone dividers at 3, 10, 30, 60 bars
    const maxBars = 60;
    const zones = [
      { maxBars: 3,  label: 'JUST FIRED', color: TEAL },
      { maxBars: 10, label: 'FRESH',      color: TEAL },
      { maxBars: 30, label: 'ACTIVE',     color: AMBER },
      { maxBars: 60, label: 'AGING',      color: WHITE_DIM },
    ];

    let prevX = 0;
    zones.forEach((z, i) => {
      const zoneX = timelineX + (z.maxBars / maxBars) * timelineW;
      const zoneStartX = timelineX + (prevX / maxBars) * timelineW;
      const isActive = state.bars > prevX && state.bars <= z.maxBars;

      // Zone band (subtle background above timeline)
      ctx.fillStyle = z.color.replace(/[\d.]+\)$/, isActive ? '0.18' : '0.05');
      ctx.fillRect(zoneStartX, timelineY - 18, zoneX - zoneStartX, 16);

      // Zone label
      ctx.fillStyle = isActive ? z.color : 'rgba(255,255,255,0.3)';
      ctx.font = isActive ? 'bold 8px system-ui' : '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, (zoneStartX + zoneX) / 2, timelineY - 6);

      // Tick mark
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(zoneX, timelineY - 2);
      ctx.lineTo(zoneX, timelineY + 2);
      ctx.stroke();

      // Bar count label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(`${z.maxBars}b`, zoneX, timelineY + 12);

      prevX = z.maxBars;
    });

    // Signal marker at current age
    const markerX = timelineX + (state.bars / maxBars) * timelineW;
    const markerPulse = 0.7 + 0.3 * Math.sin(f * 0.25);
    ctx.fillStyle = state.actionColor.replace(/[\d.]+\)$/, `${markerPulse})`);
    ctx.beginPath();
    ctx.arc(markerX, timelineY, 5, 0, Math.PI * 2);
    ctx.fill();

    // "now" label above marker
    ctx.fillStyle = state.actionColor;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.bars}b ago`, markerX, timelineY + 22);

    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.caption, w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 11: Live Conditions Sub-Panel
// Shows the 4-row histogram sub-panel (Trend / Momentum / Volume / Tension)
// with 10-block bars animating. Teaches that the sub-panel is a quick
// visual gauge of four dimensions simultaneously.
// ============================================================
function LiveConditionsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE CONDITIONS SUB-PANEL — FOUR GAUGES AT A GLANCE', w / 2, 16);

    // Each condition breathes at a different rate to show independent movement
    const getValue = (baseVal: number, speed: number, range: number) => {
      return Math.max(0, Math.min(100, baseVal + Math.sin(f * speed) * range));
    };

    const conditions = [
      { name: 'Trend',    val: getValue(62, 0.025, 20), labels: ['FLAT', 'WEAK', 'MODERATE', 'STRONG'] },
      { name: 'Momentum', val: getValue(55, 0.04, 25),  labels: ['STALLED', 'FADING', 'BUILDING', 'SURGING'] },
      { name: 'Volume',   val: getValue(40, 0.03, 30),  labels: ['EMPTY', 'QUIET', 'ACTIVE', 'EXTREME'] },
      { name: 'Tension',  val: getValue(50, 0.035, 30), labels: ['RELAXED', 'LIGHT', 'BUILDING', 'STRETCHED'] },
    ];

    // Divider header
    const dividerY = 32;
    ctx.fillStyle = 'rgba(26,26,26,0.8)';
    ctx.fillRect(30, dividerY, w - 60, 20);
    ctx.fillStyle = WHITE_LBL;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2500\u2500 Conditions \u2500\u2500', 40, dividerY + 14);

    const rowStartY = 58;
    const rowH = 22;
    const rowGap = 2;
    const rowX = 30;
    const rowW = w - 60;
    const col1W = rowW * 0.18;
    const col2W = rowW * 0.22;

    conditions.forEach((cond, i) => {
      const y = rowStartY + i * (rowH + rowGap);
      const val = cond.val;

      // Determine label (matches Pine line 3409-3412)
      let label = cond.labels[0];
      if (val > 75) label = cond.labels[3];
      else if (val > 50) label = cond.labels[2];
      else if (val > 25) label = cond.labels[1];

      // Determine color (matches Pine line 3415-3418)
      // Trend: >33 teal, else amber
      // Momentum: >66 teal, <33 magenta, else amber
      // Volume: >80 magenta, >50 teal, else amber
      // Tension: >66 magenta, >33 amber, else teal
      let barColor = AMBER;
      if (cond.name === 'Trend') {
        barColor = val > 33 ? TEAL : AMBER;
      } else if (cond.name === 'Momentum') {
        barColor = val > 66 ? TEAL : val < 33 ? MAGENTA : AMBER;
      } else if (cond.name === 'Volume') {
        barColor = val > 80 ? MAGENTA : val > 50 ? TEAL : AMBER;
      } else if (cond.name === 'Tension') {
        barColor = val > 66 ? MAGENTA : val > 33 ? AMBER : TEAL;
      }

      // Row background
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(rowX, y, rowW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH);

      // Label
      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(cond.name, rowX + 10, y + 16);

      // State label (center)
      ctx.fillStyle = barColor;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, rowX + col1W + col2W / 2, y + 16);

      // 10-block bar (right side)
      const barStartX = rowX + col1W + col2W + 14;
      const barEndX = rowX + rowW - 14;
      const barTotalW = barEndX - barStartX;
      const blockW = barTotalW / 10 - 1;
      const blockH = 10;
      const blockY = y + rowH / 2 - blockH / 2;

      // Compute filled blocks (mimics Pine make_bar function)
      const filledBlocks = Math.round(val / 10);

      for (let b = 0; b < 10; b++) {
        const bx = barStartX + b * (blockW + 1);
        if (b < filledBlocks) {
          // Filled block (matches Pine full-block character)
          ctx.fillStyle = barColor;
          ctx.fillRect(bx, blockY, blockW, blockH);
        } else {
          // Empty block (matches Pine shaded-block character — dotted/dimmed)
          ctx.fillStyle = barColor.replace(/[\d.]+\)$/, '0.15');
          ctx.fillRect(bx, blockY, blockW, blockH);
          // Dot pattern for empty block
          ctx.fillStyle = barColor.replace(/[\d.]+\)$/, '0.3');
          for (let dx = 1; dx < blockW; dx += 3) {
            for (let dy = 1; dy < blockH; dy += 3) {
              ctx.fillRect(bx + dx, blockY + dy, 1, 1);
            }
          }
        }
      }
    });

    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'italic 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Four dimensions, four gauges, one glance. No numbers \u2014 just intensity.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={170} />;
}

// ============================================================
// ANIMATION 12: Color Language
// Shows the 5-color vocabulary of the Command Center side-by-side.
// Each color has a specific meaning that's consistent across ALL rows.
// Learn the colors once, read the whole panel.
// ============================================================
function ColorLanguageAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE COLOR LANGUAGE \u2014 FIVE COLORS, ONE VOCABULARY', w / 2, 16);

    const colors = [
      { color: TEAL,        name: 'TEAL',         meaning: 'positive / healthy',     example: 'BULL \u00B7 RIDE IT \u00B7 FRESH' },
      { color: MAGENTA,     name: 'MAGENTA',      meaning: 'negative / warning',     example: 'BEAR \u00B7 REDUCE \u00B7 DANGER' },
      { color: AMBER,       name: 'AMBER',        meaning: 'caution / transition',   example: 'SNAP LIKELY \u00B7 WATCH \u00B7 COILING' },
      { color: 'rgba(255,255,255,0.9)', name: 'WHITE',        meaning: 'neutral / informational', example: 'MATURE \u00B7 RANGING \u00B7 NORMAL' },
      { color: RED_BRIGHT,  name: 'BRIGHT RED',   meaning: 'urgent danger',          example: 'FADING \u00B7 EXIT SOON \u00B7 JUST EXHAUSTED' },
    ];

    // Active color cycles to draw attention to each in turn
    const activeIdx = Math.floor(t * 0.45) % colors.length;

    const cardY = 36;
    const cardH = 46;
    const cardGap = 2;
    const cardStartX = 30;
    const cardW = (w - 60 - (colors.length - 1) * cardGap) / colors.length;

    colors.forEach((c, i) => {
      const cx = cardStartX + i * (cardW + cardGap);
      const isActive = i === activeIdx;
      const pulse = isActive ? 0.85 + 0.15 * Math.sin(f * 0.2) : 1;

      // Card background
      ctx.fillStyle = isActive ? `rgba(0,0,0,0.5)` : 'rgba(0,0,0,0.25)';
      ctx.fillRect(cx, cardY, cardW, cardH);

      // Border
      if (isActive) {
        ctx.strokeStyle = c.color.replace(/[\d.]+\)$/, `${pulse})`);
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(cx, cardY, cardW, cardH);

      // Color swatch
      const swatchH = 8;
      ctx.fillStyle = c.color.replace(/[\d.]+\)$/, `${isActive ? pulse : 0.7})`);
      ctx.fillRect(cx + 8, cardY + 6, cardW - 16, swatchH);

      // Color name
      ctx.fillStyle = c.color.replace(/[\d.]+\)$/, `${isActive ? pulse : 0.85})`);
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, cx + cardW / 2, cardY + 28);

      // Meaning
      ctx.fillStyle = `rgba(255,255,255,${isActive ? 0.85 : 0.5})`;
      ctx.font = 'italic 8px system-ui';
      ctx.fillText(c.meaning, cx + cardW / 2, cardY + 40);
    });

    // Active example shown below in big
    const active = colors[activeIdx];
    const exampleY = cardY + cardH + 28;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMMAND CENTER PHRASES USING THIS COLOR:', w / 2, exampleY);

    ctx.fillStyle = active.color;
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(active.example, w / 2, exampleY + 20);

    // Bottom insight
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The same five colors appear across all 15 rows. Learn once, read everything.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={190} />;
}

// ============================================================
// ANIMATION 13: The 10-Second Glance Read
// Shows the operator's scan discipline: Header first, then color
// check across all rows, then deep-read the outliers. Teaches
// the reading order and timing of an effective Command Center scan.
// ============================================================
function TenSecondGlanceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 10-SECOND GLANCE READ \u2014 OPERATOR SCAN DISCIPLINE', w / 2, 16);

    // Mini Command Center on the left
    const panelX = 20;
    const panelY = 34;
    const panelW = w * 0.42;
    const rowH = 16;
    const rowGap = 1;

    // Example Command Center state — TREND state
    const rows = [
      { name: 'CIPHER',   state: '\u25B2 BULL TREND', stateColor: TEAL,    action: '\u2192 RIDE IT',       actionColor: TEAL,    header: true },
      { name: 'Ribbon',   state: '\u25B2 BULL',       stateColor: TEAL,    action: '\u2192 EXPANDING',     actionColor: TEAL },
      { name: 'Pulse',    state: '\u25B2 SUPPORT',    stateColor: TEAL,    action: '\u2192 TREND SAFE',    actionColor: TEAL },
      { name: 'Tension',  state: '\u25B2 BUILDING',   stateColor: AMBER,   action: '\u2192 WATCH SNAP',    actionColor: AMBER },
      { name: 'Momentum', state: '\u25B2 SURGING',    stateColor: 'rgba(0,230,118,1)', action: '\u2192 HOLD',          actionColor: 'rgba(0,230,118,1)' },
      { name: 'Volume',   state: 'STRONG',            stateColor: TEAL,    action: '\u2192 CONVICTION',    actionColor: TEAL },
      { name: 'Risk',     state: '\u25B2 WATCH',      stateColor: AMBER,   action: '\u2192 STAY ALERT',    actionColor: AMBER },
      { name: 'HTF',      state: '4H\u25B2 D\u25B2',  stateColor: TEAL,    action: '\u2192 ALIGNED BULL',  actionColor: TEAL },
    ];

    // Reading order phases
    // Phase 1 (0-30%): Scan the HEADER only
    // Phase 2 (30-60%): Color-scan all rows
    // Phase 3 (60-100%): Deep-read the amber rows (outliers)
    const cyclePos = (t * 0.12) % 1;
    const phase = cyclePos < 0.3 ? 1 : cyclePos < 0.6 ? 2 : 3;
    const phaseProgress = phase === 1 ? cyclePos / 0.3 : phase === 2 ? (cyclePos - 0.3) / 0.3 : (cyclePos - 0.6) / 0.4;

    // Draw rows
    rows.forEach((row, i) => {
      const y = panelY + i * (rowH + rowGap);

      // Row background
      const bgAlpha = row.header ? 0.55 : 0.35;
      ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
      ctx.fillRect(panelX, y, panelW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, y, panelW, rowH);

      // Phase-based dimming: non-scanned rows dim, scanned rows bright
      let rowDim = 1;
      if (phase === 1 && !row.header) rowDim = 0.3;
      if (phase === 3 && row.stateColor !== AMBER && row.actionColor !== AMBER) rowDim = 0.25;

      // Label
      ctx.fillStyle = row.header ? `rgba(255,255,255,${0.9 * rowDim})` : WHITE_LBL.replace(/[\d.]+\)$/, `${rowDim})`);
      ctx.font = row.header ? 'bold 8px system-ui' : '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, panelX + 6, y + 11);

      // State
      ctx.fillStyle = row.stateColor.replace(/[\d.]+\)$/, `${rowDim})`);
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(row.state, panelX + panelW * 0.5, y + 11);

      // Action
      ctx.fillStyle = row.actionColor.replace(/[\d.]+\)$/, `${rowDim})`);
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.action, panelX + panelW * 0.7, y + 11);
    });

    // Scan indicator: highlight what's being read right now
    if (phase === 1) {
      // Highlight header row
      const highlightAlpha = 0.5 + 0.5 * Math.sin(f * 0.3);
      ctx.strokeStyle = AMBER.replace(/[\d.]+\)$/, `${highlightAlpha})`);
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX - 2, panelY - 2, panelW + 4, rowH + 4);
    } else if (phase === 2) {
      // Scan line moving top-to-bottom
      const scanProgress = phaseProgress;
      const scanY = panelY + scanProgress * (rows.length * (rowH + rowGap));
      ctx.strokeStyle = AMBER.replace(/[\d.]+\)$/, '0.8');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(panelX - 4, scanY);
      ctx.lineTo(panelX + panelW + 4, scanY);
      ctx.stroke();
    } else if (phase === 3) {
      // Highlight amber rows (Tension, Risk)
      rows.forEach((row, i) => {
        if (row.stateColor === AMBER || row.actionColor === AMBER) {
          const y = panelY + i * (rowH + rowGap);
          const highlightAlpha = 0.5 + 0.5 * Math.sin(f * 0.3);
          ctx.strokeStyle = AMBER.replace(/[\d.]+\)$/, `${highlightAlpha})`);
          ctx.lineWidth = 2;
          ctx.strokeRect(panelX - 2, y - 1, panelW + 4, rowH + 2);
        }
      });
    }

    // Right side: instruction panel for current phase
    const instrX = panelX + panelW + 30;
    const instrW = w - instrX - 20;

    const phaseData = [
      { num: '1', title: 'HEADER FIRST', time: '~2 sec', desc: 'Read Executive Summary only. State + action. That\u2019s your one-line briefing.' },
      { num: '2', title: 'COLOR SCAN',   time: '~4 sec', desc: 'Sweep down. Note color pattern. Mostly teal? Mixed? Amber warnings?' },
      { num: '3', title: 'DEEP READ',    time: '~4 sec', desc: 'Read the amber/red outliers in full. They are the edge cases worth knowing.' },
    ];

    const currentPhaseData = phaseData[phase - 1];

    // Phase number (big)
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 40px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentPhaseData.num, instrX, panelY + 36);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(currentPhaseData.title, instrX + 38, panelY + 22);

    // Time
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText(currentPhaseData.time, instrX + 38, panelY + 36);

    // Description (wrapped)
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px system-ui';
    const words = currentPhaseData.desc.split(' ');
    let line = '';
    let lineY = panelY + 58;
    const maxLineW = instrW - 4;
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineW && line !== '') {
        ctx.fillText(line.trim(), instrX, lineY);
        line = word + ' ';
        lineY += 14;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line.trim(), instrX, lineY);

    // Step progress dots
    const dotY = h - 10;
    const dotSpacing = 14;
    const dotStart = w / 2 - ((phaseData.length - 1) * dotSpacing) / 2;
    phaseData.forEach((_, i) => {
      ctx.fillStyle = i === (phase - 1) ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 14: Common Reading Mistakes
// Cycles through 4 mistake scenarios showing what a consumer misreads
// and what an operator actually sees. Each mistake is a real failure
// mode seen in practice. Ends with the corrective read.
// ============================================================
function ReadingMistakesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR READING MISTAKES \u2014 CONSUMER VS OPERATOR', w / 2, 16);

    const mistakes = [
      {
        number: 1,
        title: 'READING ONLY THE HEADER',
        consumer: 'Reads "BULL TREND \u2192 RIDE IT" and enters long. Ignores every row below.',
        operator: 'Reads the header, then verifies with at least 3 rows. Tension = STRETCHED and Risk = DANGER means the header is technically right but the setup is NOT.',
        lesson: 'The header resolves conflict. It does not replace the rows.',
      },
      {
        number: 2,
        title: 'TREATING ONE AMBER AS FATAL',
        consumer: 'Sees any amber cell and passes on every trade. Over-filters into paralysis.',
        operator: 'Amber is NORMAL. Two to three amber cells in 15 rows is baseline. Only ALIGNED amber across a family (e.g. Trend family all amber) is a real warning.',
        lesson: 'Amber is information, not prohibition.',
      },
      {
        number: 3,
        title: 'SCANNING TOP-TO-BOTTOM LINEARLY',
        consumer: 'Reads every row left-to-right, top-to-bottom. Takes 30+ seconds. Loses flow.',
        operator: 'Scans in 3 passes: header (2s) \u2192 color sweep (4s) \u2192 deep-read outliers (4s). Total: 10 seconds.',
        lesson: 'Read structurally, not linearly.',
      },
      {
        number: 4,
        title: 'IGNORING LIVE CONDITIONS',
        consumer: 'Focuses on the top 15 rows. Ignores the Conditions sub-panel at the bottom.',
        operator: 'Conditions gives four fast-changing real-time gauges. When they shift fast, something is happening NOW that the slower rows haven\u2019t caught up to yet.',
        lesson: 'Conditions is the canary. Rows are the minera.',
      },
    ];

    const mistakeIdx = Math.floor(t * 0.14) % mistakes.length;
    const m = mistakes[mistakeIdx];

    // Mistake number + title
    const titleY = 36;
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${m.number}`, 30, titleY + 2);

    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(m.title, 54, titleY - 4);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText(`mistake ${m.number} of 4`, 54, titleY + 8);

    // Two columns: CONSUMER vs OPERATOR
    const colGap = 14;
    const colW = (w - 40 - colGap) / 2;
    const colY = titleY + 24;
    const colH = 100;

    // Word wrap helper
    const wrapText = (txt: string, x: number, y: number, maxW: number, lineH: number) => {
      const words = txt.split(' ');
      let line = '';
      let currentY = y;
      words.forEach((word) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && line !== '') {
          ctx.fillText(line.trim(), x, currentY);
          line = word + ' ';
          currentY += lineH;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line.trim(), x, currentY);
      return currentY;
    };

    // CONSUMER column (left — magenta)
    ctx.fillStyle = 'rgba(239,83,80,0.08)';
    ctx.fillRect(20, colY, colW, colH);
    ctx.strokeStyle = 'rgba(239,83,80,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, colY, colW, colH);

    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CONSUMER MISREADS', 28, colY + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '10px system-ui';
    wrapText(m.consumer, 28, colY + 30, colW - 16, 13);

    // OPERATOR column (right — teal)
    const opX = 20 + colW + colGap;
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(opX, colY, colW, colH);
    ctx.strokeStyle = 'rgba(38,166,154,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(opX, colY, colW, colH);

    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('OPERATOR READS', opX + 8, colY + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '10px system-ui';
    wrapText(m.operator, opX + 8, colY + 30, colW - 16, 13);

    // Lesson box at bottom
    const lessonY = colY + colH + 14;
    ctx.fillStyle = 'rgba(255,179,0,0.1)';
    ctx.fillRect(20, lessonY, w - 40, 22);
    ctx.strokeStyle = 'rgba(255,179,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, lessonY, w - 40, 22);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('LESSON \u00B7', 28, lessonY + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'italic 10px system-ui';
    ctx.fillText(m.lesson, 74, lessonY + 14);

    // Progress dots
    const dotY = h - 10;
    const dotSpacing = 16;
    const dotStart = w / 2 - ((mistakes.length - 1) * dotSpacing) / 2;
    mistakes.forEach((_, i) => {
      ctx.fillStyle = i === mistakeIdx ? AMBER : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(dotStart + i * dotSpacing, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// CONFETTI COMPONENT (for certificate reveal)
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

    const colors = ['#26A69A', '#EF5350', '#FFB300', '#FFFFFF', '#FF1744'];
    const particles: Array<{ x: number; y: number; vx: number; vy: number; rot: number; vr: number; color: string; size: number; }> = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: rect.width / 2,
        y: rect.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
      });
    }

    let frame = 0;
    let animId = 0;
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      });
      frame++;
      if (frame < 120) {
        animId = requestAnimationFrame(loop);
      }
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [active]);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ============================================================
// GAME ROUNDS — 5 scenarios testing Command Center reading skill
// Each scenario presents a real Command Center state and asks the
// student to decide what it really means or what the right action is.
// ============================================================
const gameRounds = [
  {
    scenario: 'You glance at the Command Center. The header says BULL TREND → RIDE IT. You feel good about going long. But Tension shows STRETCHED → SNAP LIKELY and Risk shows DANGER → REDUCE SIZE. What is the RIGHT read of this state?',
    options: [
      {
        id: 'a',
        text: 'The header said RIDE IT. Enter long immediately.',
        correct: false,
        explain: 'Wrong. This is the classic "only reading the header" mistake. The header resolves conflict among rows, but it does not veto them. When Tension and Risk both scream warnings, the priority waterfall in the header has not yet caught up to what two lower rows are telling you.',
      },
      {
        id: 'b',
        text: 'The header and two rows disagree. Stand aside — the setup has internal conflict.',
        correct: true,
        explain: 'Correct. Internal conflict between header and 2+ rows is the signature of an ending trend. The trend is still visible (header) but the internal conditions supporting it are deteriorating (Tension stretched, Risk in danger). An operator waits for the rows to realign with the header, or trades AGAINST the trend once it snaps.',
      },
      {
        id: 'c',
        text: 'Go long but use a smaller position since Risk is amber.',
        correct: false,
        explain: 'Wrong. Reducing size is not a substitute for reading. When the Command Center shows this much disagreement, the right action is no trade, not a smaller trade. Smaller positions on bad setups still bleed capital.',
      },
    ],
  },
  {
    scenario: 'The Volatility row shows BREAKOUT READY 14b → PREPARE ENTRY 72% energy. Momentum is FLAT. HTF shows ALIGNED BULL. What are you looking at?',
    options: [
      {
        id: 'a',
        text: 'A squeeze about to break. Momentum is flat because energy is coiled. HTF gives the likely direction.',
        correct: true,
        explain: 'Correct. This is a "loaded spring" setup — the Energy Family is telling you exactly what is happening. Flat momentum + coiled squeeze + aligned HTF is a common pre-breakout signature. The HTF alignment gives you the directional bias for when the squeeze releases.',
      },
      {
        id: 'b',
        text: 'A dead market. No momentum means no trade.',
        correct: false,
        explain: 'Wrong. FLAT momentum during a BREAKOUT READY squeeze is not a dead market — it is stored energy. Energy has to go somewhere. The right read is anticipation, not rejection.',
      },
      {
        id: 'c',
        text: 'A reversal setup. Breakout-ready squeezes usually fade.',
        correct: false,
        explain: 'Wrong. Breakout-ready squeezes RESOLVE, they don\u2019t fade. The energy score (72%) tells you how much tension is stored. High energy + aligned HTF is a continuation setup, not a reversal.',
      },
    ],
  },
  {
    scenario: 'Sweep row shows ▲ BUY 2b ago STRONG + FVG and the action is → HOT + FVG ★. The header shows ↔ RANGING → SNAP ZONE. What is CIPHER telling you?',
    options: [
      {
        id: 'a',
        text: 'A strong buy sweep at an FVG — ICT\u2019s highest-conviction reversal setup. Header confirms a snap is likely.',
        correct: true,
        explain: 'Correct. The ★ star on HOT + FVG is reserved for when a liquidity sweep happens AT an active imbalance — the highest-conviction reversal in the entire suite per the Pine code. The SNAP ZONE header confirms CIPHER has already waterfalled all rows and decided a reversal is the most urgent read.',
      },
      {
        id: 'b',
        text: 'A random wick. Ranging markets sweep all the time, ignore it.',
        correct: false,
        explain: 'Wrong. The STRONG quality tag means 4+ of 5 sweep-quality factors aligned (wick depth, volume, rejection quality, trend alignment, multi-level). Combined with the FVG confluence, this is not a random wick. It is exactly the setup ICT traders pay to get alerts for.',
      },
      {
        id: 'c',
        text: 'Wait for the header to turn teal or magenta before acting.',
        correct: false,
        explain: 'Wrong. A ranging header is correct for THIS stage of the setup — the reversal has not fully resolved yet. Waiting for a trend header means waiting until the move has already happened and you have missed the best entry.',
      },
    ],
  },
  {
    scenario: 'You see this pattern across many rows: Ribbon teal, Pulse teal, Tension teal, Momentum green, Volume teal, Risk teal, Structure teal, HTF aligned bull. Every single row is positive. What is the operator\u2019s read?',
    options: [
      {
        id: 'a',
        text: 'Perfect setup. Load up on max size.',
        correct: false,
        explain: 'Wrong. Too perfect is its own warning. When every single row agrees, you are usually LATE to the trend — everyone else is already in. Max size on an everyone-agrees state is how retail traders get stopped out on the pullback.',
      },
      {
        id: 'b',
        text: 'Trend is mature. Good conditions but not entry conditions. Wait for a pullback where some rows briefly turn amber.',
        correct: true,
        explain: 'Correct. Full agreement across all 15 rows is actually rare and usually marks the late stage of a move. The operator\u2019s entry comes DURING disagreement (amber in 2-3 rows with header still green) not after full agreement. "All green" is for riding existing positions, not opening new ones.',
      },
      {
        id: 'c',
        text: 'Something is broken with CIPHER. Rows should never all agree.',
        correct: false,
        explain: 'Wrong. Rows can and do all align occasionally — it is just rare and meaningful. This is a real market state, not a bug. The lesson is recognizing what it means: mature trend, late entry risk.',
      },
    ],
  },
  {
    scenario: 'Live Conditions sub-panel shows: Trend STRONG (9 blocks), Momentum STALLED (2 blocks), Volume QUIET (3 blocks), Tension RELAXED (2 blocks). What scenario is this?',
    options: [
      {
        id: 'a',
        text: 'An established trend catching its breath. Low-energy pause inside a strong structure.',
        correct: true,
        explain: 'Correct. STRONG trend (ADX is high, the directional engine is running) combined with low momentum, low volume, and no tension describes a consolidation WITHIN a trend — the market pauses to absorb before continuing. This is one of the cleanest re-entry setups in trend following.',
      },
      {
        id: 'b',
        text: 'A broken indicator. Strong trend should have strong momentum.',
        correct: false,
        explain: 'Wrong. Trend (ADX) and Momentum (velocity) measure different things. ADX measures whether a directional move has been happening; velocity measures the current rate of change. A trend can be strong structurally even while momentum has temporarily stalled. This is normal.',
      },
      {
        id: 'c',
        text: 'The trend is dead. Move on to another chart.',
        correct: false,
        explain: 'Wrong. A dying trend would show falling TREND values, not STRONG. The operator reads Conditions as a dashboard of fast vs slow indicators. STRONG is slow (ADX). STALLED + QUIET is fast (velocity, volume). When fast is low but slow is high, you are inside a consolidation, not at the end of the trend.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 questions testing Command Center knowledge
// ============================================================
const quizQuestions = [
  {
    q: 'What is the "Priority Waterfall" — the groundbreaking concept of this lesson?',
    options: [
      { id: 'a', text: 'A trading strategy that enters only when all rows agree.', correct: false },
      { id: 'b', text: 'The system CIPHER uses to pick which ONE state from a priority-ordered stack to surface in each cell.', correct: true },
      { id: 'c', text: 'A visual effect where colors cascade down the panel.', correct: false },
      { id: 'd', text: 'The order in which rows should be read — top to bottom.', correct: false },
    ],
    explain: 'The Priority Waterfall is CIPHER\u2019s internal mechanism: for each row, CIPHER evaluates multiple candidate states in a priority order, and the cell you see shows the TOP of that stack. Every cell is a pre-prioritized verdict. This is why cells are trustworthy without needing you to see the raw data behind them.',
  },
  {
    q: 'How many cells does each row of the Command Center have, and what does each cell represent?',
    options: [
      { id: 'a', text: '2 cells: Label and Value.', correct: false },
      { id: 'b', text: '3 cells: Label, State, and Action.', correct: true },
      { id: 'c', text: '4 cells: Label, State, Action, and Confidence.', correct: false },
      { id: 'd', text: 'It varies by row.', correct: false },
    ],
    explain: 'Every Command Center row has exactly 3 cells: Label (cell 0, left-aligned in dim gray), State (cell 1, center-aligned, colored by the state), and Action (cell 2, left-aligned, colored by urgency). This universal 3-cell grammar is what lets you read any row as soon as you learn the pattern.',
  },
  {
    q: 'Which row in the Command Center is the "Executive Summary" — the always-on verdict that waterfalls through all other rows?',
    options: [
      { id: 'a', text: 'The Regime row.', correct: false },
      { id: 'b', text: 'The header row (CIPHER PRO row at the top).', correct: true },
      { id: 'c', text: 'The Last Signal row.', correct: false },
      { id: 'd', text: 'The HTF row.', correct: false },
    ],
    explain: 'The header row (with "CIPHER PRO" in cell 0) is always on and cannot be toggled off. Its action cell waterfalls through 17 possible conditions, picking the single most urgent thing happening right now. When rows below it disagree, the header has already resolved the conflict.',
  },
  {
    q: 'You see three rows in the Trend family showing different colors: Ribbon teal, Pulse teal, Tension magenta. What does this commonly indicate?',
    options: [
      { id: 'a', text: 'A broken indicator — they should always match.', correct: false },
      { id: 'b', text: 'A healthy trend with growing reversal pressure — trim exposure but do not exit.', correct: true },
      { id: 'c', text: 'An immediate sell signal.', correct: false },
      { id: 'd', text: 'The trend has already reversed.', correct: false },
    ],
    explain: 'The Trend family rows measure different dimensions: Ribbon and Pulse measure direction and structure (both bullish), while Tension measures how stretched price is from fair value (magenta means stretched). Disagreement within a family is INFORMATION — the trend is still alive but overextended. This is typically a "trim, don\u2019t exit" state for trend followers.',
  },
  {
    q: 'The Live Conditions sub-panel at the bottom of the Command Center shows which four dimensions?',
    options: [
      { id: 'a', text: 'Direction, Speed, Volatility, Risk.', correct: false },
      { id: 'b', text: 'Trend, Momentum, Volume, Tension.', correct: true },
      { id: 'c', text: 'Bull, Bear, Range, Volatile.', correct: false },
      { id: 'd', text: 'Entry, Exit, Stop, Target.', correct: false },
    ],
    explain: 'The Live Conditions sub-panel shows 4 real-time gauges: Trend (from ADX), Momentum (from velocity), Volume (from participation ratio), and Tension (from price-to-fair-value distance). Each is displayed as a 10-block histogram showing intensity rather than a specific number.',
  },
  {
    q: 'What does AMBER mean across the Command Center\u2019s color language?',
    options: [
      { id: 'a', text: 'Always a reason to avoid trading.', correct: false },
      { id: 'b', text: 'Caution or transition — information worth reading, not a prohibition.', correct: true },
      { id: 'c', text: 'A broken or undefined state.', correct: false },
      { id: 'd', text: 'A sub-type of green meaning "almost ready."', correct: false },
    ],
    explain: 'Amber signals caution or transition — it appears when something is in an in-between state: building pressure, approaching a limit, forming a new regime. Amber is NORMAL baseline reading; most Command Centers have 2-3 amber cells at any time. Only aligned amber across a family or against the header is a genuine warning.',
  },
  {
    q: 'The operator\u2019s "10-Second Glance Read" discipline has 3 phases. What are they, in order?',
    options: [
      { id: 'a', text: 'Bottom up, top down, then sideways.', correct: false },
      { id: 'b', text: 'Header first (2s) → Color scan all rows (4s) → Deep read the amber outliers (4s).', correct: true },
      { id: 'c', text: 'Read every cell left-to-right, top-to-bottom.', correct: false },
      { id: 'd', text: 'Check HTF, then check Session, then check everything else.', correct: false },
    ],
    explain: 'The structured 3-phase scan is how operators read 15 rows in 10 seconds. Reading linearly takes 30+ seconds and breaks flow. The 3-phase structure exploits the fact that the header pre-resolves most conflict, so most rows only need a color check rather than a full read.',
  },
  {
    q: 'In the Sweep row, you see: ▲ BUY 2b ago STRONG + FVG with action → HOT + FVG ★. What does the ★ star signify?',
    options: [
      { id: 'a', text: 'The sweep happened during the most liquid session.', correct: false },
      { id: 'b', text: 'The liquidity sweep happened AT an active Fair Value Gap — the highest-conviction reversal setup in the suite.', correct: true },
      { id: 'c', text: 'The sweep had institutional volume.', correct: false },
      { id: 'd', text: 'A decorative flourish with no functional meaning.', correct: false },
    ],
    explain: 'The ★ star is reserved for the rare case where a sweep event happens AT or very near an active Fair Value Gap. Per the Pine code, this is ICT\u2019s highest-conviction reversal setup — two institutional concepts (liquidity grab + imbalance magnet) aligning at the same price. Every other sweep tag lacks the star.',
  },
];

// ============================================================
// MAIN COMPONENT — Lesson 11.2: The CIPHER Command Center · Anatomy
// ============================================================
export default function CipherCommandCenterAnatomy() {
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  // Compute quiz score
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 2</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The CIPHER<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Command Center</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Fifteen pre-prioritized verdicts, one operator station. Every cell is the top of a stack &mdash; verdicts, not raw data.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* ================ SECTION S00 — Why This Matters ================ */}
      {/* ================ SECTION S00 — Why This Matters ================ */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Command Center IS CIPHER.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The Command Center is the single most information-dense element in CIPHER. Fifteen rows, each a distinct dimension of the market, each updated every bar. Miss the reading discipline and you drown in data. <strong className="text-white">Master it and you read a chart in ten seconds.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">This lesson does one thing: teach you to read every cell. Not the math behind it, not the entries it suggests &mdash; just the reading. Because the reading is the operator skill that underlies every other skill in Level 11.</p>
            <p className="text-gray-400 leading-relaxed">The Command Center is not a summary of CIPHER. It <strong className="text-amber-400">IS</strong> CIPHER. The arrows on the chart are derivative &mdash; they fire only when enough Command Center rows agree. If you cannot read the Command Center, you cannot evaluate arrows when they fire. You are trusting signals you cannot verify.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE COMMAND CENTER AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every lesson from 11.2 onward assumes you can read this panel at a glance. The fifteen rows are not raw data &mdash; they are pre-prioritized verdicts. Each cell is the top of a sorted stack. Read cells as conclusions, not as inputs to interpret.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S01 — The Priority Waterfall ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Priority Waterfall</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every cell in the Command Center is the <strong className="text-amber-400">top of a priority stack</strong>. CIPHER has already resolved the conflict &mdash; you are reading the verdict, not the data. Look at any single cell. Say the Ribbon row&apos;s Action column shows &ldquo;DIVERGING.&rdquo; What you are NOT seeing is that CIPHER evaluated seven possible states and picked this one through a strict priority order: <strong className="text-white">DIVERGING</strong> (internal trend deterioration) &rarr; CURVING (projection bending back) &rarr; DOUBLE COIL (ribbon + BB/KC compressed) &rarr; COILED (ribbon squeeze confirmed) &rarr; FLIP NEAR (cross proximity) &rarr; AGING (past average stack duration) &rarr; EXPANDING (healthy trend, default). The portable insight: <strong className="text-amber-400">cells are verdicts, not raw readings</strong>. You do not need to be the analyst &mdash; CIPHER is the analyst. You are the operator who reads the verdict and decides what to do. This also explains why different rows can show seemingly-different colors at the same time. Each row is the top of its own independent stack. Disagreement between rows is not a bug; it is CIPHER showing you that different dimensions of the market are pointing in different directions. The Executive Summary header then resolves which disagreement matters most.</p>
          <PriorityWaterfallAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE WATERFALL DOCTRINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">When CIPHER shows a verdict, it has already done the analysis. Your job is not to second-guess which state should have surfaced &mdash; it is to read the surfaced state, integrate with the other row verdicts, and decide. Don&apos;t reverse-engineer cells. Read them.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S02 — Executive Summary Header ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Header</p>
          <h2 className="text-2xl font-extrabold mb-4">The Executive Summary Header</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Always on. Always read first. The header waterfalls through every row to give you one line. It is the only row that cannot be toggled off in settings &mdash; because it is always the first thing you read. Three cells. <strong className="text-white">Brand cell</strong> &mdash; CIPHER PRO with a tooltip anchor showing the full Executive Summary rationale on hover. <strong className="text-white">State cell</strong> &mdash; the current regime with direction: BULL TREND, BEAR TREND, RANGING, or VOLATILE. <strong className="text-amber-400">Action hint cell</strong> &mdash; the single most urgent thing to do right now, picked from 17 possible actions via a priority waterfall. This cell is where the Executive Summary earns its name. If you have ten seconds to read a chart, spend two of them here. The header pre-resolves most conflict between the rows below. When rows disagree and the header is clear, trust the header. When the header itself is ambiguous (RANGING with no clear action), stand aside.</p>
          <ExecutiveHeaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Header Is Your First Read &mdash; Always</p>
            <p className="text-sm text-gray-400 leading-relaxed">Train yourself to look at the header BEFORE the chart. Most operators flip this order &mdash; chart first, header second &mdash; and end up letting the candles drive the thesis. Header first means the verdict drives the read; the chart only confirms or denies. It is a small habit that compounds.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S03 — The 3-Cell Pattern ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Universal Grammar</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Row Speaks the Same Grammar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Fifteen different rows. Fifteen different market dimensions. <strong className="text-amber-400">One universal pattern: Label &middot; State &middot; Action.</strong> <strong className="text-white">Cell 0 &mdash; Label:</strong> the row&apos;s name, left-aligned, always dim gray. Tells you which dimension this row measures. Never changes color. <strong className="text-white">Cell 1 &mdash; State:</strong> the current reading, center-aligned. Color encodes the state. Often includes direction arrows and numeric context (bars, ATR, %). <strong className="text-white">Cell 2 &mdash; Action:</strong> what the state implies, left-aligned, prefixed with &rarr;. Color encodes urgency. The priority-waterfall verdict for that row. This consistency is an enormous gift. You do not learn 15 different row languages. You learn one grammar and the same pattern unlocks every row. Once you recognize the grammar, even rows you have never read before (Sweep, Imbalance, Regime) become legible on first sight.</p>
          <ThreeColumnGrammarAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Learn the Grammar Once, Read Forever</p>
            <p className="text-sm text-gray-400 leading-relaxed">Other indicators ship row formats that vary &mdash; some have just a state, some bury the action in a tooltip, some use icons that mean different things in different rows. CIPHER&apos;s 3-cell uniformity is a deliberate design choice that flattens the learning curve from N&times;15 to N&times;1. Every row you learn pays forward to every future row.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S04 — The Trend Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Family 1 of 6: Trend</p>
          <h2 className="text-2xl font-extrabold mb-4">Ribbon &middot; Pulse &middot; Tension</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first three rows of the Command Center form a family. Individually they each measure one thing; together they tell you whether a trend is healthy, weakening, or about to snap. <strong className="text-white">Ribbon</strong> &mdash; the adaptive trend engine. Reports direction (BULL / BEAR / CROSSING) in cell 1, then the most urgent intelligence from a 7-state waterfall in cell 2 (DIVERGING &rarr; CURVING &rarr; DOUBLE COIL &rarr; COILED &rarr; FLIP NEAR &rarr; AGING &rarr; EXPANDING). <strong className="text-white">Pulse</strong> &mdash; the dynamic S/R lifeline. Reports whether price is using the Pulse line as SUPPORT (bull) or RESISTANCE (bear), plus how long it has been holding and how stretched it is. Action waterfalls from NEW TREND &rarr; OVEREXTENDED &rarr; TREND SAFE &rarr; TIGHTEN STOPS &rarr; FLIP WARNING. <strong className="text-white">Tension</strong> &mdash; the snap-back pressure gauge. Reports how far price has stretched from fair value: RELAXED &rarr; BUILDING &rarr; STRETCHED &rarr; SNAPPING. When it snaps, mean-reversion is in progress.</p>
          <TrendFamilyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Reading the Family as a Story</p>
            <p className="text-sm text-gray-400 leading-relaxed">All three teal = trend is clean, ride it. Ribbon teal + Tension amber = trend alive but stretched, trim into strength. Ribbon teal + Tension magenta = snap imminent, exit or prepare to reverse. The family tells a story that no single row tells. Read all three together; the story is in the chord, not the notes.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S05 — The Energy Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Family 2 of 6: Energy</p>
          <h2 className="text-2xl font-extrabold mb-4">Momentum &middot; Volatility / Squeeze</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The next two rows describe energy: where the market has momentum right now (Momentum) and where energy is being stored up for release (Volatility/Squeeze). <strong className="text-white">Momentum</strong> &mdash; the densest row in the panel. Cell 1 shows direction + NOW state + phase bars + health % + health trend arrow (e.g. &ldquo;&#9650; SURGING 8b 78%&#9650;&rdquo;). Cell 2 shows the NEXT outlook waterfalled from 10+ possible actions. This row alone gives you an ENORMOUS amount of information at a glance once you can read it. <strong className="text-white">Volatility/Squeeze</strong> &mdash; dual-mode energy storage. This row has 4 display modes that rotate automatically: (1) normal volatility state, (2) active squeeze with phase + bars + energy %, (3) breakout bar with direction + quality, (4) post-breakout tracking (runner vs dud). The label even changes between &ldquo;Volatility&rdquo; and &ldquo;Squeeze&rdquo; based on state.</p>
          <EnergyFamilyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The &ldquo;Loaded Spring&rdquo; Pattern</p>
            <p className="text-sm text-gray-400 leading-relaxed">FLAT momentum + BREAKOUT READY squeeze is one of the most valuable reads in CIPHER. Momentum is at zero because energy is coiled, not because the market is dead. When the squeeze releases, momentum explodes. Train yourself to recognize this pattern &mdash; it&apos;s the highest-conviction setup the Energy family produces.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S06 — The Participation Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Family 3 of 6: Participation</p>
          <h2 className="text-2xl font-extrabold mb-4">The Volume Row</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Volume sits alone because it answers a unique question: regardless of what price is doing, <strong className="text-amber-400">who is participating?</strong> The Volume row converts raw volume ratios into five plain-English states with immediate trading implications. <strong className="text-white">EXTREME</strong> (2.0x+ average) &mdash; climax bar, somebody is trapped. <strong className="text-white">STRONG</strong> (1.3x+ average) &mdash; institutions are present, trust the move. <strong className="text-white">NORMAL</strong> &mdash; baseline, neutral input. <strong className="text-white">THIN</strong> (0.5&ndash;0.8x) &mdash; weak hands only, moves may not hold. <strong className="text-white">EMPTY</strong> (under 0.5x) &mdash; nobody cares, noise market. Volume is the participation veto. A BULL TREND header with EMPTY volume is a trap: price is going up but nobody is there to defend it. Always glance at Volume before trusting any setup from the rows above it.</p>
          <VolumeRowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Volume Is the Veto Layer</p>
            <p className="text-sm text-gray-400 leading-relaxed">No matter how clean the trend, momentum, or structure looks, EMPTY or THIN volume should make you stand down or size much smaller. Conversely, EXTREME volume is rarely a continuation signal &mdash; it&apos;s usually a climax or trap. Use Volume as a binary: STRONG/NORMAL = proceed; THIN/EMPTY/EXTREME = pause and reread.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S07 — The Risk Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Family 4 of 6: Risk</p>
          <h2 className="text-2xl font-extrabold mb-4">The Risk Envelope Row</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Risk row translates price position within the Risk Envelope (a 3-zone ATR cloud) into 4 zones with specific sizing implications. Position sizing is a solved problem when the Risk row is read correctly. <strong className="text-white">SAFE</strong> &mdash; inside inner band. Normal position size. No adjustment. <strong className="text-white">WATCH</strong> &mdash; past inner band. Pay attention. Not dangerous yet &mdash; just &ldquo;something is happening.&rdquo; <strong className="text-white">CAUTION</strong> &mdash; between mid and outer band. Extension visible. Tighten stops. Protect capital. <strong className="text-amber-400">DANGER</strong> &mdash; beyond outer band. Reduce size immediately. ENTRENCHED tag (&#9888;) means it has been here too long. The dwell-time suffix (e.g. &ldquo;REDUCE SIZE 15b &#9888;&rdquo;) adds crucial context: DANGER for 2 bars is a wick; DANGER for 15 bars with the ENTRENCHED warning is a sustained extension that demands action.</p>
          <RiskRowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Read the Dwell-Time, Not Just the Zone</p>
            <p className="text-sm text-gray-400 leading-relaxed">A single bar in DANGER is just a wick &mdash; ignore it. Three bars in DANGER is extension worth noting. Ten+ bars with the ENTRENCHED tag is structural &mdash; the move is exhausted and you are LATE. The Risk row teaches operators not to react to single-bar extremes but to read the persistence of the extreme. Dwell-time is the signal; the zone is the threshold.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S08 — The Structure Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Family 5 of 6: Structure</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure &middot; Imbalance &middot; Sweep</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three rows that together answer &ldquo;where is the meaningful structure and how is price interacting with it?&rdquo; Every trader has some version of these concepts; CIPHER bundles them into one family so you do not have to scan three separate tools. <strong className="text-white">Structure</strong> &mdash; nearest S/R levels with ATR distance. Cell 1 shows support and resistance distances (e.g. &ldquo;S 1.2 ATR R 0.3 ATR&rdquo;). Cell 2 translates this to AT SUPPORT / AT RESISTANCE / NEAR / DECISION ZONE / BETWEEN LEVELS / NO LEVELS. <strong className="text-white">Imbalance</strong> &mdash; nearest Fair Value Gaps (FVGs). Shows the closest bull and bear FVG with ATR distance and fill percentage. Guidance includes STACKED BULL/BEAR for aggressive institutional imbalances &mdash; 2+ gaps in the same direction within 2 ATR. <strong className="text-white">Sweep</strong> &mdash; last liquidity sweep event. Shows direction + bars ago + quality (WEAK/MODERATE/STRONG) with optional FVG tag. Freshness goes HOT (&le;3b) &rarr; COOLING (&le;10b) &rarr; COLD. The <strong className="text-amber-400">&#9733; star on HOT + FVG</strong> is the highest-conviction reversal signal in the suite.</p>
          <StructureFamilyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; The ICT Confluence Setup</p>
            <p className="text-sm text-gray-400 leading-relaxed">A recent sweep AT an active imbalance is what ICT traders wait for. CIPHER tags this &ldquo;HOT + FVG &#9733;&rdquo; &mdash; when you see that, the Structure family has handed you the highest-probability reversal pattern in the entire indicator. The full setup is one Sweep row away from being formed for you, automatically.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S09 — The Context Family ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Family 6 of 6: Context</p>
          <h2 className="text-2xl font-extrabold mb-4">Bias &middot; Session &middot; Regime &middot; HTF</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The largest family. Four rows that zoom OUT from the current chart to show you the bigger picture. Without context, every signal is just a chart pattern; with context, it becomes a trade. <strong className="text-white">Bias</strong> &mdash; macro environment, asset-class-aware. Crypto: BTC.D + USDT.D. Stocks: VIX + SPX. Forex: DXY + US10Y. Cell 1 shows raw macro symbols (for advanced traders); cell 2 translates to FAVOR LONGS / FAVOR SHORTS / BE SELECTIVE (for fast reads). <strong className="text-white">Session</strong> &mdash; active trading window. Detects LDN OPEN / NY OPEN / LDN CLOSE as killzones (PRIME TIME), LDN/NY overlap (HIGH VOLUME), active sessions (NORMAL), and quiet sessions like Tokyo (LOW VOLUME). Session quality modifies the trust-level of every signal. <strong className="text-white">Regime</strong> &mdash; market structure with transition warning. Shows TREND / RANGE / VOLATILE. The action cell is forward-looking: SHIFTING TO X (transition imminent), X FORMING (transition likely), or TREND INTACT / RANGE HOLDING / STAY CAUTIOUS. This row is your early warning for regime changes. <strong className="text-white">HTF</strong> &mdash; multi-timeframe alignment. Shows two higher timeframes (1H&rarr;4H, 4H&rarr;D, D&rarr;W etc.) with direction + strength (WEAK/MODERATE/STRONG/DOMINANT). Cell 2 verdict: ALIGNED BULL, ALIGNED BEAR, or CONFLICTING.</p>
          <ContextFamilyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Context Determines Trade or Pattern</p>
            <p className="text-sm text-gray-400 leading-relaxed">A clean Trend setup during Asia lunch with a CONFLICTING HTF is just a chart pattern, not a trade. The same setup during NY open with ALIGNED HTF and FAVOR LONGS bias is a high-conviction trade. The Context family converts &ldquo;technically valid&rdquo; into &ldquo;actually tradeable.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S10 — Last Signal ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Activity</p>
          <h2 className="text-2xl font-extrabold mb-4">The Last Signal Row</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Freshness is intelligence. Stale signals do not have the action value of fresh ones. Last Signal reports the most recent signal that passed your filters (Signal Type, Direction, Strong Only). Cell 1 shows direction + bars ago (e.g. &ldquo;&#9650; Long 2 bars&rdquo;). Cell 2 translates age to a freshness band. <strong className="text-white">JUST FIRED</strong> (&le;3 bars) &mdash; entry still fresh, full confidence in the setup. <strong className="text-white">FRESH</strong> (&le;10 bars) &mdash; signal recent, original setup may still be valid &mdash; confirm before taking it. <strong className="text-white">ACTIVE</strong> (&le;30 bars) &mdash; older, setup weakening, look for re-entry rather than chasing. <strong className="text-amber-400">AGING</strong> (&gt;30 bars) &mdash; stale, treat as historical &mdash; no action value.</p>
          <LastSignalRowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Don&apos;t Chase AGING Signals</p>
            <p className="text-sm text-gray-400 leading-relaxed">A common mistake is seeing an AGING signal and taking it as if it had just fired. The most-quality entries are JUST FIRED and FRESH. If you see an AGING signal, set an alert and wait for the next one &mdash; don&apos;t chase 30+ bars after the fact.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S11 — Live Conditions ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Sub-Panel</p>
          <h2 className="text-2xl font-extrabold mb-4">The Live Conditions Sub-Panel</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Below the main rows sits a 4-gauge sub-panel. Fast-changing dimensions at a glance. The Conditions sub-panel is separated from the main rows by a thin divider. It contains four fast-moving gauges, each rendered as a 10-block histogram (filled blocks for intensity, dim blocks for empty). These are the canaries. <strong className="text-white">Trend</strong> &mdash; FLAT &rarr; WEAK &rarr; MODERATE &rarr; STRONG. Measures ADX strength. This is the slow one &mdash; it changes over many bars. <strong className="text-white">Momentum</strong> &mdash; STALLED &rarr; FADING &rarr; BUILDING &rarr; SURGING. Measures current velocity. Changes bar-to-bar. <strong className="text-white">Volume</strong> &mdash; EMPTY &rarr; QUIET &rarr; ACTIVE &rarr; EXTREME. Measures participation ratio. Fast and decisive. <strong className="text-white">Tension</strong> &mdash; RELAXED &rarr; LIGHT &rarr; BUILDING &rarr; STRETCHED. Measures price-to-fair-value distance. Shows mean-reversion pressure.</p>
          <LiveConditionsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Conditions Lead the Main Rows</p>
            <p className="text-sm text-gray-400 leading-relaxed">When Conditions moves fast but rows above are slow, something is happening NOW that the slower rows have not caught up to yet. Smart operators watch Conditions to catch changes early &mdash; the rows above will follow within a few bars. Conditions is the early-warning system.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S12 — Color Language ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Vocabulary</p>
          <h2 className="text-2xl font-extrabold mb-4">The Color Language</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most trading panels use random colors. CIPHER uses five, and they mean the same thing everywhere. Learn the vocabulary once and every row becomes instantly legible. <strong className="text-white">TEAL</strong> &mdash; positive, healthy, bullish. Safe to ride / safe to trust. <strong className="text-white">MAGENTA</strong> &mdash; negative, warning, bearish. Something to be protected from. <strong className="text-amber-400">AMBER</strong> &mdash; caution, transition, in-between. Information worth reading, NOT a prohibition. <strong className="text-white">WHITE</strong> &mdash; neutral, informational. No bias either way. Often used for NORMAL or MATURE states. <strong className="text-amber-400">BRIGHT RED</strong> &mdash; urgent danger. More severe than magenta. Reserved for FADING, EXIT SOON, JUST EXHAUSTED, entrenched DANGER. When a cell is bright red, drop what you are doing and read the row. The color is reserved for the most urgent states in the entire panel.</p>
          <ColorLanguageAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Amber Is Information, Not Prohibition</p>
            <p className="text-sm text-gray-400 leading-relaxed">A common beginner mistake is treating amber like red &mdash; &ldquo;something amber, must avoid the trade.&rdquo; Amber means &ldquo;read this row carefully, the answer matters here.&rdquo; Most A+ setups have at least one amber row in the panel. The discipline is reading the amber row, not avoiding the trade.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S13 — 10-Second Glance Read ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">The 10-Second Glance Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">How operators read 15 rows in 10 seconds. Not linearly &mdash; structurally. Reading every row top-to-bottom, left-to-right, takes 30+ seconds and breaks your flow. Operators do not read linearly &mdash; they read in 3 structured passes. <strong className="text-white">Pass 1 &mdash; Header First (~2 seconds):</strong> read the Executive Summary only. State + action. That is your one-line briefing. If the header is clear, you often do not need the rest. <strong className="text-white">Pass 2 &mdash; Color Scan (~4 seconds):</strong> sweep your eyes down the panel. Note the color pattern. Mostly teal? Mixed? Amber warnings? You are looking for the color shape of the panel, not reading any specific row. <strong className="text-amber-400">Pass 3 &mdash; Deep Read (~4 seconds):</strong> now read only the amber and red rows in full. These are the outliers &mdash; the edge cases CIPHER flagged as worth your attention. Everything teal you can trust; everything amber you need to understand.</p>
          <TenSecondGlanceAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Ten Seconds Is a Learnable Skill</p>
            <p className="text-sm text-gray-400 leading-relaxed">Total time: 10 seconds. This is a learnable skill &mdash; practice it 20 times and it becomes automatic. After that you will read the Command Center faster than most traders read a single MACD. The discipline is not speed; the discipline is the structured 3-pass order.</p>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S14 — Reading Mistakes ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways the Command Center Gets Misread</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Watch the animation cycle through the four mistakes. For each one, ask yourself honestly: have I done this? Most newcomers have done at least two. The cure is awareness &mdash; once you can name the mistake, you can catch yourself in the act.</p>
          <ReadingMistakesAnim />
          <div className="space-y-3 mt-6">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 1 &mdash; Reading Only the Header</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The header is your first read &mdash; not your only read. Header alone misses crucial nuance from the Risk row, the Volume veto, and the HTF alignment. The header sets the thesis; the rows below either confirm it or warn you off.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 2 &mdash; Treating One Amber Cell as Fatal</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Amber means &ldquo;information worth reading,&rdquo; not &ldquo;prohibition.&rdquo; A+ setups often have amber cells. Read the amber row, understand what it&apos;s telling you, then decide. Don&apos;t reflexively skip every amber-flecked panel.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 3 &mdash; Scanning Linearly Top-to-Bottom</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Reading row 1 in full, then row 2 in full, then row 3, takes 30+ seconds and you lose track of the panel&apos;s shape. Use the 3-pass discipline: header first, color scan, deep read on outliers only. Structure beats sequence.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 4 &mdash; Ignoring Live Conditions</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The Live Conditions sub-panel changes faster than the main rows. When it shifts and the rows above are still slow, that&apos;s your early warning. Operators who ignore Conditions miss regime changes by several bars &mdash; usually long enough to be the wrong side of the move.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================ SECTION S15 — Cheat Sheet ================ */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Command Center Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Screenshot This. Pin It.</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Reading Order (10 Seconds)</p>
                <p className="text-sm text-gray-300">1. Header first (~2s) &mdash; State + Action. 2. Color scan all rows (~4s) &mdash; note the panel shape. 3. Deep read amber/red outliers (~4s). 4. Glance at Conditions for fast-moving dimensions. 5. Act or stand aside.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Color Vocabulary</p>
                <p className="text-sm text-gray-300"><span className="text-teal-400 font-semibold">TEAL</span> = positive / healthy / bullish &middot; <span className="text-red-400 font-semibold">MAGENTA</span> = negative / warning / bearish &middot; <span className="text-amber-400 font-semibold">AMBER</span> = caution / transition (information, not prohibition) &middot; <span className="font-semibold">WHITE</span> = neutral / informational &middot; <span style={{ color: '#FF1744' }} className="font-semibold">BRIGHT RED</span> = urgent danger.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Row Families (15 Rows + Live Conditions)</p>
                <p className="text-sm text-gray-300"><strong className="text-white">Trend:</strong> Ribbon &middot; Pulse &middot; Tension &middot; <strong className="text-white">Energy:</strong> Momentum &middot; Volatility/Squeeze &middot; <strong className="text-white">Participation:</strong> Volume &middot; <strong className="text-white">Risk:</strong> Risk Envelope &middot; <strong className="text-white">Structure:</strong> Structure &middot; Imbalance &middot; Sweep &middot; <strong className="text-white">Context:</strong> Bias &middot; Session &middot; Regime &middot; HTF &middot; <strong className="text-white">Activity:</strong> Last Signal.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Universal Grammar (Every Row)</p>
                <p className="text-sm text-gray-300">Cell 0 = LABEL (dim gray, never changes) &middot; Cell 1 = STATE (color encodes, often with arrows + numerics) &middot; Cell 2 = ACTION (prefixed &rarr;, color encodes urgency, the priority-waterfall verdict).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The &#9733; Star Signatures</p>
                <p className="text-sm text-gray-300"><strong className="text-amber-400">HOT + FVG &#9733;</strong> = sweep at active imbalance, highest-conviction reversal &middot; <strong className="text-amber-400">&#9733; DOUBLE</strong> = ribbon + BB/KC both compressed, max stored energy &middot; <strong className="text-amber-400">&#9889; DOUBLE</strong> = multi-level sweep, 2+ liquidity levels raided in one bar.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 mb-1">Mistakes to Avoid</p>
                <p className="text-sm text-gray-300">&#10060; Reading only the header &middot; &#10060; Treating one amber cell as fatal &middot; &#10060; Scanning linearly top-to-bottom &middot; &#10060; Ignoring Live Conditions.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Command Center</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real Command Center states. For each one, pick the operator read. You&apos;ll see the explanation after every answer, including for the wrong ones.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">{gameRounds[gameRound].scenario}</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade reading installed. The Command Center is now your panel of choice.' : finalScore >= 3 ? 'Solid grasp. Re-read the families (S04&ndash;S09) before the quiz.' : 'Re-study the priority waterfall (S01) and the 10-second discipline (S13) before the quiz.'}</p>
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
                <p className="text-sm font-semibold text-white mb-4">{q.q}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.2: The CIPHER Command Center &mdash; Anatomy</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Command Center Operator &mdash;</p>
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
