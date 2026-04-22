# Level 11 Bundle — Lesson 11.4 (The 3-Regime Engine)

## ⚠️ HOLD — DO NOT DEPLOY YET

This bundle is **staged for a combined 11.4 + 11.5 deploy**. Shezab's decision: hold
until 11.5 is complete, then ship both in one tarball push. Back up this file
locally but do NOT extract into the live repo yet.

When 11.5 is ready, I'll produce a combined `level-11-bundle_4-and-5.tar.gz` that
supersedes this one.

---

## What's inside

| File | Purpose | Lines |
|------|---------|-------|
| `app/academy/lesson/cipher-regime-engine/page.tsx` | **NEW** · The lesson itself | 2,809 |
| `app/lib/academy-data.ts` | **UPDATED** · Lesson 11.4 registered in Level 11 course's `lessons` array | 343 |
| `app/academy/page.tsx` | **UPDATED** · `cipher-regime-engine` added to allowlist | 331 |

---

## Lesson metadata

- **Title:** The 3-Regime Engine
- **Slug:** `cipher-regime-engine`
- **Course:** `level-11-cipher-pro-mastery`
- **Sections:** 17 (Hero + S00–S15 + S16 Game + S17 Quiz)
- **Animations:** 13 hand-coded canvas animations
- **Game:** 5 scenario rounds (Regime Reader)
- **Quiz:** 8 questions · 66% pass threshold
- **Estimated time:** 42 minutes
- **Certificate:** Regime Reader Operator
- **Groundbreaking Concept (S01):** ⭐ The Regime as Forecaster, Not Observer

---

## Coverage

This is the **first lesson of the Regime Engine Arc** (11.4 → 11.7). It teaches
CIPHER's 3-regime classification system and the Regime Transition Predictor (RTP).

### Section breakdown

| # | Section | What it covers |
|---|---------|-----------------|
| Hero | The 3-Regime Engine — TREND · RANGE · VOLATILE | — |
| S00 | First — Why This Matters | The single most misread signal on the chart |
| S01 | ⭐ The Regime as Forecaster, Not Observer | RTP core mechanism |
| S02 | The Three Regimes | TREND / RANGE / VOLATILE triptych |
| S03 | The Three-Score Math | trend_pct / volatile_pct / range_pct formulas |
| S04 | TREND — The ADX-Driven State | ADX × 2.5 → trend_pct |
| S05 | VOLATILE — The ATR Spike State | vol_spike = atr / atr_slow, 1.5×/2.0× thresholds |
| S06 | RANGE — What's Left Over | The residual regime design philosophy |
| S07 | The Tie-Break Priority | TREND > VOLATILE > RANGE |
| S08 | The Regime Transition Predictor | Sigmoid probability + 30-deep rolling history |
| S09 | Reading the Regime Row | Three cells: label / state / guidance |
| S10 | The Five Downstream Effects | header / action / guidance / envelope / alert JSON |
| S11 | VOLATILE Widens the Envelope | +10% band scale in VOLATILE only |
| S12 | No Hysteresis — The Honest Tradeoff | Why RTP guidance, not bar-lock, is the stability layer |
| S13 | Three Regime Playbooks | Entry / stop / size / avoid for each regime |
| S14 | Common Mistakes (6 red cards) | Reading only state, assuming persistence, flicker-trading, ignoring VOLATILE, wrong playbook, hiding the row |
| S15 | The Regime Cheat Sheet | Screenshot-this summary |
| S16 | Scenario Game | 5 rounds, per-option explanations |
| S17 | Knowledge Check | 8 questions, cert at 66%+ |

### Animations (13 total)

All hand-coded Canvas2D with `AnimScene` primitive. Brand-compliant colors only:
TEAL #26A69A (TREND, positive) · AMBER #FFB300 (RANGE, uncertainty) · MAGENTA #EF5350
(VOLATILE, negative).

