import { requireAuth } from '@/lib/supabase/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  let body: { instagramUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const instagramUrl = body.instagramUrl?.trim();
  if (!instagramUrl || !instagramUrl.includes('instagram.com')) {
    return NextResponse.json({ error: 'Valid Instagram URL required' }, { status: 400 });
  }

  // Step 1: Fetch metadata via Apify (if configured)
  const apifyToken = process.env.APIFY_API_TOKEN;
  const apifyActorId = process.env.APIFY_INSTAGRAM_ACTOR_ID;
  let metadata: Record<string, unknown> = { url: instagramUrl };

  if (apifyToken && apifyActorId) {
    try {
      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/${apifyActorId}/runs?token=${apifyToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directUrls: [instagramUrl],
            resultsLimit: 1,
          }),
        },
      );
      if (apifyRes.ok) {
        const runData = await apifyRes.json();
        if (runData.data?.defaultDatasetId) {
          // Poll for results (simplified — wait up to 30s)
          const datasetId = runData.data.defaultDatasetId;
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            const dsRes = await fetch(
              `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`,
            );
            if (dsRes.ok) {
              const items = await dsRes.json();
              if (items.length > 0) {
                metadata = { ...metadata, ...items[0] };
                break;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[instagram] apify error', err);
    }
  }

  // Step 2: Run OpenAI analysis (if configured)
  const openaiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_INSTAGRAM_ASSISTANT_ID ?? 'asst_INZL2X679dYy7hPGjsCDMbUF';
  let analysisResult: Record<string, unknown> = {};
  let threadId = '';
  let runId = '';

  if (openaiKey) {
    try {
      // Create thread
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });
      const thread = await threadRes.json();
      threadId = thread.id;

      // Add message
      await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: `Analyze this Instagram content: ${JSON.stringify(metadata)}`,
        }),
      });

      // Run assistant
      const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({ assistant_id: assistantId }),
      });
      const run = await runRes.json();
      runId = run.id;

      // Poll for completion
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              'OpenAI-Beta': 'assistants=v2',
            },
          },
        );
        const status = await statusRes.json();
        if (status.status === 'completed') {
          const msgsRes = await fetch(
            `https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${openaiKey}`,
                'OpenAI-Beta': 'assistants=v2',
              },
            },
          );
          const msgs = await msgsRes.json();
          const content = msgs.data?.[0]?.content?.[0]?.text?.value;
          if (content) {
            try {
              analysisResult = JSON.parse(content);
            } catch {
              analysisResult = { raw: content };
            }
          }
          break;
        }
        if (status.status === 'failed') break;
      }
    } catch (err) {
      console.error('[instagram] openai error', err);
    }
  }

  // Step 3: Save analysis to DB
  const { error } = await ctx.admin
    .schema('bookmarks')
    .from('instagram_analyses')
    .upsert(
      {
        user_id: ctx.userId,
        instagram_url: instagramUrl,
        thread_id: threadId,
        run_id: runId,
        metadata,
        analysis_result: analysisResult,
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,instagram_url' },
    );

  if (error) {
    console.error('[instagram] save analysis', error);
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      analysis: { threadId, runId, metadata, analysis_result: analysisResult },
      metadata,
    },
  });
}
