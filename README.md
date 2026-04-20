# Level 11 — Consolidated Bundle (Lessons 11.3a + 11.3b)

**Everything built in this session, in one tarball.** Deploy both CIPHER Inputs Anatomy lessons together.

## What's inside

| File | Status | Lines | Purpose |
|------|--------|-------|---------|
| `app/academy/lesson/cipher-inputs-anatomy-part-1/page.tsx` | **NEW** | 4,321 | Lesson 11.3a (Visual Layer) |
| `app/academy/lesson/cipher-inputs-anatomy-part-2/page.tsx` | **NEW** | 3,997 | Lesson 11.3b (Behavioral Layer) |
| `app/lib/academy-data.ts` | **UPDATED** | 342 | Registers both 11.3a and 11.3b in Level 11 |
| `app/academy/page.tsx` | **UPDATED** | 330 | Adds both slugs to allowlist |

**Total: 8,990 lines of code.** Two lessons, registered and allowlisted.

## Combined lesson stats

| Metric | 11.3a | 11.3b | Combined |
|--------|-------|-------|----------|
| Lines of code | 4,321 | 3,997 | 8,318 |
| Sections | 16 | 16 | 32 |
| Animations | 14 | 14 | 28 |
| Game rounds | 5 | 5 | 10 |
| Quiz questions | 8 | 8 | 16 |
| Estimated study time | 45 min | 50 min | 95 min |
| Inputs taught | 26 (9 groups) | 33 (3 groups) | **59 across 12 groups (COMPLETE)** |

## What this completes

The full **CIPHER Inputs Anatomy tour**. Students who complete both 11.3a and 11.3b know every one of the 59 CIPHER PRO inputs by:
- Name
- Default value
- Range and step
- What it controls (display vs calculation)
- How it interacts with other settings (silent cascade, cross-group cascade)
- When to change it from default
- Common mistakes and their fixes

## How to install

### 1. Backup first
```bash
cd /path/to/interakktive
git add -A && git stash push -m "pre-11.3-consolidated-$(date +%Y%m%d-%H%M)"
```

### 2. Extract at repo root
```bash
tar -xzf level-11-consolidated-bundle.tar.gz
```

Files land in the correct `app/...` paths.

### 3. Test locally
```bash
npm run dev
```

Navigate to:
- `http://localhost:3000/academy` — Level 11 should now show **4 lessons** (11.1, 11.2, 11.3a, 11.3b)
- `http://localhost:3000/academy/lesson/cipher-inputs-anatomy-part-1` — test 11.3a
- `http://localhost:3000/academy/lesson/cipher-inputs-anatomy-part-2` — test 11.3b

### 4. Take both lessons as a student
- Click through all sections (watch animations play)
- Play the 5-round game (look for per-round feedback working)
- Take the 8-question quiz (need 66% to pass)
- Earn the certificate with confetti on pass
- Follow the footer nav forward from 11.3a → 11.3b → Academy

### 5. Commit and push
```bash
git add -A
git commit -m "Academy L11: ship Lessons 11.3a + 11.3b (CIPHER Inputs Anatomy — complete)"
git push
```

### 6. Watch Vercel deploy
Vercel auto-deploys. Check the build log if anything fails.

## What to verify in production after deploy

- `/academy` loads, Level 11 card shows 4 lessons
- Both lesson URLs return 200 OK
- Neither lesson returns 404
- Animations render correctly (check the Arrow Tally hero on 11.3b — it's the most complex)
- Certificate confetti fires on quiz pass

## Lesson 11.3a — Visual Layer

**Slug:** `cipher-inputs-anatomy-part-1`
**Groundbreaking Concept:** ⭐ The Silent Cascade

Covers the 9 visual-layer groups (26 inputs):
1. PRESET (1 input) — the override engine with 7 options
2. CIPHER RIBBON (4 inputs) — with PRO-exclusive Divergence and Projection
3. CIPHER RISK ENVELOPE (5 inputs) — concentric zones + Fair Value gravity
4. CIPHER STRUCTURE (6 inputs) — lifecycle-managed S/R
5. CIPHER SPINE (2 inputs) — health-adaptive breathing bands
6. CIPHER IMBALANCE (2 inputs) — shrinking FVG boxes
7. CIPHER SWEEPS (1 input) — liquidity raids with 3-bar context
8. CIPHER COIL (1 input) — BB/KC squeeze with breakout diamond
9. CIPHER PULSE (4 inputs) — the signal engine with Pulse ATR Factor

Plus: Intensity universal language, 3 visual-layer playbooks (Scalper / Swing / Structure reader), 6 common mistakes.

## Lesson 11.3b — Behavioral Layer

**Slug:** `cipher-inputs-anatomy-part-2`
**Groundbreaking Concept:** ⭐ The Arrow Is the Last Word

Covers the 3 behavioral-layer groups (33 inputs):
1. SIGNAL ENGINE (4 inputs) — Signal Engine dropdown, Direction, Strong Signals Only (4-factor gate), Cipher Candles (7 modes)
2. CIPHER RISK MAP (10 inputs) — 3 display toggles + 4 SL methods + 4 TP methods + TP1/TP2/TP3 targets
3. COMMAND CENTER (19 inputs) — master + Position + Size + 16 row toggles (6 families)

Plus: The 4-factor conviction audit, asset-class routing (Auto = router), canonical scale-out sequence (TP1 → 33% off + SL to BE), Cross-Group Cascade doctrine, 3 behavioral playbooks (Trend Follower / Mean Reversion / Structure-Based), 6 common mistakes.

## Doctrines established across both lessons

| Doctrine | Where |
|----------|-------|
| The Silent Cascade (within-group ripples) | 11.3a S01 |
| The Arrow Is the Last Word (4 votes → 1 arrow) | 11.3b S01 |
| The Cross-Group Cascade (3 settings → 8 systems) | 11.3b S12 |
| The Canonical Scale-Out Sequence (TP1 → 33% + SL to BE) | 11.3b S09 |
| Auto SL/TP is a Router (asset-class routing) | 11.3b S07 |

## Rollback if anything breaks

```bash
# Discard the extracted files, restore the pre-deploy state
git stash pop
```

Then report what broke and I'll patch.

## Not in this bundle

- **11.1 and 11.2** — already live on production, untouched by this bundle
- **`tv-username-edit.tar.gz`** — still on hold per your instruction; do NOT deploy unless explicitly told to
- **Anything beyond 11.3** — roadmap for 11.4–11.20 exists but not yet built

## After this deploys

Level 11 status will be:

| Lesson | Status |
|--------|--------|
| 11.1 Why CIPHER — Operator Contract | ✅ LIVE |
| 11.2 Command Center — Anatomy | ✅ LIVE |
| 11.3a Inputs Anatomy — Visual Layer | ✅ LIVE (after this push) |
| 11.3b Inputs Anatomy — Behavioral Layer | ✅ LIVE (after this push) |
| 11.4–11.20 (17 lessons remaining) | ⏳ Pending |

## Verification

All 4 files parse clean under SWC:
- `app/academy/lesson/cipher-inputs-anatomy-part-1/page.tsx` ✓
- `app/academy/lesson/cipher-inputs-anatomy-part-2/page.tsx` ✓
- `app/lib/academy-data.ts` ✓
- `app/academy/page.tsx` ✓

No shared components touched. No styling changes. No config changes. No dependencies added. Surgical 4-file deploy.

---

*Built in a single session. Test carefully. Push when ready.*