1. `RegimeForecasterAnim` — 4-scene cycle (naive → CIPHER view → probability rising → transition fires)
2. `RegimeTriptychAnim` — three chart snippets showing each regime's visual signature
3. `ThreeScoreAnim` — three racing bars, tallest wins per scene
4. `ADXScaleAnim` — oscillating ADX needle (0→50) with live trend_pct readout
5. `ATRSpikeAnim` — ATR line breathing around ATR_slow baseline, crossing 1.5×/2.0× thresholds
6. `RangeResidualAnim` — three-cup overflow metaphor (TREND + VOLATILE fill, RANGE = residual)
7. `TieBreakAnim` — four tie scenarios resolved by priority
8. `RTPTimelineAnim` — sigmoid curve with animated position marker + live duration/avg/probability
9. `RegimeRowAnim` — 5-scene Command Center row replay (cycles through all regime + transition states)
10. `CascadeFiveAnim` — center regime bubble + 5 satellite cards lighting up
11. `EnvelopeWideningAnim` — side-by-side TREND vs VOLATILE bands on identical price action
12. `NoHysteresisAnim` — top strip: flickering raw regime · bottom strip: stable RTP guidance
13. `PlaybookMatrixAnim` — 3 playbook cards rotating highlight with entry/stop/size/avoid

---

## Verification record

All 3 files parse clean under SWC:
- `app/academy/lesson/cipher-regime-engine/page.tsx` ✓
- `app/lib/academy-data.ts` ✓
- `app/academy/page.tsx` ✓

Structural audit (lesson page.tsx):
- Line count: 2,809
- Gold sections (max-w-2xl): 19 ✓
- `max-w-4xl` remaining: 0 ✓
- Gold h2 count: 17 ✓
- Sequential labels 01 → 17, no gaps ✓
- All 13 animations defined + used exactly once ✓
- 6 red mistake cards ✓
- `<section>` balance: 20 / 20 ✓
- `<motion.div>` balance: 27 / 27 ✓
- `'use client'` directive on line 6 ✓
- File ends with `}` ✓

---

## When 11.5 is ready — installation instructions

You'll receive a combined tarball (e.g., `level-11-bundle_4-and-5.tar.gz`) that
includes **both** lessons. Treat this 11.4-only tarball as the single-lesson
fallback if we ever need to ship 11.4 alone.

### To install the combined bundle (when it arrives)

1. **Backup first:**
   ```bash
   cd ~/OneDrive/Desktop && STAMP=$(date +%Y-%m-%d_%H-%M) && mkdir -p interakktive-backups && tar --exclude='interakktive-website/node_modules' --exclude='interakktive-website/.next' --exclude='interakktive-website/.turbo' --exclude='interakktive-website/.vercel' -czf "interakktive-backups/interakktive-website_pre-11-4-5_${STAMP}.tar.gz" interakktive-website/
   ```

2. **Extract the combined bundle at repo root:**
   ```bash
   cd ~/OneDrive/Desktop/interakktive-website
   tar -xzf /path/to/level-11-bundle_4-and-5.tar.gz
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```
   Navigate to:
   - `http://localhost:3000/academy/lesson/cipher-regime-engine`
   - `http://localhost:3000/academy/lesson/<11-5-slug>`

4. **Commit and push when both lessons pass your review:**
   ```bash
   git add -A
   git commit -m "Academy: ship Lessons 11.4 (3-Regime Engine) and 11.5"
   git push
   ```

---

## Rollback (if ever needed)

```bash
cd ~/OneDrive/Desktop
rm -rf interakktive-website-broken
mv interakktive-website interakktive-website-broken
tar -xzf interakktive-backups/interakktive-website_pre-11-4-5_<timestamp>.tar.gz
cd interakktive-website && npm install
```

---

## Changes from earlier 11.x bundles

None — same 3-file surface as 11.1, 11.2, 11.3a, 11.3b. Same Gold standard format
(max-w-2xl, Crown badge, PRO · LEVEL 11 nav, conic-gradient certificate).
