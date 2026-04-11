import { requireAuth } from '@/lib/supabase/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { path?: string[] };

export async function GET(_request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  // GET /api/bookmarks — list canonical bookmarks
  if (!subpath) {
    const { data, error } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[bookmarks] list', error);
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }
    return NextResponse.json({ bookmarks: data ?? [] });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  // POST /api/bookmarks/share — create a bookmark via share target
  if (subpath === 'share') {
    let body: { url?: string; text?: string; title?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check for duplicates
    const { data: existing } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('url', url)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Bookmark already exists',
        duplicate: true,
        bookmark: existing,
      });
    }

    const { data: created, error } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .insert({
        user_id: ctx.userId,
        url,
        title: body.title ?? body.text ?? url,
        source: 'share',
        processing_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[bookmarks] share', error);
      return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bookmark created', bookmark: created });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
