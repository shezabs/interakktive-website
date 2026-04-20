// app/academy/lesson/cipher-inputs-anatomy-part-1/page.tsx
// ATLAS Academy — Lesson 11.3a: CIPHER Inputs Anatomy — Part 1 (Visual Layer) [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Covers 9 visual-layer input groups: PRESET, RIBBON, RISK ENVELOPE, STRUCTURE,
// SPINE, IMBALANCE, SWEEPS, COIL, PULSE. 26 inputs total.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT (consistent with Level 10 + 11.1 + 11.2)
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
// ANIMATION 1: The Silent Cascade (Groundbreaking Concept)
// One toggle flip ripples through 4 downstream systems the student
// didn't know were connected. Demonstrates why settings are dangerous
// and why mastering them is a trading skill, not a setup step.
// The toggle: "Strong Signals Only" (richest cascade — 4+ downstream effects).
// ============================================================
function SilentCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    // Full cycle = 8 seconds. Breakdown:
    //   0.00 - 0.15 : show starting state (toggle off, 8 signals, all systems "normal")
    //   0.15 - 0.22 : toggle click animation (checkbox fills amber -> teal)
    //   0.22 - 0.40 : RIPPLE 1 — signals on chart drop from 8 to 3
    //   0.40 - 0.55 : RIPPLE 2 — "Last Signal" row updates (FRESH -> AGING)
    //   0.55 - 0.70 : RIPPLE 3 — "Pulse" row action shifts (WATCH BREAKOUT -> HOLDING)
    //   0.70 - 0.85 : RIPPLE 4 — tooltip TP/SL recalcs (different anchor signal)
    //   0.85 - 1.00 : punchline — "You toggled ONE thing. FOUR systems changed."
    const cycle = (t * 0.125) % 1;
    const phase =
      cycle < 0.15 ? 0 :
      cycle < 0.22 ? 1 :
      cycle < 0.40 ? 2 :
      cycle < 0.55 ? 3 :
      cycle < 0.70 ? 4 :
      cycle < 0.85 ? 5 : 6;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE SILENT CASCADE — ONE TOGGLE, FOUR DOWNSTREAM SHIFTS', w / 2, 16);

    // ---- LAYOUT: 2x2 grid of tiles ----
    // TL: Settings panel with the toggle
    // TR: Mini chart with signal markers
    // BL: Mini Command Center (3 rows)
    // BR: Tooltip preview (TP/SL values)
    const pad = 12;
    const titleH = 28;
    const gridTop = titleH + 4;
    const gridH = h - gridTop - 6;
    const tileW = (w - pad * 3) / 2;
    const tileH = (gridH - pad) / 2;

    // helper: draw tile frame with optional "rippling" glow
    const drawTile = (x: number, y: number, tw: number, th: number, rippling: boolean, label: string) => {
      ctx.fillStyle = 'rgba(20,24,32,0.6)';
      ctx.strokeStyle = rippling ? AMBER : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = rippling ? 1.5 : 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, tw, th, 8);
      else ctx.rect(x, y, tw, th);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 10, y + 13);
      if (rippling) {
        ctx.fillStyle = AMBER;
        ctx.fillRect(x + tw - 52, y + 6, 46, 12);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('RIPPLE', x + tw - 29, y + 15);
      }
    };

    // ------------- TILE 1: SETTINGS ------------
    const tl = { x: pad, y: gridTop };
    drawTile(tl.x, tl.y, tileW, tileH, phase === 1, 'SETTINGS · SIGNAL ENGINE');

    // Settings rows
    const sx = tl.x + 14;
    let sy = tl.y + 30;
    // Row 1: Signal Engine dropdown
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Signal Engine', sx, sy + 8);
    ctx.fillStyle = 'rgba(11,14,18,1)';
    ctx.fillRect(sx + tileW - 72, sy, 48, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sx + tileW - 72, sy, 48, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Trend', sx + tileW - 48, sy + 10);
    sy += 26;

    // Row 2: Direction dropdown
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'left';
    ctx.font = '10px system-ui';
    ctx.fillText('Direction', sx, sy + 8);
    ctx.fillStyle = 'rgba(11,14,18,1)';
    ctx.fillRect(sx + tileW - 72, sy, 48, 14);
    ctx.strokeRect(sx + tileW - 72, sy, 48, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Both', sx + tileW - 48, sy + 10);
    sy += 26;

    // Row 3: THE TOGGLE (highlighted with amber border)
    const toggleOn = phase >= 1;
    const togglePulse = phase === 1 ? Math.sin(t * 20) * 0.5 + 0.5 : 0;
    const highlightAlpha = phase >= 1 ? 0.15 + togglePulse * 0.1 : 0.08;
    ctx.fillStyle = `rgba(255,179,0,${highlightAlpha})`;
    ctx.fillRect(sx - 6, sy - 3, tileW - 18, 20);
    ctx.strokeStyle = `rgba(255,179,0,${phase >= 1 ? 0.5 : 0.25})`;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sx - 6, sy - 3, tileW - 18, 20);
    // Checkbox
    ctx.fillStyle = toggleOn ? TEAL : 'rgba(11,14,18,1)';
    ctx.strokeStyle = toggleOn ? TEAL : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(sx, sy + 2, 11, 11);
    ctx.strokeRect(sx, sy + 2, 11, 11);
    if (toggleOn) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + 2, sy + 7);
      ctx.lineTo(sx + 5, sy + 10);
      ctx.lineTo(sx + 9, sy + 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Strong Signals Only', sx + 18, sy + 11);

    sy += 28;
    // Row 4: cipher candles
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px system-ui';
    ctx.fillText('Cipher Candles', sx, sy + 8);
    ctx.fillStyle = 'rgba(11,14,18,1)';
    ctx.fillRect(sx + tileW - 72, sy, 48, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeRect(sx + tileW - 72, sy, 48, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Default', sx + tileW - 48, sy + 10);

    // ------------- TILE 2: CHART ------------
    const tr = { x: pad * 2 + tileW, y: gridTop };
    drawTile(tr.x, tr.y, tileW, tileH, phase === 2, 'CHART · SIGNAL MARKERS');
    // Draw a price path inside the chart tile
    const chartX = tr.x + 10;
    const chartY = tr.y + 28;
    const chartW = tileW - 20;
    const chartH = tileH - 38;
    // Price path (fake OHLC trend upward)
    ctx.strokeStyle = 'rgba(58,69,85,0.9)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    const pricePoints = 20;
    for (let i = 0; i < pricePoints; i++) {
      const px = chartX + (i / (pricePoints - 1)) * chartW;
      const noise = Math.sin(i * 1.3) * 4 + Math.cos(i * 2.1) * 3;
      const py = chartY + chartH - 8 - (i / pricePoints) * (chartH - 20) + noise;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Signal markers — 8 total, but after RIPPLE 1 only 3 remain
    // Positions along the price path chosen so the 3 survivors are "the best"
    const allSignals = [
      { i: 2, dir: 'L', strong: false },
      { i: 4, dir: 'S', strong: false },
      { i: 6, dir: 'L', strong: true },   // survives
      { i: 8, dir: 'L', strong: false },
      { i: 10, dir: 'S', strong: false },
      { i: 13, dir: 'L', strong: true },  // survives
      { i: 15, dir: 'L', strong: false },
      { i: 18, dir: 'L', strong: true },  // survives
    ];
    const postRipple1 = phase >= 2;
    const ripple1Progress = phase === 2 ? Math.min(1, (cycle - 0.22) / 0.10) : phase > 2 ? 1 : 0;

    allSignals.forEach((s) => {
      const px = chartX + (s.i / (pricePoints - 1)) * chartW;
      const noise = Math.sin(s.i * 1.3) * 4 + Math.cos(s.i * 2.1) * 3;
      const py = chartY + chartH - 8 - (s.i / pricePoints) * (chartH - 20) + noise;
      let alpha = 1;
      if (postRipple1 && !s.strong) alpha = 1 - ripple1Progress;
      if (alpha < 0.02) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.dir === 'L' ? TEAL : MAGENTA;
      ctx.beginPath();
      ctx.arc(px, py - 14, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Direction glyph
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.dir, px, py - 12);
      ctx.globalAlpha = 1;
    });
    // Signal count readout
    const visibleSigs = postRipple1 ? allSignals.filter((s) => s.strong).length : allSignals.length;
    ctx.fillStyle = 'rgba(11,14,18,0.8)';
    ctx.fillRect(tr.x + tileW - 68, tr.y + tileH - 22, 58, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(tr.x + tileW - 68, tr.y + tileH - 22, 58, 14);
    ctx.fillStyle = postRipple1 ? MAGENTA : TEAL;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${visibleSigs} SIGNALS`, tr.x + tileW - 39, tr.y + tileH - 12);

    // ------------- TILE 3: MINI COMMAND CENTER ------------
    const bl = { x: pad, y: gridTop + tileH + pad };
    const ccRippling = phase === 3 || phase === 4;
    drawTile(bl.x, bl.y, tileW, tileH, ccRippling, 'COMMAND CENTER (3 ROWS)');
    // 3 rows: PULSE · LAST SIGNAL · STRUCTURE
    const ccRows = [
      {
        label: 'PULSE',
        pre: { state: 'CLOSE', action: 'WATCH BREAKOUT', stateCol: AMBER, actCol: AMBER },
        post: { state: 'HOLDING', action: '—', stateCol: TEAL, actCol: WHITE_LBL },
        ripple: 4,
      },
      {
        label: 'LAST SIG',
        pre: { state: 'L · 3 BARS', action: 'FRESH', stateCol: TEAL, actCol: TEAL },
        post: { state: 'L · 12 BARS', action: 'AGING', stateCol: WHITE_LBL, actCol: AMBER },
        ripple: 3,
      },
      {
        label: 'STRUCTURE',
        pre: { state: 'AT SUPPORT', action: '—', stateCol: TEAL, actCol: WHITE_LBL },
        post: { state: 'AT SUPPORT', action: '—', stateCol: TEAL, actCol: WHITE_LBL },
        ripple: -1,
      },
    ];
    const rowH = (tileH - 32) / 3;
    ccRows.forEach((r, idx) => {
      const ry = bl.y + 26 + idx * rowH;
      // row separator
      if (idx > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(bl.x + 10, ry);
        ctx.lineTo(bl.x + tileW - 10, ry);
        ctx.stroke();
      }
      const isPostChange = (r.ripple === 3 && phase >= 3) || (r.ripple === 4 && phase >= 4);
      const v = isPostChange ? r.post : r.pre;
      const flashProgress = (r.ripple === 3 && phase === 3) ? Math.min(1, (cycle - 0.40) / 0.08)
                         : (r.ripple === 4 && phase === 4) ? Math.min(1, (cycle - 0.55) / 0.08)
                         : 0;
      // Flash background
      if (flashProgress > 0 && flashProgress < 1) {
        ctx.fillStyle = `rgba(255,179,0,${(1 - flashProgress) * 0.35})`;
        ctx.fillRect(bl.x + 6, ry + 2, tileW - 12, rowH - 4);
      }
      // Label (col 1)
      ctx.fillStyle = WHITE_LBL;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, bl.x + 12, ry + rowH / 2 + 3);
      // State (col 2)
      ctx.fillStyle = v.stateCol;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(v.state, bl.x + 80, ry + rowH / 2 + 3);
      // Action (col 3)
      ctx.fillStyle = v.actCol;
      ctx.font = '9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(v.action, bl.x + tileW - 12, ry + rowH / 2 + 3);
    });

    // ------------- TILE 4: TOOLTIP PREVIEW ------------
    const br = { x: pad * 2 + tileW, y: gridTop + tileH + pad };
    drawTile(br.x, br.y, tileW, tileH, phase === 5, 'SIGNAL TOOLTIP · TP/SL');
    // Tooltip-like card inside the tile
    const postRipple4 = phase >= 5;
    const bodyX = br.x + 14;
    let bodyY = br.y + 30;
    // entry line
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ENTRY', bodyX, bodyY + 8);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(postRipple4 ? '4,318.50' : '4,310.25', br.x + tileW - 14, bodyY + 9);
    bodyY += 18;
    // SL line
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SL', bodyX, bodyY + 8);
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(postRipple4 ? '4,306.75' : '4,298.50', br.x + tileW - 14, bodyY + 9);
    bodyY += 16;
    // TP1
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TP1 · 1R', bodyX, bodyY + 8);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(postRipple4 ? '4,330.25' : '4,322.00', br.x + tileW - 14, bodyY + 9);
    bodyY += 16;
    // TP2
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TP2 · 2R', bodyX, bodyY + 8);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(postRipple4 ? '4,342.00' : '4,333.75', br.x + tileW - 14, bodyY + 9);

    // Flash overlay when tooltip updates
    if (phase === 5) {
      const r4p = Math.min(1, (cycle - 0.70) / 0.08);
      ctx.fillStyle = `rgba(255,179,0,${(1 - r4p) * 0.35})`;
      ctx.fillRect(br.x + 6, br.y + 24, tileW - 12, tileH - 30);
    }

    // ------------- PUNCHLINE ------------
    if (phase === 6) {
      const pp = Math.min(1, (cycle - 0.85) / 0.08);
      ctx.fillStyle = `rgba(6,10,18,${pp * 0.85})`;
      ctx.fillRect(0, gridTop - 2, w, gridH + 8);
      ctx.fillStyle = `rgba(255,179,0,${pp})`;
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('YOU TOGGLED ONE THING.', w / 2, gridTop + gridH / 2 - 10);
      ctx.font = 'bold 18px system-ui';
      ctx.fillText('FOUR SYSTEMS CHANGED.', w / 2, gridTop + gridH / 2 + 14);
      ctx.fillStyle = `rgba(255,255,255,${pp * 0.65})`;
      ctx.font = '10px system-ui';
      ctx.fillText('That is the Silent Cascade.', w / 2, gridTop + gridH / 2 + 34);
    }
  }, []);
  return <AnimScene drawFn={draw} height={340} />;
}

// ============================================================
// ANIMATION 2: Anatomy of a Pine Input
// Shows one input row from the TradingView settings panel with each
// anatomical zone pulsed/highlighted in sequence:
//   - Label  - Control (checkbox/dropdown/number)  - Info icon  - Tooltip
// Teaches the 4-part grammar every CIPHER input row shares.
// ============================================================
function PineInputAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EVERY CIPHER INPUT HAS THE SAME 4-PART ANATOMY', w / 2, 16);

    // The "panel" frame — mimic the TV settings dialog
    const panelX = 40;
    const panelY = 38;
    const panelW = w - 80;
    const panelH = h - 72;
    ctx.fillStyle = 'rgba(20,24,32,0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // Group header "── CIPHER RIBBON ──"
    ctx.fillStyle = 'rgba(120,130,145,1)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('── CIPHER RIBBON ──', panelX + panelW / 2, panelY + 22);

    // The input row — show "Pulse ATR Factor" since it has the richest anatomy
    // (label + number control + info dot, plus a pulsing tooltip bubble)
    const rowY = panelY + 50;
    const rowH = 40;
    const rowX = panelX + 24;
    const rowW = panelW - 48;

    // Phases to pulse each zone (cycle = 6s)
    const cycle = (t * 0.17) % 1;
    const activeZone = Math.floor(cycle * 4); // 0-3
    const zonePulse = Math.abs(Math.sin(cycle * 4 * Math.PI));

    // Row: [LABEL] [CONTROL] [INFO ICON]
    const labelX = rowX + 8;
    const labelW = 140;
    const controlX = rowX + rowW - 110;
    const controlW = 70;
    const infoX = rowX + rowW - 24;

    // Zone highlight backgrounds (drawn first so they sit under content)
    const drawZoneHL = (zoneIdx: number, zx: number, zy: number, zw: number, zh: number) => {
      if (activeZone === zoneIdx) {
        ctx.fillStyle = `rgba(255,179,0,${0.08 + zonePulse * 0.14})`;
        ctx.strokeStyle = `rgba(255,179,0,${0.3 + zonePulse * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(zx, zy, zw, zh, 4);
        else ctx.rect(zx, zy, zw, zh);
        ctx.fill();
        ctx.stroke();
      }
    };
    drawZoneHL(0, labelX - 4, rowY + 2, labelW + 8, rowH - 4);
    drawZoneHL(1, controlX - 4, rowY + 8, controlW + 8, rowH - 16);
    drawZoneHL(2, infoX - 8, rowY + 8, 20, rowH - 16);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Pulse ATR Factor', labelX, rowY + rowH / 2 + 4);

    // Control (number box)
    ctx.fillStyle = 'rgba(11,14,18,1)';
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(controlX, rowY + 10, controlW, 20);
    ctx.strokeRect(controlX, rowY + 10, controlW, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1.5', controlX + controlW / 2, rowY + 24);

    // Info icon
    ctx.fillStyle = 'rgba(120,130,145,1)';
    ctx.beginPath();
    ctx.arc(infoX, rowY + rowH / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0B0E12';
    ctx.font = 'bold italic 9px serif';
    ctx.textAlign = 'center';
    ctx.fillText('i', infoX, rowY + rowH / 2 + 3);

    // Tooltip bubble (appears when zone 3 is active)
    const tipY = rowY + rowH + 16;
    const tipH = 58;
    const tipW = rowW - 60;
    const tipX = rowX + 30;
    if (activeZone === 3) {
      const tipAlpha = 0.7 + zonePulse * 0.3;
      ctx.fillStyle = `rgba(20,24,32,${tipAlpha})`;
      ctx.strokeStyle = `rgba(255,179,0,${0.3 + zonePulse * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tipX, tipY, tipW, tipH, 6);
      else ctx.rect(tipX, tipY, tipW, tipH);
      ctx.fill();
      ctx.stroke();
      // Tip pointer (arrow up from top edge)
      ctx.fillStyle = `rgba(20,24,32,${tipAlpha})`;
      ctx.beginPath();
      ctx.moveTo(infoX - 5, tipY);
      ctx.lineTo(infoX + 5, tipY);
      ctx.lineTo(infoX, tipY - 5);
      ctx.closePath();
      ctx.fill();
      // Tooltip text (wrapped)
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Distance from Cipher Flow. Lower = tighter', tipX + 10, tipY + 16);
      ctx.fillText('(more signals, tighter stops). Higher = wider', tipX + 10, tipY + 30);
      ctx.fillText('(fewer signals, survives more noise).', tipX + 10, tipY + 44);
    }

    // Zone labels (callouts) at the bottom
    const labels = ['LABEL', 'CONTROL', 'INFO ICON', 'TOOLTIP'];
    const labelPositions = [labelX + labelW / 2, controlX + controlW / 2, infoX, tipX + tipW / 2];
    const descriptions = [
      'What the setting is called',
      'What you change',
      'Click to reveal tooltip',
      'The reason (read this first)',
    ];
    const calloutY = h - 20;
    labels.forEach((lbl, i) => {
      const isActive = activeZone === i;
      ctx.fillStyle = isActive ? AMBER : 'rgba(255,255,255,0.3)';
      ctx.font = isActive ? 'bold 9px system-ui' : '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, labelPositions[i], calloutY);
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '8px system-ui';
        ctx.fillText(descriptions[i], labelPositions[i], calloutY + 10);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 3: The PRESET Selector
// Shows the PRESET dropdown cycling through all 7 options. Each option
// "opens up" underneath to reveal its 3 visual layers (max 3 per preset).
// Teaches: presets are curated 3-visual combinations, not magic.
// ============================================================
function PresetSelectorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PRESETS ARE 3-VISUAL RECIPES — NOT MAGIC', w / 2, 16);

    // Presets and their 3 curated visuals (from Pine lines 148-205)
    const presets = [
      { name: 'None',           visuals: [],                                              note: 'Manual — your toggles rule' },
      { name: 'Trend Trader',   visuals: ['Cipher Ribbon', 'Cipher Pulse', 'Trend candles'], note: 'Follow the wave' },
      { name: 'Scalper',        visuals: ['Structure', 'Imbalance', 'Pulse (tight)'],       note: 'Scalp from levels' },
      { name: 'Swing Trader',   visuals: ['Cipher Ribbon', 'Cipher Spine', 'Pulse (wide)'], note: 'Strong signals only' },
      { name: 'Reversal',       visuals: ['Spine', 'Imbalance', 'Risk Envelope'],           note: 'Catch the snap' },
      { name: 'Sniper',         visuals: ['Cipher Pulse (widest)', 'Cipher Coil', ''],      note: 'Wait for the squeeze' },
      { name: 'Structure',      visuals: ['Structure', 'Imbalance', 'Sweeps'],              note: 'Pure chart reading' },
    ];

    // Cycle — 2.5s per preset
    const dwellPerPreset = 60; // frames
    const idx = Math.floor(f / dwellPerPreset) % presets.length;
    const localF = f % dwellPerPreset;

    // Left column: the dropdown list (always visible)
    const listX = 40;
    const listY = 34;
    const listW = 140;
    const listItemH = 24;

    // Dropdown "closed" header
    ctx.fillStyle = 'rgba(11,14,18,1)';
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(listX, listY, listW, 22);
    ctx.strokeRect(listX, listY, listW, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Preset', listX + 8, listY + 15);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`${presets[idx].name}  ∨`, listX + listW - 8, listY + 15);

    // Open dropdown list beneath
    ctx.fillStyle = 'rgba(11,14,18,0.98)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(listX, listY + 24, listW, presets.length * listItemH);
    ctx.strokeRect(listX, listY + 24, listW, presets.length * listItemH);
    presets.forEach((p, pi) => {
      const itemY = listY + 24 + pi * listItemH;
      if (pi === idx) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(listX + 2, itemY + 2, listW - 4, listItemH - 4);
      }
      ctx.fillStyle = pi === idx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)';
      ctx.font = pi === idx ? 'bold 10px system-ui' : '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, listX + 10, itemY + 15);
    });

    // Right panel: the 3 visuals that unfold for the selected preset
    const panelX = listX + listW + 30;
    const panelY = listY;
    const panelW = w - panelX - 40;
    const panelH = h - panelY - 26;
    ctx.fillStyle = 'rgba(20,24,32,0.7)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // Preset heading
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(presets[idx].name.toUpperCase(), panelX + 14, panelY + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText(`"${presets[idx].note}"`, panelX + 14, panelY + 38);

    // The 3 visual "cards" staggered in
    const visuals = presets[idx].visuals;
    if (visuals.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'italic 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('All toggles respect what YOU set.', panelX + panelW / 2, panelY + panelH / 2 + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillText('No overrides.', panelX + panelW / 2, panelY + panelH / 2 + 24);
    } else {
      const cardY = panelY + 56;
      const cardH = 22;
      const cardGap = 6;
      visuals.forEach((v, vi) => {
        if (!v) return;
        const delay = vi * 10;
        const cardProgress = Math.min(1, Math.max(0, (localF - delay) / 16));
        if (cardProgress <= 0) return;
        const cardY2 = cardY + vi * (cardH + cardGap);
        const cardAlpha = cardProgress;
        const slideX = 20 * (1 - cardProgress);
        ctx.globalAlpha = cardAlpha;
        ctx.fillStyle = 'rgba(38,166,154,0.15)';
        ctx.strokeStyle = 'rgba(38,166,154,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(panelX + 14 - slideX, cardY2, panelW - 28, cardH, 4);
        else ctx.rect(panelX + 14 - slideX, cardY2, panelW - 28, cardH);
        ctx.fill();
        ctx.stroke();
        // Check glyph
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(panelX + 22 - slideX, cardY2 + 11);
        ctx.lineTo(panelX + 26 - slideX, cardY2 + 15);
        ctx.lineTo(panelX + 32 - slideX, cardY2 + 7);
        ctx.stroke();
        // Card label
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(v, panelX + 40 - slideX, cardY2 + 15);
        ctx.globalAlpha = 1;
      });
    }

    // Footer note
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Max 3 visual layers per preset · overrides your toggles while active', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 4: Preset Override Matrix
// A grid showing which visuals each preset enables. Cycles through each
// preset highlighting its row, revealing that presets are pre-baked
// combinations selected from the same underlying toggle set. Teaches:
// you can manually replicate any preset once you know which 3 to turn on.
// ============================================================
function PresetOverrideMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE PRESET OVERRIDE MATRIX — PATTERNS BEHIND PRESETS', w / 2, 16);

    // Matrix: rows = presets, cols = visual layers
    const presets = ['Trend Trader', 'Scalper', 'Swing Trader', 'Reversal', 'Sniper', 'Structure'];
    const visuals = ['Ribbon', 'Envelope', 'Structure', 'Spine', 'Imbalance', 'Sweeps', 'Coil', 'Pulse'];
    // Row-major boolean matrix (see reference doc)
    const matrix: boolean[][] = [
      // Rib  Env  Str  Spi  Imb  Swp  Coil Puls
      [ true, false, false, false, false, false, false, true  ], // Trend Trader
      [ false, false, true, false, true, false, false, true  ], // Scalper
      [ true, false, false, true, false, false, false, true  ], // Swing Trader
      [ false, true, false, true, true, false, false, false ], // Reversal
      [ false, false, false, false, false, false, true, true  ], // Sniper
      [ false, false, true, false, true, true, false, false ], // Structure
    ];

    // Cell dimensions
    const gridLeft = 120;
    const gridTop = 46;
    const gridW = w - gridLeft - 20;
    const cellW = gridW / visuals.length;
    const cellH = 28;

    // Column headers
    visuals.forEach((v, vi) => {
      ctx.save();
      ctx.translate(gridLeft + vi * cellW + cellW / 2, gridTop - 6);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(v, 0, 0);
      ctx.restore();
    });

    // Active preset highlight cycle
    const dwellPerPreset = 48;
    const activePreset = Math.floor(f / dwellPerPreset) % presets.length;
    const localF = f % dwellPerPreset;

    // Row labels + cells
    presets.forEach((p, pi) => {
      const ry = gridTop + pi * cellH;
      const isActive = pi === activePreset;

      // Row highlight
      if (isActive) {
        const pulse = Math.sin(localF * 0.3) * 0.15 + 0.6;
        ctx.fillStyle = `rgba(255,179,0,${0.06 + pulse * 0.04})`;
        ctx.fillRect(20, ry - 2, w - 40, cellH);
      }

      // Row label
      ctx.fillStyle = isActive ? AMBER : 'rgba(255,255,255,0.55)';
      ctx.font = isActive ? 'bold 10px system-ui' : '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(p, gridLeft - 10, ry + cellH / 2 + 3);

      // Cells
      visuals.forEach((_, vi) => {
        const cx = gridLeft + vi * cellW;
        const isOn = matrix[pi][vi];
        // Cell bg
        ctx.fillStyle = 'rgba(11,14,18,0.6)';
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.fillRect(cx + 3, ry + 3, cellW - 6, cellH - 6);
        ctx.strokeRect(cx + 3, ry + 3, cellW - 6, cellH - 6);

        if (isOn) {
          // Filled dot — teal if active preset, dim white otherwise
          const activeProgress = isActive ? Math.min(1, localF / 20) : 1;
          const color = isActive ? TEAL : 'rgba(38,166,154,0.35)';
          ctx.fillStyle = color;
          const radius = isActive ? 5 + Math.sin(localF * 0.5) * 0.5 : 4;
          ctx.globalAlpha = activeProgress;
          ctx.beginPath();
          ctx.arc(cx + cellW / 2, ry + cellH / 2, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three visuals per preset. You can replicate any preset manually — just flip the right toggles.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: Ribbon Divergence
// Shows the split-view phenomenon: price makes fresh highs (top pane)
// while the Cipher Ribbon's internal expansion weakens (bottom pane).
// Amber diamond (◆) appears at the first bar of divergence. Teaches:
// "DIVERGING" in the Command Center's Ribbon row comes from here.
// Unique to CIPHER PRO — the retail version can't see this.
// ============================================================
function RibbonDivergenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RIBBON DIVERGENCE — PRICE CLIMBING, ENGINE WEAKENING', w / 2, 16);

    // Split layout: top = price (higher highs), bottom = ribbon expansion (fading)
    const padL = 30;
    const padR = 20;
    const chartW = w - padL - padR;
    const topY = 32;
    const topH = (h - 48) * 0.55;
    const botY = topY + topH + 12;
    const botH = (h - 48) * 0.45 - 12;

    // Pane labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL, topY - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('RIBBON EXPANSION (internal health)', padL, botY - 4);

    // Pane backgrounds
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, topY, chartW, topH);
    ctx.strokeRect(padL, topY, chartW, topH);
    ctx.fillRect(padL, botY, chartW, botH);
    ctx.strokeRect(padL, botY, chartW, botH);

    // Number of bars and animation cycle
    const bars = 40;
    const barW = chartW / bars;
    const cycle = (t * 0.08) % 1;
    const revealCount = Math.floor(cycle * (bars + 8));

    // Price series: three rising peaks (HH HH HH) — bull pattern
    const priceAt = (i: number) => {
      // Base uptrend + 3 swing peaks at ~i=10, i=22, i=34
      const base = (i / bars) * 0.6;
      const swing = Math.sin(i * 0.32) * 0.15;
      const bump = 0.05 * (Math.exp(-Math.pow((i - 10) / 4, 2)) + Math.exp(-Math.pow((i - 22) / 4, 2)) + Math.exp(-Math.pow((i - 34) / 4, 2)));
      return base + swing + bump;
    };

    // Ribbon expansion (internal): starts strong, fades — this is the point
    const expAt = (i: number) => {
      const peak1 = 0.85 * Math.exp(-Math.pow((i - 10) / 3, 2));
      const peak2 = 0.55 * Math.exp(-Math.pow((i - 22) / 3, 2));
      const peak3 = 0.22 * Math.exp(-Math.pow((i - 34) / 3, 2));
      return peak1 + peak2 + peak3;
    };

    // Draw price bars (teal candles, rising)
    ctx.lineWidth = 1;
    for (let i = 0; i < Math.min(bars, revealCount); i++) {
      const x = padL + i * barW;
      const prev = i === 0 ? priceAt(0) : priceAt(i - 1);
      const curr = priceAt(i);
      const yOpen = topY + topH - 6 - prev * (topH - 18);
      const yClose = topY + topH - 6 - curr * (topH - 18);
      const up = yClose <= yOpen;
      ctx.fillStyle = up ? TEAL : MAGENTA;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(x + 1, Math.min(yOpen, yClose), Math.max(1.5, barW - 2), Math.max(1, Math.abs(yClose - yOpen)));
      ctx.globalAlpha = 1;
    }

    // Mark the 3 price peaks with rising highs
    const peaks = [10, 22, 34];
    peaks.forEach((pi, idx) => {
      if (revealCount <= pi) return;
      const x = padL + pi * barW;
      const y = topY + topH - 6 - priceAt(pi) * (topH - 18);
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(x, y - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`HH${idx + 1}`, x, y - 12);
    });

    // Ribbon expansion histogram (bottom pane) — the key visual
    for (let i = 0; i < Math.min(bars, revealCount); i++) {
      const x = padL + i * barW;
      const eVal = expAt(i);
      const h2 = eVal * (botH - 10);
      // color by value: strong = teal, weak = amber
      const alpha = Math.max(0.25, eVal);
      ctx.fillStyle = eVal > 0.5 ? `rgba(38,166,154,${alpha})` : `rgba(255,179,0,${alpha})`;
      ctx.fillRect(x + 1, botY + botH - h2 - 4, Math.max(1.5, barW - 2), h2);
    }

    // Expansion trendline — dotted line connecting peaks to show decay
    if (revealCount >= 34) {
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      peaks.forEach((pi, idx) => {
        const x = padL + pi * barW;
        const eVal = expAt(pi);
        const y = botY + botH - eVal * (botH - 10) - 4;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Diamond marker + label at 3rd peak (when divergence confirms)
    if (revealCount > 34) {
      const x = padL + 34 * barW;
      const y = botY + botH - expAt(34) * (botH - 10) - 14;
      // amber diamond
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 5);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
      // flash ring
      const ringP = Math.min(1, (revealCount - 34) / 6);
      ctx.strokeStyle = `rgba(255,179,0,${(1 - ringP) * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 5 + ringP * 10, 0, Math.PI * 2);
      ctx.stroke();

      // Callout text
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('DIVERGING', padL + chartW - 6, botY + 14);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Price rises across 3 swing highs — but internal ribbon expansion fades. Command Center ▶ DIVERGING.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 6: Ribbon Projection
// 6-bar kinematic extrapolation — dotted line projecting where the
// Cipher Core is HEADED based on velocity + acceleration. Fades with
// distance. Teaches: this is NOT a price prediction, it's a projection
// of where the trend engine itself is going. When projection curves
// back toward Flow, flip is approaching (Command Center ▶ CURVING).
// ============================================================
function RibbonProjectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RIBBON PROJECTION — WHERE THE TREND ENGINE IS HEADED', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 30;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Chart frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Realtime bar count: the "live" ribbon is N bars, projection is +6
    const liveBars = 28;
    const projBars = 6;
    const totalBars = liveBars + projBars;
    const barW = chartW / totalBars;

    // Cycle — 4 phases of behavior to show:
    //   0.0-0.33 : strong uptrend, projection continues up
    //   0.33-0.66 : trend maturing, projection starts flattening
    //   0.66-1.00 : projection curves back toward Flow — CURVING mode
    const cycle = (t * 0.08) % 1;
    const curvePhase = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;
    const curveAmt = curvePhase === 0 ? 0 : curvePhase === 1 ? 0.4 : 0.9;

    // Live Flow + Core + Anchor lines (3-line ribbon)
    // Flow (middle) is gently rising, Core above, Anchor below
    const flowAt = (i: number) => {
      const norm = i / (totalBars - 1);
      const base = 0.35 + norm * 0.32;
      const wave = Math.sin(i * 0.35) * 0.03;
      return base + wave;
    };
    const coreAt = (i: number) => flowAt(i) + 0.06 + Math.sin(i * 0.4) * 0.01;
    const anchorAt = (i: number) => flowAt(i) - 0.06 - Math.sin(i * 0.4) * 0.01;

    // Live bars — smooth rising trend
    ctx.lineWidth = 2;
    ctx.strokeStyle = TEAL;
    ctx.beginPath();
    for (let i = 0; i < liveBars; i++) {
      const x = padL + i * barW;
      const y = padT + chartH - coreAt(i) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(38,166,154,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < liveBars; i++) {
      const x = padL + i * barW;
      const y = padT + chartH - flowAt(i) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(38,166,154,0.4)';
    ctx.beginPath();
    for (let i = 0; i < liveBars; i++) {
      const x = padL + i * barW;
      const y = padT + chartH - anchorAt(i) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Ribbon fill
    ctx.fillStyle = 'rgba(38,166,154,0.12)';
    ctx.beginPath();
    for (let i = 0; i < liveBars; i++) {
      const x = padL + i * barW;
      const y = padT + chartH - coreAt(i) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = liveBars - 1; i >= 0; i--) {
      const x = padL + i * barW;
      const y = padT + chartH - anchorAt(i) * chartH;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Vertical "NOW" divider
    const nowX = padL + (liveBars - 1) * barW;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX, padT);
    ctx.lineTo(nowX, padT + chartH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', nowX, padT + chartH + 12);

    // PROJECTION — 6 dotted bars into the future
    // Compute current velocity (slope between last two live bars)
    const last = liveBars - 1;
    const velocity = coreAt(last) - coreAt(last - 1);
    const projAccel = -velocity * curveAmt; // negative accel = curving back

    for (let j = 1; j <= projBars; j++) {
      const i = last + j;
      const x = padL + i * barW;
      // kinematic: last + v*j + 0.5*a*j^2
      const yNorm = coreAt(last) + velocity * j + 0.5 * projAccel * j * j;
      const y = padT + chartH - yNorm * chartH;

      // dotted segment fading with distance
      const alpha = (1 - (j - 1) / projBars) * 0.85;
      const isAmber = curvePhase === 2;
      const r = isAmber ? 255 : 38;
      const g = isAmber ? 179 : 166;
      const b = isAmber ? 0 : 154;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Connecting thin line from previous projected point
      if (j > 1) {
        const prevI = last + j - 1;
        const prevX = padL + prevI * barW;
        const prevYNorm = coreAt(last) + velocity * (j - 1) + 0.5 * projAccel * (j - 1) * (j - 1);
        const prevY = padT + chartH - prevYNorm * chartH;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // State badge (top right)
    const badgeX = padL + chartW - 70;
    const badgeY = padT + 6;
    const badgeColor = curvePhase === 2 ? AMBER : curvePhase === 1 ? 'rgba(255,255,255,0.6)' : TEAL;
    const badgeLabel = curvePhase === 2 ? 'CURVING' : curvePhase === 1 ? 'MATURING' : 'EXPANDING';
    ctx.fillStyle = 'rgba(11,14,18,0.85)';
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 1;
    ctx.fillRect(badgeX, badgeY, 64, 16);
    ctx.strokeRect(badgeX, badgeY, 64, 16);
    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(badgeLabel, badgeX + 32, badgeY + 11);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Dotted line = where the trend engine is heading, not where price will go. Curves back ▶ flip approaching.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: Risk Envelope Zones
// Animates price walking through 4 zones: SAFE · WATCH · CAUTION · DANGER.
// Each zone is a horizontal band; the envelope widens and darkens as risk
// escalates. Magenta ✕ marker drops at the moment of transition into a
// higher-risk zone. Teaches: the zones are concentric, the ✕ fires on
// first-bar escalation only (not re-entries).
// ============================================================
function RiskEnvelopeZonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RISK ENVELOPE ZONES — CONCENTRIC BANDS OF ESCALATING RISK', w / 2, 16);

    const padL = 40;
    const padR = 20;
    const padT = 28;
    const padB = 20;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Fair Value line sits at middle
    const fvY = padT + chartH / 2;

    // Zone widths: SAFE (0-0.5 ATR), WATCH (0.5-1.0), CAUTION (1.0-1.5), DANGER (1.5+)
    const zoneHeight = chartH / 2;
    const bandH = zoneHeight / 4;

    const zones = [
      { label: 'SAFE', color: 'rgba(38,166,154,0.15)', strokeCol: 'rgba(38,166,154,0.8)' },
      { label: 'WATCH', color: 'rgba(255,255,255,0.06)', strokeCol: 'rgba(255,255,255,0.6)' },
      { label: 'CAUTION', color: 'rgba(255,179,0,0.12)', strokeCol: 'rgba(255,179,0,0.85)' },
      { label: 'DANGER', color: 'rgba(239,83,80,0.14)', strokeCol: 'rgba(239,83,80,0.85)' },
    ];
    zones.forEach((z, zi) => {
      const upperY = fvY - (zi + 1) * bandH;
      const lowerY = fvY + zi * bandH;
      ctx.fillStyle = z.color;
      ctx.fillRect(padL, upperY, chartW, bandH);
      ctx.fillRect(padL, lowerY, chartW, bandH);
    });

    // Zone labels (right side)
    zones.forEach((z, zi) => {
      const upperY = fvY - (zi + 1) * bandH + bandH / 2;
      ctx.fillStyle = z.strokeCol;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(z.label, padL + chartW - 6, upperY + 3);
    });

    // Fair Value dotted line
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, fvY);
    ctx.lineTo(padL + chartW, fvY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Fair Value', padL + 4, fvY - 4);

    // Price walk — climbs through zones, pulls back
    const bars = 60;
    const barW = chartW / bars;
    const cycle = (t * 0.07) % 1;
    const showUpTo = Math.floor(cycle * (bars + 10));

    const priceAt = (i: number) => {
      const norm = i / bars;
      const shape = norm < 0.7 ? norm * 1.4 : 0.98 - (norm - 0.7) * 0.8;
      return Math.max(-1, Math.min(1, shape * 1.8 - 0.1));
    };

    // Price line
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < Math.min(bars, showUpTo); i++) {
      const x = padL + i * barW;
      const pv = priceAt(i);
      const y = fvY - pv * zoneHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Zone-of-price
    const zoneOf = (pv: number) => {
      const a = Math.abs(pv);
      if (a < 0.25) return 0;
      if (a < 0.5) return 1;
      if (a < 0.75) return 2;
      return 3;
    };

    // Find transition bars
    const transitions: { bar: number; toZ: number }[] = [];
    for (let i = 1; i < bars; i++) {
      const prevZ = zoneOf(priceAt(i - 1));
      const currZ = zoneOf(priceAt(i));
      if (currZ > prevZ) transitions.push({ bar: i, toZ: currZ });
    }

    // Plot ✕ markers
    transitions.forEach((tr) => {
      if (tr.bar > showUpTo) return;
      const x = padL + tr.bar * barW;
      const pv = priceAt(tr.bar);
      const y = fvY - pv * zoneHeight;
      // amber when entering CAUTION, magenta when entering DANGER
      const cross = tr.toZ === 3 ? MAGENTA : tr.toZ === 2 ? AMBER : 'rgba(255,255,255,0.5)';
      ctx.strokeStyle = cross;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.moveTo(x + 4, y - 4);
      ctx.lineTo(x - 4, y + 4);
      ctx.stroke();
      const age = showUpTo - tr.bar;
      if (age < 6) {
        const rp = age / 6;
        ctx.strokeStyle = cross.replace(/rgba?\(([^)]+),?\s*1?\)?$/, '').length
          ? cross.replace(',1)', `,${(1 - rp) * 0.6})`)
          : cross;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 5 + rp * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Current dot
    if (showUpTo > 0 && showUpTo <= bars) {
      const i = Math.min(bars - 1, showUpTo - 1);
      const x = padL + i * barW;
      const pv = priceAt(i);
      const y = fvY - pv * zoneHeight;
      const zIdx = zoneOf(pv);
      const zColor = [TEAL, 'rgba(255,255,255,0.7)', AMBER, MAGENTA][zIdx];
      ctx.fillStyle = zColor;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('✕ markers fire only on first-bar escalation. Re-entries into the same zone do not re-trigger.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 8: Fair Value Gravity
// The Fair Value line acts as a gravitational anchor — all Risk
// Envelope bands reference it. Shows price stretching away, then
// being "pulled back" toward the FV line via a magnet-like arrow.
// Teaches: the Mean Reversion Score in the panel measures distance
// from THIS line. Cannot turn off FV and expect MR to work — it
// depends on Risk Envelope being ON.
// ============================================================
function FairValueGravityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FAIR VALUE GRAVITY — WHAT PRICE REVERTS TO', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 34;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    const fvY = padT + chartH / 2;
    const bars = 50;
    const barW = chartW / bars;
    const cycle = (t * 0.06) % 1;
    const showUpTo = Math.floor(cycle * bars);

    // Price: oscillating, decaying (mean-reversion illustrated)
    const priceAt = (i: number) => {
      const norm = i / bars;
      const amp = 0.5;
      const phase = norm * Math.PI * 1.5;
      const decay = Math.exp(-norm * 0.3);
      return Math.sin(phase) * amp * decay;
    };

    // Draw Risk Envelope bands (tinted, narrow)
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const w2 = Math.max(1.2, barW - 0.6);
      ctx.fillStyle = 'rgba(38,166,154,0.04)';
      ctx.fillRect(x, fvY - chartH * 0.25, w2, chartH * 0.5);
      ctx.fillStyle = 'rgba(255,179,0,0.04)';
      ctx.fillRect(x, fvY - chartH * 0.40, w2, chartH * 0.15);
      ctx.fillRect(x, fvY + chartH * 0.25, w2, chartH * 0.15);
      ctx.fillStyle = 'rgba(239,83,80,0.04)';
      ctx.fillRect(x, fvY - chartH * 0.48, w2, chartH * 0.08);
      ctx.fillRect(x, fvY + chartH * 0.40, w2, chartH * 0.08);
    }

    // FV dotted line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, fvY);
    ctx.lineTo(padL + chartW, fvY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('FAIR VALUE · EMA(HL2, 20)', padL + 6, fvY - 6);

    // Price line
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < Math.min(bars, showUpTo); i++) {
      const x = padL + i * barW;
      const pv = priceAt(i);
      const y = fvY - pv * chartH * 0.9;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current price dot + gravity arrow
    if (showUpTo > 0 && showUpTo <= bars) {
      const i = Math.min(bars - 1, showUpTo - 1);
      const x = padL + i * barW;
      const pv = priceAt(i);
      const y = fvY - pv * chartH * 0.9;
      ctx.fillStyle = Math.abs(pv) > 0.3 ? AMBER : TEAL;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      if (Math.abs(pv) > 0.28) {
        const arrowStart = y;
        const arrowEnd = fvY;
        const dir = arrowEnd > arrowStart ? 1 : -1;
        const pulse = (f * 0.08) % 1;
        const arrowX = x + 12;
        ctx.strokeStyle = `rgba(255,179,0,${0.35 + pulse * 0.4})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowStart);
        ctx.lineTo(arrowX, arrowEnd);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.moveTo(arrowX - 4, arrowEnd - dir * 5);
        ctx.lineTo(arrowX + 4, arrowEnd - dir * 5);
        ctx.lineTo(arrowX, arrowEnd);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = AMBER;
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('GRAVITY', arrowX + 8, (arrowStart + arrowEnd) / 2);
      }
    }

    // MR Score readout (top right)
    if (showUpTo > 0 && showUpTo <= bars) {
      const pv = priceAt(Math.min(bars - 1, showUpTo - 1));
      const mrColor = Math.abs(pv) > 0.3 ? AMBER : TEAL;
      ctx.fillStyle = 'rgba(11,14,18,0.85)';
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.fillRect(padL + chartW - 100, padT + 6, 94, 26);
      ctx.strokeRect(padL + chartW - 100, padT + 6, 94, 26);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('MEAN REV SCORE', padL + chartW - 94, padT + 16);
      ctx.fillStyle = mrColor;
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${(Math.abs(pv) * 3.2).toFixed(2)}σ`, padL + chartW - 10, padT + 28);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Mean Reversion Score measures distance from Fair Value in ATR units. Requires Risk Envelope ON.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: Structure Zone Lifecycle
// Animates one S/R zone through its full lifecycle:
//   BIRTH (pivot detected) → ACTIVE (glowing band) → TEST #1-4 → REMOVED
// Teaches: max tests setting (default 4) controls the pruning. Pivot
// length determines how many zones get born. Max Age prevents ancient
// zones from cluttering the chart. "NOT order blocks" distinction.
// ============================================================
function StructureLifecycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STRUCTURE ZONE LIFECYCLE — BIRTH · TEST · CONSUMED', w / 2, 16);

    const padL = 30;
    const padR = 100; // room for stage panel on the right
    const padT = 30;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // The zone sits at ~38% height (resistance band)
    const zoneY = padT + chartH * 0.38;
    const zoneH = 14;

    // Cycle stages
    const cycle = (t * 0.05) % 1;
    let stage = 0;
    let testCount = 0;
    if (cycle < 0.08) stage = 0; // BIRTH
    else if (cycle < 0.22) { stage = 1; testCount = 0; }
    else if (cycle < 0.38) { stage = 2; testCount = 1; }
    else if (cycle < 0.54) { stage = 2; testCount = 2; }
    else if (cycle < 0.70) { stage = 2; testCount = 3; }
    else if (cycle < 0.85) { stage = 2; testCount = 4; }
    else stage = 3; // REMOVED

    const bars = 50;
    const barW = chartW / bars;
    const testBars = [12, 22, 32, 42];
    const shownTestBars = testBars.slice(0, testCount);

    // Build price points
    const pricePoints: { x: number; y: number }[] = [];
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const nearZone = shownTestBars.some((tb) => Math.abs(tb - i) < 3);
      const base = chartH * 0.6 + Math.sin(i * 0.3) * 12;
      let y = padT + base;
      if (nearZone) {
        const dist = Math.min(...shownTestBars.map((tb) => Math.abs(tb - i)));
        const pull = (3 - dist) / 3;
        y = y * (1 - pull) + zoneY * pull;
      }
      pricePoints.push({ x, y });
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    pricePoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Zone band
    if (stage > 0) {
      const zoneAlpha = stage === 3 ? 0.1 : 0.2 + 0.05 * testCount;
      const zoneStroke = stage === 3 ? 'rgba(255,255,255,0.2)' : MAGENTA;
      ctx.fillStyle = `rgba(239,83,80,${zoneAlpha})`;
      ctx.fillRect(padL, zoneY - zoneH / 2, chartW, zoneH);
      ctx.strokeStyle = zoneStroke;
      ctx.lineWidth = 1;
      ctx.setLineDash(stage === 3 ? [3, 3] : []);
      ctx.strokeRect(padL, zoneY - zoneH / 2, chartW, zoneH);
      ctx.setLineDash([]);
    }

    // Test markers
    for (let ti = 0; ti < testCount; ti++) {
      const tb = testBars[ti];
      const x = padL + tb * barW;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 3, zoneY - 3);
      ctx.lineTo(x + 3, zoneY + 3);
      ctx.moveTo(x + 3, zoneY - 3);
      ctx.lineTo(x - 3, zoneY + 3);
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`T${ti + 1}`, x, zoneY - 8);
    }

    // Birth marker
    if (stage >= 1) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(padL + 4, zoneY, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // REMOVED stamp
    if (stage === 3) {
      ctx.save();
      ctx.translate(padL + chartW / 2, zoneY);
      ctx.rotate(-0.08);
      ctx.fillStyle = 'rgba(136,136,136,0.7)';
      ctx.strokeStyle = 'rgba(136,136,136,0.8)';
      ctx.lineWidth = 1.5;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CONSUMED', 0, 6);
      ctx.beginPath();
      ctx.rect(-50, -12, 100, 22);
      ctx.stroke();
      ctx.restore();
    }

    // Stage panel (right side)
    const panelX = padL + chartW + 12;
    const panelY = padT + 4;
    const panelW = w - panelX - 8;
    const panelH = chartH;
    ctx.fillStyle = 'rgba(20,24,32,0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('LIFECYCLE', panelX + 8, panelY + 14);

    const stages = ['BIRTH', 'ACTIVE', `TESTED ×${testCount}`, 'CONSUMED'];
    const stageColors = [TEAL, 'rgba(255,255,255,0.8)', AMBER, 'rgba(136,136,136,0.8)'];
    const stagesTop = panelY + 28;
    const stageH = (panelH - 36) / 4;
    stages.forEach((s, si) => {
      const sy = stagesTop + si * stageH;
      const isActive = si === stage;
      if (isActive) {
        ctx.fillStyle = `rgba(255,179,0,${0.1 + Math.sin(t * 5) * 0.03})`;
        ctx.fillRect(panelX + 4, sy - 2, panelW - 8, stageH - 4);
      }
      ctx.fillStyle = si <= stage ? stageColors[si] : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(panelX + 14, sy + stageH / 2 - 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = si === stage ? AMBER : si < stage ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)';
      ctx.font = si === stage ? 'bold 9px system-ui' : '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s, panelX + 24, sy + stageH / 2 + 2);
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Default: remove after 4 tests · max age 200 bars. NOT order blocks — those live in PHANTOM.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 10: Spine Breathing Bands
// Animated range-midpoint line (the Spine) with health-adaptive bands.
// Cycles through 3 states: HEALTHY (tight bands hugging the Spine, vivid
// teal), MATURING (widening, desaturating), DYING (bands wide and chaotic
// with Spine drifting away from price). Teaches: band width = confidence,
// Spine drift from price = the warning gap.
// ============================================================
function SpineBreathingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SPINE BREATHING BANDS — CONFIDENCE IS VISIBLE', w / 2, 16);

    const padL = 30;
    const padR = 120; // room for health meter panel
    const padT = 32;
    const padB = 26;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Chart frame
    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Cycle — 3 health states
    const cycle = (t * 0.05) % 1;
    const healthPhase = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;
    // Smooth blend within each phase
    const phaseLocal = healthPhase === 0 ? cycle / 0.33 : healthPhase === 1 ? (cycle - 0.33) / 0.33 : (cycle - 0.66) / 0.34;

    // Health score 0-1: healthy=~0.85, maturing=~0.55, dying=~0.2
    const healthTargets = [0.85, 0.55, 0.2];
    const health = healthTargets[healthPhase];

    // Band width scales inverse to health (tight when healthy, wide when dying)
    // Price: always rising trend; Spine lags and drifts away as health drops
    const bars = 50;
    const barW = chartW / bars;

    // Use a continuous parametrization so the animation flows instead of "jumping" between states
    const priceAt = (i: number) => {
      const norm = i / bars;
      const base = 0.3 + norm * 0.4;
      const wave = Math.sin(i * 0.4) * 0.04;
      return base + wave;
    };

    // Spine: starts on price, drifts downward (in chart coords = away from rising price) as health drops
    const spineDrift = (1 - health) * 0.18;
    const spineAt = (i: number) => priceAt(i) - spineDrift * (i / bars);

    // Band half-width (fraction of chart height)
    const bandHW = 0.04 + (1 - health) * 0.12;

    // Draw bands (fill)
    const healthColor = health > 0.7 ? TEAL : health > 0.4 ? AMBER : MAGENTA;
    const healthRGB = health > 0.7 ? [38, 166, 154] : health > 0.4 ? [255, 179, 0] : [239, 83, 80];
    const [hr, hg, hb] = healthRGB;

    // Upper band fill
    ctx.fillStyle = `rgba(${hr},${hg},${hb},${0.08 + health * 0.08})`;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const sp = spineAt(i);
      const y = padT + chartH - sp * chartH;
      const yUp = y - bandHW * chartH;
      if (i === 0) ctx.moveTo(x, yUp);
      else ctx.lineTo(x, yUp);
    }
    for (let i = bars - 1; i >= 0; i--) {
      const x = padL + i * barW;
      const sp = spineAt(i);
      const y = padT + chartH - sp * chartH;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Lower band fill
    ctx.fillStyle = `rgba(${hr},${hg},${hb},${0.08 + health * 0.08})`;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const sp = spineAt(i);
      const y = padT + chartH - sp * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = bars - 1; i >= 0; i--) {
      const x = padL + i * barW;
      const sp = spineAt(i);
      const y = padT + chartH - sp * chartH;
      const yDn = y + bandHW * chartH;
      ctx.lineTo(x, yDn);
    }
    ctx.closePath();
    ctx.fill();

    // Spine line itself
    ctx.strokeStyle = `rgba(${hr},${hg},${hb},${0.5 + health * 0.5})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const sp = spineAt(i);
      const y = padT + chartH - sp * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Price line (always teal + prominent)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < bars; i++) {
      const x = padL + i * barW;
      const pv = priceAt(i);
      const y = padT + chartH - pv * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // "Gap" warning — draw a vertical brace between price and Spine on the last bar when dying
    if (health < 0.5) {
      const lastI = bars - 1;
      const x = padL + lastI * barW;
      const py = padT + chartH - priceAt(lastI) * chartH;
      const sy = padT + chartH - spineAt(lastI) * chartH;
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x + 8, py);
      ctx.lineTo(x + 8, sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('GAP', x + 12, (py + sy) / 2 + 3);
    }

    // Health meter panel (right)
    const panelX = padL + chartW + 14;
    const panelY = padT + 4;
    const panelW = w - panelX - 8;
    const panelH = chartH;
    ctx.fillStyle = 'rgba(20,24,32,0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 6);
    else ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // Health label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('HEALTH', panelX + 8, panelY + 14);

    // Health bar (vertical gauge)
    const gaugeX = panelX + 12;
    const gaugeY = panelY + 24;
    const gaugeW = 14;
    const gaugeH = panelH - 70;
    ctx.fillStyle = 'rgba(11,14,18,0.8)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
    ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);
    // fill
    const fillH = gaugeH * health;
    ctx.fillStyle = healthColor;
    ctx.fillRect(gaugeX + 1, gaugeY + gaugeH - fillH + 1, gaugeW - 2, fillH - 2);

    // State label
    const stateLabels = ['HEALTHY', 'MATURING', 'DYING'];
    const stateColors = [TEAL, AMBER, MAGENTA];
    ctx.fillStyle = stateColors[healthPhase];
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stateLabels[healthPhase], panelX + panelW / 2, panelY + panelH - 20);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText(`${Math.round(health * 100)}%`, panelX + panelW / 2, panelY + panelH - 6);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Tight bands = confident. Wide bands = chaotic. Spine drifting away from price = the warning.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 11: Imbalance (FVG) Shrink
// Shows a bullish Fair Value Gap box that shrinks as price fills into it.
// Dotted midline at 50% equilibrium. Starts as full box, shrinks to half,
// then auto-deletes when fully consumed. Teaches: FVGs are magnets that
// shrink in real time — only the remaining unfilled portion is shown.
// Expired FVGs (100+ bars old) auto-expire even if not filled.
// ============================================================
function ImbalanceShrinkAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('IMBALANCE BOXES SHRINK AS PRICE FILLS — ONLY THE REMAINING MAGNET SHOWS', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 30;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // The FVG box: top edge at ~40% height, bottom edge at ~60% height
    // (a bullish gap that forms below price, then price returns to fill it)
    const gapTop = padT + chartH * 0.40;
    const gapBot = padT + chartH * 0.68;
    const gapFullH = gapBot - gapTop;

    // Cycle through 4 stages:
    // 0.0-0.15: gap just formed (no fill)
    // 0.15-0.45: price returns partially (20%, 40% fill)
    // 0.45-0.65: price fills deep into gap (70% fill)
    // 0.65-0.85: fully filled
    // 0.85-1.0: auto-deleted (faded out)
    const cycle = (t * 0.06) % 1;
    let fillPct = 0;
    let deleted = false;
    if (cycle < 0.15) fillPct = 0;
    else if (cycle < 0.45) fillPct = ((cycle - 0.15) / 0.30) * 0.5;
    else if (cycle < 0.65) fillPct = 0.5 + ((cycle - 0.45) / 0.20) * 0.4;
    else if (cycle < 0.85) fillPct = 0.9 + ((cycle - 0.65) / 0.20) * 0.1;
    else { fillPct = 1.0; deleted = true; }
    fillPct = Math.min(1, fillPct);

    // Where the gap formed on the chart (pivot bar)
    const formBarX = padL + chartW * 0.25;
    const gapRight = padL + chartW * 0.92;

    // Price path: forms a wick up (creates gap), pulls back down into gap, then rises
    const bars = 60;
    const barW = chartW / bars;
    const formBar = 15; // bar index where gap forms
    const priceSeries: number[] = [];
    for (let i = 0; i < bars; i++) {
      let y;
      if (i < formBar) {
        // Approach from below, spike up (forms gap)
        const p = i / formBar;
        y = padT + chartH * 0.82 - p * chartH * 0.45;
      } else if (i < formBar + 8) {
        // Continue up briefly
        const p = (i - formBar) / 8;
        y = padT + chartH * 0.37 - p * chartH * 0.08;
      } else {
        // Return down into the gap
        const p = Math.min(1, (i - (formBar + 8)) / 25);
        const targetDepth = gapTop + gapFullH * fillPct;
        y = padT + chartH * 0.29 + p * (targetDepth - padT - chartH * 0.29);
      }
      priceSeries.push(y);
    }

    // Shrinking gap box — top stays, bottom rises with fill
    if (!deleted) {
      const remainTop = gapTop + gapFullH * fillPct;
      const remainBot = gapBot;
      // Fill
      ctx.fillStyle = 'rgba(38,166,154,0.15)';
      ctx.fillRect(formBarX, remainTop, gapRight - formBarX, remainBot - remainTop);
      // Stroke
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1;
      ctx.strokeRect(formBarX, remainTop, gapRight - formBarX, remainBot - remainTop);

      // Dotted midline at 50% of ORIGINAL gap (the equilibrium)
      const midY = (gapTop + gapBot) / 2;
      if (midY >= remainTop && midY <= remainBot) {
        ctx.strokeStyle = 'rgba(38,166,154,0.6)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(formBarX, midY);
        ctx.lineTo(gapRight, midY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Auto-delete fade
      const deleteP = (cycle - 0.85) / 0.15;
      ctx.fillStyle = `rgba(38,166,154,${0.15 * (1 - deleteP)})`;
      ctx.fillRect(formBarX, gapTop, gapRight - formBarX, gapFullH);
      ctx.strokeStyle = `rgba(38,166,154,${0.8 * (1 - deleteP)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.strokeRect(formBarX, gapTop, gapRight - formBarX, gapFullH);
      ctx.setLineDash([]);
    }

    // Fill % badge
    if (!deleted) {
      const badgeColor = fillPct < 0.3 ? TEAL : fillPct < 0.7 ? AMBER : MAGENTA;
      ctx.fillStyle = 'rgba(11,14,18,0.9)';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1;
      ctx.fillRect(gapRight + 8, gapTop, 68, 22);
      ctx.strokeRect(gapRight + 8, gapTop, 68, 22);
      ctx.fillStyle = badgeColor;
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(fillPct * 100)}% FILL`, gapRight + 42, gapTop + 15);
    } else {
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('AUTO-DELETED', gapRight + 8, gapTop + 14);
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    priceSeries.forEach((y, i) => {
      const x = padL + i * barW;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Gaps shrink from the top down. Full fill = auto-delete. Size-filtered (>0.3 ATR) · 100-bar expiry.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 12: Sweep Detection
// A liquidity sweep: price wicks beyond the prior swing high (grabbing
// stops above), then closes BACK INSIDE the range. A diamond (◆) marker
// drops at the swept level. A 3-bar "Sweep context" window highlights
// that any signal firing within 3 bars gets tagged "Sweep" — highest-
// probability reversal setup in CIPHER.
// ============================================================
function SweepDetectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SWEEP DETECTION — STOPS GRABBED, THEN CLOSE BACK INSIDE', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 30;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Prior swing high — horizontal dashed line at ~30% down from top
    const swingHighY = padT + chartH * 0.30;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padL + 10, swingHighY);
    ctx.lineTo(padL + chartW - 10, swingHighY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRIOR SWING HIGH', padL + 12, swingHighY - 4);

    // Candlestick series — 22 candles, the 14th is the sweep candle
    const totalCandles = 22;
    const candleW = (chartW - 20) / totalCandles;
    const bodyW = Math.max(2, candleW * 0.65);
    const sweepIdx = 13;

    const cycle = (t * 0.07) % 1;
    const revealTo = Math.floor(cycle * (totalCandles + 6));

    // Build OHLC: priceline rises toward the swing high, sweeps it on the 14th candle, reverses
    const candles: { o: number; h: number; l: number; c: number }[] = [];
    for (let i = 0; i < totalCandles; i++) {
      const base = padT + chartH * 0.75 - (i / totalCandles) * chartH * 0.35;
      const bodySize = 6 + Math.sin(i * 0.8) * 3;
      let o = base - bodySize / 2;
      let c = base + bodySize / 2;
      let high = Math.min(o, c) - 3 - Math.abs(Math.sin(i * 1.1)) * 2;
      let low = Math.max(o, c) + 3 + Math.abs(Math.cos(i * 1.3)) * 2;
      if (i === sweepIdx) {
        // The sweep candle: wick WAY above swingHighY, but body closes back below
        high = swingHighY - 6; // big wick up past swing high
        low = swingHighY + 10;
        o = swingHighY + 2;
        c = swingHighY + 6; // closes below swing high (back inside)
      } else if (i > sweepIdx) {
        // Reverse after sweep
        const p = (i - sweepIdx) / (totalCandles - sweepIdx);
        const basePost = swingHighY + 12 + p * chartH * 0.22;
        o = basePost - 4;
        c = basePost + 4;
        high = Math.min(o, c) - 3;
        low = Math.max(o, c) + 3;
      }
      candles.push({ o, h: high, l: low, c });
    }

    // Draw candles up to revealTo
    for (let i = 0; i < Math.min(totalCandles, revealTo); i++) {
      const x = padL + 10 + i * candleW + candleW / 2;
      const cd = candles[i];
      const isBull = cd.c < cd.o; // in screen coords lower-y = higher price
      const color = isBull ? TEAL : MAGENTA;
      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, cd.h);
      ctx.lineTo(x, cd.l);
      ctx.stroke();
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyW / 2, Math.min(cd.o, cd.c), bodyW, Math.abs(cd.c - cd.o));
    }

    // Sweep diamond + annotation (once the sweep candle has rendered)
    if (revealTo > sweepIdx) {
      const x = padL + 10 + sweepIdx * candleW + candleW / 2;
      const y = swingHighY;
      const age = revealTo - sweepIdx;

      // Diamond marker AT swing high level
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 6, y);
      ctx.lineTo(x, y + 6);
      ctx.lineTo(x - 6, y);
      ctx.closePath();
      ctx.fill();

      // Flash ring fading
      if (age < 8) {
        const rp = age / 8;
        ctx.strokeStyle = `rgba(255,179,0,${(1 - rp) * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 6 + rp * 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3-bar sweep-context window — amber tinted box over 3 candles right after sweep
      if (age >= 1) {
        const ctxStart = padL + 10 + (sweepIdx + 1) * candleW;
        const ctxEnd = padL + 10 + (sweepIdx + 4) * candleW;
        ctx.fillStyle = 'rgba(255,179,0,0.08)';
        ctx.fillRect(ctxStart, padT + 4, ctxEnd - ctxStart, chartH - 8);
        ctx.strokeStyle = 'rgba(255,179,0,0.4)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 3]);
        ctx.strokeRect(ctxStart, padT + 4, ctxEnd - ctxStart, chartH - 8);
        ctx.setLineDash([]);
        ctx.fillStyle = AMBER;
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('SWEEP CONTEXT · 3 BARS', (ctxStart + ctxEnd) / 2, padT + 14);
      }
    }

    // Callout
    if (revealTo > sweepIdx + 3) {
      const x = padL + chartW - 110;
      const y = padT + 40;
      ctx.fillStyle = 'rgba(11,14,18,0.85)';
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, 100, 34);
      ctx.strokeRect(x, y, 100, 34);
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SWEEP DETECTED', x + 50, y + 13);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '8px system-ui';
      ctx.fillText('Wick above · close below', x + 50, y + 26);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Any signal firing within 3 bars of a sweep = "Sweep" context tag. Highest-probability reversal in CIPHER.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 13: Coil Compression
// Bollinger Bands + Keltner Channel converging through 3 squeeze stages:
// BUILDING (faint thin lines, early compression), COILING (medium lines,
// energy building), BREAKOUT READY (thick bright lines, about to fire).
// When stage 4 triggers, a diamond (◆) marks the breakout direction.
// Teaches: the amber compression zone darkens/brightens with state.
// ============================================================
function CoilCompressionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COIL COMPRESSION — BUILDING · COILING · BREAKOUT READY · FIRE', w / 2, 16);

    const padL = 30;
    const padR = 20;
    const padT = 30;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.fillStyle = 'rgba(11,14,18,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeRect(padL, padT, chartW, chartH);

    const bars = 50;
    const barW = chartW / bars;

    // 4 stages — BUILDING, COILING, BREAKOUT READY, FIRE (with release)
    const cycle = (t * 0.05) % 1;
    let stage = 0;
    if (cycle < 0.25) stage = 0;
    else if (cycle < 0.50) stage = 1;
    else if (cycle < 0.75) stage = 2;
    else stage = 3;

    // Midline around price
    const midY = padT + chartH * 0.55;

    // Band width starts wide, compresses to thin by stage 3, then explodes on stage 3 breakout
    const widthByStage = [chartH * 0.30, chartH * 0.18, chartH * 0.09, chartH * 0.30];
    const bandWidth = widthByStage[stage];
    const brightness = [0.15, 0.35, 0.65, 0.9][stage];

    // Price path: tight oscillation during build, sharp breakout on stage 3
    const priceYs: number[] = [];
    for (let i = 0; i < bars; i++) {
      const norm = i / bars;
      if (stage === 3 && norm > 0.75) {
        // Breakout shoot-up in stage 3
        const p = (norm - 0.75) / 0.25;
        priceYs.push(midY - p * chartH * 0.35 + Math.sin(i * 0.4) * 3);
      } else {
        // Tight oscillation inside the coil
        const oscillAmp = bandWidth * 0.35;
        priceYs.push(midY + Math.sin(i * 0.9 + t * 2) * oscillAmp);
      }
    }

    // Upper & lower bands (symmetric, converge as stage increases)
    const upperBand = midY - bandWidth;
    const lowerBand = midY + bandWidth;

    // Amber compression zone fill
    ctx.fillStyle = `rgba(255,179,0,${brightness * 0.15})`;
    ctx.fillRect(padL, upperBand, chartW, lowerBand - upperBand);

    // Upper band line
    ctx.strokeStyle = `rgba(255,179,0,${brightness})`;
    ctx.lineWidth = 0.5 + stage * 0.8;
    ctx.beginPath();
    ctx.moveTo(padL, upperBand);
    ctx.lineTo(padL + chartW, upperBand);
    ctx.stroke();

    // Lower band line
    ctx.beginPath();
    ctx.moveTo(padL, lowerBand);
    ctx.lineTo(padL + chartW, lowerBand);
    ctx.stroke();

    // Inner "Keltner" (narrower band, appears as it tightens)
    if (stage >= 1) {
      const keltnerUp = midY - bandWidth * 0.55;
      const keltnerDn = midY + bandWidth * 0.55;
      ctx.strokeStyle = `rgba(255,179,0,${brightness * 0.7})`;
      ctx.lineWidth = 0.4 + stage * 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padL, keltnerUp);
      ctx.lineTo(padL + chartW, keltnerUp);
      ctx.moveTo(padL, keltnerDn);
      ctx.lineTo(padL + chartW, keltnerDn);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Price line
    ctx.strokeStyle = stage === 3 ? TEAL : 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    priceYs.forEach((y, i) => {
      const x = padL + i * barW;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Stage indicator + energy bar (bottom left)
    const stageLabels = ['BUILDING', 'COILING', 'BREAKOUT READY', '◆ FIRE · UP'];
    const stageColors = ['rgba(255,255,255,0.5)', AMBER, AMBER, TEAL];
    ctx.fillStyle = 'rgba(11,14,18,0.85)';
    ctx.strokeStyle = stageColors[stage];
    ctx.lineWidth = 1;
    ctx.fillRect(padL + 8, padT + 8, 120, 30);
    ctx.strokeRect(padL + 8, padT + 8, 120, 30);
    ctx.fillStyle = stageColors[stage];
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(stageLabels[stage], padL + 14, padT + 22);
    // Energy bar
    const energyPct = [0.2, 0.5, 0.85, 1.0][stage];
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(padL + 14, padT + 28, 108, 4);
    ctx.fillStyle = stageColors[stage];
    ctx.fillRect(padL + 14, padT + 28, 108 * energyPct, 4);

    // Breakout diamond when stage 3
    if (stage === 3 && cycle > 0.8) {
      const breakoutX = padL + chartW * 0.80;
      const breakoutY = midY - chartH * 0.22;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(breakoutX, breakoutY - 7);
      ctx.lineTo(breakoutX + 7, breakoutY);
      ctx.lineTo(breakoutX, breakoutY + 7);
      ctx.lineTo(breakoutX - 7, breakoutY);
      ctx.closePath();
      ctx.fill();
      const rp = (cycle - 0.8) / 0.2;
      ctx.strokeStyle = `rgba(38,166,154,${(1 - rp) * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(breakoutX, breakoutY, 7 + rp * 16, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Lines thicken + brighten with compression. ◆ fires on release, marks breakout direction.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 14: Pulse ATR Factor (Tight vs Wide)
// Side-by-side comparison of two Pulse ATR Factor settings:
//   LEFT: 0.8× (tight) — more signals, tighter stops, more whipsaw
//   RIGHT: 1.3× (wide) — fewer signals, survives noise, wider stops
// Same price path, same Cipher Flow, different pulse distance. Shows
// how the signals FIRE at different points because the Pulse line is
// at different distances. Teaches: one slider value cascades into the
// whole signal distribution.
// ============================================================
function PulseATRFactorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PULSE ATR FACTOR — ONE SLIDER CHANGES THE ENTIRE SIGNAL DISTRIBUTION', w / 2, 16);

    const padT = 30;
    const padB = 26;
    const midGap = 10;
    const paneW = (w - 40 - midGap) / 2;
    const paneX1 = 20;
    const paneX2 = paneX1 + paneW + midGap;
    const paneH = h - padT - padB;

    // Same price path for both panes
    const bars = 60;
    const priceAt = (i: number) => {
      const norm = i / bars;
      const trend = 0.35 + norm * 0.25;
      const bigWave = Math.sin(norm * Math.PI * 2.5) * 0.08;
      const noise = Math.sin(i * 0.9) * 0.03 + Math.cos(i * 1.4) * 0.02;
      return trend + bigWave + noise;
    };

    // Cipher Flow (smoothed) — middle anchor
    const flowAt = (i: number) => {
      const norm = i / bars;
      return 0.38 + norm * 0.22;
    };

    const atrAt = (i: number) => 0.05 + Math.sin(i * 0.2) * 0.01;

    const drawPane = (x: number, factor: number, label: string, tightColor: boolean) => {
      // Pane background
      ctx.fillStyle = 'rgba(11,14,18,0.5)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.6;
      ctx.fillRect(x, padT, paneW, paneH);
      ctx.strokeRect(x, padT, paneW, paneH);

      // Pane title
      const titleColor = tightColor ? AMBER : TEAL;
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + paneW / 2, padT - 6);

      const barW = paneW / bars;

      // Draw price line
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const px = x + i * barW;
        const py = padT + paneH - priceAt(i) * paneH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Flow line (reference)
      ctx.strokeStyle = 'rgba(38,166,154,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const px = x + i * barW;
        const py = padT + paneH - flowAt(i) * paneH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Pulse line (below Flow by factor*ATR for long setups / above for short)
      // For simplicity show a single bullish Pulse line below Flow
      ctx.strokeStyle = tightColor ? AMBER : TEAL;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const px = x + i * barW;
        const pulseY = flowAt(i) - factor * atrAt(i);
        const py = padT + paneH - pulseY * paneH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Count Pulse crosses — a "cross" happens when price dips below Pulse then returns above
      const signals: number[] = [];
      let prevAbove = true;
      for (let i = 1; i < bars; i++) {
        const pv = priceAt(i);
        const pulseY = flowAt(i) - factor * atrAt(i);
        const above = pv > pulseY;
        if (!prevAbove && above) signals.push(i);
        prevAbove = above;
      }

      // Draw PX signal markers (teal circles with L label)
      signals.forEach((si) => {
        const px = x + si * barW;
        const py = padT + paneH - priceAt(si) * paneH;
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(px, py + 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('L', px, py + 12);
      });

      // Signal count badge (bottom of pane)
      ctx.fillStyle = 'rgba(11,14,18,0.85)';
      ctx.strokeStyle = titleColor;
      ctx.lineWidth = 1;
      ctx.fillRect(x + paneW - 70, padT + paneH - 22, 64, 16);
      ctx.strokeRect(x + paneW - 70, padT + paneH - 22, 64, 16);
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${signals.length} SIGNALS`, x + paneW - 38, padT + paneH - 11);

      // Factor readout (top corner)
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Pulse ATR Factor = ${factor.toFixed(1)}`, x + 6, padT + 12);
    };

    drawPane(paneX1, 0.8, 'TIGHT (0.8×)', true);
    drawPane(paneX2, 1.3, 'WIDE (1.3×)', false);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Tight = more signals, tighter stops, more whipsaw · Wide = fewer signals, survives noise, wider stops.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// CONFETTI COMPONENT — certificate celebration (matches 11.1 + 11.2)
// 120 pieces, brand colors, 4s duration, triggered once when cert reveals
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
        p.vy += 0.35; // gravity
        p.vx *= 0.99; // air drag
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
// GAME ROUNDS — 5 scenarios testing the "operator tunes" skill
// Each round asks the student to pick the correct downstream effect
// of a specific settings change. Tests the Silent Cascade doctrine.
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You open CIPHER for the first time on a fresh chart. The PRESET dropdown is set to "None". You turn ON Cipher Ribbon, Cipher Pulse, and Cipher Spine — three visuals. Then you change the PRESET dropdown from "None" to "Trend Trader". What happens to your three visuals?',
    prompt: 'What happens to the visuals you already turned on?',
    options: [
      {
        id: 'a',
        text: 'Nothing — your toggles override the preset.',
        correct: false,
        explain:
          'Wrong direction. Presets OVERRIDE your manual toggles, not the other way around. When a preset is active, your individual visual toggles are ignored until you switch back to None.',
      },
      {
        id: 'b',
        text: 'Preset forces its own 3-visual combination (Ribbon, Pulse, Trend candles). Your Spine is silently turned off.',
        correct: true,
        explain:
          'Correct. Trend Trader locks 3 visuals: Cipher Ribbon + Cipher Pulse + Trend candles. The preset override engine silently suppresses any other visual toggle — your Spine turns off without warning. This is exactly why the "Silent Cascade" is named silent.',
      },
      {
        id: 'c',
        text: 'You now have 6 visuals on — three from you plus three from the preset.',
        correct: false,
        explain:
          'Presets are not additive. They enforce a "max 3 visual layers" constraint by OVERRIDING your manual toggles, not stacking on top.',
      },
      {
        id: 'd',
        text: 'The chart errors out because you cannot have more than 3 visuals.',
        correct: false,
        explain:
          'Nothing errors — CIPHER silently resolves the conflict in favour of the preset. That silence is the danger.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You are scalping a 5-minute chart. You had Cipher Pulse ON with the default Pulse ATR Factor = 1.5. You tighten it to 0.8 because you want more entries. You check the Command Center 30 seconds later.',
    prompt: 'Besides more signal markers on the chart, what else changes?',
    options: [
      {
        id: 'a',
        text: 'Only the signal count changes. Everything else stays the same.',
        correct: false,
        explain:
          'This is the "Silent Cascade" fallacy. Pulse ATR Factor does not just gate signals — it affects the Pulse row action in the Command Center (CLOSE/VERY CLOSE/FLIPPED thresholds), the "Last Signal" row freshness (because the most recent signal is now different), and the tooltip SL distance (tighter pulse = tighter stops on Pulse-SL mode).',
      },
      {
        id: 'b',
        text: 'Only the Pulse row in the Command Center updates.',
        correct: false,
        explain:
          'Closer, but still underestimates the cascade. The Pulse row DOES change — but so does Last Signal (different most-recent signal), the Strong Signals Only filter hit rate, and tooltip SL distances.',
      },
      {
        id: 'c',
        text: 'Four things change: signal distribution, Pulse row action, Last Signal row, and tooltip SL distances (on Pulse SL mode).',
        correct: true,
        explain:
          'Correct. One slider, four downstream systems. This is the Silent Cascade in its cleanest form — which is why Pulse ATR Factor is taught in its own section, not as an aside.',
      },
      {
        id: 'd',
        text: 'Nothing visible changes until the next bar closes.',
        correct: false,
        explain:
          'Pulse is calculated live during the bar, not on close. The recalculation happens on every tick.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You have Cipher Risk Envelope turned ON with Fair Value Line ON. You decide to turn Fair Value Line OFF to reduce visual clutter. A moment later you hover your mouse over a signal and notice the "Mean Reversion" reading in the tooltip seems stale.',
    prompt: 'Why is the Mean Reversion reading affected?',
    options: [
      {
        id: 'a',
        text: 'Mean Reversion Score measures distance from the Fair Value line. Turning the line OFF only hides the line — the calculation still runs as long as Risk Envelope is ON.',
        correct: true,
        explain:
          'Correct. The Fair Value Line toggle is PURELY VISUAL — it controls whether the dotted line draws on the chart. The MR score calculation depends on Risk Envelope being ON, not the Fair Value Line toggle. Many operators confuse these two.',
      },
      {
        id: 'b',
        text: 'Mean Reversion is broken — turning off the Fair Value line deletes the calculation.',
        correct: false,
        explain:
          'The calculation is not deleted. Hiding the line and hiding the calculation are two different things. The sub-toggle only controls drawing.',
      },
      {
        id: 'c',
        text: 'Mean Reversion Score requires the Fair Value Line to draw or it returns NaN.',
        correct: false,
        explain:
          'No — the line is a display element. Calculations use the underlying EMA(HL2, 20) regardless of whether the line is drawn.',
      },
      {
        id: 'd',
        text: 'Turning off Fair Value Line automatically turns off Risk Envelope.',
        correct: false,
        explain:
          'Parent/child relationships do not work this way. You can turn off any child without affecting the parent. Only turning off the PARENT (Risk Envelope) disables the whole system.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You are watching a long bar range unfold on gold (XAUUSD). Cipher Structure is ON. A new resistance zone was born 30 bars ago. Price has tested it 3 times already — each test leaves an amber ✕ on the zone. You zoom in and see another test forming on the current bar (test #4).',
    prompt: 'With default settings, what happens on test #4?',
    options: [
      {
        id: 'a',
        text: 'Nothing special. Tests are just visual markers — the zone stays forever.',
        correct: false,
        explain:
          'Tests are not just visual. CIPHER prunes zones after N tests. Default is 4. The "Remove After N Tests" setting controls this.',
      },
      {
        id: 'b',
        text: 'The zone will be REMOVED after this test. Default Remove After N Tests = 4, so test #4 is the last one. The zone is treated as consumed liquidity.',
        correct: true,
        explain:
          'Correct. The zone is gone after this test. This is a deliberate design — the idea is that a level tested 4 times has had its liquidity consumed and is no longer institutionally meaningful.',
      },
      {
        id: 'c',
        text: 'The zone turns magenta and flashes red.',
        correct: false,
        explain:
          'Zone colour does not change based on test count. Zones are always magenta (resistance) or teal (support). The ✕ tests accumulate, then at the limit the zone is removed entirely.',
      },
      {
        id: 'd',
        text: 'The zone stays but price is no longer allowed to close through it.',
        correct: false,
        explain:
          'CIPHER has no concept of "allowed to close." It is a read-only indicator. Zones are removed from the CHART once consumed, but price does whatever it wants.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You trade ES futures on a 15-minute chart. You want to reduce noise in your signal feed — too many marginal setups. Without switching to a preset, you turn on "Strong Signals Only" in the SIGNAL ENGINE group.',
    prompt: 'What are the FOUR conditions CIPHER now requires for a signal to show?',
    options: [
      {
        id: 'a',
        text: 'ADX > 30, RSI > 70 long / < 30 short, volume spike, MACD crossover.',
        correct: false,
        explain:
          'These are retail-indicator concepts. CIPHER uses a proprietary 4-factor conviction check that does not include RSI or MACD.',
      },
      {
        id: 'b',
        text: 'Ribbon stacked with signal direction, ADX > 20, Volume > 1.0× average, Momentum health > 50%.',
        correct: true,
        explain:
          'Correct. 3 out of 4 of these must agree for a signal to pass the Strong filter. This is why turning on Strong Signals Only silently changes the signal distribution — it now routes every potential signal through a 4-factor audit.',
      },
      {
        id: 'c',
        text: 'Just the ADX filter — if ADX > 20, the signal shows.',
        correct: false,
        explain:
          'Single-factor filtering is the free-tier approach. CIPHER PRO uses a 4-factor conviction check because real edge rarely comes from one indicator agreeing with itself.',
      },
      {
        id: 'd',
        text: 'Whatever you set in the Custom Conviction panel.',
        correct: false,
        explain:
          'There is no Custom Conviction panel in CIPHER PRO. The 4 factors are hardcoded — deliberately, so operators cannot curve-fit their way out of discipline.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 8 questions covering groups PRESET through PULSE
// 66% pass threshold (6 of 8 correct = pass)
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question:
      'What is the MAXIMUM number of visual layers any CIPHER preset (Trend Trader, Scalper, etc.) will enable?',
    options: [
      { id: 'a', text: '2 layers', correct: false },
      { id: 'b', text: '3 layers', correct: true },
      { id: 'c', text: '5 layers', correct: false },
      { id: 'd', text: 'Unlimited — presets enable every visual', correct: false },
    ],
    explain:
      'Every preset caps at 3 visual layers. This is a deliberate design choice — any more and the chart becomes unreadable. When you outgrow presets, you are choosing your own 3 layers manually.',
  },
  {
    id: 'q2',
    question:
      'You open CIPHER and the Pulse ATR Factor input shows "1.5". What does this default mean in plain English?',
    options: [
      {
        id: 'a',
        text: 'Pulse line is 1.5 pips away from Cipher Flow at all times',
        correct: false,
      },
      {
        id: 'b',
        text: 'Pulse line sits 1.5× the current ATR away from Cipher Flow — a balanced middle-ground',
        correct: true,
      },
      { id: 'c', text: 'Signals fire every 1.5 bars', correct: false },
      { id: 'd', text: 'The Pulse indicator updates 1.5 times per minute', correct: false },
    ],
    explain:
      'The factor is an ATR multiplier. 1.5 × ATR is the distance between the Cipher Flow line and the Pulse line. Lower = tighter = more signals. Higher = wider = fewer signals but survives more noise.',
  },
  {
    id: 'q3',
    question:
      'Ribbon Divergence (a PRO-only feature) is defined as:',
    options: [
      { id: 'a', text: 'Price crossing the Cipher Ribbon from above', correct: false },
      {
        id: 'b',
        text: 'Two ribbon lines separating vertically by a large amount',
        correct: false,
      },
      {
        id: 'c',
        text: 'Price making fresh highs while the ribbon\'s internal expansion weakens',
        correct: true,
      },
      { id: 'd', text: 'The ribbon turning from teal to magenta', correct: false },
    ],
    explain:
      'Ribbon Divergence detects trend deterioration FROM INSIDE before the surface shows it. Price can keep climbing while the engine loses steam — an amber ◆ diamond marks the first bar, and the Command Center Trend row shifts to DIVERGING.',
  },
  {
    id: 'q4',
    question: 'In the Risk Envelope, a magenta ✕ marker drops when:',
    options: [
      { id: 'a', text: 'Price closes above the Fair Value line', correct: false },
      {
        id: 'b',
        text: 'Price escalates into the DANGER zone for the first time',
        correct: true,
      },
      { id: 'c', text: 'Price crosses back below the ATR midline', correct: false },
      { id: 'd', text: 'Any time price is in the CAUTION zone', correct: false },
    ],
    explain:
      'The ✕ fires only on FIRST-BAR escalation into a higher-risk zone. Magenta ✕ means DANGER zone entry. Amber ✕ means CAUTION zone entry. Re-entries do not re-trigger — the zone must have been LEFT before re-escalation.',
  },
  {
    id: 'q5',
    question:
      'A CIPHER Structure zone was born 30 bars ago. You see 4 amber ✕ test markers on it. With DEFAULT settings, what happens next bar?',
    options: [
      { id: 'a', text: 'Zone stays active with 4 tests logged', correct: false },
      { id: 'b', text: 'Zone turns red because it has been tested too many times', correct: false },
      {
        id: 'c',
        text: 'Zone is REMOVED — default "Remove After N Tests" is 4, so the zone is treated as consumed liquidity',
        correct: true,
      },
      { id: 'd', text: 'Zone splits into two — a supply zone and a demand zone', correct: false },
    ],
    explain:
      'Default Max Tests = 4 in CIPHER. A zone tested 4 times is considered exhausted liquidity and pruned from the chart. This prevents stale zones from piling up.',
  },
  {
    id: 'q6',
    question:
      'You turn ON Cipher Risk Envelope but turn OFF "Fair Value Line". What breaks?',
    options: [
      { id: 'a', text: 'The entire Risk Envelope stops drawing', correct: false },
      {
        id: 'b',
        text: 'Nothing breaks — Fair Value Line is a display toggle, not a calculation toggle',
        correct: true,
      },
      { id: 'c', text: 'Mean Reversion Score returns NaN', correct: false },
      { id: 'd', text: 'The Command Center Risk row disappears', correct: false },
    ],
    explain:
      'The Fair Value Line toggle is PURELY VISUAL — it controls whether the dotted FV line draws on the chart. The Mean Reversion calculation runs on the underlying EMA(HL2, 20) regardless. Confusing display toggles with calculation toggles is one of the most common Silent Cascade mistakes.',
  },
  {
    id: 'q7',
    question:
      'A Cipher Imbalance (FVG) box is showing "40% FILL" on the chart. What is CIPHER visualizing?',
    options: [
      {
        id: 'a',
        text: 'The original full gap size — the box never shrinks',
        correct: false,
      },
      {
        id: 'b',
        text: 'Only the REMAINING unfilled portion of the gap — the box has shrunk by 40% from the top down',
        correct: true,
      },
      {
        id: 'c',
        text: '40% of the gap has been traded above and 60% below',
        correct: false,
      },
      { id: 'd', text: 'The gap has been filled for 40 bars', correct: false },
    ],
    explain:
      'Cipher Imbalance shrinks the box in real time as price consumes the gap. Only the remaining magnet is shown. At 100% fill, the box auto-deletes entirely. This is unique to CIPHER — most FVG tools leave the original box on the chart forever.',
  },
  {
    id: 'q8',
    question:
      'You see a Cipher Coil progressing through stages: BUILDING → COILING → BREAKOUT READY. The lines get thicker and brighter as stages advance. Then a teal diamond (◆) appears. What did the diamond signal?',
    options: [
      { id: 'a', text: 'The Coil zone is being cancelled due to low volume', correct: false },
      {
        id: 'b',
        text: 'The squeeze has released and the diamond marks the breakout direction — up, in this case (teal)',
        correct: true,
      },
      {
        id: 'c',
        text: 'Price is about to revert to the middle of the coil',
        correct: false,
      },
      { id: 'd', text: 'A new coil is forming', correct: false },
    ],
    explain:
      'The diamond (◆) fires at the moment of squeeze release. Its colour matches the breakout direction — teal ◆ = bull break, magenta ◆ = bear break. This is the payoff moment of the Coil progression.',
  },
];

// ============================================================
// MAIN COMPONENT — Phase 3B-1
// Hero + sections S00–S08
// Component is intentionally UNCLOSED at the end of Phase 3B-1.
// Phase 3B-2 appends sections S09–S15 + game/quiz UI + certificate
// + closing tags.
// ============================================================
export default function CipherInputsAnatomyPart1() {
  const [gameActive, setGameActive] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [gameComplete, setGameComplete] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.3A-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  // Compute quiz score
  const quizScore = quizAnswers.filter((ans, i) => {
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = Math.round((quizScore / quizQuestions.length) * 100);
  const quizPassed = quizPercent >= 66;

  useEffect(() => {
    if (quizPassed && quizSubmitted && !certRevealed) {
      const timer = setTimeout(() => setCertRevealed(true), 600);
      return () => clearTimeout(timer);
    }
  }, [quizPassed, quizSubmitted, certRevealed]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12 0%, #0a0f1a 100%)' }}>
      {/* ================ HERO ================ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top, rgba(255,179,0,0.15), transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/academy" className="text-xs text-white/50 hover:text-white/80 transition">← Academy</Link>
            <span className="text-white/20">/</span>
            <span className="text-xs text-white/50">Level 11 · CIPHER PRO Mastery</span>
            <span className="text-white/20">/</span>
            <span className="text-xs text-amber-400">Lesson 11.3a</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold tracking-widest text-amber-400">PRO · LEVEL 11 · CIPHER</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            CIPHER Inputs Anatomy
            <br />
            <span className="text-amber-400">· Part 1 — The Visual Layer</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-3xl italic">
            Nine groups. Twenty-six inputs. Every toggle echoes through the system.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Sections</div>
              <div className="text-lg font-bold">16</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Animations</div>
              <div className="text-lg font-bold">14</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Game rounds</div>
              <div className="text-lg font-bold">5</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Est. time</div>
              <div className="text-lg font-bold">45 min</div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 max-w-3xl">
            <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">COVERED IN THIS LESSON</div>
            <div className="flex flex-wrap gap-2">
              {['PRESET', 'RIBBON', 'RISK ENVELOPE', 'STRUCTURE', 'SPINE', 'IMBALANCE', 'SWEEPS', 'COIL', 'PULSE'].map((g) => (
                <span key={g} className="text-[11px] font-mono text-white/70 bg-white/5 border border-white/10 rounded px-2 py-1">
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/50 italic">
              Part 2 covers SIGNAL ENGINE, RISK MAP (TP/SL) and COMMAND CENTER row toggles.
            </p>
          </div>
        </div>
      </section>

      {/* ================ SECTION S00 — Why Settings Matter ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S00 · FOUNDATION</div>
        <h2 className="text-3xl font-bold mb-6">Why settings matter — the operator tunes the instrument</h2>
        <div className="space-y-4 text-white/80 leading-relaxed text-lg">
          <p>
            In Lesson 11.2 you learned what the Command Center TELLS you. This lesson teaches what you can TELL the Command Center — and more broadly, CIPHER itself. Every setting is a lever. Some levers move one thing. Some levers move four things you never noticed.
          </p>
          <p>
            An instrument without an operator is a pretty light show. An instrument WITH an operator is a decision machine. The difference is whether you know which knobs to turn and when. That is this lesson.
          </p>
          <p className="pt-4 border-l-4 border-amber-500/50 pl-5 italic text-white/70">
            Level 11 ships with 59 total inputs across 12 groups. This lesson covers 26 inputs across the 9 <span className="text-amber-400 font-semibold">visual-layer</span> groups — the things that DRAW on your chart. Part 2 will cover the 33 <span className="text-amber-400 font-semibold">behavioral</span> inputs — the things that change what CIPHER DOES with those drawings.
          </p>
        </div>
      </section>

      {/* ================ SECTION S01 — The Silent Cascade (Groundbreaking Concept) ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[10px] font-bold tracking-widest text-amber-400">S01 · GROUNDBREAKING CONCEPT</div>
          <span className="text-amber-400">★</span>
        </div>
        <h2 className="text-3xl font-bold mb-6">The Silent Cascade</h2>

        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 mb-8">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-3">CORE DOCTRINE</div>
          <p className="text-xl text-white/90 leading-relaxed">
            Every setting in CIPHER is connected to every other setting. One toggle change creates downstream effects you did not ask for and will not see unless you are looking. The operator&apos;s skill is <span className="text-amber-400 font-semibold">knowing the cascade before you flip the switch</span>.
          </p>
        </div>

        <div className="mb-8">
          <SilentCascadeAnim />
        </div>

        <div className="space-y-4 text-white/80 leading-relaxed">
          <p>
            Consider the animation above. The operator clicks a single toggle — &ldquo;Strong Signals Only&rdquo;. One checkbox. Look what happens:
          </p>
          <ul className="space-y-3 pl-6 border-l-2 border-amber-500/40">
            <li className="leading-relaxed">
              <span className="text-amber-400 font-bold">Ripple 1.</span> Signal count on the chart drops from 8 markers to 3. Five signals that were previously valid now fail the 4-factor conviction test.
            </li>
            <li className="leading-relaxed">
              <span className="text-amber-400 font-bold">Ripple 2.</span> The &ldquo;Last Signal&rdquo; row in the Command Center shifts from FRESH to AGING — because the most recent qualifying signal is now older than it was a second ago.
            </li>
            <li className="leading-relaxed">
              <span className="text-amber-400 font-bold">Ripple 3.</span> The Pulse row&apos;s action cell changes from &ldquo;WATCH BREAKOUT&rdquo; to &ldquo;HOLDING&rdquo;. The last live-armed signal has been filtered out, so the breakout watch no longer applies.
            </li>
            <li className="leading-relaxed">
              <span className="text-amber-400 font-bold">Ripple 4.</span> The tooltip TP/SL values recalculate. The tooltip anchors to the most recent valid signal — and since that signal is now different, the numbers shift.
            </li>
          </ul>
          <p className="pt-4">
            Four systems. One click. No warning dialog, no confirmation prompt, no notification sound. The cascade is silent because it happens through the data flow, not through the UI. And this is exactly one example — every single setting you will learn in the rest of this lesson has its own cascade.
          </p>
          <div className="mt-6 p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">THE OPERATOR&apos;S RULE</div>
            <p className="text-white/80 leading-relaxed">
              Before you change ANY setting, ask: <span className="text-white font-semibold">&ldquo;what ELSE does this change?&rdquo;</span> If you cannot answer in under five seconds, you do not know the cascade well enough to change it yet. Leave it. Read the relevant section. Come back.
            </p>
          </div>
        </div>
      </section>

      {/* ================ SECTION S02 — Reading a CIPHER input row ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S02 · ANATOMY</div>
        <h2 className="text-3xl font-bold mb-6">Reading a CIPHER input row</h2>
        <div className="space-y-4 text-white/80 leading-relaxed text-lg mb-8">
          <p>
            Before you touch any setting, you need to read the row. Every input in CIPHER follows the same four-part grammar. Once you see the pattern, every one of the 59 inputs becomes easy to scan.
          </p>
        </div>

        <div className="mb-8">
          <PineInputAnatomyAnim />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">1 · LABEL</div>
            <p className="text-white/80 text-sm leading-relaxed">
              What the setting is called. Sub-settings under a parent toggle appear slightly indented (visually) because the Pine source prefixes them with two spaces. &ldquo;Intensity&rdquo;, &ldquo;Fair Value Line&rdquo;, &ldquo;ATR Multiplier&rdquo; are all sub-settings.
            </p>
          </div>
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">2 · CONTROL</div>
            <p className="text-white/80 text-sm leading-relaxed">
              What you actually change. Three types: <span className="text-white">checkbox</span> (on/off), <span className="text-white">dropdown</span> (one option from a list), or <span className="text-white">number field</span> (with min/max constraints).
            </p>
          </div>
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">3 · INFO ICON (ⓘ)</div>
            <p className="text-white/80 text-sm leading-relaxed">
              Tiny circle on the right. Click or hover to reveal the tooltip. This is where the REAL information lives. Read this FIRST, before you change anything.
            </p>
          </div>
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">4 · TOOLTIP</div>
            <p className="text-white/80 text-sm leading-relaxed">
              The written reason for the setting. Often includes recommendations (&ldquo;0.5 tight, 1.0 standard, 1.5 wide&rdquo;). Written by someone who already thought through the cascade for you.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">⚠ DO NOT SKIP THE TOOLTIP</div>
          <p className="text-white/80 text-sm leading-relaxed">
            The fastest way to break your CIPHER setup is to change a number because &ldquo;it looks interesting&rdquo; without reading the ⓘ first. The tooltips are short — all of them fit in 2–4 sentences. There is zero excuse not to read them.
          </p>
        </div>
      </section>

      {/* ================ SECTION S03 — PRESET ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S03 · THE OVERRIDE ENGINE</div>
        <h2 className="text-3xl font-bold mb-2">PRESET — the six training wheels</h2>
        <p className="text-white/50 italic mb-8">1 input · 7 options · overrides your manual toggles while active</p>

        <div className="mb-8">
          <PresetSelectorAnim />
        </div>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The PRESET dropdown is the FIRST thing in CIPHER&apos;s settings panel and for good reason — it is a master override. Select a preset and it silently enforces its own combination of visuals, ignoring whatever you had turned on manually. Set it back to None and your manual toggles come back.
          </p>
          <p>
            Every preset obeys one rule: <span className="text-amber-400 font-semibold">max 3 visual layers</span>. More than three visuals and the chart becomes unreadable, so CIPHER refuses to stack them. You are getting a curated combination, not a buffet.
          </p>
        </div>

        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-amber-400 font-bold">Preset</th>
                <th className="text-left p-3 text-amber-400 font-bold">Visuals forced ON</th>
                <th className="text-left p-3 text-amber-400 font-bold">Signal engine</th>
                <th className="text-left p-3 text-amber-400 font-bold">The mindset</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">None</td>
                <td className="p-3 italic text-white/50">whatever you set</td>
                <td className="p-3 italic text-white/50">whatever you set</td>
                <td className="p-3 italic text-white/60">&ldquo;Manual control.&rdquo;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">Trend Trader</td>
                <td className="p-3">Cipher Ribbon · Cipher Pulse · Trend candles</td>
                <td className="p-3">Trend (PX only)</td>
                <td className="p-3 italic text-white/60">&ldquo;Follow the wave.&rdquo;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">Scalper</td>
                <td className="p-3">Structure · Imbalance · Pulse (tight 0.8×)</td>
                <td className="p-3">All Signals · Composite Bold candles</td>
                <td className="p-3 italic text-white/60">&ldquo;Scalp from levels. Target gaps.&rdquo;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">Swing Trader</td>
                <td className="p-3">Cipher Ribbon · Cipher Spine · Pulse (wide 1.2×)</td>
                <td className="p-3">Trend · Strong Signals forced ON</td>
                <td className="p-3 italic text-white/60">&ldquo;Strong signals only.&rdquo;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">Reversal</td>
                <td className="p-3">Spine · Imbalance · Risk Envelope</td>
                <td className="p-3">Reversal (TS only) · Tension candles</td>
                <td className="p-3 italic text-white/60">&ldquo;Catch the snap.&rdquo;</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-bold text-white">Sniper</td>
                <td className="p-3">Pulse (widest 1.3×) · Cipher Coil</td>
                <td className="p-3">All Signals · Strong Signals forced ON</td>
                <td className="p-3 italic text-white/60">&ldquo;Wait for the squeeze. Strike once.&rdquo;</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Structure</td>
                <td className="p-3">Structure · Imbalance · Sweeps</td>
                <td className="p-3">Visuals Only · no signals</td>
                <td className="p-3 italic text-white/60">&ldquo;Pure chart reading.&rdquo;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mb-4 text-white">The Preset Override Matrix</h3>
        <div className="mb-6">
          <PresetOverrideMatrixAnim />
        </div>

        <div className="p-5 rounded-lg bg-white/5 border border-white/10 mb-6">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">THE PRESET GRADUATION CEREMONY</div>
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            Presets are training wheels. Use them for the first 2–4 weeks while you learn which visuals you actually read. Then graduate to <span className="text-amber-400 font-semibold">None</span> and set your own three.
          </p>
          <p className="text-white/80 text-sm leading-relaxed">
            You graduate when you can answer &ldquo;which three visuals do I need for this specific market right now?&rdquo; without looking at the preset list. If you can answer that, presets are no longer saving you time — they are limiting you.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">⚠ COMMON MISTAKE</div>
          <p className="text-white/80 text-sm leading-relaxed">
            You turn on 3 visuals manually, then pick a preset to try, and expect your visuals to be additive. They are not. The preset <span className="text-white">silently suppresses</span> your manual toggles. If you switch back to None you will find your original toggles are still set — they were just being ignored while the preset was active.
          </p>
        </div>
      </section>

      {/* ================ SECTION S04 — CIPHER RIBBON ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S04 · ADAPTIVE TREND VISUAL</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER RIBBON</h2>
        <p className="text-white/50 italic mb-8">4 inputs · three adaptive lines · Divergence and Projection are PRO-only</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The Cipher Ribbon is three proprietary trend lines — <span className="text-white font-semibold">Core</span> (fastest, most responsive), <span className="text-white font-semibold">Flow</span> (midpoint anchor), and <span className="text-white font-semibold">Anchor</span> (slowest, structural reference). Together they adapt to volatility, trend strength, and volume conviction. This is the flagship visual of the whole CIPHER suite.
          </p>
        </div>

        {/* Ribbon inputs table */}
        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 4 RIBBON INPUTS</div>
          <div className="space-y-3">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Cipher Ribbon</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                The master on/off for the entire ribbon system. When OFF, none of the sub-settings matter — the ribbon simply does not draw. When ON, the three adaptive lines render with their fill band.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Intensity</div>
                  <div className="text-xs text-white/50">dropdown · default: Normal · options: Subtle / Normal / Bold</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">visual only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Controls the opacity of the ribbon fill and line weight. <span className="text-white">Subtle</span> recedes into the chart — good when the ribbon is one of three or more visuals. <span className="text-white">Normal</span> is the baseline. <span className="text-white">Bold</span> is the &ldquo;I want the ribbon to dominate&rdquo; setting — use when the ribbon is your ONLY visual.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/25">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Ribbon Divergence</div>
                  <div className="text-xs text-white/50">checkbox · default: ON · PRO EXCLUSIVE</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">★ unique to PRO</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Detects when price makes new highs or lows but the ribbon&apos;s INTERNAL expansion weakens. An amber ◆ diamond marks the first bar of the divergence. The Command Center Ribbon row shifts to <span className="text-amber-400 font-mono">DIVERGING</span>. This is trend deterioration from inside — the engine loses steam before the surface does.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/25">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Ribbon Projection</div>
                  <div className="text-xs text-white/50">checkbox · default: ON · PRO EXCLUSIVE</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">★ unique to PRO</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Projects the Cipher Core 6 bars forward using kinematic extrapolation (velocity + acceleration). Dotted line fades with distance. When the projection curves back toward Flow, a potential flip is approaching — the Command Center Ribbon row shifts to <span className="text-amber-400 font-mono">CURVING</span>. <span className="text-white font-semibold">This is NOT a price prediction</span> — it is a projection of where the trend engine itself is heading.
              </p>
            </div>
          </div>
        </div>

        {/* Ribbon Divergence animation */}
        <h3 className="text-xl font-bold mb-4 text-white">Ribbon Divergence visualised</h3>
        <div className="mb-6">
          <RibbonDivergenceAnim />
        </div>
        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            Look at the top pane: price is making three rising highs (HH1, HH2, HH3) — a textbook bull trend by surface reading. Now look at the bottom pane: the ribbon&apos;s internal expansion was huge at HH1, weaker at HH2, and collapsed at HH3. The engine is dying while the surface looks alive.
          </p>
          <p>
            The amber ◆ diamond drops at HH3. From that bar forward, the Command Center Ribbon row reads DIVERGING until the condition clears. This is one of the highest-conviction trend-reversal warnings in all of CIPHER.
          </p>
        </div>

        {/* Ribbon Projection animation */}
        <h3 className="text-xl font-bold mb-4 text-white">Ribbon Projection visualised</h3>
        <div className="mb-6">
          <RibbonProjectionAnim />
        </div>
        <div className="space-y-3 text-white/80 leading-relaxed">
          <p>
            The live ribbon is solid. The dotted dots past the NOW line are the projection — 6 bars of extrapolation based on where the engine is CURRENTLY heading. In the first phase (EXPANDING) the projection continues in the same direction. In the second (MATURING) it flattens. In the third (CURVING) it curves back toward the Flow line — and that is the warning sign.
          </p>
          <p className="p-4 rounded-lg bg-white/5 border-l-4 border-amber-500/50 italic">
            CURVING in the Ribbon row of your Command Center does not mean price will reverse. It means the ENGINE is about to flip. Price lags the engine by 2–5 bars on average. You have time to prepare.
          </p>
        </div>
      </section>

      {/* ================ SECTION S05 — CIPHER RISK ENVELOPE ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S05 · ADAPTIVE VOLATILITY CLOUD</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER RISK ENVELOPE</h2>
        <p className="text-white/50 italic mb-8">5 inputs · concentric zones · the FV line is a trap (explained below)</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The Risk Envelope is an adaptive volatility cloud that surrounds price with four concentric zones: SAFE, WATCH, CAUTION, DANGER. The width scales with volatility, and the opacity scales with conviction. All four zones reference the Fair Value line at the centre — the gravitational anchor the whole system rotates around.
          </p>
        </div>

        <div className="mb-8">
          <RiskEnvelopeZonesAnim />
        </div>

        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            Zones escalate outward. A trade taken in the SAFE zone has volatility working WITH you — price is near fair value, the ATR is normal, your stop fits inside a half-ATR of breathing room. A trade taken in the DANGER zone has volatility working AGAINST you — price is stretched far from fair value, mean reversion is imminent, your stop needs to be wider.
          </p>
          <p>
            The ✕ markers fire on first-bar escalation INTO a higher zone. Amber ✕ when you cross into CAUTION. Magenta ✕ when you cross into DANGER. <span className="text-white font-semibold">Re-entries do not re-trigger</span> — the zone has to be LEFT before re-escalation counts. This prevents noise from producing dozens of false markers when price oscillates on the zone boundary.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 5 RISK ENVELOPE INPUTS</div>
          <div className="space-y-3">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Cipher Risk Envelope</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Master on/off. When ON, all four zones draw. When OFF, the entire envelope system is hidden AND the Mean Reversion Score calculation is still active in the Command Center (the calculation uses the underlying EMA; the draw is what the toggle controls).
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Intensity</div>
                  <div className="text-xs text-white/50">dropdown · default: Normal · Subtle / Normal / Bold</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">visual only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Opacity of the fill bands. Subtle recedes, Bold dominates. On charts with 3 visuals, most operators set this to Subtle to let other visuals breathe.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/25">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Fair Value Line</div>
                  <div className="text-xs text-white/50">checkbox · default: ON · DISPLAY TOGGLE</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">⚠ display only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                A dotted white line at the envelope&apos;s gravitational centre — the EMA(HL2, 20) that all bands anchor to. This is the &ldquo;fair value&rdquo; every other zone is measured from. The Mean Reversion Score in the Command Center measures distance from THIS line in ATR-sigma units. <span className="text-white font-semibold">BUT</span> — and this is the trap — turning this toggle OFF only hides the DRAWN LINE. The calculation underneath still runs as long as Risk Envelope is ON. Confusing display vs calculation is one of the most common Silent Cascade mistakes.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Zone Transition Markers</div>
                  <div className="text-xs text-white/50">checkbox · default: ON</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">signal events</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Shows the ✕ markers when price escalates into a higher-risk zone. Magenta ✕ on DANGER entry, amber ✕ on CAUTION entry. Only fires on FIRST-BAR of the transition, so the chart stays clean even with choppy price.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Adaptive Intensity</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">dynamic visuals</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                When ON, two dynamic factors kick in: (1) <span className="text-white">Progressive Danger Glow</span> — the deeper price pushes into the DANGER zone, the brighter the fill. (2) <span className="text-white">Band Breathing</span> — fills brighten when ATR is expanding, fade when contracting. Gives the envelope a living, responsive feel. Leave OFF if you prefer static visuals.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4 text-white">Fair Value gravity</h3>
        <div className="mb-6">
          <FairValueGravityAnim />
        </div>
        <div className="mb-6 space-y-3 text-white/80 leading-relaxed">
          <p>
            Watch the price path in the animation. Every time it stretches far from the Fair Value line, an amber &ldquo;GRAVITY&rdquo; arrow appears pointing it back toward the line. The Mean Reversion Score in the top-right reports the distance in ATR-sigma units. The larger the number, the more stretched — the more mean reversion becomes the dominant probability.
          </p>
          <p>
            This is WHY the Fair Value line matters. It is not a support/resistance level. It is not a moving average you trade off. It is the centre of mass that the rest of the envelope is measured against.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">⚠ THE DISPLAY vs CALCULATION TRAP</div>
          <p className="text-white/80 text-sm leading-relaxed">
            The Fair Value Line toggle is a DISPLAY toggle. Turning it OFF hides the dotted line but does NOT disable the Mean Reversion Score in the Command Center. The calculation uses the underlying EMA(HL2, 20) regardless. If you want to disable the MR score entirely, turn off the MASTER toggle — the whole Risk Envelope — not the Fair Value sub-toggle.
          </p>
        </div>
      </section>

      {/* ================ SECTION S06 — CIPHER STRUCTURE ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S06 · INSTITUTIONAL S/R</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER STRUCTURE</h2>
        <p className="text-white/50 italic mb-8">6 inputs · lifecycle-managed S/R levels · NOT order blocks (those live in PHANTOM)</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            Cipher Structure draws institutional support and resistance levels based on swing-point detection. Each zone has a lifecycle — it is born at a pivot, tested N times, and consumed. Unlike static S/R tools, Structure prunes its own zones so the chart never gets cluttered with stale levels from weeks ago.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">These are NOT order blocks.</span> Order blocks (supply/demand zones with wick engulfment rules) live in PHANTOM PRO. Structure is a different concept — swing-high/swing-low detection with institutional-price-action pruning logic.
          </p>
        </div>

        <div className="mb-8">
          <StructureLifecycleAnim />
        </div>

        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            Every zone walks through four stages: BIRTH (pivot detected), ACTIVE (drawn on chart, no tests yet), TESTED ×N (each touch plants an amber ✕), and CONSUMED (removed after N tests or after max age bars — whichever comes first). The right-hand stage panel tracks which phase the current zone is in.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 6 STRUCTURE INPUTS</div>
          <div className="space-y-3">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Cipher Structure</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Master on/off for the entire zone system. When OFF, no zones render. When ON, all zones respecting the four numeric filters below render with their tests.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Intensity</div>
                  <div className="text-xs text-white/50">dropdown · default: Normal · Subtle / Normal / Bold</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">visual only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Controls zone band opacity. On a busy chart with 3 visuals, Subtle is almost always the right call for Structure.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Pivot Detection Length</div>
                  <div className="text-xs text-white/50">integer · default: 5 · range: 2–20</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">sensitivity</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Bars left/right for swing detection. A pivot requires N bars on either side to be lower (for a swing high) or higher (for a swing low). <span className="text-white">Lower value</span> = more zones, more noise. <span className="text-white">Higher value</span> = fewer zones, only the strongest. 5 is balanced — good for 15m–1H timeframes. Drop to 3 on faster charts, raise to 10+ on slower ones.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Max Levels (above + below)</div>
                  <div className="text-xs text-white/50">integer · default: 8 · range: 4–16</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">clutter cap</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Maximum total S/R levels drawn on the chart at any time. Default is 8, typically split roughly 4 above + 4 below price. When a new stronger zone forms and you are already at the cap, the oldest or weakest zone is pruned to make room.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/25">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Remove After N Tests</div>
                  <div className="text-xs text-white/50">integer · default: 4 · range: 2–6</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">⚠ consumption rule</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                A zone is removed from the chart after this many tests — the philosophy is that a level tested 4 times has had its liquidity consumed and is no longer institutionally meaningful. <span className="text-white">Lower</span> = faster consumption, fewer re-test trades. <span className="text-white">Higher</span> = slower consumption, more willing to re-take zones on repeated tests. This setting is a TRADING STYLE dial as much as a technical one.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Max Zone Age (bars)</div>
                  <div className="text-xs text-white/50">integer · default: 200 · range: 50–500</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">time-to-live</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Zones older than this are removed regardless of how many times they have been tested. Prevents ancient zones from cluttering the chart long after they have stopped being relevant. On a 15m chart, 200 bars is ~50 hours — roughly two trading days.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">⚙ TUNING PRIMER</div>
          <p className="text-white/80 text-sm leading-relaxed">
            For scalping (1m–5m): Pivot Length 3, Max Levels 8, Remove After 3. For swing (1H–4H): Pivot Length 8, Max Levels 6, Remove After 4. For position (Daily+): Pivot Length 15, Max Levels 4, Remove After 5–6. The defaults (5 / 8 / 4 / 200) target the 15m chart.
          </p>
        </div>
      </section>

      {/* ================ SECTION S07 — CIPHER SPINE ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S07 · RANGE MIDPOINT</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER SPINE</h2>
        <p className="text-white/50 italic mb-8">2 inputs · health-adaptive midpoint with breathing bands</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The Spine is an adaptive range-midpoint line wrapped in breathing bands whose width tells you momentum health. When momentum is strong and the trend is healthy, the bands are tight and vivid. When momentum is dying and the trend is about to flip, the bands stretch wide and desaturate — and the Spine itself starts drifting away from price.
          </p>
          <p>
            The gap between the Spine and price is the warning. Healthy trends have their Spine right on top of price; dying trends have the Spine trailing behind or ahead, creating a visible GAP.
          </p>
        </div>

        <div className="mb-8">
          <SpineBreathingAnim />
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 2 SPINE INPUTS</div>
          <div className="space-y-3">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Cipher Spine</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Master on/off for the Spine midpoint line and its breathing bands. When ON, the Spine renders and its colour adapts: teal when bullish momentum is healthy, magenta when bearish, amber during transitions. Vividness intensifies with momentum strength.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Intensity</div>
                  <div className="text-xs text-white/50">dropdown · default: Normal · Subtle / Normal / Bold</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">visual only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Controls the opacity of the band fill and the Spine line weight. Spine is naturally bold — often paired well at Subtle to stay in the background while still providing orientation.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">WHEN TO READ THE SPINE</div>
          <p className="text-white/80 text-sm leading-relaxed">
            The Spine is not a signal line — you do not trade from its crosses. It is a <span className="text-white font-semibold">confidence gauge</span>. Check it before every entry. If the bands are tight and vivid and the Spine hugs price, you have momentum wind at your back. If the bands are wide and the Spine has drifted away, you are fighting a maturing trend. Size down or skip the trade.
          </p>
        </div>
      </section>

      {/* ================ SECTION S09 — CIPHER SWEEPS ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S09 · LIQUIDITY RAIDS</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER SWEEPS</h2>
        <p className="text-white/50 italic mb-8">1 input · the light version · full SMC treatment lives in PHANTOM</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            A liquidity sweep is when price wicks BEYOND a prior swing high or low — grabbing the stops that were parked above or below — then closes back INSIDE the range. The textbook institutional trap. CIPHER Sweeps detects these events and marks them with a diamond (◆) at the swept level. A 3-bar context window follows: any signal that fires within 3 bars of a sweep gets tagged with &ldquo;Sweep&rdquo; in its tooltip — CIPHER&apos;s highest-probability reversal setup.
          </p>
        </div>

        <div className="mb-8">
          <SweepDetectionAnim />
        </div>

        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            The animation walks a series of candles toward a prior swing high (dashed white line). Most candles stay below. On candle 14 the wick shoots UP past the line — stops above the swing high are hit. But watch the BODY: it closes back below the line. That is the signature of a sweep — wick above, body inside. The amber ◆ drops at the swept level. For the next 3 bars, any CIPHER signal that fires gets the &ldquo;Sweep&rdquo; context tag.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 1 SWEEPS INPUT</div>
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="font-bold text-white">Cipher Sweeps</div>
                <div className="text-xs text-white/50">checkbox · default: OFF</div>
              </div>
              <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle (no sub-settings)</div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              Master on/off for the sweep detection system. There are no sub-settings — detection parameters are internal. When ON, every qualifying sweep gets a ◆ marker and triggers the 3-bar Sweep context window. When OFF, signals still fire but none of them will ever carry the Sweep context tag.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">CIPHER vs PHANTOM — KNOW THE DIFFERENCE</div>
          <p className="text-white/80 text-sm leading-relaxed">
            CIPHER Sweeps is the LIGHT version — detection + marker + 3-bar context. PHANTOM PRO has the full Smart Money Concepts treatment: equal highs/lows clusters, liquidity pools, sweep quality scoring, and sessional sweep statistics. If you are trading SMC as your primary style, enable PHANTOM Sweeps too — the two work together, not in competition.
          </p>
        </div>
      </section>

      {/* ================ SECTION S10 — CIPHER COIL ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S10 · COMPRESSION ZONES</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER COIL</h2>
        <p className="text-white/50 italic mb-8">1 input · BB/KC squeeze with progression stages · fires direction on release</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The Cipher Coil is a compression-zone visual built on Bollinger Band + Keltner Channel convergence. When price enters a squeeze, an amber box appears with three lines that get progressively thicker and brighter as the squeeze intensifies. There are four stages: <span className="text-white font-semibold">BUILDING</span> (early compression, faint thin lines), <span className="text-white font-semibold">COILING</span> (medium lines, energy building), <span className="text-white font-semibold">BREAKOUT READY</span> (thick bright lines, about to fire), and the release — where a diamond (◆) marks the breakout direction.
          </p>
        </div>

        <div className="mb-8">
          <CoilCompressionAnim />
        </div>

        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            Watch the bands converge. The outer BB lines and inner KC dashed lines both narrow as compression intensifies. The energy bar at the top-left fills from 20% (BUILDING) to 85% (BREAKOUT READY). Then the release: the bands re-expand, price shoots out, a teal ◆ fires marking an upward break. The colour of the diamond tells you direction — teal ◆ for bullish release, magenta ◆ for bearish.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 1 COIL INPUT</div>
          <div className="p-5 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="font-bold text-white">Cipher Coil</div>
                <div className="text-xs text-white/50">checkbox · default: OFF</div>
              </div>
              <div className="text-xs font-mono text-amber-400 whitespace-nowrap">master toggle (no sub-settings)</div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              Master on/off for the compression-zone visual and the release diamond. There are no sub-settings — compression thresholds are internal and adaptive. When ON, you see the progression stages and the release marker. When OFF, CIPHER still tracks squeeze internally for the Command Center&apos;s Volatility row (which will show BUILDING/COILING/BREAKOUT READY in the action cell), but the visual does not draw on the chart.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">THE PRE-FIRE SETUP</div>
          <p className="text-white/80 text-sm leading-relaxed">
            When the Coil reaches BREAKOUT READY, you have typically 3–8 bars before release. Use that time to: (1) check HTF bias in the Command Center — align direction with higher timeframe, (2) mark entry levels above/below the coil bounds, (3) set alerts. When the ◆ fires, you are not scrambling to make a decision — you are executing a decision that was already made.
          </p>
        </div>
      </section>

      {/* ================ SECTION S11 — CIPHER PULSE ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S11 · THE DYNAMIC S/R LINE</div>
        <h2 className="text-3xl font-bold mb-2">CIPHER PULSE</h2>
        <p className="text-white/50 italic mb-8">4 inputs · the engine that fires signals · two numeric knobs that cascade widely</p>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            The Cipher Pulse is the dynamic support/resistance line that fires the majority of CIPHER&apos;s signals. Teal when bullish, magenta when bearish. Every time price CROSSES the Pulse line, a PX signal fires (Pulse Cross — the &ldquo;Trend&rdquo; engine). The line itself is offset from the Cipher Flow by an ATR multiple. Two numeric knobs — <span className="text-white">Pulse ATR Factor</span> and <span className="text-white">Pulse Smoothing</span> — control that distance and its responsiveness. These two knobs are arguably the most cascading settings in CIPHER.
          </p>
        </div>

        <div className="mb-8">
          <PulseATRFactorAnim />
        </div>

        <div className="mb-8 space-y-3 text-white/80 leading-relaxed">
          <p>
            Two panes. Same price path. Same Cipher Flow. Only one thing is different — the Pulse ATR Factor. The left pane uses 0.8× ATR (tight), the right uses 1.3× (wide). Count the signals: the tight pane fires many more. Each of those signals on the left has a tighter stop-loss distance and is more vulnerable to whipsaw. Each signal on the right has a wider stop and survives more noise, but the setup is also rarer.
          </p>
          <p>
            This is the Silent Cascade in one slider. One value changed. A completely different signal distribution. A different stop distance for every trade. A different hit rate. A different expectancy curve.
          </p>
        </div>

        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-3">THE 4 PULSE INPUTS</div>
          <div className="space-y-3">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Cipher Pulse</div>
                  <div className="text-xs text-white/50">checkbox · default: OFF</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">⚠ display only — does NOT gate signals</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                This toggle controls whether the Pulse LINE draws on the chart. It does <span className="text-white font-semibold">not</span> control whether PX signals fire. Signals still fire even with the line hidden, as long as the SIGNAL ENGINE is set to Trend or All Signals. Turning off this toggle only hides the visual line — it is a cosmetic choice for operators who want fewer lines on-screen but still want the PX signals.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Intensity</div>
                  <div className="text-xs text-white/50">dropdown · default: Normal · Subtle / Normal / Bold</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">visual only</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Controls Pulse line weight. Subtle keeps it in the background for chart-readers who use it as a reference. Bold makes it a primary visual anchor. If Pulse is your trigger (and it usually is on Trend-Trader setups), Bold is the right choice.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/25">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Pulse ATR Factor</div>
                  <div className="text-xs text-white/50">float · default: 1.5 · range: 0.5–3.0 · step: 0.1</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">★ the master dial</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Distance from Cipher Flow in ATR multiples. <span className="text-white">Lower</span> = tighter, more signals, tighter stops, more whipsaw. <span className="text-white">Higher</span> = wider, fewer signals, survives more noise, wider stops. 1.5 is the balanced default. Presets override this: Scalper×0.8 (0.8 tight), Swing×1.2 (1.8 wide), Sniper×1.3 (1.95 widest). This single value controls the entire signal distribution — changing it is not a tweak, it is a trading-style decision.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="font-bold text-white">Pulse Smoothing</div>
                  <div className="text-xs text-white/50">integer · default: 3 · range: 1–10 · step: 1</div>
                </div>
                <div className="text-xs font-mono text-amber-400 whitespace-nowrap">responsiveness</div>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                Smoothing periods applied to the Pulse line movement. <span className="text-white">Higher</span> = smoother line, fewer whipsaw crosses, slightly later signals. <span className="text-white">Lower</span> = rawer line, more immediate signals, more false crosses on noisy bars. 3 is balanced. 5–7 is good for chop-prone instruments. 1–2 is for scalpers willing to accept some noise for maximum speed.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">⚠ THE SIGNAL-GATING MISCONCEPTION</div>
          <p className="text-white/80 text-sm leading-relaxed">
            &ldquo;I turned off Cipher Pulse — why am I still getting PX signals?&rdquo; Because the toggle is a display toggle, not a signal gate. If you want to disable PX signals entirely, change <span className="text-white font-semibold">Signal Engine</span> (in the SIGNAL ENGINE group — covered in Part 2) to &ldquo;Reversal&rdquo; or &ldquo;Visuals Only&rdquo;. The Pulse toggle is for hiding the line, not silencing the engine.
          </p>
        </div>
      </section>

      {/* ================ SECTION S12 — The Intensity Universal Language ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S12 · CROSS-CUTTING CONCEPT</div>
        <h2 className="text-3xl font-bold mb-6">The Intensity universal language</h2>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            Every visual group in CIPHER has an &ldquo;Intensity&rdquo; dropdown with three options: <span className="text-white font-semibold">Subtle · Normal · Bold</span>. You have seen it appear in RIBBON, RISK ENVELOPE, STRUCTURE, SPINE, IMBALANCE, and PULSE. It is intentionally the same three options everywhere — a universal language across the visual layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-widest text-teal-300 mb-2">SUBTLE</div>
            <div className="text-lg font-bold mb-2">Whisper</div>
            <p className="text-sm text-white/70 leading-relaxed">
              Lowest opacity, thinnest lines, most transparent fills. Use when this visual is <span className="text-white">not the primary</span> — it&apos;s one of three on-chart and you want it to stay in the background. Also use on charts with busy price action where you need price to stay readable.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-widest text-white/70 mb-2">NORMAL</div>
            <div className="text-lg font-bold mb-2">Balanced</div>
            <p className="text-sm text-white/70 leading-relaxed">
              The baseline. What the preset engine defaults to. A safe middle ground — the visual is clearly visible but not overwhelming. Use when you do not have a strong opinion yet, or as the default when adding a new visual to your chart.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold tracking-widest text-amber-400 mb-2">BOLD</div>
            <div className="text-lg font-bold mb-2">Dominant</div>
            <p className="text-sm text-white/70 leading-relaxed">
              Maximum opacity, thickest lines, vivid fills. Use when this visual is the <span className="text-white">primary tool</span> on the chart — you are trading directly off it. Also use on dark charts (dark theme) where Normal starts to fade into the background.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white/5 border border-white/10 mb-6">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">THE 3-TIER INTENSITY DOCTRINE</div>
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            When you have exactly 3 visuals active (the preset rule), a common operator pattern is:
          </p>
          <ul className="space-y-2 pl-6 text-sm text-white/75 list-disc">
            <li><span className="text-amber-400 font-semibold">Primary (BOLD)</span> — the visual you are trading from. Its signals are your triggers.</li>
            <li><span className="text-amber-400 font-semibold">Secondary (NORMAL)</span> — the visual that provides context. Its readings shape your bias.</li>
            <li><span className="text-amber-400 font-semibold">Background (SUBTLE)</span> — the visual that provides orientation. Its readings frame the market regime.</li>
          </ul>
          <p className="text-white/80 text-sm leading-relaxed mt-3">
            This creates visual hierarchy. Your eye goes to the BOLD visual first, checks NORMAL for agreement, and glances at SUBTLE for context. Three different Intensity settings on the same chart, three different roles.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">SUBTLE IS NOT OFF</div>
          <p className="text-white/80 text-sm leading-relaxed">
            Intensity Subtle still draws the visual. It is quieter, not absent. If you want the visual to be truly hidden, use the master toggle at the top of the group. Confusing &ldquo;hard to see&rdquo; with &ldquo;turned off&rdquo; is a common rookie error — and it leads to complaints like &ldquo;my Risk Envelope disappeared&rdquo; when really the chart just zoomed out and Subtle fills became invisible at that zoom.
          </p>
        </div>
      </section>

      {/* ================ SECTION S13 — Three Visual-Layer Playbooks ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S13 · TUNING PLAYBOOKS</div>
        <h2 className="text-3xl font-bold mb-6">Three visual-layer playbooks to steal</h2>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            You do not have to derive a visual combination from scratch. Below are three playbooks built from the same 9 visual-layer groups you just learned, each tuned for a specific operator profile. Set the PRESET dropdown to <span className="text-white font-mono">None</span> first, then manually flip the toggles below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Playbook 1 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/25">
            <div className="text-xs font-bold tracking-widest text-teal-300 mb-3">PLAYBOOK 1</div>
            <h3 className="text-xl font-bold mb-4">The Scalper visuals</h3>
            <p className="text-sm text-white/70 mb-4 italic">1m–5m charts · fast reads · tight stops</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Structure</span>
                <span className="text-amber-400 text-xs font-mono">BOLD · Pivot=3</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Imbalance</span>
                <span className="text-amber-400 text-xs font-mono">NORMAL</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Pulse</span>
                <span className="text-amber-400 text-xs font-mono">SUBTLE · F=0.8</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/55 leading-relaxed">
              Structure is the primary — you scalp from levels. Imbalances are the target magnets. Tight Pulse provides the trigger, subtle so it does not dominate the small timeframe.
            </p>
          </div>

          {/* Playbook 2 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/25">
            <div className="text-xs font-bold tracking-widest text-amber-400 mb-3">PLAYBOOK 2</div>
            <h3 className="text-xl font-bold mb-4">The Swing trader visuals</h3>
            <p className="text-sm text-white/70 mb-4 italic">1H–4H charts · HTF alignment · wider stops</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Ribbon</span>
                <span className="text-amber-400 text-xs font-mono">BOLD · Div+Proj ON</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Spine</span>
                <span className="text-amber-400 text-xs font-mono">NORMAL</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Pulse</span>
                <span className="text-amber-400 text-xs font-mono">SUBTLE · F=1.8</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/55 leading-relaxed">
              Ribbon is your trend barometer — Divergence and Projection are your early-warning system. Spine is your confidence gauge. Wide Pulse (1.8) gives rare, high-conviction entries only.
            </p>
          </div>

          {/* Playbook 3 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-magenta-500/10 to-transparent border border-white/15" style={{ background: 'linear-gradient(135deg, rgba(239,83,80,0.10), transparent)' }}>
            <div className="text-xs font-bold tracking-widest text-rose-300 mb-3">PLAYBOOK 3</div>
            <h3 className="text-xl font-bold mb-4">The Structure reader</h3>
            <p className="text-sm text-white/70 mb-4 italic">15m–1H charts · pure chart reading · no signals</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Structure</span>
                <span className="text-amber-400 text-xs font-mono">BOLD · Pivot=5</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Imbalance</span>
                <span className="text-amber-400 text-xs font-mono">NORMAL</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-white">Cipher Sweeps</span>
                <span className="text-amber-400 text-xs font-mono">NORMAL</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/55 leading-relaxed">
              Zero signals on the chart — this is for operators who distrust automated triggers. Structure tells you where. Imbalance tells you the magnet. Sweeps tell you when liquidity was just grabbed. You make the call.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs font-bold tracking-wider text-amber-400 mb-2">THE BIG CAVEAT</div>
          <p className="text-white/80 text-sm leading-relaxed">
            These playbooks are starting points, not destinations. Run each for at least 20 trades before judging. If something does not feel right — a visual is too loud, too quiet, or fighting for attention — adjust one setting at a time and note the change. That is how you develop your own visual language.
          </p>
        </div>
      </section>

      {/* ================ SECTION S14 — Common Mistakes ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S14 · WHAT GOES WRONG</div>
        <h2 className="text-3xl font-bold mb-6">Common visual-layer mistakes</h2>

        <div className="space-y-4 text-white/80 leading-relaxed mb-8">
          <p>
            Every mistake in this list costs real operators real trades. They are listed in order of how often they show up in practice.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              num: 1,
              title: 'Stacking 5+ visuals on one chart',
              body: 'You turn on every visual because &ldquo;why not, I bought the PRO version.&rdquo; The chart becomes unreadable. You miss setups because your eye does not know where to look. THE FIX: pick 3 visuals max. Preset engine enforces it for a reason. Use presets until you earn the right to go None.',
            },
            {
              num: 2,
              title: 'Confusing display toggles with calculation toggles',
              body: 'You turn off Fair Value Line and expect the Mean Reversion Score to go dark. It does not — the sub-toggle is display only. THE FIX: read the S05 &ldquo;display vs calculation trap&rdquo; warning again. When a sub-toggle controls drawing vs calculation, the parent master toggle is what you want if you want the whole system gone.',
            },
            {
              num: 3,
              title: 'Changing Pulse ATR Factor mid-trade',
              body: 'You have an open position. You think &ldquo;the Pulse feels too tight&rdquo; and bump the factor from 1.5 to 2.0. Your tooltip SL recalculates. Your open trade&apos;s risk-reward is now different. You are mid-trade and you just changed the instrument. THE FIX: never retune mid-trade. Close the trade, adjust the instrument, open a new trade.',
            },
            {
              num: 4,
              title: 'Turning Pulse OFF and expecting signals to stop',
              body: 'The Pulse toggle is display only. Signals keep firing. THE FIX: to silence PX signals, go to Signal Engine (Part 2) and change it to Reversal or Visuals Only.',
            },
            {
              num: 5,
              title: 'Changing Structure defaults before you understand them',
              body: 'You drop Pivot Length from 5 to 2 because you want &ldquo;more zones.&rdquo; You get 30+ zones. The chart is noise. You cannot tell which zones matter. THE FIX: change one default at a time, wait 20 bars, evaluate. Run the defaults for a full session before deciding anything is wrong with them.',
            },
            {
              num: 6,
              title: 'Picking a preset and thinking you are done',
              body: 'Presets are training wheels. They work on average. Your specific market is not average. THE FIX: use a preset for 1–2 weeks, pay attention to when it feels wrong, then graduate to None and build your own.',
            },
          ].map((m) => (
            <div key={m.num} className="flex gap-4 p-5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                {m.num}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1" dangerouslySetInnerHTML={{ __html: m.title }} />
                <p className="text-sm text-white/75 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.body }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION S15 — Game + Quiz + Certificate ================ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">S15 · PROVE IT</div>
        <h2 className="text-3xl font-bold mb-6">Game · Quiz · Certificate</h2>
        <p className="text-white/70 leading-relaxed mb-8">
          Five rounds of cascade-reading, followed by an eight-question quiz. Pass the quiz at 66% and you unlock your PRO certificate for Lesson 11.3a.
        </p>

        {/* ---------- GAME ---------- */}
        {!gameActive && !gameComplete && (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 mb-8">
            <div className="text-xs font-bold tracking-widest text-amber-400 mb-3">INTERACTIVE CHALLENGE</div>
            <h3 className="text-2xl font-bold mb-4">The Silent Cascade — 5 scenarios</h3>
            <p className="text-white/75 leading-relaxed mb-6">
              Each round puts you in a situation where a single settings change ripples through CIPHER. Your job: pick the correct downstream effect. No time limit. Full explanations on each answer.
            </p>
            <button
              onClick={() => setGameActive(true)}
              className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wide transition"
            >
              START GAME →
            </button>
          </div>
        )}

        {gameActive && !gameComplete && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold tracking-widest text-amber-400">ROUND {gameRound + 1} OF {gameRounds.length}</div>
              <div className="flex gap-1.5">
                {gameRounds.map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1.5 rounded-full ${
                      gameSelections[i] ? 'bg-amber-400' : i === gameRound ? 'bg-white/40' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6 p-5 rounded-lg bg-black/30 border border-white/10">
              <div className="text-[10px] font-bold tracking-widest text-white/40 mb-2">SCENARIO</div>
              <p className="text-white/90 leading-relaxed">{gameRounds[gameRound].scenario}</p>
            </div>

            <div className="text-sm font-bold text-white/80 mb-3">{gameRounds[gameRound].prompt}</div>

            <div className="space-y-3 mb-6">
              {gameRounds[gameRound].options.map((opt) => {
                const selected = gameSelections[gameRound] === opt.id;
                const showCorrectness = selected;
                const isCorrect = opt.correct;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (gameSelections[gameRound] !== null) return;
                      const next = [...gameSelections];
                      next[gameRound] = opt.id;
                      setGameSelections(next);
                    }}
                    disabled={gameSelections[gameRound] !== null}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      showCorrectness
                        ? isCorrect
                          ? 'bg-teal-500/15 border-teal-500/50'
                          : 'bg-rose-500/15 border-rose-500/50'
                        : 'bg-white/5 border-white/10 hover:border-amber-500/40'
                    } ${gameSelections[gameRound] !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {opt.id.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-white/90">{opt.text}</div>
                        {showCorrectness && (
                          <div className="mt-2 text-sm text-white/70 italic">{opt.explain}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {gameSelections[gameRound] !== null && (
              <button
                onClick={() => {
                  if (gameRound < gameRounds.length - 1) {
                    setGameRound(gameRound + 1);
                  } else {
                    setGameComplete(true);
                    setGameActive(false);
                  }
                }}
                className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wide transition"
              >
                {gameRound < gameRounds.length - 1 ? 'Next Round →' : 'Finish Game →'}
              </button>
            )}
          </div>
        )}

        {gameComplete && (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/30 mb-8">
            <div className="text-xs font-bold tracking-widest text-teal-300 mb-3">GAME COMPLETE</div>
            <h3 className="text-2xl font-bold mb-4">Cascade reading — checked</h3>
            <p className="text-white/75 leading-relaxed mb-6">
              You worked through all 5 scenarios. Now take the quiz to earn your Lesson 11.3a certificate. 8 questions. 66% to pass.
            </p>
            {!quizActive && (
              <button
                onClick={() => setQuizActive(true)}
                className="px-6 py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold tracking-wide transition"
              >
                START QUIZ →
              </button>
            )}
          </div>
        )}

        {/* ---------- QUIZ ---------- */}
        {quizActive && !quizSubmitted && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold tracking-widest text-amber-400">FINAL QUIZ · 8 QUESTIONS · 66% TO PASS</div>
              <div className="text-xs text-white/50 font-mono">
                {quizAnswers.filter((a) => a !== null).length} / {quizQuestions.length} answered
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {quizQuestions.map((q, qi) => (
                <div key={q.id} className="p-5 rounded-lg bg-black/30 border border-white/10">
                  <div className="text-xs font-bold text-amber-400 mb-2">Q{qi + 1}</div>
                  <div className="text-white/90 mb-4 leading-relaxed">{q.question}</div>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = quizAnswers[qi] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const next = [...quizAnswers];
                            next[qi] = opt.id;
                            setQuizAnswers(next);
                          }}
                          className={`w-full text-left p-3 rounded border transition text-sm ${
                            selected
                              ? 'bg-amber-500/15 border-amber-500/50 text-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/30'
                          }`}
                        >
                          <span className="inline-block w-5 text-xs font-mono text-white/40 mr-2">{opt.id.toUpperCase()}.</span>
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={quizAnswers.some((a) => a === null)}
              className={`px-6 py-3 rounded-lg font-bold tracking-wide transition ${
                quizAnswers.some((a) => a === null)
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              SUBMIT QUIZ →
            </button>
            <p className="text-xs text-white/40 mt-2 italic">Answer all {quizQuestions.length} questions to submit.</p>
          </div>
        )}

        {quizSubmitted && (
          <div className={`p-8 rounded-2xl border mb-8 ${quizPassed ? 'bg-gradient-to-br from-teal-500/15 to-transparent border-teal-500/40' : 'bg-gradient-to-br from-rose-500/15 to-transparent border-rose-500/40'}`}>
            <div className={`text-xs font-bold tracking-widest mb-3 ${quizPassed ? 'text-teal-300' : 'text-rose-300'}`}>
              {quizPassed ? 'PASSED' : 'TRY AGAIN'}
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Score: {quizScore} / {quizQuestions.length} · {quizPercent}%
            </h3>
            <p className="text-white/75 leading-relaxed mb-6">
              {quizPassed
                ? 'You have demonstrated mastery of the visual-layer inputs. Your PRO certificate is unlocked below.'
                : `You need 66% to pass. You scored ${quizPercent}%. Review the sections, then retry.`}
            </p>

            <div className="mb-6">
              <div className="text-xs font-bold tracking-widest text-white/50 mb-3">REVIEW</div>
              <div className="space-y-3">
                {quizQuestions.map((q, qi) => {
                  const correctId = q.options.find((o) => o.correct)?.id;
                  const yourId = quizAnswers[qi];
                  const correct = yourId === correctId;
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border text-sm ${correct ? 'bg-teal-500/5 border-teal-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${correct ? 'bg-teal-500 text-black' : 'bg-rose-500 text-black'}`}>
                          {correct ? '✓' : '✕'}
                        </span>
                        <div className="flex-1">
                          <div className="text-white/85 mb-1 text-xs">Q{qi + 1}. {q.question}</div>
                          <div className="text-xs text-white/60 italic">{q.explain}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!quizPassed && (
              <button
                onClick={() => {
                  setQuizAnswers(new Array(quizQuestions.length).fill(null));
                  setQuizSubmitted(false);
                }}
                className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wide transition"
              >
                RETRY QUIZ →
              </button>
            )}
          </div>
        )}

        {/* ---------- CERTIFICATE ---------- */}
        {quizPassed && quizSubmitted && (
          <div className="relative mb-8">
            {certRevealed && <Confetti active={certRevealed} />}
            <div
              className="relative p-10 rounded-2xl border overflow-hidden"
              style={{
                background: 'conic-gradient(from 180deg at 50% 50%, rgba(255,179,0,0.15) 0deg, rgba(38,166,154,0.12) 120deg, rgba(255,196,61,0.15) 240deg, rgba(255,179,0,0.15) 360deg)',
                borderColor: 'rgba(255,196,61,0.5)',
              }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <div className="text-xs font-bold tracking-widest text-amber-400">PRO · LEVEL 11 · CERTIFICATE</div>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-4xl font-bold mb-2">CIPHER Visual Layer Mastery</h3>
                <p className="text-white/70 italic mb-6">Lesson 11.3a · Part 1</p>

                <div className="inline-block p-6 rounded-xl bg-black/40 border border-amber-400/30 mb-6">
                  <div className="text-[10px] tracking-widest text-white/50 mb-1">CERT ID</div>
                  <div className="text-lg font-mono text-amber-400">{certId}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-6">
                  <div>
                    <div className="text-[10px] tracking-widest text-white/40 mb-1">QUIZ</div>
                    <div className="text-white/80 font-mono">{quizScore} / {quizQuestions.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-white/40 mb-1">SCORE</div>
                    <div className="text-white/80 font-mono">{quizPercent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-white/40 mb-1">DATE</div>
                    <div className="text-white/80 font-mono text-sm">{new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>

                <p className="text-sm text-white/60 max-w-xl mx-auto italic">
                  Certified operator of CIPHER&apos;s visual layer — 9 groups, 26 inputs, and the Silent Cascade doctrine.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================ FOOTER NAV ================ */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/academy/lesson/cipher-command-center-anatomy"
            className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition"
          >
            <div className="text-[10px] font-bold tracking-widest text-white/40 mb-2">← PREVIOUS</div>
            <div className="text-white font-bold group-hover:text-amber-400 transition">Lesson 11.2 · The CIPHER Command Center — Anatomy</div>
          </Link>
          <Link
            href="/academy"
            className="group p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition"
          >
            <div className="text-[10px] font-bold tracking-widest text-amber-400 mb-2">NEXT →</div>
            <div className="text-white font-bold group-hover:text-amber-300 transition">Lesson 11.3b · Inputs Anatomy Part 2 (coming soon)</div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/academy" className="text-xs text-white/40 hover:text-white/70 transition">
            ← Return to Academy
          </Link>
        </div>
      </section>
    </div>
  );
}

