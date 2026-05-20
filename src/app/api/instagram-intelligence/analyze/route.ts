import { authedHandler } from '@/lib/api/handler';
import { analyseInstagramUrl } from '@/lib/instagram/instagramAnalysis';
import { validateInstagramAnalyzeBody } from '@/lib/instagram/validateInstagramAnalyzeBody';

export const POST = authedHandler(
  { body: validateInstagramAnalyzeBody },
  async ({ admin, userId, body }) =>
    analyseInstagramUrl(admin, userId, body.instagramUrl),
);
