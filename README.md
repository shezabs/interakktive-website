# ATLAS Academy — Deployment Guide
# Verified against your live codebase

## Files Included

```
app/
├── academy/
│   ├── layout.tsx                        # Standalone layout (hides nav/footer like War Room)
│   ├── page.tsx                          # /academy landing page
│   └── lesson/
│       └── what-is-trading/
│           └── page.tsx                  # Full interactive Lesson 1
├── lib/
│   └── academy-data.ts                  # Course & lesson definitions
supabase/
└── academy-schema.sql                    # Tables + RLS + seed data
```

## Verified Compatibility
- ✅ framer-motion ^11.0.0 (installed in your package.json)
- ✅ lucide-react ^0.344.0 (installed — used for icons on landing page)
- ✅ @/* path alias maps to ./* (confirmed in tsconfig.json)
- ✅ Standalone layout pattern matches your war-room/layout.tsx
- ✅ Dark background compatible with your globals.css body styles
- ✅ bg-clip-text uses translateZ(0) fix from your globals.css
- ✅ No existing files modified — all new files only

## Deployment Steps

### 1. Supabase SQL (do first)
- Go to Supabase Dashboard → SQL Editor
- Paste contents of `supabase/academy-schema.sql` → Run
- Creates: academy_courses, academy_lessons, academy_progress, academy_certificates
- All RLS-protected, seeded with Level 1 + Lesson 1

### 2. Extract into your project
```bash
cd "C:\Users\sheza_lfgh1\OneDrive\Desktop\interakktive-website"
tar xzf atlas-academy-final.tar.gz
```

This creates:
- app/academy/layout.tsx (NEW)
- app/academy/page.tsx (NEW)
- app/academy/lesson/what-is-trading/page.tsx (NEW)
- app/lib/academy-data.ts (NEW)

No existing files are touched.

### 3. Deploy
```bash
git add -A
git commit -m "feat: ATLAS Academy with interactive Lesson 1 - What Is Trading"
git push origin main
```

### 4. Test
- https://www.interakktive.com/academy
- https://www.interakktive.com/academy/lesson/what-is-trading

## What's In Lesson 1
- Cinematic hero with animated gradient text
- 3 animated canvas story scenes (barter → money → modern markets)
- 4 concept cards with hover micro-interactions
- Live BTC/USD trading simulator (fake prices)
- Market types timeline
- 3-question quiz with instant feedback
- Certificate of completion with confetti (66%+ to pass)
- Scroll progress tracker in sticky nav
- Fully mobile responsive

## Notes
- Academy has its own layout.tsx that hides your site nav/footer (like War Room)
- The "back to site" link in the academy nav goes to /
- Only Lesson 1 is active — others show as locked
- The supabase/ folder is just for reference (SQL runs in dashboard, not deployed)
