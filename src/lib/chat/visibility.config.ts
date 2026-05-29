import type { VisibilityRule } from './visibility';

/**
 * Single source of truth for where the chat launcher renders.
 *
 *   allow     — render on these routes (default: everywhere under `/`)
 *   deny      — never render here, even if the route is in `allow`
 *   forceShow — escape hatch: render even if the route is in `deny`
 *
 * Precedence: `forceShow > deny > allow > default-deny`.
 *
 * To opt a sub-project out of the chatbot, add its route pattern to `deny`
 * here. No other file should need to change.
 *
 * See docs/chatbotv1/requirements.md §5.8.
 */
export const VISIBILITY: VisibilityRule = {
  allow: ['/**'],
  deny: ['/login', '/auth/**'],
  forceShow: [],
};
