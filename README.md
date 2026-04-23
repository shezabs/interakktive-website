# Admin Panel — Round 1

**What this ships:** a full admin panel at `/admin` with four tabs:
1. **Overview** — MRR, sub counts, churn, recent activity, alerts strip
2. **Users** — full user table with detail drawer (edit TV username, resend verification, ban/unban, delete)
3. **Subscriptions** — table + drawer with plan editing, force cancel, reactivate, extend period, reset swap, grant comp, mark TV invite sent
4. **Audit Log** — every admin action logged with before/after JSON snapshots

**Auth model:** hardcoded email allowlist in middleware + API-side check.
Admin emails:
- `shezabmediaworxltd@gmail.com` (Shezab)
- `mustafamoinmirza@icloud.com` (Mustafa)

Non-admin users hitting `/admin/*` get redirected to home with no error (avoids leaking the existence of admin routes). `/api/admin/*` returns 401.

---

## Deploy steps

### 1. Run the SQL **FIRST** in Supabase SQL Editor

Open `supabase/admin-schema.sql` and run it in the Supabase SQL Editor. This:
- Adds `tv_invite_sent` (boolean) and `admin_notes` (text) columns to the `subscriptions` table
- Creates the `admin_audit_log` table with indexes and RLS policy

**Must be done before the code deploys**, or the admin APIs will 500 on missing columns.

### 2. Extract the tarball into the repo

```bash
cd ~/OneDrive/Desktop/interakktive-website && tar -xzf ~/Downloads/admin-panel-round-1.tar.gz
```

### 3. Commit and push

```bash
git add -A && git commit -m "Admin panel Round 1: Overview, Users, Subscriptions, Audit" && git push origin main
```

### 4. Verify Vercel env vars

The API routes use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. This is already set in Vercel (the webhook uses it), but double-check if deploys fail. Other env vars used: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`.

### 5. Visit `/admin`

Sign in with an admin email. You'll see the "Admin" link appear in the main nav with a shield icon (only visible to admin accounts).

---

## Files shipped

```
middleware.ts                                  # NEW — protects /admin/* at the edge
supabase/admin-schema.sql                      # NEW — SQL to run before deploy
app/lib/admin-auth.ts                          # NEW — requireAdmin() + writeAuditLog()
app/admin/layout.tsx                           # NEW — shared chrome
app/admin/page.tsx                             # NEW — Overview tab
app/admin/users/page.tsx                       # NEW — Users tab
app/admin/subscriptions/page.tsx               # NEW — Subscriptions tab
app/admin/audit/page.tsx                       # NEW — Audit log viewer
app/admin/components/AdminNav.tsx              # NEW — top tab bar
app/admin/components/DataTable.tsx             # NEW — generic sortable/searchable table
app/admin/components/Drawer.tsx                # NEW — side panel for details
app/admin/components/ConfirmModal.tsx          # NEW — typed-confirm destructive modal
app/admin/components/shared.tsx                # NEW — badges, metric cards, formatters
app/api/admin/overview/route.ts                # NEW — GET dashboard metrics
app/api/admin/users/route.ts                   # NEW — GET users list
app/api/admin/users/[id]/route.ts              # NEW — GET/PATCH/DELETE individual user
app/api/admin/subscriptions/route.ts           # NEW — GET list, POST grant comp
app/api/admin/subscriptions/[id]/route.ts      # NEW — GET/PATCH/DELETE individual sub
app/api/admin/audit/route.ts                   # NEW — GET audit log entries
app/components/Navigation.tsx                  # MODIFIED — added conditional Admin link
```

---

## Notes

- **MRR source:** tries Stripe live first; falls back to estimate from sub plans if Stripe is unreachable.
- **Audit log never blocks:** if the write fails, the action still completes (logged to console).
- **Stripe actions sync:** cancel/reactivate also update Stripe if `stripe_subscription_id` is present. Comp subs (no Stripe ID) skip Stripe calls.
- **Ban uses Supabase `ban_duration`:** `'876000h'` (~100 years) for ban, `'none'` to unban.
- **Delete cascades:** deleting a user also removes subs, swaps, prop accounts, prop trades, prop sessions, Academy progress/certs, and finally the auth row.

---

## Adding a new admin

Admin emails are in **three** places that must all be kept in sync:
1. `middleware.ts` → `ADMIN_EMAILS` constant
2. `app/lib/admin-auth.ts` → `ADMIN_EMAILS` constant  
3. `app/components/Navigation.tsx` → `ADMIN_EMAILS` constant
4. `supabase/admin-schema.sql` → RLS policy on `admin_audit_log`

Edit all four, redeploy, and update the RLS policy by running this in Supabase SQL Editor:

```sql
DROP POLICY IF EXISTS "Admins can read audit log" ON admin_audit_log;
CREATE POLICY "Admins can read audit log" ON admin_audit_log
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'shezabmediaworxltd@gmail.com',
      'mustafamoinmirza@icloud.com',
      'new-admin@example.com'
    )
  );
```

---

## What comes in Round 2

Once Round 1 has been live for a few days:
- Prop tab — view/edit all user prop accounts, see trade history, close accounts
- Academy tab — full course management, grant certificates, edit progress
- Revenue tab — deeper Stripe analytics, LTV, cohort retention, refund tools
