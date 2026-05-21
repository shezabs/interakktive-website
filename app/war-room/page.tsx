import { redirect } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// /war-room — RETIRED (May 2026)
// ─────────────────────────────────────────────────────────────────────────────
// The AI War Room product (14-agent specialist chat) has been retired.
// This route now silently redirects to the homepage so bookmarked URLs don't
// 404. The retirement is intentional — do not re-enable without an explicit
// product decision.
//
// Note: the Academy lesson "Cipher War Room Integration" (L11.24) is unrelated
// — it teaches trader workflow / desk choreography, not this product.
// ─────────────────────────────────────────────────────────────────────────────

export default function WarRoomRetired() {
  redirect('/');
}
