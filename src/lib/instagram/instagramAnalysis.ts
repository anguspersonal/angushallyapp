/**
 * Instagram intelligence — orchestrates Apify metadata extraction, OpenAI
 * Assistant analysis, and persistence to `bookmarks.instagram_analyses`.
 *
 * Each external integration is fail-soft: Apify or OpenAI being down /
 * unconfigured leaves the corresponding fields empty rather than aborting.
 * Only the persistence step throws (HttpError(500)) — see ADR 0034.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';

export interface InstagramAnalysisResult {
  threadId: string;
  runId: string;
  metadata: Record<string, unknown>;
  analysis_result: Record<string, unknown>;
}

export interface InstagramAnalysisResponse {
  success: true;
  data: {
    analysis: InstagramAnalysisResult;
    metadata: Record<string, unknown>;
  };
}

const APIFY_POLL_ATTEMPTS = 10;
const APIFY_POLL_INTERVAL_MS = 3000;
const OPENAI_POLL_ATTEMPTS = 10;
const OPENAI_POLL_INTERVAL_MS = 3000;
const DEFAULT_INSTAGRAM_ASSISTANT_ID = 'asst_INZL2X679dYy7hPGjsCDMbUF';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchApifyMetadata(
  instagramUrl: string,
): Promise<Record<string, unknown>> {
  const apifyToken = process.env.APIFY_API_TOKEN;
  const apifyActorId = process.env.APIFY_INSTAGRAM_ACTOR_ID;
  const baseMetadata: Record<string, unknown> = { url: instagramUrl };

  if (!apifyToken || !apifyActorId) return baseMetadata;

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${apifyActorId}/runs?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrls: [instagramUrl], resultsLimit: 1 }),
      },
    );
    if (!runRes.ok) return baseMetadata;

    const runData = await runRes.json();
    const datasetId = runData?.data?.defaultDatasetId;
    if (!datasetId) return baseMetadata;

    for (let attempt = 0; attempt < APIFY_POLL_ATTEMPTS; attempt++) {
      await sleep(APIFY_POLL_INTERVAL_MS);
      const dsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`,
      );
      if (!dsRes.ok) continue;
      const items = await dsRes.json();
      if (Array.isArray(items) && items.length > 0) {
        return { ...baseMetadata, ...items[0] };
      }
    }
    return baseMetadata;
  } catch (err) {
    console.error('[instagram] apify error', err);
    return baseMetadata;
  }
}

interface AssistantOutput {
  threadId: string;
  runId: string;
  analysisResult: Record<string, unknown>;
}

const EMPTY_ASSISTANT_OUTPUT: AssistantOutput = {
  threadId: '',
  runId: '',
  analysisResult: {},
};

async function runOpenAiAssistant(
  metadata: Record<string, unknown>,
): Promise<AssistantOutput> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return EMPTY_ASSISTANT_OUTPUT;

  const assistantId =
    process.env.OPENAI_INSTAGRAM_ASSISTANT_ID ?? DEFAULT_INSTAGRAM_ASSISTANT_ID;
  const headers = {
    Authorization: `Bearer ${openaiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
  };
  const pollHeaders = {
    Authorization: headers.Authorization,
    'OpenAI-Beta': headers['OpenAI-Beta'],
  };

  try {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const thread = await threadRes.json();
    const threadId = thread.id as string;

    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: 'user',
        content: `Analyze this Instagram content: ${JSON.stringify(metadata)}`,
      }),
    });

    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ assistant_id: assistantId }),
      },
    );
    const run = await runRes.json();
    const runId = run.id as string;

    for (let attempt = 0; attempt < OPENAI_POLL_ATTEMPTS; attempt++) {
      await sleep(OPENAI_POLL_INTERVAL_MS);
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        { headers: pollHeaders },
      );
      const status = await statusRes.json();

      if (status.status === 'completed') {
        const msgsRes = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`,
          { headers: pollHeaders },
        );
        const msgs = await msgsRes.json();
        const content = msgs?.data?.[0]?.content?.[0]?.text?.value as
          | string
          | undefined;

        let analysisResult: Record<string, unknown> = {};
        if (content) {
          try {
            analysisResult = JSON.parse(content);
          } catch {
            analysisResult = { raw: content };
          }
        }
        return { threadId, runId, analysisResult };
      }

      if (status.status === 'failed') {
        return { threadId, runId, analysisResult: {} };
      }
    }

    return { threadId, runId, analysisResult: {} };
  } catch (err) {
    console.error('[instagram] openai error', err);
    return EMPTY_ASSISTANT_OUTPUT;
  }
}

async function saveAnalysis(
  admin: SupabaseClient,
  userId: string,
  instagramUrl: string,
  output: AssistantOutput,
  metadata: Record<string, unknown>,
): Promise<void> {
  const { error } = await admin
    .schema('bookmarks')
    .from('instagram_analyses')
    .upsert(
      {
        user_id: userId,
        instagram_url: instagramUrl,
        thread_id: output.threadId,
        run_id: output.runId,
        metadata,
        analysis_result: output.analysisResult,
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,instagram_url' },
    );

  if (error) {
    console.error('[instagram] save analysis', error);
    throw new HttpError(500, 'Failed to save analysis');
  }
}

export async function analyseInstagramUrl(
  admin: SupabaseClient,
  userId: string,
  instagramUrl: string,
): Promise<InstagramAnalysisResponse> {
  const metadata = await fetchApifyMetadata(instagramUrl);
  const assistantOutput = await runOpenAiAssistant(metadata);
  await saveAnalysis(admin, userId, instagramUrl, assistantOutput, metadata);

  return {
    success: true,
    data: {
      analysis: {
        threadId: assistantOutput.threadId,
        runId: assistantOutput.runId,
        metadata,
        analysis_result: assistantOutput.analysisResult,
      },
      metadata,
    },
  };
}
