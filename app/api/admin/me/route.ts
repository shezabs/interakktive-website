import { NextResponse } from 'next/server';
import { getAdminContext } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ email: ctx.email, role: ctx.role });
}
