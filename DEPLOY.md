# War Room Truncation — Deploy

Retires the `/war-room` AI chat product. Silent redirect to homepage. Academy lesson L11.24 (a separately-named pedagogy lesson) is intentionally untouched.

## What's in this tarball

```
app/war-room/page.tsx        (REPLACES the existing file with a 1-line redirect to '/')
```

## What you must DELETE manually (tarball can't do this)

```
app/war-room/layout.tsx          ← removes the "hide nav/footer" layout
app/api/war-room/route.ts        ← removes the Anthropic API proxy
app/api/war-room/                ← remove the now-empty directory
```

## Deploy steps

```bash
cd ~/OneDrive/Desktop/interakktive-website

# 1. Delete the obsolete files
rm app/war-room/layout.tsx
rm app/api/war-room/route.ts
rmdir app/api/war-room

# 2. Extract the new redirect page (overwrites the existing page.tsx)
tar -xzf ~/Downloads/war-room-truncation.tar.gz

# 3. Verify the four-line deletion + one-line replacement
git status
# Expected:
#   modified:   app/war-room/page.tsx
#   deleted:    app/war-room/layout.tsx
#   deleted:    app/api/war-room/route.ts

# 4. Commit + push
git add app/war-room/ app/api/
git commit -m "chore: retire /war-room (AI chat product) — silent redirect to home"
git push origin main
```

Vercel deploys in 60-90s.

## Post-deploy cleanup in Vercel (manual)

Once you've verified the redirect works on prod, go to Vercel dashboard:

1. Project → Settings → Environment Variables
2. **Remove** `ANTHROPIC_API_KEY` (sensitive production key, no longer used)
3. Leave `WAR_ROOM_PASSWORD` if you want — it's just a string, no risk. Or remove for cleanliness.

This stops any future Anthropic API charges immediately.

## Verify on prod

- Visit `https://interakktive.com/war-room` → should silently redirect to homepage
- Try POSTing to `https://interakktive.com/api/war-room` → should return 404 (route no longer exists)
- Academy L11.24 (`/academy/lesson/cipher-war-room-integration`) → renders normally, unchanged

## What was NOT changed (intentional)

- `app/academy/lesson/cipher-war-room-integration/page.tsx` — L11.24 lesson stays. It teaches trader workflow / desk choreography. Different product from the AI chat tool — just shares a name.
- `app/academy/lesson/cipher-risk-map/page.tsx` — has a roadmap paragraph mentioning L11.24. Stays.
- `app/academy/lesson/cipher-conviction-synthesis/page.tsx` — has forward-refs to L11.24 in arc text. Stays.
- `app/lib/academy-data.ts` + `app/lib/academy-helpers.ts` — lesson metadata for L11.24. Stays.

The "War Room Operator" certificate from L11.24 remains a legitimately earned credential.

## Reversibility

Not built in. To revive the AI chat product:
1. Restore the deleted files from the `interakktive-website_affiliate-phase1-shipped_2026-05-15.tar.gz` backup
2. Restore `ANTHROPIC_API_KEY` in Vercel
3. Redeploy

Files are still in git history forever (`git log --oneline --diff-filter=D -- app/api/war-room/route.ts`).

## Total impact

- **Removed**: 532 lines (435 + 14 + 83)
- **Added**: 17 lines (the redirect file)
- **Net delta**: −515 lines
- **TypeScript**: 0 errors
- **API spend**: ANTHROPIC_API_KEY usage drops to zero on this route once deployed
