// app/lib/admin-emails.ts
// ============================================================================
// Single source of truth for admin/test access emails.
// Anyone in this list:
//   1. Is treated as a paying subscriber by useProAccess (full Academy access)
//   2. Sees an "Admin Access" badge on lesson pages (so you know it's not the
//      real paywall behavior)
//   3. Has access to the "Reset Academy Progress" button on the dashboard
//
// To add an email: lowercase it and add to ADMIN_EMAILS.
// To revoke: remove the email and redeploy.
// ============================================================================

export const ADMIN_EMAILS: ReadonlyArray<string> = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
