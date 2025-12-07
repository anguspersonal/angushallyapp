/**
 * Runtime shim for the Habits domain. The TypeScript contract module is the
 * single source of truth for constants and shapes; this file re-exports the
 * compiled output so CommonJS consumers share the same values without
 * duplicating literals or relying on ts-node.
 *
 * Generated via `tsc -p shared/services/habit/tsconfig.json`.
 * Do not add logic or literals here; regenerate from the TS source when the
 * contract changes so JS consumers stay aligned.
 */

module.exports = require('./dist/contracts.js');
