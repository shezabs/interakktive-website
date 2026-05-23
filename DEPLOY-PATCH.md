# Affiliate System Phase 1.1 — Patch

Single-file patch to `/affiliates` page. No SQL, no API, no admin changes.

## What's in this tarball

```
app/affiliates/page.tsx  (modified — replaces the one shipped in Phase 1)
```

## What this patch changes

1. **Pricing fix in "Real Revenue" card** — annual range corrected from "$480 to $960" → "$500 to $1,000"
2. **Calculator pricing constants** — PLAN_PRICING annual prices updated to $500 / $750 / $1,000
3. **Calculator UX** — the confusing "% annual sales" slider replaced with a clean 3-button choice (Mostly monthly / 50-50 / Mostly annual) with an explainer line about why annual mix matters
4. **Two new sections added** between "Why partner with us" and "Who it's for":
   - **S02 — What you'd be recommending** — explains the product depth: ATLAS PRO Suite, ATLAS Prop, ATLAS Academy (156 lessons + verifiable certifications)
   - **S03 — Why customers stay** — covers Live Discord discussions, YouTube channel, Recorded video library, Direct messaging access. Closes with the retention-payoff line.
5. **Section numbering renumbered** sequentially 01 → 10 across the whole page
6. **War Room not mentioned anywhere on this page** (per direction — feature being truncated)

Page goes from ~820 lines to 947 lines. TypeScript: 0 errors.

## Deploy

```bash
cd ~/OneDrive/Desktop/interakktive-website
tar -xzf affiliate-system-phase1.1-patch.tar.gz
git diff app/affiliates/page.tsx                 # eyeball the changes
git add app/affiliates/page.tsx
git commit -m "fix(affiliates): correct pricing, replace annual slider with 3-button choice, add product + retention sections"
git push origin main
```

Vercel deploys in 60-90s. No DB migration needed. No env changes needed.

## Verify on prod

- "Real revenue" card now reads "$500 to $1,000" (not $480 to $960)
- Calculator no longer has a "% annual sales" slider — instead 3 buttons (Mostly monthly / 50-50 / Mostly annual)
- New section "What you'd be recommending" with 3 cards (ATLAS PRO Suite, ATLAS Prop, ATLAS Academy)
- New section "Why customers stay" with 4 cards (Discord, YouTube, Video library, Direct messaging) and an amber callout closing line
- Section numbering reads 01 / 02 / 03 / 04 / 05 / 06 / 07 / 08 / 09 / 10 top to bottom
