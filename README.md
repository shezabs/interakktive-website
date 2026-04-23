# Lesson 11.7 + 11.8 — Gold Standard Expansion (Joint Deploy)

## Scope
Two files updated. No changes to academy-data.ts or allowlist — already correct.

- app/academy/lesson/cipher-regime-sizing/page.tsx       (11.7)
- app/academy/lesson/cipher-signal-philosophy/page.tsx   (11.8)

## Lesson 11.7 — Regime-Based Position Sizing

### Content fixes
- BandScaleAnim — VOLATILE max corrected 1.25× → 1.35× (with vol bonus)
- SameCandleAnim — VOLATILE scale updated, regime color fixed to AMBER
- TransitionJourneyAnim — fabricated "JUST HIT WATCH" removed (no such product message)
- S01 caption — updated to match corrected band scales

### 5 new animations
- DwellEscalationAnim — SPIKE/VISIT/ESTABLISHED/ENTRENCHED progression
- StopPlacementAnim — asymmetric stops in a Bull Trend
- DrawdownSimulatorAnim — RANGE+DANGER vs TREND+SAFE equity-curve comparison
- LiveDecisionLoopAnim — 4 inputs → 1 size converger
- ConfluenceAlertAnim — zone+dwell+MR all firing = full exit

### 5 new teaching sections
- S09 Dwell Phases
- S10 Stop Placement in a Trend
- S11 Position Sizing Math
- S12 Decision Loop
- S13 Confluence Exit
(Old S09-S13 renumbered to S14-S18)

### Metrics
- Lines: 1,101 → 1,648
- Animations: 8 → 13
- Teaching sections: 14 → 20

## Lesson 11.8 — The Signal Philosophy

### Content fix
- FinalGateAnim scene 4 — label corrected (clearly differentiates OR-false vs Strong-Only-false)

### 5 new animations
- PXMechanicsAnim — 3-check breakdown (body / distance / rapid-flip)
- TSConditionsAnim — 4-condition checklist
- DirectionFilterAnim — two streams, one gate
- StrongThresholdAnim — slider with 6 sample candidates
- LabelAnatomyAnim — label explodes apart with annotations

### 5 new teaching sections
- S03 PX Mechanics
- S04 TS Conditions
- S07 Direction Filter in Action
- S09 Strong Only: The 3+ Threshold
- S11 Signal Label Anatomy
(Old S03-S08 renumbered, downstream cascade to S14-S17)

### Metrics
- Lines: 1,160 → 1,734
- Animations: 8 → 13
- Teaching sections: 13 → 19

## Joint metrics
- Both lessons: no Pine refs, no line numbers, no screenshot mentions in any student-facing content
- Both lessons: SWC parse OK
- Both lessons: gold-standard-compliant on structure, sections, animations, body prose

## Deploy
```
cd ~/OneDrive/Desktop/interakktive-website && tar -xzf ~/Downloads/lessons-11-7-and-11-8-GOLD.tar.gz
git add -A && git commit -m "Academy: expand 11.7 and 11.8 to gold-standard depth"
git push origin main
```
